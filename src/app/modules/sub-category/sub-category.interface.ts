import { Model, Types } from "mongoose";

export type ISubCategory = {
  category: Types.ObjectId;
  name: string;
  image: string;
};
