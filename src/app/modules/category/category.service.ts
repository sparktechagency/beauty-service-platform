import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { ICategory } from "./category.interface";
import { Category } from "./category.model";
import unlinkFile from "../../../shared/unlinkFile";

const createCategoryToDB = async (payload: ICategory) => {
  const isExistName = await Category.findOne({ name: payload.name });

  if (isExistName) {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      "This Category Name Already Exist"
    );
  }

  const createCategory = await Category.create(payload);
  return createCategory;
};

const getCategoriesFromDB = async (): Promise<ICategory[]> => {
  const result = await Category.find({});
  return result;
};

const updateCategoryToDB = async (id: string, payload: ICategory) => {
  const isExistCategory = await Category.findById(id);

  if (!isExistCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
  }

 
  let temp:any = payload
  
  
  temp.existImage = typeof temp.existImage === "string" ? [temp.existImage] : temp.existImage
  if (payload.image) {
    isExistCategory.image.forEach(item=>{
      if(!temp.existImage.includes(item)){
        unlinkFile(item)
      }
    })

  }

    if(temp.existImage){
      payload.image=payload.image?[...payload.image,...temp.existImage]:[...temp.existImage]
    }
 
  

  const updateCategory = await Category.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateCategory;
};

const deleteCategoryToDB = async (id: string): Promise<ICategory | null> => {
  const deleteCategory = await Category.findByIdAndDelete(id);
  if (!deleteCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
  }
  return deleteCategory;
};

const getSingleCategoryFromDB = async (id: string) => {
  const result = await Category.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
  }
  return result;
};

export const CategoryService = {
  createCategoryToDB,
  getCategoriesFromDB,
  updateCategoryToDB,
  deleteCategoryToDB,
  getSingleCategoryFromDB,
};
