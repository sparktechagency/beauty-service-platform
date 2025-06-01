import { z } from "zod";
import { DOCUMENT_TYPE } from "../../../enums/document";

const createDocumentZodSchema = z.object({
  body: z.object({
    user: z.string({
      required_error: "user is required",
    }),
    license: z.string({
      required_error: "license is required",
    }).optional(),
    work: z.string({
      required_error: "work is required",
    }).optional(),
    portfolio: z.string({
      required_error: "portfolio is required",
    }).optional(),
    background: z.string({
      required_error: "background is required",
    }).optional(),
    dashboard: z.string({
      required_error: "dashboard is required",
    }).optional()
  }),
});

export  const DocumentValidations = {
  createDocumentZodSchema,
};