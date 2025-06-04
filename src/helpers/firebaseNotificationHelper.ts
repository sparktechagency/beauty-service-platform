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
  let stringData:any = {}
  if(data){
    for(let keyData in data){
      stringData[keyData]  = String(data[keyData])
    }
  }

  
  
  
  const message = {
    notification: {
      title,
      body,
    },
    token,
    data:stringData,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
