import { Model } from "mongoose"
import { USER_ROLES } from "../../../enums/user"

export type IPlan = {
    name:string,
    price:number,
    price_offer:number,
    offers:string[],
    price_id?:string,
    for:USER_ROLES,
    paymentLink?:string,
    productId?:string,
}

export type PlanModel = Model<IPlan,Record<string,any>>