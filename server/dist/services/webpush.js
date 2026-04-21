import webpush from 'web-push';
import dotenv from 'dotenv';
dotenv.config();
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@studyflow.com';
webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
export const sendPushNotification = async (subscription, payload) => {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        return true;
    }
    catch (error) {
        console.error('Error sending push notification:', error);
        return false;
    }
};
export default webpush;
