import { User } from "../user/user.model";

const analyticsFromBD = async () => {
  const user = await User.find().countDocuments();
  //   const bookings = await Bo
  //   const earning = await Earning
  //   const subscription = await
};

export const AnalyticsServices = {};
