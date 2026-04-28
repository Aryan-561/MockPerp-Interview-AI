import { z } from "zod";

export const registerSchema = z
    .object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters long"),
        email: z
            .string()
            .email("Please enter a valid email address"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters long"),
        confirmPassword: z
            .string()
            .min(6, "Password must be at least 6 characters long"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const loginSchema = z.object({
    email: z
        .string()
        .email("Please enter a valid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
