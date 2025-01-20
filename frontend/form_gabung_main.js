import { setupFormSubmission } from "./form_gabung_submit.js"; // ✅ Import dynamic submission handler
import fetchAndRenderTable from "./report_fetchAndRenderTable.js"; // ✅ Use default import

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Form Initialized");

    const form = document.querySelector("form");
    if (!form) {
        console.error("⚠️ No form found on this page!");
        return;
    }

    const submitButton = form.querySelector("button[type='submit'], button[type='button']");
    if (!submitButton) {
        console.error("⚠️ No submit button found in the form!");
        return;
    }

    const apiEndpoint = form.dataset.api;
    if (!apiEndpoint) {
        console.error("⚠️ No API endpoint specified in the form!");
        return;
    }

    console.log(`📌 Form Ready for Submission: ${form.id}`);



    // ✅ Attach event listener only in main.js
    submitButton.addEventListener("click", (event) => {
        event.preventDefault();
        console.log(`📤 Submit button clicked for form: ${form.id}`);

        setupFormSubmission(form, apiEndpoint); // ✅ Pass the actual form element
    })


    console.log("🚀 Form Ready for Submission");



    // ✅ Ensure tables exist before fetching data
    if (document.querySelector("#lemburTable")) {
        fetchAndRenderTable("lembur", "#lemburTable");
    }

    if (document.querySelector("#sppdTable")) {
        fetchAndRenderTable("sppd", "#sppdTable");
    }




});
