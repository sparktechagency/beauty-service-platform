import { z } from "zod";
const createServiceManagementZodSchema = z.object({
  body: z.object({
    category: z.string({
      required_error: "Category is required",
    }),
    subCategory: z.string({
      required_error: "SubCategory is required",
    }),
    name: z.string({
      required_error: "Name is required",
    }),
    basePrice: z.number({
      required_error: "Base price is required",
    }),
    addOns: z.array(
      z.object({
        title: z.string({
          required_error: "Title is required",
        }),
        price: z.number({
          required_error: "Price is required",
        }),
      })
    ),
    statePrices:z.string()
  }),
});


const updateServiceManagementZodSchema = z.object({
  body: z.object({
    category: z.string().optional(),
    subCategory: z.string().optional(),
    name: z.string().optional(),
    basePrice: z.number().optional(),
    addOns: z
      .array(
        z.object({
          title: z.string().optional(),
          price: z.number().optional(), 
        })
      )
  }).optional(),
  statePrices:z.string().optional()
})

export const ServiceManagementValidations = {
  createServiceManagementZodSchema,
  updateServiceManagementZodSchema
};
