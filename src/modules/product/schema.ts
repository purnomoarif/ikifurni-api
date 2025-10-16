import { z } from "@hono/zod-openapi";

export const ProductsSchema = z.array(
  z.object({
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
);
