import { JwtPayload } from "jsonwebtoken";
import stripe from "../../../config/stripe";
import QueryBuilder from "../../builder/queryBuilder";
import { IPlan } from "./plan.interface";
import { Plan } from "./plan.model";
import { USER_ROLES } from "../../../enums/user";

const createPlanToDB = async (payload: IPlan): Promise<IPlan | null> => {
  const product = await stripe.products.create({
    name: payload.name,
    description: "Monthly subscription",
  });
  const formatPrice = parseInt((((payload.price)) * 100).toFixed(2));
  const price = await stripe.prices.create({
    unit_amount:formatPrice ,
    currency: "usd",
    recurring: {
      interval: "month",
    },
    product: product.id,
    
  });

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ]
  })
  
  const plan =await Plan.create({ ...payload, price_id: price.id, productId: product.id, paymentLink: paymentLink.url });
  return plan;
};

const getPlansFromDB = async (query: Record<string, any>) => {
  const result = new QueryBuilder(Plan.find({status:{$ne:'delete'}}), query).filter()
  return await result.modelQuery.lean();
};

const getPlanFromDB = async (id: string) => {
  const plan = await Plan.findById(id);
  return plan;
};
const updatePlanToDB = async (
  id: string,
  payload: Partial<IPlan>
): Promise<IPlan | null> => {
  const existingPlan = await Plan.findById(id);
    if (payload.name) {
        const product = await stripe.products.update(existingPlan?.productId!, {
            name: payload.name,
        });
    }
    let price=payload.price_id;
    if (payload.price!==undefined) {
        const price2 = await stripe.prices.update(existingPlan?.price_id!, {
            active:false
        });
        const formatPrice = parseInt((((payload.price)) * 100).toFixed(2))

        const newPrice = await stripe.prices.create({
            unit_amount: formatPrice,
            currency: "usd",
            recurring: {
              interval: "month",
            },
            product: existingPlan?.productId,
        });
        price=newPrice.id;
        console.log(newPrice);
        
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
              {
                price: newPrice.id,
                quantity: 1,
              },
            ]
          })
        payload.paymentLink=paymentLink.url;
    }

    if(price){
        payload.price_id=price;
    }
  const plan = await Plan.findByIdAndUpdate(id, payload, { new: true });
  return plan;
};


export const PlanService = {
  createPlanToDB,
  getPlansFromDB,
  getPlanFromDB,
  updatePlanToDB
};
