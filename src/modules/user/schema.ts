import { z } from "@hono/zod-openapi";

export const UserSchema = z.object({
  id: z.string(),

  email: z.string(),
  password: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UsersSchema = z.array(UserSchema);

export const RegisterUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string(),
});
