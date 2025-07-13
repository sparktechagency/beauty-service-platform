import mongoose, { mongo, Types } from "mongoose";
import { IWallet } from "./wallet.interface";
import { Wallet } from "./wallet.model";
import ApiError from "../../../errors/ApiErrors";
import { Widthdraw } from "./withdraw/withdraw.model";

import { WITHDRAW_STATUS } from "../../../enums/withdraw";
import { User } from "../user/user.model";
import stripe from "../../../config/stripe";
import crypto from "crypto";
import QueryBuilder from "../../builder/queryBuilder";
import { JwtPayload } from "jsonwebtoken";
import { UserTakeService } from "../usertakeservice/usertakeservice.model";
import { Subscription } from "../subscription/subscription.model";
import { Plan } from "../plan/plan.model";
import { sendNotifications } from "../../../helpers/notificationsHelper";

const createWallet = async (user:Types.ObjectId): Promise<IWallet | null> => {
    const isExist = await Wallet.findOne({ user });
    if (isExist) {
        return isExist;
    }
    const wallet = await Wallet.create({
        user: user,
        balance: 0,
        status: "active",
    });
    return wallet;
};

const getWallet = async (user:Types.ObjectId,query:Record<string,any>)=> {
    let wallet = await Wallet.findOne({ user });
    const queryBuilder = new QueryBuilder(Widthdraw.find({user:user,status:WITHDRAW_STATUS.PENDING}),query).sort().paginate()
    const paginationResult = await queryBuilder.getPaginationInfo()
    const withdraws = await queryBuilder.modelQuery.lean().exec()
    return {
        data:{
            wallet,
            withdraws
        },
        paginationResult:paginationResult
    }
};
const updateWallet = async (user:Types.ObjectId, amount:number): Promise<IWallet | null> => {
    let wallet = await Wallet.findOne({ user });
    if (!wallet) {
        wallet = await createWallet(user) as any
    }
    wallet!.balance !+= amount;
    await wallet!.save();
    return wallet;
};

const applyForWidthdraw = async (user:Types.ObjectId, amount:number) => {
   const transaction = await mongoose.startSession();
   try{
    await transaction.startTransaction();
    const userData = await User.findById(user).lean().exec()
    if(!userData){
        throw new ApiError(404,"User not found")
    }
    if(!userData.accountInfo?.loginLink){
        throw new ApiError(400,"Please add you stripe account info")
    }
    const wallet = await Wallet.findOne({ user });
    if (!wallet) {
        throw new ApiError(404, "Wallet not found");
    }
    if (wallet.balance < amount) {
        throw new ApiError(400, "Insufficient balance");
    }
    await wallet.updateOne({ balance: wallet.balance - amount },{session:transaction});
    const widthdraw = await Widthdraw.create({
        user,
        amount,
        status: WITHDRAW_STATUS.APPROVED,
    });
    await stripe.transfers.create({
        amount: amount * 100,
        currency: "usd",
        destination: userData.accountInfo.stripeAccountId,
    });

    await sendNotifications({
        title:"Withdraw Request",
        message:"Your withdraw request has been approved",
        isRead:false,
        receiver:[user._id],
        userId:user._id,
    })
    await transaction.commitTransaction();
    await transaction.endSession();
    return widthdraw;
   }
   catch(error:any){
    await transaction.abortTransaction();
    throw new ApiError(400,error.message);
   }
};

const getAllWithdraws = async (query:Record<string,any>)=> {
    const result = new QueryBuilder(Widthdraw.find(),query).sort().paginate().filter()
    const paginationResult = await result.getPaginationInfo()
    const data = await result.modelQuery.populate("user",["name","email"]).lean().exec()
    return {
        data,
        paginationResult
    };
};

const getSingleWithdraw = async (id:string)=>{
    const withdraw = await Widthdraw.findById(id)
    .populate("user",["name","email"])
    .lean()
    .exec()
    return withdraw;
}

const acceptOrRejectWithdraw = async (id:string,status:WITHDRAW_STATUS)=>{
    const createTransiction = await mongoose.startSession();
    try{
        createTransiction.startTransaction()

        const withdraw = await Widthdraw.findById(id);
        
        if(!withdraw){
            throw new ApiError(404,"Withdraw not found")
        }
        const user = await User.findById(withdraw.user);
        if(!user){
            throw new ApiError(404,"User not found")
        }

        if(withdraw.status !== WITHDRAW_STATUS.PENDING){
            throw new ApiError(400,"Withdraw already processed")
        }
        if(status == WITHDRAW_STATUS.APPROVED){

            const charges = await stripe.transfers.create({
                amount:withdraw.amount*100,
                currency:'usd',
                destination:user.accountInfo?.stripeAccountId!,
                description:`Withdrawal of ${withdraw.amount} from Beauty Care`,
            }
            )
              withdraw.status = status
              await withdraw.save()
        }
        else if (status == WITHDRAW_STATUS.REJECTED){
            withdraw.status = status
            await Wallet.findOneAndUpdate({user:withdraw.user},{
                $inc:{balance:withdraw.amount}
            })
            await withdraw.save()
        }
     

    }catch(err){
        createTransiction.abortTransaction()
        createTransiction.endSession()
        console.log(err);
        
        throw new ApiError(400,"Withdraw Failed")
       

    }

}

const userEarnings = async (user:JwtPayload,query:Record<string,any>)=>{
    const result = new QueryBuilder(UserTakeService.find({artiestId:user.id,status:"completed"}),query).sort().paginate()
    const paginationResult = await result.getPaginationInfo()
    const data = await result.modelQuery.populate('serviceId','name').lean().exec()
    const mappedData = data.map((item:any)=>{
        const date = new Date(item.createdAt).toDateString().slice(4,10)
        return {
            title:`${date} - ${item?.serviceId?.name||"demo"}`,
            amount:`$${item.price-(item?.artist_app_fee??0)}`,
        }
    })
    const lastWidthdraw:any = await Widthdraw.findOne({user:user.id,status:WITHDRAW_STATUS.APPROVED}).sort({createdAt:-1}).lean().exec()
    const lastWithdrawDate = lastWidthdraw?.createdAt
    return {
        data:{
            lastWithdrawDate,
            data:mappedData
        },
        paginationResult,
    }
}

const weeklyEarningFromDb = async (user:JwtPayload)=>{
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const endOfWeek = new Date();
    const query = {
        updatedAt: {
            $gte: startOfWeek,
            $lte: endOfWeek
        },
        status:"completed",
        artistId:user.id
    };
    const earnings = await UserTakeService.find(query).lean().exec();
    
    const totalEarnings = earnings.reduce((total, item) => total + item.price, 0);
    const walletPrice = await Wallet.findOne({user:user.id}).lean().exec();
    const subscription:any = await Subscription.findOne({user:user.id}).populate('package').lean().exec();
    return {
        weekly:totalEarnings,
        currentBalance:walletPrice?.balance,
        subscription:subscription?.package?.name||"free",

    }
}

export const WalletService = {
    createWallet,
    getWallet,
    updateWallet,
    applyForWidthdraw,
    getAllWithdraws,
    getSingleWithdraw,
    acceptOrRejectWithdraw,
    userEarnings,
    weeklyEarningFromDb
};
