import { fetchFromApi } from "./utils_apiService.js";
import { renderTable } from "./utils_renderTable.js";
import { renderSummary } from "./utils_renderTable.js"; // 👈 Import renderSummary


document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Document Loaded, Fetching Data...");

    const moduleName = document.body.dataset.module; // Get module from <body data-module="lembur">
    const endpoint = document.body.dataset.endpoint; // Get endpoint from <body data-endpoint="report/rekap-pln">

    console.log(`📌 Detected Module: ${moduleName}`);
    console.log(`📌 Detected Endpoint: ${endpoint}`);

    const data = await fetchFromApi(moduleName, endpoint);

    if (data && data.data) {
        console.log("📝 RAW Data:", data.data);
        console.log("📝 RAW Headers:", data.header);
        renderTable(moduleName, endpoint, data.data, data.header);
        if (data.summary) {
            renderSummary(data.summary);
        }
    } else {
        console.error("⚠️ No data received!");
    }
});
