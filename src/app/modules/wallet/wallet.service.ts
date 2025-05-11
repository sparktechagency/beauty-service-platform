import mongoose, { mongo, Types } from "mongoose";
import { IWallet } from "./wallet.interface";
import { Wallet } from "./wallet.model";
import ApiError from "../../../errors/ApiErrors";
import { Widthdraw } from "./withdraw/withdraw.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { WITHDRAW_STATUS } from "../../../enums/withdraw";
import { User } from "../user/user.model";
import stripe from "../../../config/stripe";
import crypto from "crypto";
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

const getWallet = async (user:Types.ObjectId): Promise<IWallet | null> => {
    const wallet = await Wallet.findOne({ user });
    if (!wallet) {
        const newWallet = await createWallet(user);
        return newWallet;
    }
    return wallet;
};
const updateWallet = async (user:Types.ObjectId, amount:number): Promise<IWallet | null> => {
    const wallet = await Wallet.findOne({ user });
    if (!wallet) {
        throw new ApiError(404,"Wallet not found");
    }
    wallet.balance += amount;
    await wallet.save();
    return wallet;
};

const applyForWidthdraw = async (user:Types.ObjectId, amount:number): Promise<IWallet | null> => {
    const wallet = await Wallet.findOne({ user });
    if (!wallet) {
        throw new ApiError(404,"Wallet not found");
    }
    if (wallet.balance < amount) {
        throw new ApiError(400,"Insufficient balance");
    }
    wallet.balance -= amount;
    await wallet.save();
    const widthdrawData = await Widthdraw.create({
        user: user,
        amount: amount,
    });
    return wallet;
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
              withdraw.transactionId = crypto.randomBytes(8).toString("hex").toUpperCase()
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

export const WalletService = {
    createWallet,
    getWallet,
    updateWallet,
    applyForWidthdraw,
    getAllWithdraws,
    getSingleWithdraw,
    acceptOrRejectWithdraw
};
