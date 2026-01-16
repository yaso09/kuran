import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { trackPageVisit, updatePageVisitExit, syncPendingAnalytics } from '@/lib/analytics';

export function usePageTracking(pagePath: string, pageName: string) {
    const { user } = useUser();
    const visitIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        // Sync any pending analytics on mount
        syncPendingAnalytics();

        // Track page entry
        trackPageVisit(user.id, pagePath, pageName).then((visitId) => {
            visitIdRef.current = visitId;
        });

        // Track page exit on unmount
        return () => {
            if (visitIdRef.current) {
                updatePageVisitExit(visitIdRef.current);
            }
        };
    }, [user?.id, pagePath, pageName]);
}
