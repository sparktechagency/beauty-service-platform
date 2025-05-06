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
  const price = await stripe.prices.create({
    unit_amount: (payload.price-(payload.price*(payload.price_offer/100))) * 100,
    currency: "usd",
    recurring: {
      interval: "month",
    },
    product: product.id,
    
  });
  
  const plan =await Plan.create({ ...payload, price_id: price.id, productId: product.id, paymentLink: "demo" });
  return plan;
};

const getPlansFromDB = async (query: Record<string, any>,user:JwtPayload) => {
  const result = new QueryBuilder(Plan.find([USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN].includes(user.role) ? {} : {for:user.role}), query).filter().sort()
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
  const plan = await Plan.findByIdAndUpdate(id, payload, { new: true });
  return plan;
};


export const PlanService = {
  createPlanToDB,
  getPlansFromDB,
  getPlanFromDB,
  updatePlanToDB
};
