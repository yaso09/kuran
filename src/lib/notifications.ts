// Notification utility functions

export interface NotificationSettings {
    enabled: boolean;
    time: string; // HH:MM format
    frequency: 'daily' | 'custom';
}

const STORAGE_KEY = 'quran_notification_settings';

// Get notification settings from localStorage
export function getNotificationSettings(): NotificationSettings {
    if (typeof window === 'undefined') {
        return { enabled: false, time: '20:00', frequency: 'daily' };
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing notification settings:', e);
        }
    }

    return { enabled: false, time: '20:00', frequency: 'daily' };
}

// Save notification settings to localStorage
export function saveNotificationSettings(settings: NotificationSettings): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        console.warn('Notifications not supported');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

// Show a notification
export function showNotification(title: string, options?: NotificationOptions): void {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return;
    }

    if (Notification.permission === 'granted') {
        new Notification(title, {
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            ...options,
        });
    }
}

// Schedule daily notification
export function scheduleDailyNotification(settings: NotificationSettings): void {
    if (!settings.enabled || typeof window === 'undefined') return;

    // Clear any existing interval
    const existingInterval = localStorage.getItem('notification_interval_id');
    if (existingInterval) {
        clearInterval(Number(existingInterval));
    }

    // Calculate time until next notification
    const [hours, minutes] = settings.time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If scheduled time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    // Set timeout for first notification
    setTimeout(() => {
        showNotification('Kur\'an Okuma Hatırlatması', {
            body: 'Bugünkü okumanızı tamamlamayı unutmayın! 📖',
            tag: 'daily-reading-reminder',
            requireInteraction: false,
            data: {
                url: '/kuran',
            },
        });

        // Set daily interval
        const intervalId = setInterval(() => {
            showNotification('Kur\'an Okuma Hatırlatması', {
                body: 'Bugünkü okumanızı tamamlamayı unutmayın! 📖',
                tag: 'daily-reading-reminder',
                requireInteraction: false,
                data: {
                    url: '/kuran',
                },
            });
        }, 24 * 60 * 60 * 1000); // 24 hours

        localStorage.setItem('notification_interval_id', String(intervalId));
    }, timeUntilNotification);
}

// Check if user has read today
export function hasReadToday(): boolean {
    if (typeof window === 'undefined') return false;

    const lastReadDate = localStorage.getItem('last_read_date');
    if (!lastReadDate) return false;

    const today = new Date().toDateString();
    return lastReadDate === today;
}

// Send notification if user hasn't read today
export function sendReminderIfNeeded(): void {
    const settings = getNotificationSettings();

    if (!settings.enabled) return;
    if (hasReadToday()) return;

    showNotification('Kur\'an Okuma Hatırlatması', {
        body: 'Bugün henüz okuma yapmadınız. Serinizi koruyun! 🔥',
        tag: 'reading-reminder',
        requireInteraction: false,
        data: {
            url: '/kuran',
        },
    });
}

// Initialize notifications on app load
export function initializeNotifications(): void {
    if (typeof window === 'undefined') return;

    const settings = getNotificationSettings();

    if (settings.enabled) {
        requestNotificationPermission().then((granted) => {
            if (granted) {
                scheduleDailyNotification(settings);
            }
        });
    }

    // Listen for notification clicks
    if ('Notification' in window) {
        // This will be handled by service worker for better support
    }
}

export async function registerPushSubscription(userId: string) {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
    }

    try {
        // Force update service worker to ensure latest version
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
        });
        await registration.update();

        const existingSubscription = await registration.pushManager.getSubscription();

        if (existingSubscription) {
            // Even if exists, we might want to update it on the backend just in case
            await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    subscription: existingSubscription.toJSON()
                })
            });
            return;
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
            console.warn("VAPID Public Key is missing");
            return;
        }

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidPublicKey
        });

        await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                subscription: subscription.toJSON()
            })
        });

        console.log("Push subscription successful");
    } catch (error) {
        console.error("Push registration failed:", error);
    }
}

