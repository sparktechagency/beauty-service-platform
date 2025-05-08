import { JwtPayload } from "jsonwebtoken";
import { Notification } from "./notification.model";
import QueryBuilder from "../../builder/queryBuilder";
import { Types } from "mongoose";

// Just for single notification update to db
const updateNotificationToDB = async (id: string) => {
  const result = await Notification.findOneAndUpdate(
    { _id: id, isRead: false },
    { $set: { isRead: true } },
    { new: true }
  );
  return result;
};


// Mark all notifications as read
const markAllNotificationsAsRead = async (user: JwtPayload) => {

const userObjectId = new Types.ObjectId(user.id)
  const result = await Notification.updateMany(
    { isRead: false, receiver: userObjectId },
    { $set: { isRead: true } }
  );
  return result;
};


// Get all notifications
const allNotificationFromDB = async (
  user: JwtPayload,
  query: Record<string, any>
) => {
  const userObjectId = new Types.ObjectId(user.id);

  const initialQuery = Notification.find({ receiver: userObjectId });

  const result = new QueryBuilder(initialQuery, query)
    .sort()
    .paginate();

  const data = await result.modelQuery.lean();
  const pagination = await result.getPaginationInfo();

  return {
    pagination,
    data,
  };
};

export const NotificationService = {

  updateNotificationToDB,
  allNotificationFromDB,
  markAllNotificationsAsRead,
};
