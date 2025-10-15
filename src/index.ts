import { cors } from "hono/cors";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

import { db } from "./lib/db";

const app = new OpenAPIHono();

app.use(cors());

app.get("/", (c) => {
  return c.json({
    title: "Ikifurni API",
  });
});

const getProductRoute = createRoute({
  method: "get",
  path: "/products",
  responses: {
    200: {
      description: "Get all products",
      content: {
        "application/json": {
          schema: z
            .object({
              id: z.string(),
              slug: z.string(),
              name: z.string(),
              imageUrl: z.string(),
              price: z.number(),
              stock: z.number(),
              description: z.string(),
              createdAt: z.date(),
              updatedAt: z.date(),
            })
            .array(),
        },
      },
    },
  },
});

app.openapi(getProductRoute, async (c) => {
  const products = await db.product.findMany();

  return c.json(products);
});

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Ikifurni API",
    version: "1.0.0",
  },
});

export default app;
