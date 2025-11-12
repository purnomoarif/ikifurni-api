import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  ProductCreateSchema,
  ProductIdParamSchema,
  ProductSchema,
  ProductSlugParamSchema,
  ProductsSchema,
} from "./schema";
import { db } from "../../lib/db";

export const productRoute = new OpenAPIHono();

// GET all products
productRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
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
productRoute.openapi(
  createRoute({
    method: "get",
    path: "/{slug}",
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
productRoute.openapi(
  createRoute({
    method: "post",
    path: "/",
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
productRoute.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
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
