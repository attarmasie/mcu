import { z } from "zod";

const dosageFormEnum = z.enum(["tablet", "capsule", "syrup", "injection", "cream"]);

export const createMedicineSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(100, "Code must be at most 100 characters"),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be at most 255 characters"),

  strength: z.string().min(1, "Strength is required"),

  dosage_form: dosageFormEnum,
  is_prescription_required: z.boolean(),

  notes: z.string().optional(),
  minimum_stock: z.number().min(0, "Minimum stock must be a non-negative number"),
});

export const updateMedicineSchema = createMedicineSchema.extend({
  id: z.string(),
});

export type CreateMedicineFormData = z.infer<typeof createMedicineSchema>;
export type UpdateMedicineFormData = z.infer<typeof updateMedicineSchema>;

export const dosageFormOptions = [
  { value: "tablet", label: "Tablet" },
  { value: "capsule", label: "Capsule" },
  { value: "syrup", label: "Syrup" },
  { value: "injection", label: "Injection" },
  { value: "cream", label: "Cream" },
] as const;
