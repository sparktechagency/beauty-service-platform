import { z } from "zod";

const createSubCategoryZodSchema = z.object({
  body: z.object({
    category: z.string({
      required_error: "Category is required",
    }),
    name: z.string({
      required_error: "Name is required",
    }),
    image: z.string({
      required_error: "Image is required",
    }).optional(),
  }),
});
const updateSubCategoryZodSchema = z.object({
  body: z.object({
    category: z.string().optional(),
    name: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const SubCategoryValidations = {
  createSubCategoryZodSchema,
  updateSubCategoryZodSchema,
};
