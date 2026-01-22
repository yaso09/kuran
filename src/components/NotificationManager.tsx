"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { registerPushSubscription } from "@/lib/notifications";

export default function NotificationManager() {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (!isLoaded || !user?.id) return;
        registerPushSubscription(user.id);
    }, [user, isLoaded]);

    return null;
}
