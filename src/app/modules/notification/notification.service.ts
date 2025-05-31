import { JwtPayload } from "jsonwebtoken";
import { Notification } from "./notification.model";
import QueryBuilder from "../../builder/queryBuilder";
import { Types } from "mongoose";

// Just for single notification update to db
const updateNotificationToDB = async (id: string,user:JwtPayload) => {
  const result = await Notification.findOneAndUpdate(
    { _id: id, isRead: false },
    { $set: { isRead: true, $push: { readers: user.id } } },
    { new: true }
  );
  return result;
};


// Mark all notifications as read
const markAllNotificationsAsRead = async (user: JwtPayload) => {

const userObjectId = new Types.ObjectId(user.id)
  const result = await Notification.updateMany(
    { isRead: false, receiver: {
      $in: [userObjectId]
    } },
    { $set: { isRead: true,$push: { readers: userObjectId } } },
  );
  return result;
};


// Get all notifications
const allNotificationFromDB = async (
  user: JwtPayload,
  query: Record<string, any>
) => {
  const userObjectId = new Types.ObjectId(user.id);

  const initialQuery = Notification.find({ receiver:{
    $in: [userObjectId]
  } });

  const result = new QueryBuilder(initialQuery, query)
    .sort()
    .paginate();

  let unreadCount = 0

  const data = (await result.modelQuery.lean()).map((item:any)=>{
    if(item.isRead === false){
      unreadCount++
    }
    return {
      ...item,
      readers:item?.readers?.includes(userObjectId)
    }
  })
  const pagination = await result.getPaginationInfo();

  return {
    pagination,
    data:{
      unreadCount,
      data
    },
  };
};

export const NotificationService = {

  updateNotificationToDB,
  allNotificationFromDB,
  markAllNotificationsAsRead,
};
