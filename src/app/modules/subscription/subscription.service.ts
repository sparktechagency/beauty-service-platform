import { JwtPayload } from "jsonwebtoken";
import { ISubscription } from "./subscription.interface";
import { Subscription } from "./subscription.model";
import stripe from "../../../config/stripe";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import { Plan } from "../plan/plan.model";
import QueryBuilder from "../../builder/queryBuilder";
import { paginateHelper } from "../../../helpers/paginateHelper";
import { date } from "zod";
import { IPlan } from "../plan/plan.interface";

const subscriptionToDB = async (user: JwtPayload, priceId: string) => {

  
  const packageData = await Plan.findOne({ price_id: priceId });

  // const bonus = 

  if (!packageData) {
    throw new ApiError(404, "Package not found");
  }
  console.log(user);
  
  if (packageData.for !== user.role) {
    throw new ApiError(404, "Role not matched");
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
    success_url: `https://www.your.com/user/payment-success`,
    cancel_url: `https://www.your.com/user/payment-cancel`,
    metadata: {
      data: JSON.stringify({
        userId: user.id,
        packageId: packageData.id,
      }),
    },
  });

  return subscription.url;
};

const subscriptionDetailsFromDB = async (
  user: JwtPayload
): Promise<{ subscription: ISubscription | {} }> => {
  const subscription = await Subscription.findOne({ user: user.id })
    .populate("package")
    .lean();
  if (!subscription) {
    return { subscription: {} }; // Return empty object if no subscription found
  }

  const subscriptionFromStripe = await stripe.subscriptions.retrieve(
    subscription.subscriptionId
  );

  // Check subscription status and update database accordingly
  if (subscriptionFromStripe?.status !== "active") {
    await Promise.all([
      User.findByIdAndUpdate(user.id, { isSubscribed: false }, { new: true }),
      Subscription.findOneAndUpdate(
        { user: user.id },
        { status: "expired" },
        { new: true }
      ),
    ]);
  }

  return { subscription };
};




const subscriberFromDB = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(Subscription.find(), query).sort();
  const data: any = await queryBuilder.modelQuery
    .populate([
      {
        path: "user",
        select: "name email",
      },
      {
        path: "package",
      },
    ])
    .lean();
  const filterData = data.filter((item: any) => {
    return (
      (!query.status || item.status === query.status) &&
      (!query.package ||
        item.package?.name?.toLowerCase() === query.package.toLowerCase()) &&
      (!query.user ||
        item.package?.for?.toLowerCase() === query?.user?.toLowerCase())
    );
  });

  const paginate = paginateHelper.paginateArray(filterData, query);
  return {
    data: paginate.data,
    meta: paginate.pagination,
  };
};

const changeSubscriptionStatus = async (
  subscriptionId: string,
  status: string
) => {
  const subscription = await Subscription.findOne({ _id: subscriptionId });
  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }
  const subscribePlan = await Subscription.findOneAndUpdate(
    { _id: subscriptionId },
    { status },
    { new: true }
  );
  return subscribePlan;
};

const overViewOfSubscription = async (query: Record<string, any>) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const groupData = await Subscription.aggregate([
    {
      $lookup: {
        from: "plans",
        localField: "package",
        foreignField: "_id",
        as: "package",
      },
    },
    { $unwind: "$package" },
    ...(query.user ? [{ $match: { "package.for": query.user } }] : []),
    {
      $group: {
        _id: "$package._id",
        package: { $first: "$package" },
        totalActiveSubscriber: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, 1, 0],
          },
        },
        totalSubscriber: { $sum: 1 },
        todays_subscriber: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "active"] },
                  { $gte: ["$createdAt", yesterday] },
                  { $lte: ["$createdAt", now] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $addFields: {
        totalAmount: { $multiply: ["$package.price", "$totalSubscriber"] },
      },
    },
  ]);

  // Get all plans that are not in groupData
  const usedPlanIds = groupData.map((item) => item._id.toString());
  const unusedPlans = await Plan.find({
    status: { $ne: "delete" },
    ...(query.user && { for: query.user }),
    _id: { $nin: usedPlanIds },
  }).lean();

  const unusedPlanData = unusedPlans.map((item) => ({
    id: item._id,
    name: item.name,
    subscriber: 0,
    totalAmount: 0,
    todays_subscriber: 0,
  }));

  const finalArray = groupData.map((item) => ({
    id: item._id,
    name: item.package.name,
    subscriber: item.totalActiveSubscriber,
    totalAmount: item.totalAmount,
    todays_subscriber: item.todays_subscriber,
  }));

  return [...finalArray, ...unusedPlanData];
};


const subsriprionDetailsFromDB = async (user:JwtPayload)=>{
  const subscription = await Subscription.findOne({user:user.id}).populate('package').lean()



  if(!subscription){
    return {subscription:{}}
  }
    const packageData = subscription.package as any as IPlan
  const allPackageOffers = await Plan.find({status:{
    $ne:'deleted'
  },for:packageData?.for},{name:1,price_offer:1}).sort({price_offer:1}).lean()
  
  

  return {priceOffer:packageData.price_offer,allPackageOffers}
}

export const SubscriptionService = {
  subscriptionDetailsFromDB,
  subscriberFromDB,
  subscriptionToDB,
  changeSubscriptionStatus,
  overViewOfSubscription,
  subsriprionDetailsFromDB
};
