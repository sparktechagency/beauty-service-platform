import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import ApiError from '../errors/ApiErrors';
import stripe from '../config/stripe';
import { Subscription } from '../app/modules/subscription/subscription.model';
import { User } from '../app/modules/user/user.model';


export const handleSubscriptionDeleted = async (data: Stripe.Subscription) => {

    // Retrieve the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(data.id);

    // Find the current active subscription
    const userSubscription = await Subscription.findOne({
        customerId: subscription.customer,
        status: 'active',
    });

    if (userSubscription) {

        // Deactivate the subscription
        await Subscription.findByIdAndUpdate(
            userSubscription._id,
            { status: 'expired' },
            { new: true }
        );
    
        // Find the user associated with the subscription
        const existingUser = await User.findById(userSubscription?.user);
        if(existingUser?.subscription,toString() !== userSubscription._id.toString()){
            throw new ApiError(StatusCodes.NOT_FOUND, `User not found.`);
        }
        if (existingUser) {
            await User.findByIdAndUpdate(
                existingUser._id,
                { subscription: null },
                { new: true },
            );
        } else {
            console.log('User not found.');
            return;
        }
    } else {
        console.log('Subscription not found.');
        return;
    }
}