export async function fetchData() {
    try {
        // ✅ Automatically determine API base URL based on environment
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const API_BASE_URL = isLocal
            ? "http://localhost:3000/api"  // 🔥 Local Development API
            : "https://backend-sppd-production.up.railway.app/api";  // 🚀 Production API on Railway

        const API_URL = `${API_BASE_URL}/lembur/report/lembar-satuan`;
        console.log(`📌 Using API URL: ${API_URL}`);

        // ✅ Fetch Data from API
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`❌ HTTP Error: ${response.status}`);
        }

        const jsonResponse = await response.json();
        console.log("📥 Full API Response:", jsonResponse);

        if (!jsonResponse || !jsonResponse.detailed_records) {
            throw new Error("❌ Invalid response structure. 'detailed_records' missing.");
        }

        return jsonResponse.detailed_records;

    } catch (error) {
        console.error("🚨 Oops! Error fetching data:", error);
        return [];
    }
}
