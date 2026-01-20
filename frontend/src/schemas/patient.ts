import { z } from "zod";

export const createPatientSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be at most 255 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z
    .enum(["male", "female", "other"])
    .refine((val) => val !== null, {
      message: "Gender is required",
    }),
  patient_type: z
    .enum(["teacher", "student", "general"])
    .refine((val) => val !== null, {
      message: "Patient type is required",
    }),
  phone_number: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  medical_record_number: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  blood_type: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  allergies: z.string().optional(),
});

export type CreatePatientFormData = z.infer<typeof createPatientSchema>;

export const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

export const patientTypeOptions = [
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
  { value: "general", label: "General" },
] as const;

export const bloodTypeOptions = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
] as const;
