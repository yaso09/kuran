import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@yasireymen.com',
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
        // Suppress logging for expired/invalid subscriptions as they are handled upstream
        if (error.statusCode !== 410 && error.statusCode !== 404) {
            console.error('Push notification error:', error);
        }
        return { success: false, error: error.message, statusCode: error.statusCode };
    }
}
