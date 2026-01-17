export async function getPrayerTimes(city: string) {
    try {
        // 1. Search for the place to get ID
        const searchRes = await fetch(`https://vakit.vercel.app/api/searchPlaces?q=${encodeURIComponent(city)}&lang=tr`, {
            next: { revalidate: 86400 } // Cache search results for 24 hours
        });

        if (!searchRes.ok) {
            throw new Error("Failed to search for city");
        }

        const places = await searchRes.json();
        if (!places || places.length === 0) {
            throw new Error(`City not found: ${city}`);
        }

        // Use the first matching place
        const placeId = places[0].id;

        // 2. Fetch prayer times using the place ID
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        const timesRes = await fetch(`https://vakit.vercel.app/api/timesForPlace?id=${placeId}&date=${today}&days=1&timezoneOffset=180&calculationMethod=Turkey`, {
            next: { revalidate: 3600 } // Cache prayer times for 1 hour
        });

        if (!timesRes.ok) {
            throw new Error("Failed to fetch prayer times from source");
        }

        const timesData = await timesRes.json();
        const dailyTimes = timesData.times[today];

        if (!dailyTimes || dailyTimes.length < 6) {
            throw new Error("Invalid prayer times data received");
        }

        // 3. Map to match the existing UI format
        // Expected format by frontend: { success: true, result: [{ vakit: string, saat: string }, ...] }
        const formattedResult = [
            { vakit: "İmsak", saat: dailyTimes[0] },
            { vakit: "Güneş", saat: dailyTimes[1] },
            { vakit: "Öğle", saat: dailyTimes[2] },
            { vakit: "İkindi", saat: dailyTimes[3] },
            { vakit: "Akşam", saat: dailyTimes[4] },
            { vakit: "Yatsı", saat: dailyTimes[5] }
        ];

        return {
            success: true,
            result: formattedResult
        };
    } catch (error: any) {
        console.error("Prayer times fetch error:", error);
        return {
            success: false,
            message: error.message
        };
    }
}
