import e, { Request, Response } from "express";
import config from "../../../config";
import stripe from "../../../config/stripe";
import { handleSubscriptionCreated, handleSubscriptionDeleted } from "../../../handlers";
import Stripe from "stripe";
import { User } from "../user/user.model";
import { UserTakeService } from "../usertakeservice/usertakeservice.model";
import { UserTakeServiceServices } from "../usertakeservice/usertakeservice.service";
import { ReviewService } from "../review/review.service";

export const handleWebHook =async (req:Request, res:Response) => {
    const sig = req.headers["stripe-signature"];
    const  webhookSecret = config.stripe.webhookSecret;
    const event = stripe.webhooks.constructEvent(req.body,sig!,webhookSecret!);
    switch(event.type){
        case 'checkout.session.completed':
            if(event.data.object.mode!='subscription'){
            const metadata = JSON.parse(event.data.object?.metadata?.data!)

            if(metadata.tip){
                await ReviewService.handleTip(metadata)
            }
            else{
                const payload = JSON.parse(event.data.object.metadata?.data!)
                await UserTakeServiceServices.bookOrder(payload.orderId,event.data.object.payment_intent as string)
            }
            }

            break;
        case 'customer.subscription.created':
            await handleSubscriptionCreated(event.data.object)
            
            break;

        case 'customer.subscription.updated':
            console.log("subscription updated");
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object);
            
            break;
        case 'payment_intent.succeeded':
            break;
        case 'invoice.paid':

            break;
            case "account.updated":
          const account = event.data.object as Stripe.Account;
          await User.HandleConnectStripe(account);
          break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
   return res.status(200).json({message:"success"});
   

}