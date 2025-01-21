import { fetchData } from './lembaran-lembur-fetchData.js';

document.addEventListener("DOMContentLoaded", async () => {
    const reportContainer = document.getElementById("reports-container");
    const data = await fetchData();

    if (data.length === 0) {
        console.log("❌ No data available.");
        return;
    }

    console.log("✅ Processing Records:", data);

    for (const record of data) {
        const recordContainer = document.createElement("div");
        recordContainer.classList.add("record-group", "mb-10", "border", "border-black", "p-4", "rounded-lg");

        recordContainer.id = `record-${record.UUID}`;
        reportContainer.appendChild(recordContainer);

        // ✅ Load all three forms per record
        const formTypes = ["ppt01", "ppt02", "ppt03"];
        for (const formType of formTypes) {
            let templatePath = `./lembaran-lembur-table-${formType}.html`;

            try {
                // ✅ Fetch and render the correct template
                const templateHTML = await $.get(templatePath);
                const renderedHTML = fillTemplate(templateHTML, record);
                recordContainer.innerHTML += renderedHTML;

                console.log(`✅ Rendered ${formType.toUpperCase()} for ${record.UUID}`);
            } catch (error) {
                console.error(`❌ Error loading template ${templatePath}:`, error);
            }
        }
    }
});

/**
 * ✅ Replace placeholders with actual data from API response.
 */
const fillTemplate = (template, data) => {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        return data[key] !== undefined ? data[key] : "-";
    });
};