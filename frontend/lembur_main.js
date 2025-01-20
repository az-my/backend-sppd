import { 
    setTanggalMulaiLimits, updateDayNames, updateDayStatus,
    updateJamMulaiOptions, updateJamSelesaiOptions, autoFillTanggalSelesai,
    populateDriverDropdown, autoFillFields,
    populateUnitKerjaDropdown, autoFillUnitKerja,
    calculateTotalJamLembur, calculateTotalJamBayar, calculateTotalBiaya, autoFillUpahPerJam
} from './lembur_script.js';

import { submitLemburForm } from "./lembur_submit.js";
import fetchAndRenderTable from "./fetchAndRenderTable.js"; // ✅ Use default import

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Lembur Form Loaded");

        // ✅ Ensure tables exist before calling fetch
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
    autoFillUpahPerJam(); // ✅ Auto-fill Upah Per Jam

    // ✅ Attach Event Listeners
    document.getElementById("NAMA_DRIVER").addEventListener("change", autoFillFields);
    document.getElementById("UNIT_KERJA").addEventListener("change", autoFillUnitKerja);
    
    document.getElementById("TANGGAL_MULAI").addEventListener("change", () => {
        updateDayNames();
        updateDayStatus();
        updateJamMulaiOptions();
        calculateTotalJamLembur(); // ✅ Recalculate lembur when date changes
    });

    document.getElementById("JAM_MULAI").addEventListener("change", () => {
        updateJamSelesaiOptions();
        autoFillTanggalSelesai();
        calculateTotalJamLembur();
        autoFillUpahPerJam();
    });

    document.getElementById("JAM_SELESAI").addEventListener("change", () => {
        autoFillTanggalSelesai();
        calculateTotalJamLembur();
    });

    document.getElementById("TANGGAL_SELESAI").addEventListener("change", () => {
        updateDayNames();
        updateDayStatus();
    });

    // ✅ Calculate Total Bayar & Biaya
    document.getElementById("JAM_SELESAI").addEventListener("change", () => {
        calculateTotalJamBayar();
        calculateTotalBiaya();
    });

    document.getElementById("JAM_MULAI").addEventListener("change", () => {
        calculateTotalJamBayar();
        calculateTotalBiaya();
    });
    
    document.getElementById("TANGGAL_MULAI").addEventListener("change", () => {
        calculateTotalJamBayar();
        calculateTotalBiaya();
    });

    
    console.log("🚀 Lembur Form Loaded & Ready");

    document.getElementById("submitLemburBtn").addEventListener("click", (event) => {
        event.preventDefault(); // 🚀 Stop default form submission
        submitLemburForm(); // 🔥 Call the function manually
    });

        // // ✅ Fetch and Render Tables for Both Modules
        // fetchAndRenderTable("lembur", "#lemburTable");
        // fetchAndRenderTable("sppd", "#sppdTable");


});
