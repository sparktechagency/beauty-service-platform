import { z } from "zod";

const createServiceZodSchema = z.object({
  body: z.object({
    serviceId: z.string({
      required_error: "serviceId is required",
    }),
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
