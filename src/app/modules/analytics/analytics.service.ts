import { Referral } from "../referral/referral.model";
import { Reward } from "../reward/reward.model";
import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";
import { UserTakeService } from "../usertakeservice/usertakeservice.model";

const summury = async ()=>{
  const totalUsers = await User.countDocuments({verified: true});
  const dailyUser = await User.countDocuments({verified: true, createdAt: {$gte: new Date(new Date().setHours(0,0,0,0))}});

  const totalBookings = await UserTakeService.countDocuments({});
  const dailyBookings = await UserTakeService.countDocuments({createdAt: {$gte: new Date(new Date().setHours(0,0,0,0))}});

  const totalEarnings = await UserTakeService.aggregate([
    {
      $group: {
        _id: null,
        appFee: { $sum: "$app_fee" },
        artistEarnings: { $sum: "$artist_app_fee" },
      },
    },
  ]);

  const totalFee = totalEarnings[0]?.appFee + totalEarnings[0]?.artistEarnings;

  
  const dailyFee = await UserTakeService.aggregate([
    {
      $group: {
        _id: null,
        appFee: { $sum: "$app_fee" },
        artistEarnings: { $sum: "$artist_app_fee" },
      },
    },
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    },
  ]);

  
  

  
  const dailyFeeAmount = (dailyFee[0]?.appFee + dailyFee[0]?.artistEarnings)||0

  const totalSUbscription = await Subscription.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$price" },
      },
    },
  ])
  const totalSubscription = totalSUbscription[0]?.total;
  const dailySubscription = await Subscription.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$price" },
      },
    },
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    },
  ])
  const dailySubscriptionAmount = dailySubscription[0]?.total;

  const totalSubscriptionCount = await Subscription.countDocuments({status: "active"});
  const dailySubscriptionCount = await Subscription.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
    },
    status: "active",
    });
  return {
    users: {
      total: totalUsers,
      daily: dailyUser,
    },
    bookings: {
      total: totalBookings,
      daily: dailyBookings,
    },
    earnings: {
      total: totalFee.toFixed(2),
      daily: dailyFeeAmount,
    },
    subscription: {
      total: totalSubscription,
      daily: dailySubscriptionAmount,
      totalCount: totalSubscriptionCount,
      dailyCount: dailySubscriptionCount,
    }
  }
}

const yearlyEarningsSummary = async (query:Record<string,any>) => {
  const currentYear = new Date(query.year|| new Date()).getFullYear();
  
  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31);
  const earnings = await UserTakeService.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$createdAt",
        },
        totalEarnings: { $sum: "$app_fee" },
        artistEarnings: { $sum: "$artist_app_fee" },
      },
    },
  ]);


  

  const yearlySubscription = await Subscription.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$createdAt",
        },
        total: { $sum: "$price" },
      },
    },
  ]);


  const yearRewards = await Reward.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$createdAt",
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const yearlyReferralBonus = await Referral.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$createdAt",
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const months = {
    1:"Jan",
    2:"Feb",
    3:"Mar",
    4:"Apr",
    5:"May",
    6:"Jun",
    7:"Jul",
    8:"Aug",
    9:"Sep",
    10:"Oct",
    11:"Nov",
    12:"Dec",
  }
  const data = []
  for (let i =1;i<=12;i++){
    const month = months[i as keyof typeof months];
    const earningsData = earnings.find((earning) => earning._id === i);
    const earningTotal = earningsData?.totalEarnings + earningsData?.artistEarnings || 0;
    const subscriptionData = yearlySubscription.find((subscription) => subscription._id === i );
    const rewardData = yearRewards.find((reward) => reward._id === i );
    const referralData = yearlyReferralBonus.find((referral) => referral._id === i );
    data.push({
      month,
      earnings: earningTotal?.toFixed(2) || 0,
      subscription: subscriptionData?.total?.toFixed(2) || 0,
      profit:earningTotal- (referralData?.total + referralData?.total)||0
    })
  }

  return data;


}
function getWeekendDates(referenceDate = new Date()) {
  const day = referenceDate.getDay(); // 0 (Sun) to 6 (Sat)
  const date = referenceDate.getDate();

  // Clone the reference date
  const prevSaturday = new Date(referenceDate);
  const prevSunday = new Date(referenceDate);
  const nextSaturday = new Date(referenceDate);

  // Set previous Saturday (last weekend's start)
  const daysSinceSaturday = (day + 1) % 7 + 1; // from Mon=1 to Sat=6
  prevSaturday.setDate(date - daysSinceSaturday);
  
  // Set previous Sunday (last weekend's end)
  prevSunday.setDate(prevSaturday.getDate() + 1);

  // Set next Saturday (next weekend's start)
  nextSaturday.setDate(prevSunday.getDate() + 7);

  const hash:any = {}

  for (let i = 0; i < 7; i++) {
    const date = new Date(prevSaturday);
    date.setDate(date.getDate() + i);
    const weekend = date.toDateString().slice(8,10)
    hash[weekend] = date.toDateString().slice(0,3);

  }

  return {
    previousWeekendStart: prevSaturday,
    nextWeekendStart: nextSaturday,
    hash
  };
}




const yearlyUsersAndMonthlyEarningData = async (query:Record<string,any>) => {
  const currentYear = new Date(query.year|| new Date()).getFullYear();

  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31);
  const weekendDates = getWeekendDates();

  
  const earnings = await UserTakeService.aggregate([
    {
      $match: {
        createdAt: {
          $gte:weekendDates.previousWeekendStart ,
          $lte: weekendDates.nextWeekendStart,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%d",
            date: "$createdAt",
          },
        },
        totalEarnings: { $sum: "$app_fee" },
        artistEarnings: { $sum: "$artist_app_fee" },
      },
    },
  ]);
  const users = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$createdAt",
        },
        total: { $sum: 1 },
      },
    },
  ]);

  const months = {
    1:"Jan",
    2:"Feb",
    3:"Mar",
    4:"Apr",
    5:"May",
    6:"Jun",
    7:"Jul",
    8:"Aug",
    9:"Sep",
    10:"Oct",
    11:"Nov",
    12:"Dec",
  }
  const data = []
  for (let i =1;i<=12;i++){
    const month = months[i as keyof typeof months];
    const userData = users.find((user) => user._id === i);
    data.push({
      month,
      users: userData?.total || 0,
    })

  }

  const data2:any[] = []

  for(let day in weekendDates.hash){
    const earningsData = earnings.find((earning) => earning._id === day);
    const earningTotal = earningsData?.totalEarnings + earningsData?.artistEarnings || 0;
    data2.push({
      day,
      earnings: earningTotal,
    })
  }
  return {
    users: data,
    earnings: data2 as any
  };
}

export const AnalyticsServices = {
  summury,
  yearlyEarningsSummary,
  yearlyUsersAndMonthlyEarningData,
};
