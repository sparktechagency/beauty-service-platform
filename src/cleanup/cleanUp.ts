import cron from "node-cron";
import { Subscription } from "../app/modules/subscription/subscription.model";
import { User } from "../app/modules/user/user.model";
import { UserTakeService } from "../app/modules/usertakeservice/usertakeservice.model";
import { UserTakeServiceServices } from "../app/modules/usertakeservice/usertakeservice.service";

const expireSubscriptions = async ()=>{
    const subscriptions = await Subscription.find({
        status: "active",
        currentPeriodEnd: { $lte: new Date() },
    }).lean()
    subscriptions.forEach(async (subscription) => {
        await Subscription.findByIdAndUpdate(subscription._id, {
            status: "expired",
        });

        await User.findByIdAndUpdate(subscription.user, {
            subscription: null,
        });
    });

    await User.deleteMany({
        verified: false,
    })
}


export const cleanUp =()=>{
   cron.schedule("0 0 * * *", async()=>{
        await expireSubscriptions();
        console.log("Expired subscriptions");
   },{
    scheduled: true,
    timezone: "Asia/Dhaka",
   }

);
}


export const reminder =()=>{
   cron.schedule("*/0.1 * * * *", async()=>{
        await UserTakeServiceServices.reminderToUsers()
        console.log("Expired subscriptions");
   },{
    scheduled: true,
    timezone: "Asia/Dhaka",
   }

);
}

