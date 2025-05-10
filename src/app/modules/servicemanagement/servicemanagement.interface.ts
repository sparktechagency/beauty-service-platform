import { Types } from 'mongoose';

interface IAddOn {
  title: string;
  price: number;
}

export type IServiceManagement = {
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  name: string;
  basePrice: number;
  addOns: IAddOn[];
  image: string;
};
