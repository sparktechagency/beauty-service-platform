import { z } from "zod";
import { DOCUMENT_TYPE } from "../../../enums/document";

const createDocumentZodSchema = z.object({
  body: z.object({
    user: z.string({
      required_error: "user is required",
    }),
    type: z.nativeEnum(DOCUMENT_TYPE),
    image: z.any()
  }),
});

export  const DocumentValidations = {
  createDocumentZodSchema,
};