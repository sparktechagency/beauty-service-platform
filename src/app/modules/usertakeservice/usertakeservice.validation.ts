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
    addOns: z.array(z.object({
      name: z.string({
        required_error: "name is required",
      }).optional(),
      price: z.number({
        required_error: "price is required",
      }).optional(),
    })).optional(),
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

const cancelOrderZodSchema = z.object(
{
  body:z.object({
    reason: z.string({
      required_error: "reason is required",
    }),
  })
}
)

const activeUserValidationZodSchema = z.object({
  body: z.object({
    latitude: z.number({
      required_error: "latitude is required",
    }),
    longitude: z.number({
      required_error: "longitude is required",
    }),
    status:z.boolean({
      required_error: "status is required",
    })
  }),
});

export const UserTakeServiceValidations = {
  createServiceZodSchema,
  updateServiceZodSchema,
  cancelOrderZodSchema,
  activeUserValidationZodSchema,
};
