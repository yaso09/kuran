export async function getPrayerTimes(city: string) {
    const apiKey = process.env.NEXT_PUBLIC_COLLECT_API_KEY || process.env.COLLECT_API_KEY;
    if (!apiKey) {
        throw new Error("CollectAPI key is missing");
    }

    const res = await fetch(`https://api.collectapi.com/pray/all?data.city=${city.toLowerCase()}`, {
        headers: {
            "content-type": "application/json",
            "authorization": `apikey ${apiKey}`
        },
        next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
        throw new Error("Failed to fetch prayer times");
    }

    const data = await res.json();
    return data;
}
