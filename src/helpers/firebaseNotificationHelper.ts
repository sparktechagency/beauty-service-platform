import admin from "../config/firebase";

export type IFirebaseNotification = {
  token: string;
  title: string;
  body: string;
  data?: any;
};

export const sendNotificationToFCM = async ({
  token,
  title,
  body,
  data,
}: IFirebaseNotification) => {
  const message = {
    notification: {
      title,
      body,
    },
    token,
    data,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
