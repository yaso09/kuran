import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        'mailto:example@yourdomain.com',
        vapidPublicKey,
        vapidPrivateKey
    );
}

export async function sendPushNotification(subscription: any, payload: { title: string; body: string; icon?: string; url?: string }) {
    try {
        await webpush.sendNotification(
            subscription,
            JSON.stringify(payload)
        );
        return { success: true };
    } catch (error: any) {
        console.error('Push notification error:', error);
        return { success: false, error: error.message };
    }
}
