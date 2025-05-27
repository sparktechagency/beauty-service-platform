import { StatusCodes } from 'http-status-codes';

import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiErrors';
import QueryBuilder from '../../builder/queryBuilder';

const createAdminToDB = async (payload: IUser): Promise<IUser> => {
    const createAdmin: any = await User.create({
        ...payload,
        role: 'ADMIN',
        verified: true
    });
    if (!createAdmin) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Admin');
    }
    return createAdmin;
};

const deleteAdminFromDB = async (id: any): Promise<IUser | undefined> => {
    const isExistAdmin = await User.findByIdAndDelete(id);
    if (!isExistAdmin) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete Admin');
    }
    return;
};

const getAdminFromDB = async (query:Record<string,any>)=> {
    const result = new QueryBuilder(User.find({verified:true,isDeleted:false,role:'ADMIN'}),query).paginate().sort()
    const paginationInfo = await result.getPaginationInfo()
    const resultData = await result.modelQuery.lean()
    return {
        paginationInfo,
        resultData
    }
};

export const AdminService = {
    createAdminToDB,
    deleteAdminFromDB,
    getAdminFromDB
};
