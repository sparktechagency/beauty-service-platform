import { JwtPayload } from "jsonwebtoken";
import stripe from "../../../config/stripe";
import QueryBuilder from "../../builder/QueryBuilder";
import { IPlan } from "./plan.interface";
import { Plan } from "./plan.model";
import { USER_ROLES } from "../../../enums/user";

const createPlanToDB = async (payload: IPlan): Promise<IPlan | null> => {
  const product = await stripe.products.create({
    name: payload.name,
    description: "Monthly subscription",
  });
  const formatPrice = ((payload.price)) * 100
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

const getPlansFromDB = async (query: Record<string, any>,user:JwtPayload) => {
  const result = new QueryBuilder(Plan.find([USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN].includes(user.role) ? {status:{$ne:'delete'}} : {for:user.role, status:{$ne:'delete'}}), query).filter()
  return await result.modelQuery.sort({price:1}).lean();
};

const getPlanFromDB = async (id: string) => {
  const plan = await Plan.findById(id);
  return plan;
};
const updatePlanToDB = async (
  id: string,
  payload: Partial<IPlan>
): Promise<IPlan | null> => {
    if (payload.name) {
        const product = await stripe.products.update(payload.productId!, {
            name: payload.name,
        });
    }
    let price=payload.price_id;
    if (payload.price) {
        const price2 = await stripe.prices.update(payload.price_id!, {
            active:false
        });
        const formatPrice = ((payload.price)) * 100
        const newPrice = await stripe.prices.create({
            unit_amount: formatPrice,
            currency: "usd",
            recurring: {
              interval: "month",
            },
            product: payload.productId,
        });
        price=newPrice.id;
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
