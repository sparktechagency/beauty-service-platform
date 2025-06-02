import cron from "node-cron";
import { Subscription } from "../app/modules/subscription/subscription.model";
import { User } from "../app/modules/user/user.model";
import { UserTakeService } from "../app/modules/usertakeservice/usertakeservice.model";
import { UserTakeServiceServices } from "../app/modules/usertakeservice/usertakeservice.service";
import { Plan } from "../app/modules/plan/plan.model";

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

