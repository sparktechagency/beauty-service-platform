import { Model, Types } from "mongoose";
import { DOCUMENT_TYPE } from "../../../enums/document";

export type IDocument = {
    user: Types.ObjectId;
    type:DOCUMENT_TYPE,
    documents: string[];
    status:"verified" | "rejected";
}

export type DocumentModel = Model<IDocument>;
