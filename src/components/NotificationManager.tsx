"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function NotificationManager() {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (!isLoaded || !user) return;

        async function registerPush() {
            try {
                const registration = await navigator.serviceWorker.ready;

                // Check for existing subscription
                const existingSubscription = await registration.pushManager.getSubscription();
                if (existingSubscription) return;

                // For production, you need a VAPID public key
                // You can generate one with: npx web-push generate-vapid-keys
                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!vapidPublicKey) {
                    console.warn("VAPID Public Key is missing. Push notifications won't work.");
                    return;
                }

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: vapidPublicKey
                });

                if (!user?.id) return;

                // Send to backend
                await fetch("/api/push/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.id,
                        subscription: subscription.toJSON()
                    })
                });

                console.log("Push subscription successful");
            } catch (error) {
                console.error("Push registration failed:", error);
            }
        }

        if ("serviceWorker" in navigator && "PushManager" in window) {
            registerPush();
        }
    }, [user, isLoaded]);

    return null;
}
