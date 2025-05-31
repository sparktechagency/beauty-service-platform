import { model, Schema } from 'mongoose'
import { ICategory } from './category.interface'

const serviceSchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: [String],
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    }
  },
  { timestamps: true },
)

export const Category = model<ICategory>('Category', serviceSchema)