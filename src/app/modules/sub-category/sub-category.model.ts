import { Schema, model } from 'mongoose';
import { ISubCategory } from './sub-category.interface';


const subCategorySchema = new Schema<ISubCategory>({
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
},{
    timestamps: true,
});

export const SubCategory = model<ISubCategory>('SubCategory', subCategorySchema);
