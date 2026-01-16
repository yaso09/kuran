"use client";

import { useEffect } from 'react';
import { initializeNotifications } from '@/lib/notifications';

export default function NotificationInitializer() {
    useEffect(() => {
        // Initialize notifications when app loads
        initializeNotifications();
    }, []);

    return null;
}
