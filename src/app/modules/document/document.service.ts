import { JwtPayload } from "jsonwebtoken";
import { IDocument } from "./document.interface";
import { Document } from "./document.model";
import unlinkFile from "../../../shared/unlinkFile";

const createDocumentIntoDB = async (
  payload: IDocument
): Promise<IDocument | null> => {
const exist = await Document.findOne({ user: payload.user });
if (exist) {
    return Document.findOneAndUpdate({ user: payload.user }, payload, {
        new: true,
    });
}
  const result = await Document.create(payload);
  return result;
};


const retrievedDocumentFromDB = async (
  user: JwtPayload
): Promise<IDocument | null> => {
  const result = await Document.findOne({ user: user.id });
  return result;
};

const updateDocumentIntoDB = async (
  id: string,
  payload: Partial<IDocument>
): Promise<IDocument | null> => {
  const isExist = await Document.findOne({ _id: id});
  if (!isExist) {
    throw new Error("Document not found");
  }
  
  const result = await Document.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
  };

const deleteDocumentFromDB = async (
  id: string
): Promise<IDocument | null> => {
  const isExist = await Document.findOne({ _id: id});
  if (!isExist) {
    throw new Error("Document not found");
  }
  const result = await Document.findByIdAndDelete(id);
  return result;
};

const getDocumentsofUsersFromDB = async (
  id: string,
  query:Record<string, any>
): Promise<IDocument[] | null> => {
  const result = await Document.find().populate("user")

  return result;
};

export const DocumentServices = {
  createDocumentIntoDB,
  retrievedDocumentFromDB,
  updateDocumentIntoDB,
  deleteDocumentFromDB,
  getDocumentsofUsersFromDB,
};