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
        recordContainer.classList.add("record-group", "border", "border-gray", "p-4", "rounded-lg");

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
 * ✅ If a value is in `YYYY-MM-DD` format, reformat it to `DD MMMM YYYY` (Indonesian format).
 */
// Load Indonesian locale explicitly
moment.locale('id'); // ✅ Force Moment.js to use Indonesian

const fillTemplate = (template, data) => {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        let value = data[key];

        // ✅ Check if value matches YYYY-MM-DD and format it in Indonesian
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return moment(value).format('DD MMMM YYYY'); // ✅ Now in Indonesian format
        }

        return value !== undefined ? value : "-"; // ✅ Return original value if not a date
    });
};