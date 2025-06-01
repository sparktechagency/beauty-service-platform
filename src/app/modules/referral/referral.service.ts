import { JwtPayload } from "jsonwebtoken";
import crypto from 'crypto';
import { Referral } from "./referral.model";
import { USER_ROLES } from "../../../enums/user";

import { Types } from "mongoose";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import stripe from "../../../config/stripe";
import { emailHelper } from "../../../helpers/emailHelper";
import { emailTemplate } from "../../../shared/emailTemplate";
import { Wallet } from "../wallet/wallet.model";
import { WalletService } from "../wallet/wallet.service";
import QueryBuilder from "../../builder/queryBuilder";
import { Reward } from "../reward/reward.model";
import { BonusAndChallengeServices } from "../bonusAndChallenge/bonusAndChallenge.service";
import { BONUS_TYPE } from "../bonusAndChallenge/bonusAndChallenge.interface";
import { BonusAndChallenge } from "../bonusAndChallenge/bonusAndChallenge.model";
import { sendNotificationToFCM } from "../../../helpers/firebaseNotificationHelper";

const getReferral = async (user:JwtPayload,query:Record<string,any>)=>{
    
        const result = new QueryBuilder(Referral.find([USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN].includes(user.role)?{}:{referral_user:user.id}),query).sort().paginate()
        const  paginationInfo = await result.getPaginationInfo()
        const data = await result.modelQuery.populate([{
            path:'referral_user',
            select:'name email profile'
        },{
            path:'token_user',
            select:'name email profile'
        }
        ]).lean()
        return {
            data:data,
            paginationInfo:paginationInfo
        }
}

const acceptReferral = async (user:Types.ObjectId,id:string)=>{
    const OriginUserData = await User.findOne({reffralCodeDB:id})
    if(!OriginUserData) throw new Error("User not found")
    const referral = await Referral.findOne({token_user:user})
    if(referral) throw new ApiError(400,"You already accepted this referral")
    const referral2 = new Referral()
    referral2.token_user = user
    referral2.referral_user = OriginUserData._id
    referral2.referralCode = id
    referral2.amount = 10
    const tokenUser = await User.findById(user)
    if(!tokenUser) throw new Error("Token user not found")
  
    await referral2.save()

    

    const acceptEmailTemplate = emailTemplate.referralAcceptedEmail({name:OriginUserData.name,email:OriginUserData.email,referral:referral2.referralCode,amount:referral2.amount,referralUserNamee:tokenUser.name})
    await emailHelper.sendEmail(acceptEmailTemplate)
    await WalletService.updateWallet(referral2.referral_user,referral2.amount)

    const currenBonus = await BonusAndChallengeServices.currentBonusForUser(referral2.referral_user,BONUS_TYPE.REFERRAL)

    if(currenBonus){
        const timePerodedRefferals = await Referral.countDocuments({
            referral_user:referral2.referral_user,
            createdAt:{
             $gte:currenBonus.startDate,
             $lte:currenBonus.endDate
            }
        })
        

        if(timePerodedRefferals == currenBonus.number){
            await WalletService.updateWallet(referral2.referral_user,currenBonus.amount)
            await Reward.create({
                user:referral2.referral_user,
                title:`${currenBonus.name}`,
                amount:currenBonus.amount,
                occation:"Referral",
                occationId:referral2.referral_user
            })
          
            await BonusAndChallenge.findOneAndUpdate({
                _id:currenBonus._id
            },{
                $push:{
                    tekenUsers:referral2.referral_user
                }
            })

            const userData = await User.findById(referral2.referral_user)
            if(userData?.deviceToken){
                await sendNotificationToFCM({
                    title:"Referral Bonus",
                    body:`You have received ${currenBonus.amount} from ${tokenUser.name}`,
                    token:userData.deviceToken,
                    data:{
                        type:"referral",
                        amount:currenBonus.amount
                    }
                })
            }
        }
    }

    return referral
}

const getRefferralById = async (id:string)=>{
    const referral = await Referral.findById(id).populate(['referral_user','token_user'],['name','email'])
    if(!referral) throw new Error("Referral not found")
    return referral
}


const getReferralAndBonusesFromDB = async (user:JwtPayload)=>{

    const referrals = await Referral.find({referral_user:user.id}).populate([
        {
            path:'token_user',
            select:'name email'
        }
    ])

    
    const bonuses = await Reward.find({user:user.id}).select('title amount')

    const totalBonus = bonuses.reduce((acc,curr)=>acc+curr.amount,0)
    const totalReferral = referrals.reduce((acc,curr)=>acc+curr.amount,0)

    return {
        totalBonus:totalBonus,
        totalReferral:totalReferral,
        referrals:referrals,
        bonuses:bonuses
    }
}

export const ReferralService={
    getReferral,
    acceptReferral,
    getRefferralById,
    getReferralAndBonusesFromDB
}
