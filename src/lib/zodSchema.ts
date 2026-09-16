import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const postContentSchema = z
  .string()
  .trim()
  .min(1, "Post cannot be empty")
  .max(500, "Post must be at most 500 characters");

export const createPostSchema = z.object({
  content: postContentSchema,
});

export type CreatePostValues = z.infer<typeof createPostSchema>;

export const replySchema = z.object({
  content: postContentSchema,
});

export type ReplyValues = z.infer<typeof replySchema>;
