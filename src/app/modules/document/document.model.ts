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
    license: {
      type: [String],
      required: false,
    },
    work: {
      type: [String],
      required: false,
    },
    portfolio: {
        type: [String],
        required: false,
    },
    background: {
        type: [String],
        required: false,
    },
    dashboard: {
        type: [String],
        required: false,
    },
    status: {
        type: String,
        enum: ["verified", "unverified"],
        default: "verified",
    }
  },
  { timestamps: true }
);

export const Document = model<IDocument, DocumentModel>("Document", documentSchema);