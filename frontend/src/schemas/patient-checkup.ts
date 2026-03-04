import { z } from "zod";

export const patientCheckupMedicineSchema = z.object({
  medicine_id: z.string().min(1, "Medicine is required"),
  medicine_name: z.string().min(1, "Medicine name is required"),
  quantity: z.coerce
    .number<number | string>()
    .min(1, "Quantity must be at least 1"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration_days: z.coerce
    .number<number | string>()
    .min(1, "Duration must be at least 1 day"),
  notes: z.string().optional(),
});

export const createPatientCheckupSchema = z.object({
  patient_id: z.string().min(1, "Patient is required"),
  visit_date: z.string().min(1, "Visit date is required"),
  chief_complaint: z.string().min(1, "Chief complaint is required"),
  symptoms: z.string().min(1, "Symptoms are required"),
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
  diagnosis: z.string().optional(),
  temperature_c: z.coerce.number<number | string>().min(30).max(45).optional(),
  blood_pressure: z.string().optional(),
  heart_rate: z.coerce.number<number | string>().min(0).optional(),
  respiratory_rate: z.coerce.number<number | string>().min(0).optional(),
  oxygen_saturation: z.coerce
    .number<number | string>()
    .min(0)
    .max(100)
    .optional(),
  height_cm: z.coerce.number<number | string>().min(0).optional(),
  weight_kg: z.coerce.number<number | string>().min(0).optional(),
  medicines: z.array(patientCheckupMedicineSchema).optional(),
  treatment_plan: z.string().optional(),
  doctor_name: z.string().optional(),
  follow_up_date: z.string().optional(),
  notes: z.string().optional(),
  patient_allergies: z.string().optional(),
  patient_blood_type: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional()
    .or(z.literal("")),
});

export const updatePatientCheckupSchema = z.object({
  visit_date: z.string().min(1, "Visit date is required"),
  chief_complaint: z.string().min(1, "Chief complaint is required"),
  symptoms: z.string().min(1, "Symptoms are required"),
  status: z.enum(["scheduled", "completed", "cancelled"]),
  diagnosis: z.string().optional(),
  temperature_c: z.coerce.number<number | string>().min(30).max(45).optional(),
  blood_pressure: z.string().optional(),
  heart_rate: z.coerce.number<number | string>().min(0).optional(),
  respiratory_rate: z.coerce.number<number | string>().min(0).optional(),
  oxygen_saturation: z.coerce
    .number<number | string>()
    .min(0)
    .max(100)
    .optional(),
  height_cm: z.coerce.number<number | string>().min(0).optional(),
  weight_kg: z.coerce.number<number | string>().min(0).optional(),
  medicines: z.array(patientCheckupMedicineSchema).optional(),
  treatment_plan: z.string().optional(),
  doctor_name: z.string().optional(),
  follow_up_date: z.string().optional(),
  notes: z.string().optional(),
  patient_allergies: z.string().optional(),
  patient_blood_type: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional()
    .or(z.literal("")),
});

export type CreatePatientCheckupFormInput = z.input<
  typeof createPatientCheckupSchema
>;
export type CreatePatientCheckupFormData = z.output<
  typeof createPatientCheckupSchema
>;
export type UpdatePatientCheckupFormInput = z.input<
  typeof updatePatientCheckupSchema
>;
export type UpdatePatientCheckupFormData = z.output<
  typeof updatePatientCheckupSchema
>;
export type PatientCheckupMedicineFormData = z.infer<
  typeof patientCheckupMedicineSchema
>;

export const patientCheckupStatusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;
