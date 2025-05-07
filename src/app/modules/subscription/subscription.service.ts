import { JwtPayload } from "jsonwebtoken";
import { Package } from "../package/package.model";
import { ISubscription } from "./subscription.interface";
import { Subscription } from "./subscription.model";
import stripe from "../../../config/stripe";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import { Plan } from "../plan/plan.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { paginateHelper } from "../../../helpers/paginateHelper";
import { date } from "zod";

const subscriptionToDB = async (user: JwtPayload, priceId: string) => {
    const packageData = await Plan.findOne({ price_id: priceId });
    if (!packageData) {
        throw new ApiError(404,"Package not found");
    }
    const subscription = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        customer_email: user.email,
        success_url: `https://beauty-care-website.vercel.app/dashboard`,
        cancel_url: `https://beauty-care-website.vercel.app/dashboard`,
        metadata: {
            data: JSON.stringify({
                userId: user.id,
                packageId: packageData.id,
            }), 
        }
    });

    return subscription.url;

}

const subscriptionDetailsFromDB = async (user: JwtPayload): Promise<{ subscription: ISubscription | {} }> => {

    const subscription = await Subscription.findOne({ user: user.id }).populate("package", "title credit").lean();
    if (!subscription) {
        return { subscription: {} }; // Return empty object if no subscription found
    }

    const subscriptionFromStripe = await stripe.subscriptions.retrieve(subscription.subscriptionId);

    // Check subscription status and update database accordingly
    if (subscriptionFromStripe?.status !== "active") {
        await Promise.all([
            User.findByIdAndUpdate(user.id, { isSubscribed: false }, { new: true }),
            Subscription.findOneAndUpdate({ user: user.id }, { status: "expired" }, { new: true }),
        ]);
    }

    return { subscription };
}



const subscriberFromDB = async (query: Record<string, any>) => {
   const queryBuilder = new QueryBuilder(Subscription.find(), query).sort()
   const data:any = await queryBuilder.modelQuery.populate([{
       path:"user",
       select:"name email"
   },
   {
    path:"package",
   }
]).lean()
   const filterData = data.filter((item:any)=>{
    return (
        (!query.status || item.status === query.status) &&
        (!query.package || item.package?.name?.toLowerCase() === query.package.toLowerCase()) &&
        (!query.user || item.package?.for?.toLowerCase() === query?.user?.toLowerCase())
    )
   })

   const paginate = paginateHelper.paginateArray(filterData,query)
   return {
    data : paginate.data,
    meta: paginate.pagination
   }
}

const changeSubscriptionStatus = async (subscriptionId: string, status: string) => {
    const subscription = await Subscription.findOne({ _id: subscriptionId });
    if (!subscription) {
        throw new ApiError(404, "Subscription not found");
    }
    const subscribePlan=await Subscription.findOneAndUpdate({ _id:subscriptionId }, { status }, { new: true });
    return subscribePlan
}

const overViewOfSubscription = async (query: Record<string, any>) => {

    
    const groupData = await Subscription.aggregate([
        {
            $lookup: {
                from: "plans",
                localField: "package",
                foreignField: "_id",
                as: "package",
            }
        },

        // Group by the "package" field
        {
            $group: {
                _id: "$package._id",
                totalAmount: { $sum: "$package.price" },
                package: { $first: "$package" },
                totalActiveSubscriber:{
                    $sum:{$cond:[{ $eq:["$status","active"]},1,0]}
                },
                totalSubscriber:{
                    $sum:1
                }
            }
        },
        {
            $addFields: {
                package:{
                    $arrayElemAt: ["$package", 0]
                },
            }
        }
    ]);
    const finalArray =await Promise.all(groupData.filter((item:any)=>!query.user || item.package.for==query.user).map(async (item: any) => {
        console.log(item);
        
        const totalPrice = item.package.price*item.totalSubscriber
        
        
        const totalSubscriber = await Subscription.find({package:item.package._id,status:"active"}).lean()
        const filterItems =  totalSubscriber.filter((item:any)=>{
            const date1 = new Date(item.createdAt)
            const date2 = new Date()
            const diffTime = Math.abs(date2.getTime() - date1.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            return diffDays<=1
        })

        return {
            id:item.package._id,
            name:item.package.name,
            subscriber: item.totalActiveSubscriber,
            totalAmount: totalPrice,
            todays_subscriber: filterItems.length,
        };
    }))

    const plans = await Plan.find({status:{$ne:"delete"},for:query.user||""}).lean()
    const finalData = plans.filter(item=>{
        return !finalArray.some(data=>data.id.toString()==item._id.toString())
    }).map(item=>{
        return {
            id:item._id,
            name:item.name,
            subscriber: 0,
            totalAmount: 0,
            todays_subscriber: 0,
        }

        })
    return [...finalArray,...finalData]
    }


export const SubscriptionService = {
    subscriptionDetailsFromDB,
    subscriberFromDB,
    subscriptionToDB,
    changeSubscriptionStatus,
    overViewOfSubscription
}