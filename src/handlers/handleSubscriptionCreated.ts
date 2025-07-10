import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import ApiError from '../errors/ApiErrors';
import stripe from '../config/stripe';
import { Subscription } from '../app/modules/subscription/subscription.model';
import { User } from '../app/modules/user/user.model';
import { Plan } from '../app/modules/plan/plan.model';
import { BonusAndChallenge } from '../app/modules/bonusAndChallenge/bonusAndChallenge.model';
import { BonusAndChallengeServices } from '../app/modules/bonusAndChallenge/bonusAndChallenge.service';
import { BONUS_TYPE } from '../app/modules/bonusAndChallenge/bonusAndChallenge.interface';
import { Wallet } from '../app/modules/wallet/wallet.model';
import { WalletService } from '../app/modules/wallet/wallet.service';
import { Reward } from '../app/modules/reward/reward.model';
import { sendNotificationToFCM } from '../helpers/firebaseNotificationHelper';
import mongoose from 'mongoose';

export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {
    const sessions = await mongoose.startSession()
    try {
    const transaction = sessions.startTransaction()
        
    // Retrieve the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(data.id);
    console.log("Subscription",subscription);
    // Retrieve the customer associated with the subscription
    const customer = (await stripe.customers.retrieve( subscription.customer as string)) as Stripe.Customer;
   
    
    // Extract the price ID from the subscription items
    const priceId = subscription.items.data[0]?.price?.id;
    console.log("Price ID",priceId);
    // Retrieve the invoice to get the transaction ID and amount paid
    const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);

    const trxId = invoice?.payment_intent;

    const amountPaid = invoice?.total / 100;

    if (customer?.email) {
        
        const existingUser = await User.findOne({ email: customer?.email });
       
        
        if (existingUser) {
            // Find the pricing plan by priceId
            const pricingPlan = await Plan.findOne({ price_id: priceId });
            console.log("Pricing Plan",pricingPlan);
            if (pricingPlan) {
               
                
                // Create a new subscription record
                try {
                    const isExistSubscription = await Subscription.findOne({
                        user: existingUser?._id,
                        status: 'active',
                    });
                    if (isExistSubscription) {
                       await Subscription.findByIdAndUpdate(isExistSubscription?._id,{
                        status:"expired"
                       })
                    }
                    const newSubscription:any = await Subscription.create({
                        user: existingUser?._id,
                        customerId: customer?.id,
                        package: pricingPlan?._id,
                        status: 'active',
                        price: amountPaid,
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
                        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
                        subscriptionId: subscription.id,
                        trxId: trxId||'demo',
                    });

                    console.log("New Subscription",newSubscription);
                    
        
            
                    // Update the user to reflect the active subscription
                  const userData =  await User.findByIdAndUpdate(
                        existingUser?._id,
                        {
                            subscription:newSubscription?._id,
                        },
                        { new: true },
                    ); 

                    // console.log("User Data",userData);


                    const currentBonus = await BonusAndChallengeServices.currentBonusForUser(existingUser?._id,BONUS_TYPE.SUBSCRIPTION);

                    if(currentBonus && currentBonus.amount){
                        await WalletService.updateWallet(existingUser._id,currentBonus.amount||0);
                        await Reward.create({
                            user:existingUser?._id,
                            amount:currentBonus?.amount||0,
                            occation:"Subscription",
                            occationId:newSubscription?._id,
                            title:currentBonus.name,
                        })
                        await BonusAndChallenge.findOneAndUpdate(
                            {
                                _id:currentBonus?._id
                            },
                            {
                                $push:{
                                    tekenUsers:existingUser?._id
                                }
                            }
                        )

                        if(existingUser?.deviceToken){
                            await sendNotificationToFCM({
                            title:"Subscription",
                            body:"You have received a bonus for your subscription",
                            token:existingUser.deviceToken!,
                            data:{
                                type:"subscription"
                            }
                        })
                        }
                    }


                    
                } catch (error) {
                    console.log(error);
                    
                }
   
            } else {
               console.log('Pricing plan not found for price ID:', priceId);
            }
        } else {
            console.log('User not found for email:', customer?.email);
            return
        }
    
    } else {
        console.log('Customer not found for subscription ID:', subscription.id);
        return
    }
 
    await sessions.commitTransaction();
    sessions.endSession();
    } catch (error) {
        await sessions.abortTransaction();
        sessions.endSession();
        console.log(error);
        return error;
        
    }
}