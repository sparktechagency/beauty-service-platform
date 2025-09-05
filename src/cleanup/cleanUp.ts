import cron from "node-cron";
import { Subscription } from "../app/modules/subscription/subscription.model";
import { User } from "../app/modules/user/user.model";
import { UserTakeService } from "../app/modules/usertakeservice/usertakeservice.model";
import { UserTakeServiceServices } from "../app/modules/usertakeservice/usertakeservice.service";
import { Plan } from "../app/modules/plan/plan.model";
import { Socket } from "socket.io";
import { SubscriptionService } from "../app/modules/subscription/subscription.service";
import { USER_ROLES } from "../enums/user";

const expireSubscriptions = async ()=>{
   try {
    // console.log("==========================================Expire Subscriptions==========================================");
     let subscriptions = await Subscription.find({
        status: "active",
        currentPeriodEnd: { $lte: new Date() },
    }).lean()

    
    subscriptions.forEach(async (subscription) => {
        const subscribePlan:any = await Subscription.findByIdAndUpdate(subscription?._id, {
            status: "expired",
        },{new:true}).populate('package').lean().exec()
        

        const freeSubscription = await Plan.find({
            for:subscribePlan?.package?.for,
        }).sort({price:1}).lean().exec()
        
        
        
        const firstFreePlan = freeSubscription[0]

           const sub = await Subscription.create({
                user:subscription.user,
                package:firstFreePlan?._id,
                status:"active",
                currentPeriodStart:new Date(),
                currentPeriodEnd:new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                price:firstFreePlan.price||0,
                customerId:crypto.randomUUID(),
                subscriptionId:crypto.randomUUID(),
                trxId:crypto.randomUUID()
            })

        
            
        

        await User.findByIdAndUpdate(subscription.user, {
            subscription: sub?._id,
        });
    });


    const unSubscribedUsers = await User.find({subscription:{$exists:false},role:{$in:[USER_ROLES.ARTIST,USER_ROLES.USER]}}).lean()

    for(const user of unSubscribedUsers){
        const freePlan = await Plan.findOne({for:user.role}).sort({price:1}).lean()
        const subscription = await Subscription.create({
            user:user._id,
            package:freePlan?._id,
            status:"active",
            currentPeriodStart:new Date(),
            currentPeriodEnd:new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            price:freePlan?.price||0,
            customerId:crypto.randomUUID(),
            subscriptionId:crypto.randomUUID(),
            trxId:crypto.randomUUID()
        })
        await User.findOneAndUpdate({_id:user._id},{subscription:subscription._id},{new:true})
    }

    await User.deleteMany({
        verified: false,
    })
   } catch (error) {
    console.log(error)
   }
}


export const cleanUp = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      await expireSubscriptions();
    } catch (error) {
      console.log(error)
      
    }

  }, {
    scheduled: true,
    timezone: "America/New_York",
  });
};



export const reminder = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      await UserTakeServiceServices.reminderToUsers();
    } catch (error) {
      console.log(error)

    }

  }, {
    scheduled: true,
    timezone: "America/New_York",
  });
};

export const deleteExpiredOrders = () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      // console.log("==========================================Deleted expired orders==========================================");
         await expandOrderTimeAndDelete()
    // console.log("Deleted expired orders");
    } catch (error) {
      console.log(error)
    }
 
  }, {
    scheduled: true,
    timezone: "America/New_York",
  });
};

export async function subscriberFromDB(){
  const users = await User.find({subscription:{$exists:false},role:{$in:[USER_ROLES.ARTIST,USER_ROLES.USER]}}).lean()

  for(const user of users){
    await SubscriptionService.createFreeSubscription(user._id as any)
  }

  console.log(users);
  
}




const expandOrderTimeAndDelete = async () => {
  try {
    const now = new Date();

    const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60 * 1000);

    

    // ✅ last 10–15 mins orders
    const orders_10_15 = await UserTakeService.find({
      createdAt: { $gte: minutesAgo(15), $lte: minutesAgo(10) },
      status: "pending",
      isBooked: false,
    }).lean();

    // console.log("10–15 mins old orders:", orders_10_15.length);

    for (const order of orders_10_15) {
      await UserTakeServiceServices.expandAreaForOrder(order._id, 300);
    }

    // ✅ last 25–30 mins orders
    const orders_25_30 = await UserTakeService.find({
      createdAt: { $gte: minutesAgo(30), $lte: minutesAgo(25) },
      status: "pending",
      isBooked: false,
    }).lean();

    // console.log("25–30 mins old orders:", orders_25_30.length);

    for (const order of orders_25_30) {
      await UserTakeServiceServices.expandAreaForOrder(order._id, 400);
    }

    await UserTakeService.updateMany({
      service_date: { $lt: new Date()  },
      status: "pending",
      isBooked: false,
    },{
      status:"cancelled",
    })

  } catch (error) {
    console.error(error);
  }
};




