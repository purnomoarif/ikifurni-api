import { z } from "@hono/zod-openapi";

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  fullname: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UsersSchema = z.array(UserSchema);

export const UserIdParamSchema = z.object({
  id: z.string(),
});
