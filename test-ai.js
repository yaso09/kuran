const fetch = require('node-fetch');

async function testAI() {
    console.log("Testing AI API...");
    try {
        const response = await fetch("https://g4f.dev/api/auto/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistralai/mistral-7b-instruct:free",
                messages: [
                    {
                        role: "user",
                        content: "Kur'an'dan sabır ile ilgili bir ayet referansı ver. Sadece 'Süre:Ayet' şeklinde olsun."
                    }
                ],
                stream: false
            })
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Response Body (Text):", text);
        try {
            const json = JSON.parse(text);
            console.log("Response Body (JSON):", JSON.stringify(json, null, 2));
        } catch (e) {
            console.log("Not a valid JSON");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

testAI();
