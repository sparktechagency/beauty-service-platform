import e, { Request, Response } from "express";
import config from "../../../config";
import stripe from "../../../config/stripe";
import { handleSubscriptionCreated } from "../../../handlers";

export const handleWebHook =async (req:Request, res:Response) => {
    const sig = req.headers["stripe-signature"];
    const  webhookSecret = config.stripe.webhookSecret;
    const event = stripe.webhooks.constructEvent(req.body,sig!,webhookSecret!);
    switch(event.type){
        case 'checkout.session.completed':

            break;
        case 'customer.subscription.created':
            await handleSubscriptionCreated(event.data.object)
            
            break;

        case 'customer.subscription.updated':
            console.log("subscription updated");
            break;
        case 'customer.subscription.deleted':
            console.log("subscription deleted");
            break;
        case 'payment_intent.succeeded':
            break;
        case 'invoice.paid':

            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
   return res.status(200).json({message:"success"});
   

}