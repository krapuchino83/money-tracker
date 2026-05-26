import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Некорректный email" }),
  password: z.string().min(1, { message: "Введите пароль" }),
});

export const registerSchema = z
  .object({
    email: z.email({ error: "Некорректный email" }),
    password: z.string().min(8, { message: "Пароль не короче 8 символов" }),
    confirmPassword: z.string().min(1, { message: "Подтвердите пароль" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли должны совпадать",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
