import { z } from "zod";

const createSubscriptionZodSchema = z.object({
    body: z.object({
        // priceId: z.string({
        //     required_error: "Price ID is required",
        // }),
        userId: z.string({
            required_error: "User ID is required",
        })
    }),
});

const createChangeSubscriptionZodSchema = z.object({
    body: z.object({
        status: z.enum(["active","inactive"])
    }),
})

export const SubscriptionValidation = {
    createSubscriptionZodSchema,
    createChangeSubscriptionZodSchema,
};