import { supabase } from './supabase';

// Types
export interface PageVisit {
    id?: string;
    user_id: string;
    page_path: string;
    page_name: string;
    entered_at: string;
    exited_at?: string;
    duration_seconds?: number;
}

export interface FeatureUsage {
    id?: string;
    user_id: string;
    feature_name: string;
    feature_category?: string;
    metadata?: Record<string, any>;
    created_at?: string;
}

export interface PageVisitStats {
    page_path: string;
    page_name: string;
    visit_count: number;
    total_duration_seconds: number;
    avg_duration_seconds: number;
}

export interface FeatureUsageStats {
    feature_name: string;
    feature_category?: string;
    usage_count: number;
}

export interface SessionStats {
    total_visits: number;
    total_time_seconds: number;
    unique_pages: number;
    unique_features: number;
    most_visited_page: string;
    most_used_feature: string;
}

export interface GlobalPlatformStats {
    total_users: number;
    total_page_visits: number;
    total_forum_posts: number;
    total_comments: number;
    active_users_24h: number;
    growth_last_month: number;
}

export interface DailyVisitTrend {
    date: string;
    visit_count: number;
}

// Local storage keys
const STORAGE_KEYS = {
    CURRENT_VISIT: 'quran_current_page_visit',
    PENDING_VISITS: 'quran_pending_visits',
    PENDING_FEATURES: 'quran_pending_features',
    ANALYTICS_CONSENT: 'quran_analytics_consent',
};

// Check if user has consented to analytics (Defaults to TRUE)
export function hasAnalyticsConsent(): boolean {
    if (typeof window === 'undefined') return true;
    const consent = localStorage.getItem(STORAGE_KEYS.ANALYTICS_CONSENT);
    // If no value is set, default to true
    return consent === null || consent === 'true';
}

// Set analytics consent
export function setAnalyticsConsent(consent: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ANALYTICS_CONSENT, consent.toString());
}

// Track page visit
export async function trackPageVisit(
    userId: string,
    pagePath: string,
    pageName: string
): Promise<string | null> {
    if (!hasAnalyticsConsent()) return null;

    const visitData: PageVisit = {
        user_id: userId,
        page_path: pagePath,
        page_name: pageName,
        entered_at: new Date().toISOString(),
    };

    try {
        const { data, error } = await supabase
            .from('page_visits')
            .insert(visitData)
            .select('id')
            .single();

        if (error) throw error;

        // Store visit ID in localStorage for later update
        if (data?.id) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_VISIT, data.id);
            return data.id;
        }
    } catch (error) {
        console.error('Error tracking page visit:', error);
        // Fallback to localStorage
        const pending = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_VISITS) || '[]');
        pending.push(visitData);
        localStorage.setItem(STORAGE_KEYS.PENDING_VISITS, JSON.stringify(pending));
    }

    return null;
}

// Update page visit with exit time
export async function updatePageVisitExit(visitId?: string): Promise<void> {
    if (!hasAnalyticsConsent()) return;

    const storedVisitId = visitId || localStorage.getItem(STORAGE_KEYS.CURRENT_VISIT);
    if (!storedVisitId) return;

    try {
        const { error } = await supabase
            .from('page_visits')
            .update({ exited_at: new Date().toISOString() })
            .eq('id', storedVisitId);

        if (error) throw error;

        localStorage.removeItem(STORAGE_KEYS.CURRENT_VISIT);
    } catch (error) {
        console.error('Error updating page visit exit:', error);
    }
}

// Track feature usage
export async function trackFeatureUsage(
    userId: string,
    featureName: string,
    featureCategory?: string,
    metadata?: Record<string, any>
): Promise<void> {
    if (!hasAnalyticsConsent()) return;

    const usageData: FeatureUsage = {
        user_id: userId,
        feature_name: featureName,
        feature_category: featureCategory,
        metadata: metadata || {},
    };

    try {
        const { error } = await supabase.from('feature_usage').insert(usageData);

        if (error) throw error;
    } catch (error) {
        console.error('Error tracking feature usage:', error);
        // Fallback to localStorage
        const pending = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_FEATURES) || '[]');
        pending.push(usageData);
        localStorage.setItem(STORAGE_KEYS.PENDING_FEATURES, JSON.stringify(pending));
    }
}

