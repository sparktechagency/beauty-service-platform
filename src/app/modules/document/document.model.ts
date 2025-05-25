import { model, Schema } from "mongoose";
import { DocumentModel, IDocument } from "./document.interface";
import { DOCUMENT_TYPE } from "../../../enums/document";

const documentSchema = new Schema<IDocument,DocumentModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(DOCUMENT_TYPE),
      required: true,
    },
    documents: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ["verified", "rejected"],
      default: "verified",
    },
  },
  { timestamps: true }
);

export const Document = model<IDocument, DocumentModel>("Document", documentSchema);