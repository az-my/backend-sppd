// 🔥 Modular API Fetch Function with Retry Logic
export const fetchFromApi = async (moduleName, endpoint, method = "GET", data = null, maxRetries = 3) => {
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const BASE_URL = isLocal
        ? `http://localhost:3000/api/${moduleName}`
        : `https://backend-sppd-production.up.railway.app/api/${moduleName}`;

    const apiUrl = `${BASE_URL}/${endpoint}`;
    
    console.log(`🌍 Environment: ${isLocal ? "Local Development" : "Production"}`);
    console.log(`🔗 API URL: ${apiUrl} | Method: ${method}`);

    const options = {
        method,
        headers: { "Content-Type": "application/json" },
        ...(data && { body: JSON.stringify(data) }) // Attach body only if data is provided
    };

    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            console.log(`📡 Attempt ${attempts + 1} to fetch data...`);
            const response = await fetch(apiUrl, options);

            if (!response.ok) {
                throw new Error(`🚨 API Error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log("✨ Response Data:", result);
            return result;

        } catch (error) {
            console.error(`⚠️ API Request Failed (Attempt ${attempts + 1}):`, error.message);

            if (attempts < maxRetries - 1) {
                const retryDelay = Math.pow(2, attempts) * 1000; // Exponential backoff: 1s, 2s, 4s...
                console.log(`🔄 Retrying in ${retryDelay / 1000} seconds...`);
                await new Promise(res => setTimeout(res, retryDelay));
            } else {
                console.error("❌ Max retries reached. No data fetched.");
                return null;
            }
        }

        attempts++;
    }
};
