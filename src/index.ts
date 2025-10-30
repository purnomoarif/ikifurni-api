import { cors } from "hono/cors";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

import { db } from "./lib/db";
import {
  ProductSlugParamSchema,
  ProductSchema,
  ProductsSchema,
  ProductCreateSchema,
  ProductIdParamSchema,
} from "./modules/product/schema";
import {
  LoginUserSchema,
  RegisterUserSchema,
  TokenSchema,
  UserIdParamSchema,
  UserSchema,
  UsersSchema,
} from "./modules/user/schema";

const app = new OpenAPIHono();

app.use(cors());

// GET all products
app.openapi(
  createRoute({
    method: "get",
    path: "/products",
    responses: {
      200: {
        description: "Get all products",
        content: { "application/json": { schema: ProductsSchema } },
      },
    },
  }),

  async (c) => {
    const products = await db.product.findMany();

    return c.json(products);
  }
);

// GET product by slug
app.openapi(
  createRoute({
    method: "get",
    path: "/products/{slug}",
    request: { params: ProductSlugParamSchema },
    responses: {
      200: {
        description: "Get one product by slug",
        content: { "application/json": { schema: ProductSchema } },
      },
      404: {
        description: "Product by slug not found",
      },
    },
  }),
  async (c) => {
    const { slug } = c.req.valid("param");

    const product = await db.product.findUnique({ where: { slug } });

    if (!product) {
      return c.notFound();
    }

    return c.json(product);
  }
);

// POST new product
app.openapi(
  createRoute({
    method: "post",
    path: "/products",
    request: {
      body: {
        content: { "application/json": { schema: ProductCreateSchema } },
      },
    },
    responses: {
      201: {
        description: "Product created successfully",
        content: { "application/json": { schema: ProductSchema } },
      },
      400: { description: "Invalid request" },
    },
  }),
  async (c) => {
    try {
      const data = c.req.valid("json");

      const newProduct = await db.product.create({
        data,
      });

      return c.json(newProduct, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to create product" }, 400);
    }
  }
);

// DELETE product by id
app.openapi(
  createRoute({
    method: "delete",
    path: "/products/{id}",
    request: { params: ProductIdParamSchema },
    responses: {
      200: { description: "Product deleted successfully" },
      400: { description: "Failed to delete product" },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    try {
      await db.product.delete({ where: { id } });
    } catch (eror) {
      return c.json({ message: "Failed to delete product" }, 400);
    }

    return c.json({ message: "Product deleted successfully" });
  }
);

// GET all users
app.openapi(
  createRoute({
    method: "get",
    path: "/users",
    responses: {
      200: {
        description: "Get all users",
        content: { "application/json": { schema: UsersSchema } },
      },
    },
  }),
  async (c) => {
    const users = await db.user.findMany({
      omit: {
        email: true,
      },
    });

    return c.json(users);
  }
);

// GET users by id
app.openapi(
  createRoute({
    method: "get",
    path: "/users/{id}",
    request: { params: UserIdParamSchema },
    responses: {
      200: {
        description: "Get one users by ID",
        content: { "application/json": { schema: UserSchema } },
      },
      404: {
        description: "User by id not found",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const user = await db.user.findUnique({
      where: { id },
      omit: {
        email: true,
      },
    });

    if (!user) {
      return c.notFound();
    }

    return c.json(user);
  }
);

// POST register
app.openapi(
  createRoute({
    method: "post",
    path: "/auth/register",
    request: {
      body: { content: { "application/json": { schema: RegisterUserSchema } } },
    },
    responses: {
      201: {
        description: "Registered new user",
        content: { "application/json": { schema: UserSchema } },
      },
      400: {
        description: "Failed to register new user",
      },
    },
  }),

  async (c) => {
    const body = c.req.valid("json");

    try {
      const hash = await Bun.password.hash(body.password);

      const user = await db.user.create({
        data: {
          username: body.username,
          email: body.email,
          fullName: body.fullName,
          password: { create: { hash } },
        },
      });

      return c.json(user, 201);
    } catch (error) {
      return c.json(
        {
          message: "Username or email already exist",
        },
        400
      );
    }
  }
);

// POST log in
app.openapi(
  createRoute({
    method: "post",
    path: "/auth/login",
    request: {
      body: { content: { "application/json": { schema: LoginUserSchema } } },
    },
    responses: {
      201: {
        description: "Logged in to user",
        content: { "application/json": { schema: TokenSchema } },
      },
      400: {
        description: "Failed to login user",
      },
      404: {
        description: "User not found",
      },
    },
  }),

  async (c) => {
    const body = c.req.valid("json");

    try {
      const user = await db.user.findUnique({
        where: { email: body.email },
      });

      if (!user) {
        return c.notFound();
      }

      console.log({ user });

      //  TODO
      const token = "...";

      return c.json(token);
    } catch (error) {
      return c.json(
        {
          message: "Email or password is incorrect",
        },
        400
      );
    }
  }
);

// GET auth/me

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
