import { z } from "zod";

export const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], {
    message: "Please select a gender",
  }),

  phoneNumber: z.string().min(10, "Invalid phone number"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is too short"),

  preferredLanguage: z.string().min(1, "Language is required"),
  nationality: z.string().min(1, "Nationality is required"),
  religion: z.string().optional(),

  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),

  status: z.enum(["active", "inactive", "submitted"]).default("active"),
});

export type PatientData = z.infer<typeof patientSchema>;
