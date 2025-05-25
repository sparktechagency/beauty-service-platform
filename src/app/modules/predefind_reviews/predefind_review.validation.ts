import { z } from "zod";

const createPredefindReviewZodSchema = z.object({
  body: z.object({
    category: z.string({
      required_error: "Category is required",
    }),
    reviews: z.array(z.string({ required_error: "Reviews is required" })),
  }),
});

export const PredefiendReviewValidation = {
  createPredefindReviewZodSchema,
};