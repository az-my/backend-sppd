import {
    setTanggalMulaiLimits, updateDayNames, updateDayStatus,
    updateJamMulaiOptions, updateJamSelesaiOptions, autoFillTanggalSelesai,
    populateDriverDropdown, autoFillFields,
    populateUnitKerjaDropdown, autoFillUnitKerja,
    calculateTotalJamLembur, calculateTotalJamBayar, calculateTotalBiaya, autoFillUpahPerJam
} from './form_lembur_script.js';

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

    // ✅ Ensure tables exist before fetching data
    if (document.querySelector("#lemburTable")) {
        fetchAndRenderTable("lembur", "#lemburTable");
    }

    if (document.querySelector("#sppdTable")) {
        fetchAndRenderTable("sppd", "#sppdTable");
    }

    // ✅ Populate Dropdowns
    populateDriverDropdown();
    populateUnitKerjaDropdown();
    setTanggalMulaiLimits();
    autoFillUpahPerJam();

    // ✅ Attach Event Listeners Dynamically
    const eventMapping = {
        "NAMA_DRIVER": autoFillFields,
        "UNIT_KERJA": autoFillUnitKerja,
        "TANGGAL_MULAI": () => {
            updateDayNames();
            updateDayStatus();
            updateJamMulaiOptions();
            calculateTotalJamLembur();
            calculateTotalJamBayar();
            calculateTotalBiaya();
        },
        "JAM_MULAI": () => {
            updateJamSelesaiOptions();
            autoFillTanggalSelesai();
            calculateTotalJamLembur();
            calculateTotalJamBayar();
            calculateTotalBiaya();
            autoFillUpahPerJam();
        },
        "JAM_SELESAI": () => {
            autoFillTanggalSelesai();
            calculateTotalJamLembur();
            calculateTotalJamBayar();
            calculateTotalBiaya();
        },
        "TANGGAL_SELESAI": () => {
            updateDayNames();
            updateDayStatus();
        }
    };

    Object.keys(eventMapping).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener("change", eventMapping[fieldId]);
        } else {
            console.warn(`⚠️ Element with ID '${fieldId}' not found!`);
        }
    });

    console.log("🚀 Form Ready for Submission");


});
