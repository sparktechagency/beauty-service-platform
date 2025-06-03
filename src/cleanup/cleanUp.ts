import cron from "node-cron";
import { Subscription } from "../app/modules/subscription/subscription.model";
import { User } from "../app/modules/user/user.model";
import { UserTakeService } from "../app/modules/usertakeservice/usertakeservice.model";
import { UserTakeServiceServices } from "../app/modules/usertakeservice/usertakeservice.service";
import { Plan } from "../app/modules/plan/plan.model";
import { Socket } from "socket.io";

const expireSubscriptions = async ()=>{
    const subscriptions = await Subscription.find({
        status: "active",
        currentPeriodEnd: { $lte: new Date() },
    }).lean()
    
    
    subscriptions.forEach(async (subscription) => {
        const subscribePlan:any = await Subscription.findByIdAndUpdate(subscription._id, {
            status: "expired",
        },{new:true}).populate('package').lean().exec()
        

        const freeSubscription = await Plan.find({
            for:subscribePlan?.package?.for,
        }).sort({price:1}).lean().exec()
        
        
        
        const firstFreePlan = freeSubscription[0]

           const sub = await Subscription.create({
                user:subscription.user,
                package:firstFreePlan._id,
                status:"active",
                currentPeriodStart:new Date(),
                currentPeriodEnd:new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                price:firstFreePlan.price,
                customerId:crypto.randomUUID(),
                subscriptionId:crypto.randomUUID(),
                trxId:crypto.randomUUID()
            })

        
            
        

        await User.findByIdAndUpdate(subscription.user, {
            subscription: sub._id,
        });
    });

    await User.deleteMany({
        verified: false,
    })
}


export const cleanUp = () => {
  cron.schedule("0 0 * * *", async () => {
    await expireSubscriptions();
    console.log("Expired subscriptions");
  }, {
    scheduled: true,
    timezone: "America/New_York",
  });
};

export const reminder = () => {
  cron.schedule("0 0 * * *", async () => {
    await UserTakeServiceServices.reminderToUsers();
    console.log("Sent reminders to users");
  }, {
    scheduled: true,
    timezone: "America/New_York",
  });
};

export const deleteExpiredOrders = () => {
  cron.schedule("0 0 * * *", async () => {
    await expandOrderTimeAndDelete()
    console.log("Deleted expired orders");
  }, {
    scheduled: true,
    timezone: "America/New_York",
  });
};




const expandOrderTimeAndDelete = async ()=>{
  const currentDate = new Date();
  // 15 minutes before the current time
  const fifteenMinutesAgo = new Date(currentDate.getTime() - 15 * 60 * 1000);

  const thirteen = new Date(currentDate.getTime() - 13 * 60 * 1000);



  // 30 minutes before the current time
  const thirtyMinutesAgo = new Date(currentDate.getTime() - 30 * 60 * 1000);

  const twenttEightMinutesAgo = new Date(currentDate.getTime() - 28 * 60 * 1000);

  const fifteenMinutesAgoOrders = await UserTakeService.find({
    createdAt: {
      $gte: fifteenMinutesAgo,
      $lte: thirteen,
    },
    status: "pending",
  }).lean().exec();

  for (const order of fifteenMinutesAgoOrders) {
    await UserTakeServiceServices.expandAreaForOrder(order._id,100);
    console.log("Expanded order time for order:", order._id);
  }
  const thirtyMinutesAgoOrders = await UserTakeService.find({
    createdAt: {
      $gte: thirtyMinutesAgo,
      $lte: twenttEightMinutesAgo,
    },
    status: "pending",
  }).lean().exec();
  for (const order of thirtyMinutesAgoOrders) {
    await UserTakeServiceServices.expandAreaForOrder(order._id,200);
    console.log("Expanded order time for order:", order._id);
  }

  await UserTakeService.updateMany({
    createdAt: {
      $gte: new Date(currentDate.getTime() - 35 * 60 * 1000),
      $lte: new Date(currentDate.getTime() - 30 * 60 * 1000),
    },
    status: "pending",
  },{
    status:"cancelled"
  }).lean().exec();
  

}



