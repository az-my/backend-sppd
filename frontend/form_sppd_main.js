import { loadSppdData } from "./form_sppd_fetch.js"; // Ensure the correct path if needed

document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Document Loaded. Initializing SPPD Data Fetch...");
    loadSppdData(); // Call the function to fetch and render SPPD data
});
