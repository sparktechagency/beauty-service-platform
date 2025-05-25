import { Schema, model } from "mongoose";
import { IServiceManagement } from "./servicemanagement.interface";

const serviceManagementSchema = new Schema<IServiceManagement>({
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory: {
    type: Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  addOns: {
    type: [
      {
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

export const ServiceManagement = model<IServiceManagement>(
  "ServiceManagement",
  serviceManagementSchema
);
