import { z } from "zod";

const createCandidateZodSchema = z.object({
    body:z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Invalid phone number"), // You can add a regex for stricter validation
  zipcode: z.string().min(5, "Invalid ZIP code"),

  ssn: z.string().optional(), // Optional in sandbox
})
})
const createReportZodSchema = z.object({
  body: z.object({
    candidate_id: z.string().min(1, "Candidate ID is required"),
    name: z.string().min(1, "Report name is required"),
    package: z.string().min(1, "Package is required"),
    custom_fields: z
      .object({
        foo: z.string().optional(),
        bar: z.string().optional(),
      })
      .optional(),
  }),
});

const uploadDocuments = z.object({
  body: z.object({
    image:z.any()
  }),
});

export const CheckrValidation = {
  createCandidateZodSchema,
  createReportZodSchema,
  uploadDocuments,
};
