import { cors } from "hono/cors";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

import { db } from "./lib/db";

import { checkAuthorized } from "./modules/auth/middleware";
import { CartSchema } from "./modules/cart/schema";
import { productRoute } from "./modules/product/route";
import { userRoute } from "./modules/user/route";
import { authRoute } from "./modules/auth/route";
import { cartRoute } from "./modules/cart/route";

const app = new OpenAPIHono();

app.use(cors());

app.route("/products", productRoute);
app.route("/users", userRoute);
app.route("/auth", authRoute);
app.route("/cart", cartRoute);

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Ikifurni API",
    version: "1.0.0",
  },
});

app.get(
  "/",
  Scalar({
    pageTitle: "Ikifurni API",
    url: "/openapi.json",
  })
);

export default app;

// GET /cart
app.openapi(
  createRoute({
    method: "get",
    path: "/cart",
    middleware: checkAuthorized,
    responses: {
      200: {
        description: "Get cart",
        content: { "application/json": { schema: CartSchema } },
      },
    },
  }),
  async (c) => {
    const user = c.get("user");

    const cart = await db.cart.findFirst({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      const newCart = await db.cart.create({
        data: { userId: user.id },
        include: { items: { include: { product: true } } },
      });

      return c.json(newCart);
    }

    return c.json(cart);
  }
);
