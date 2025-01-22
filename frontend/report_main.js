import { fetchFromApi } from "./report_apiService.js";
import { renderTable, renderSummary } from "./report_renderTable.js"; 

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Document Loaded, Fetching Data...");

    const moduleName = document.body.dataset.module;  // Get module from <body data-module="sppd">
    const endpoint = document.body.dataset.endpoint;  // Get endpoint from <body data-endpoint="report/rekap-pln">

    console.log(`📌 Detected Module: ${moduleName}`);
    console.log(`📌 Detected Endpoint: ${endpoint}`);

    const apiResponse = await fetchFromApi(moduleName, endpoint);
    console.log("📦 Full API Response:", apiResponse);

    if (!apiResponse) {
        console.error("⚠️ No API response received!");
        return;
    }

    // 🚀 Let `utils_renderTable.js` handle the selection and rendering
    renderTable(moduleName, endpoint, apiResponse);

    // ✅ Render summary if available
    if (apiResponse.overall_totals) {
        console.log("📊 Rendering Summary...");
        renderSummary(apiResponse.overall_totals, endpoint, moduleName);
    } else {
        console.warn("⚠️ No summary data available.");
    }
});
