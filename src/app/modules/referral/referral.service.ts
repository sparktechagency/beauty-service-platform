import { JwtPayload } from "jsonwebtoken";
import crypto from 'crypto';
import { Referral } from "./referral.model";
import { USER_ROLES } from "../../../enums/user";
import QueryBuilder from "../../builder/QueryBuilder";
import { Types } from "mongoose";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import stripe from "../../../config/stripe";
import { emailHelper } from "../../../helpers/emailHelper";
import { emailTemplate } from "../../../shared/emailTemplate";
import { Wallet } from "../wallet/wallet.model";
import { WalletService } from "../wallet/wallet.service";
const createReferral = async (user:JwtPayload)=>{
    const referralCode = crypto.randomBytes(16).toString('hex');
    const userData = await User.findById(user.id)
    if(!userData) throw new Error("User not found")
    if(!userData.accountInfo?.stripeAccountId){
       throw new ApiError(400,"Please connect your stripe account first")
    }
    const referral = await Referral.create({
        referralCode,
        amount:10,
        status:"pending",
        referral_user:userData._id
    })
    return referral
}
const getReferral = async (user:JwtPayload,query:Record<string,any>)=>{
    
        const result = new QueryBuilder(Referral.find([USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN].includes(user.role)?{status:'accepted'}:{referral_user:user.id,status:'accepted'}),query).sort().paginate()
        const  paginationInfo = await result.getPaginationInfo()
        const data = await result.modelQuery.populate([{
            path:'referral_user',
            select:'name email'
        },{
            path:'token_user',
            select:'name email'
        }
        ]).lean().exec()
        return {
            data:data,
            paginationInfo:paginationInfo
        }
}

const acceptReferral = async (user:Types.ObjectId,id:string)=>{
    const referral = await Referral.findOne({referralCode:id})
    if(!referral) throw new Error("Referral not found")
    if(referral.status !== "pending") throw new Error("Referral already accepted")
    referral.status = "accepted"
    referral.token_user = user
    const tokenUser = await User.findById(user)
    if(!tokenUser) throw new Error("Token user not found")
    const userData = await User.findById(referral.referral_user)
    if(!userData) throw new Error("User not found")
    if(!userData.accountInfo?.stripeAccountId){
           throw new ApiError(400,"Please connect your stripe account first")
    }

    await referral.save()
    const acceptEmailTemplate = emailTemplate.referralAcceptedEmail({name:userData.name,email:userData.email,referral:referral.referralCode,amount:referral.amount,referralUserNamee:tokenUser.name})
    await emailHelper.sendEmail(acceptEmailTemplate)
    await WalletService.updateWallet(referral.referral_user,referral.amount)
    return referral
}

const getRefferralById = async (id:string)=>{
    const referral = await Referral.findById(id).populate(['referral_user','token_user'],['name','email']).lean().exec()
    if(!referral) throw new Error("Referral not found")
    return referral
}

export const ReferralService={
    createReferral,
    getReferral,
    acceptReferral,
    getRefferralById
}
