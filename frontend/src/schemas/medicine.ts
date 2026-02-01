import { z } from "zod";

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

  dosage_form: z.enum(["tablet", "capsule"]).refine((val) => val !== null, {
    message: "Dosage form is required",
  }),
  is_prescription_required: z.boolean().refine((val) => val !== null, {
    message: "Prescription requirement is required",
  }),

  notes: z.string().optional(),
});

export type CreateMedicineFormData = z.infer<typeof createMedicineSchema>;

export const dosageFormOptions = [
  { value: "tablet", label: "Tablet" },
  { value: "capsule", label: "Capsule" },
] as const;
