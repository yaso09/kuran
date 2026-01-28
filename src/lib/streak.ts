export interface StreakData {
    currentStreak: number;
    lastReadDate: string | null;
    freezes: number;
    coins: number;
    readingHistory: string[];
}

export function calculateNewStreak(
    currentData: StreakData,
    today: string = new Date().toDateString()
): {
    newStreak: number;
    newFreezes: number;
    newCoins: number;
    hasIncreased: boolean;
    useFreeze: boolean;
} {
    const { currentStreak, lastReadDate, freezes, coins } = currentData;

    if (lastReadDate === today) {
        return {
            newStreak: currentStreak,
            newFreezes: freezes,
            newCoins: coins,
            hasIncreased: false,
            useFreeze: false
        };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    // First read ever
    if (!lastReadDate) {
        return {
            newStreak: 1,
            newFreezes: freezes,
            newCoins: coins + 10,
            hasIncreased: true,
            useFreeze: false
        };
    }

    // Continuing streak (read yesterday)
    if (lastReadDate === yesterdayStr) {
        return {
            newStreak: currentStreak + 1,
            newFreezes: freezes,
            newCoins: coins + 10,
            hasIncreased: true,
            useFreeze: false
        };
    }

    // Check how many days missed
    const lastRead = new Date(lastReadDate);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate.getTime() - lastRead.getTime()) / (1000 * 60 * 60 * 24));

    // Missed 1 day - use freeze if available
    if (daysDiff === 2) {
        if (freezes > 0) {
            return {
                newStreak: currentStreak + 1,
                newFreezes: freezes - 1,
                newCoins: coins + 10,
                hasIncreased: true,
                useFreeze: true
            };
        }
        // No freeze available, but still within 2-day grace period
        return {
            newStreak: currentStreak + 1,
            newFreezes: freezes,
            newCoins: coins + 10,
            hasIncreased: true,
            useFreeze: false
        };
    }

    // Missed 2+ days - streak reset
    return {
        newStreak: 1,
        newFreezes: freezes,
        newCoins: coins + 10,
        hasIncreased: true,
        useFreeze: false
    };
}

export function getFlameColor(streak: number): string {
    if (streak >= 30) return 'text-blue-500 fill-blue-500'; // Super Hot
    if (streak >= 14) return 'text-purple-500 fill-purple-500'; // Hot
    if (streak >= 7) return 'text-amber-500 fill-amber-500'; // Normal
    return 'text-slate-500 fill-slate-500'; // Just started or low
}

export function getFlameEffect(streak: number): string {
    if (streak >= 30) return 'shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-pulse';
    if (streak >= 14) return 'shadow-[0_0_20px_rgba(168,85,247,0.5)]';
    if (streak >= 7) return 'shadow-[0_0_15px_rgba(245,158,11,0.4)]';
    return '';
}