// Sync pending analytics from localStorage to Supabase
export async function syncPendingAnalytics(): Promise<void> {
    if (!hasAnalyticsConsent()) return;

    try {
        // Sync pending visits
        const pendingVisits = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_VISITS) || '[]');
        if (pendingVisits.length > 0) {
            await supabase.from('page_visits').insert(pendingVisits);
            localStorage.removeItem(STORAGE_KEYS.PENDING_VISITS);
        }

        // Sync pending features
        const pendingFeatures = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_FEATURES) || '[]');
        if (pendingFeatures.length > 0) {
            await supabase.from('feature_usage').insert(pendingFeatures);
            localStorage.removeItem(STORAGE_KEYS.PENDING_FEATURES);
        }
    } catch (error) {
        console.error('Error syncing pending analytics:', error);
    }
}

// Get page visit statistics
export async function getPageVisitStats(
    userId: string,
    timeRange: 'today' | 'week' | 'month' | 'all' = 'all'
): Promise<PageVisitStats[]> {
    if (!hasAnalyticsConsent()) return [];

    try {
        let query = supabase
            .from('page_visits')
            .select('page_path, page_name, duration_seconds')
            .eq('user_id', userId);

        // Apply time range filter
        if (timeRange !== 'all') {
            const now = new Date();
            let startDate: Date;

            switch (timeRange) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
            }

            query = query.gte('created_at', startDate.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        // Aggregate data by page
        const statsMap = new Map<string, PageVisitStats>();

        data?.forEach((visit) => {
            const key = visit.page_path;
            if (!statsMap.has(key)) {
                statsMap.set(key, {
                    page_path: visit.page_path,
                    page_name: visit.page_name,
                    visit_count: 0,
                    total_duration_seconds: 0,
                    avg_duration_seconds: 0,
                });
            }

            const stats = statsMap.get(key)!;
            stats.visit_count++;
            stats.total_duration_seconds += visit.duration_seconds || 0;
        });

        // Calculate averages
        const result = Array.from(statsMap.values()).map((stats) => ({
            ...stats,
            avg_duration_seconds: Math.round(stats.total_duration_seconds / stats.visit_count),
        }));

        return result.sort((a, b) => b.visit_count - a.visit_count);
    } catch (error) {
        console.error('Error getting page visit stats:', error);
        return [];
    }
}

// Get feature usage statistics
export async function getFeatureUsageStats(
    userId: string,
    timeRange: 'today' | 'week' | 'month' | 'all' = 'all'
): Promise<FeatureUsageStats[]> {
    if (!hasAnalyticsConsent()) return [];

    try {
        let query = supabase
            .from('feature_usage')
            .select('feature_name, feature_category')
            .eq('user_id', userId);

        // Apply time range filter
        if (timeRange !== 'all') {
            const now = new Date();
            let startDate: Date;

            switch (timeRange) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
            }

            query = query.gte('created_at', startDate.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        // Aggregate data by feature
        const statsMap = new Map<string, FeatureUsageStats>();

        data?.forEach((usage) => {
            const key = usage.feature_name;
            if (!statsMap.has(key)) {
                statsMap.set(key, {
                    feature_name: usage.feature_name,
                    feature_category: usage.feature_category,
                    usage_count: 0,
                });
            }

            const stats = statsMap.get(key)!;
            stats.usage_count++;
        });

        const result = Array.from(statsMap.values());
        return result.sort((a, b) => b.usage_count - a.usage_count);
    } catch (error) {
        console.error('Error getting feature usage stats:', error);
        return [];
    }
}

// Get overall session statistics
export async function getSessionStats(
    userId: string,
    timeRange: 'today' | 'week' | 'month' | 'all' = 'all'
): Promise<SessionStats> {
    if (!hasAnalyticsConsent()) {
        return {
            total_visits: 0,
            total_time_seconds: 0,
            unique_pages: 0,
            unique_features: 0,
            most_visited_page: '-',
            most_used_feature: '-',
        };
    }

    const [pageStats, featureStats] = await Promise.all([
        getPageVisitStats(userId, timeRange),
        getFeatureUsageStats(userId, timeRange),
    ]);

    const totalVisits = pageStats.reduce((sum, stat) => sum + stat.visit_count, 0);
    const totalTime = pageStats.reduce((sum, stat) => sum + stat.total_duration_seconds, 0);
    const uniquePages = pageStats.length;
    const uniqueFeatures = featureStats.length;
    const mostVisitedPage = pageStats[0]?.page_name || '-';
    const mostUsedFeature = featureStats[0]?.feature_name || '-';

    return {
        total_visits: totalVisits,
        total_time_seconds: totalTime,
        unique_pages: uniquePages,
        unique_features: uniqueFeatures,
        most_visited_page: mostVisitedPage,
        most_used_feature: mostUsedFeature,
    };
}

// --- Global Platform Analytics ---

export async function getGlobalPlatformStats(): Promise<GlobalPlatformStats> {
    try {
        const [
            { count: userCount },
            { count: visitCount },
            { count: postCount },
            { count: commentCount },
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('page_visits').select('*', { count: 'exact', head: true }),
            supabase.from('forum_posts').select('*', { count: 'exact', head: true }),
            supabase.from('forum_comments').select('*', { count: 'exact', head: true }),
        ]);

        // Active users in last 24h
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: activeUsers } = await supabase
            .from('page_visits')
            .select('user_id', { count: 'exact', head: true })
            .gte('created_at', yesterday);

        // Growth last month (simplified: new profiles in last 30 days)
        const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { count: newUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', lastMonth);

        return {
            total_users: userCount || 0,
            total_page_visits: visitCount || 0,
            total_forum_posts: postCount || 0,
            total_comments: commentCount || 0,
            active_users_24h: activeUsers || 0,
            growth_last_month: newUsers || 0,
        };
    } catch (error) {
        console.error('Error fetching global stats:', error);
        return {
            total_users: 0,
            total_page_visits: 0,
            total_forum_posts: 0,
            total_comments: 0,
            active_users_24h: 0,
            growth_last_month: 0,
        };
    }
}

export async function getGlobalVisitTrends(days: number = 30): Promise<DailyVisitTrend[]> {
    try {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from('page_visits')
            .select('created_at')
            .gte('created_at', startDate);

        if (error) throw error;

        // Group by date
        const trendsMap = new Map<string, number>();
        data?.forEach(visit => {
            const date = new Date(visit.created_at).toLocaleDateString('tr-TR');
            trendsMap.set(date, (trendsMap.get(date) || 0) + 1);
        });

        return Array.from(trendsMap.entries()).map(([date, count]) => ({
            date,
            visit_count: count,
        }));
    } catch (error) {
        console.error('Error fetching visit trends:', error);
        return [];
    }
}

export async function getGlobalPopularPages(limit: number = 5): Promise<PageVisitStats[]> {
    try {
        const { data, error } = await supabase
            .from('page_visits')
            .select('page_path, page_name');

        if (error) throw error;

        const statsMap = new Map<string, PageVisitStats>();
        data?.forEach(visit => {
            if (!statsMap.has(visit.page_path)) {
                statsMap.set(visit.page_path, {
                    page_path: visit.page_path,
                    page_name: visit.page_name,
                    visit_count: 0,
                    total_duration_seconds: 0,
                    avg_duration_seconds: 0
                });
            }
            statsMap.get(visit.page_path)!.visit_count++;
        });

        return Array.from(statsMap.values())
            .sort((a, b) => b.visit_count - a.visit_count)
            .slice(0, limit);
    } catch (error) {
        console.error('Error fetching popular pages:', error);
        return [];
    }
}
