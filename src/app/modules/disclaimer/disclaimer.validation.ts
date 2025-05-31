import { z } from "zod";

const createDisclaimerZodSchema = z.object({
  body: z.object({
    content: z.string({
      required_error: "Content is required",
    }),
    type: z.enum(["contact", "privacy", "terms", "about", "payout"], {
      required_error: "Type is required",
    }),
  }),
});

export const DisclaimerValidation = {
  createDisclaimerZodSchema,
};