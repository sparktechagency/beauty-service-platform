import { z } from "zod";

const createSubscriptionZodSchema = z.object({
    body: z.object({
        priceId: z.string({
            required_error: "Price ID is required",
        }),
    }),
});

export const SubscriptionValidation = {
    createSubscriptionZodSchema,
};