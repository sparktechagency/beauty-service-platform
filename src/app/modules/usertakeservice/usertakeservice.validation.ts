import { z } from "zod";

const createServiceZodSchema = z.object({
  body: z.object({
    serviceId: z.string({
      required_error: "serviceId is required",
    }),
    price: z.number({
      required_error: "price is required",
    }),
    latitude: z.number({
      required_error: "latitude is required",
    }),
    longitude: z.number({
      required_error: "longitude is required",
    }),
    providerId: z.string({
      required_error: "providerId is required",
    }),
    addOns: z.array(z.string()).optional(),
    additionalInfo: z.string().optional(),
  }),
});
const updateServiceZodSchema = z.object({
  body: z.object({
    serviceId: z.string({
      required_error: "serviceId is required",
    }),
  }),
});

export const UserTakeServiceValidations = {
  createServiceZodSchema,
  updateServiceZodSchema,
};
