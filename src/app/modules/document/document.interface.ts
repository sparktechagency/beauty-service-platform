import { Model, Types } from "mongoose";
import { DOCUMENT_TYPE } from "../../../enums/document";

export type IDocument = {
    user: Types.ObjectId;
    license?: string[];
    work?: string[];
    portfolio?: string[];
    background?: string[];
    dashboard?: string[];
    status?:"verified" | "unverified";
    
}

export type DocumentModel = Model<IDocument>;
