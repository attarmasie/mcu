import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["doctor", "operator"]),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.enum(["admin", "doctor", "operator"]),
  is_active: z.boolean(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export const createRoleOptions = [
  { value: "doctor", label: "Doctor" },
  { value: "operator", label: "Operator" },
] as const;

export const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "doctor", label: "Doctor" },
  { value: "operator", label: "Operator" },
] as const;
