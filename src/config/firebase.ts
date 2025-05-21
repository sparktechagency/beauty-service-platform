import serviceAccount from "../../ooh-ah-firebase-adminsdk-fbsvc-570c7d8473.json";
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
