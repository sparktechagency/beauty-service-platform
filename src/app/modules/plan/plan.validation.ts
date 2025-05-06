import { z } from "zod";
import { USER_ROLES } from "../../../enums/user";



const createPlanZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    price: z.number({ required_error: 'Price is required' }),
    price_offer: z.number({ required_error: 'Price offer is required' }),
    offers: z.array(z.string(), { required_error: 'Offers are required' }),
    for: z.enum([USER_ROLES.USER, USER_ROLES.ARTIST]),
  }),
});

const updatePlanZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    price: z.number().optional(),
    price_offer: z.number().optional(),
    offers: z.array(z.string()).optional(),
    for: z.enum([USER_ROLES.ARTIST, USER_ROLES.USER]).optional(),
  }),
});

export const PlanValidation = {
  createPlanZodSchema,
  updatePlanZodSchema,
};