import cron from "node-cron";
import { Subscription } from "../app/modules/subscription/subscription.model";
import { User } from "../app/modules/user/user.model";
import { UserTakeService } from "../app/modules/usertakeservice/usertakeservice.model";
import { UserTakeServiceServices } from "../app/modules/usertakeservice/usertakeservice.service";
import { Plan } from "../app/modules/plan/plan.model";
import { Socket } from "socket.io";

const expireSubscriptions = async ()=>{
   try {
    console.log("==========================================Expire Subscriptions==========================================");
     const subscriptions = await Subscription.find({
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
                price:firstFreePlan.price,
                customerId:crypto.randomUUID(),
                subscriptionId:crypto.randomUUID(),
                trxId:crypto.randomUUID()
            })

        
            
        

        await User.findByIdAndUpdate(subscription.user, {
            subscription: sub?._id,
        });
    });

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
  cron.schedule("*/0.01 * * * *", async () => {
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




const expandOrderTimeAndDelete = async () => {
  try {
    console.log("==========================================Deleted expired orders==========================================");
    const now = new Date();

  const minutesAgo = (mins:any) => new Date(now.getTime() - mins * 60 * 1000);

  const orders_15_10 = await UserTakeService.find({
    createdAt: { $gte: minutesAgo(1), $lte: minutesAgo(10) },
    status: "pending",
    isBooked:false
  }).lean();

  if(orders_15_10.length>0){
    for (const order of orders_15_10) {
      await UserTakeServiceServices.expandAreaForOrder(order?._id, 100);
      // console.log("Expanded area by 100 for order:", order._id);
    }
  }

  const orders_30_25 = await UserTakeService.find({
    createdAt: { $gte: minutesAgo(1), $lte: minutesAgo(25) },
    status: "pending",
    isBooked:false
  }).lean();

  if(orders_30_25.length>0){
    for (const order of orders_30_25) {
      await UserTakeServiceServices.expandAreaForOrder(order?._id, 150);
      // console.log("Expanded area by 200 for order:", order._id);
    }
  }

  const cancelResult = await UserTakeService.updateMany(
    {
      createdAt: { $gte: minutesAgo(1), $lte: minutesAgo(30) },
      status: "pending",
      isBooked:false
    },
    { status: "cancelled" }
  );

  } catch (error) {
    console.log(error)
    
  }
  // console.log("Cancelled orders:", cancelResult.modifiedCount);
};



