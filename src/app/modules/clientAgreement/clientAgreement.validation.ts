import { z } from "zod";

const createClientAgreementZodSchema = z.object({
  body: z.object({
    content: z.string({
      required_error: "agreement is required",
    }),
    type:z.enum(['agreement','responsibility']),
    for:z.enum(['user','provider']),
  }),
});


export const ClientAgreementValidation = {
  createClientAgreementZodSchema,
};