import { INotification } from "../app/modules/notification/notification.interface";
import { Notification } from "../app/modules/notification/notification.model";
import { User } from "../app/modules/user/user.model";
import { ADMIN_BADGE, USER_ROLES } from "../enums/user";

export const sendNotifications = async (
  data: INotification
): Promise<INotification> => {
  const result = await Notification.create(data);

  //@ts-ignore
  const socketIo = global.io;

  if (socketIo) {
    socketIo.emit(`get-notification::${data?.receiver}`, result);
  }

  return result;
};
export const sendNotificationsAdmin = async (
  data: INotification
): Promise<INotification> => {
  

  //@ts-ignore
  const socketIo = global.io;

  const users = await User.find({
    $and: [
      {
        $or: [
          {
            role: USER_ROLES.ADMIN,
          },
          {
            role: USER_ROLES.SUPER_ADMIN,
          },
        ],
      },
      {
        $or: [
          {
            badge: ADMIN_BADGE.AH_EXECUTTIVE,
          },
          {
            badge: ADMIN_BADGE.AH_CARE,
          },
          {
            badge: ADMIN_BADGE.AH_MAIL_HANDLER,
          },
        ],
      },
    ],
  }).lean().exec()
const result = await Notification.create({
  ...data,
  receiver: users.map((user) => user._id),
});


  if (socketIo) {
   users.forEach((user) => {
      socketIo.emit(`get-notification::${user._id}`, result);
    });
  }

  return result;
};
