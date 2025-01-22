// BACKEND_sppd_report.js
const express = require('express');
const { getSheetData } = require('./BACKEND_service_gsheets');
const { sortDataByPriority, getStatusDriver, getMonthNames, isPastMidnight, splitPastMidnightRecord, getDayName } = require('./BACKEND_utils_lembur');
const { Parser } = require('json2csv');

const router = express.Router();
const SHEET_NAME = 'UJICOBA_LEMBUR';
const numeral = require("numeral");
// const dayjs = require("dayjs"); // Ensure dayjs is imported

/**
 * ✅ Generate Report (Reusable for All Report Types)
 * @param {string} reportType - "rekap-kantor", "rekap-pln", "lembar-satuan"
 */

const generateReport = async (reportType, req, res) => {
    try {
        const data = await getSheetData(SHEET_NAME);
        const headers = data[0]; // Column headers
        let rows = data.slice(1); // Data rows

        console.log("📥 Raw Data from Sheet (First Row):", rows[0]); // Log one sample row

        // ✅ Sort data before processing
        let sortedData = sortDataByPriority(rows, headers);

        // ✅ Convert raw rows to objects using headers as keys
        let detailedRecords = [];
        sortedData.forEach(row => {
            const rowObject = Object.fromEntries(headers.map((key, index) => [key, row[index] || "-"]));

            // ✅ Ensure time values are valid before splitting
            const jamMulai = rowObject["JAM_MULAI"];
            const jamSelesai = rowObject["JAM_SELESAI"];

            if (!jamMulai || !jamSelesai || !jamMulai.includes(":") || !jamSelesai.includes(":")) {
                console.warn("⚠️ Invalid JAM_MULAI or JAM_SELESAI format:", rowObject);
                rowObject["IS_PAST_MIDNIGHT"] = "UNKNOWN"; // Handle gracefully
                detailedRecords.push(rowObject);
                return;
            }

            // ✅ Check if the record crosses midnight
            const crossesMidnight = rowObject["TANGGAL_MULAI"] !== rowObject["TANGGAL_SELESAI"] || 
                parseInt(jamSelesai.split(":")[0], 10) < parseInt(jamMulai.split(":")[0], 10);

            rowObject["IS_PAST_MIDNIGHT"] = crossesMidnight ? "YES" : "NO";

            if (crossesMidnight) {
                console.log(`🕛 Record crosses midnight:`, rowObject);
                
                // ✅ Convert object back to array for `splitPastMidnightRecord`
                const rowArray = headers.map((key) => rowObject[key] || "-");
                const splitRecords = splitPastMidnightRecord(rowArray, headers);

                // ✅ Convert back to objects and append
                detailedRecords.push(
                    ...splitRecords.map(record =>
                        Object.fromEntries(headers.map((key, index) => [key, record[index] || "-"]))
                    )
                );
            } else {
                detailedRecords.push(rowObject);
            }
        });

        // ✅ Append computed columns (bulanTransaksi, bulanMasukTagihan, statusDriver)
        detailedRecords = detailedRecords.map((row) => {
            const { bulanTransaksi, bulanMasukTagihan } = getMonthNames(row["TANGGAL_MULAI"]);
            return {
                ...row,
                BULAN_TRANSAKSI: bulanTransaksi,
                BULAN_MASUK_TAGIHAN: bulanMasukTagihan,
                STATUS_DRIVER: getStatusDriver(row["NAMA_DRIVER"]),
                IS_PAST_MIDNIGHT: row["IS_PAST_MIDNIGHT"]  // Retain midnight flag
            };
        });

        // ✅ Update headers to include computed columns
        const updatedHeaders = [...headers, "BULAN_TRANSAKSI", "BULAN_MASUK_TAGIHAN", "STATUS_DRIVER", "IS_PAST_MIDNIGHT"];

        // ✅ Initialize grouping and summary calculations
        const groupedData = {};
        let totalTransactions = 0;
        let totalBiayaLembur = 0;
        let totalDurationLemburr = 0;

        

        

        // const numeral = require("numeral");

detailedRecords.forEach(row => {
    const parseLocalizedNumber = (str) => {
        if (!str) return 0; // Handle null, undefined, or empty values
        return numeral(str).value() || 0; // Use numeral.js for correct parsing
    };

    const driver = row["NAMA_DRIVER"];

    // ✅ Ensure "UPAH_PER_JAM" is an integer
    if (row["UPAH_PER_JAM"]) {
        row["UPAH_PER_JAM"] = Math.trunc(parseLocalizedNumber(row["UPAH_PER_JAM"]));
    }

    // ✅ Remove thousand separator from "TOTAL_BIAYA_BAYAR" (convert to plain number)
    if (row["TOTAL_BIAYA_BAYAR"]) {
        row["TOTAL_BIAYA_BAYAR"] = parseInt(row["TOTAL_BIAYA_BAYAR"].replace(/\./g, ''), 10); // Remove thousand separator and convert to integer
    }

    // ✅ Ensure "TOTAL_JAM_BAYAR" allows only 1 decimal place
    if (row["TOTAL_JAM_BAYAR"]) {
        row["TOTAL_JAM_BAYAR"] = parseFloat(parseLocalizedNumber(row["TOTAL_JAM_BAYAR"]).toFixed(1));
    }

    // ✅ Ensure "TOTAL_JAM_LEMBUR" allows only 1 decimal place
    if (row["TOTAL_JAM_LEMBUR"]) {
        row["TOTAL_JAM_LEMBUR"] = parseFloat(parseLocalizedNumber(row["TOTAL_JAM_LEMBUR"]).toFixed(1));
    }

    const biayaLembur = row["TOTAL_BIAYA_BAYAR"]; // Keep as original format

    const durasiLembur = 0; // Adjust if needed

    if (!groupedData[driver]) {
        groupedData[driver] = {
            NAMA_DRIVER: driver,
            JUMLAH_TRANSAKSI: 0,
            TOTAL_BIAYA_BAYAR: 0,
            TOTAL_DURASI_LEMBUR: 0
        };
    }

    // ✅ Accumulate per driver
    groupedData[driver].JUMLAH_TRANSAKSI += 1;
    groupedData[driver].TOTAL_BIAYA_BAYAR += biayaLembur;
    groupedData[driver].TOTAL_DURASI_LEMBUR += durasiLembur;

    // ✅ Accumulate for grand total
    totalTransactions += 1;
    totalBiayaLembur += biayaLembur;
    totalDurationLemburr += durasiLembur;
});

        
        
        
        // ✅ Convert grouped data into an array format
        const aggregatedByDriver = Object.values(groupedData).map(group => ({
            ...group,
            TOTAL_BIAYA_BAYAR: Math.trunc(numeral(group.TOTAL_BIAYA_BAYAR).value()),
            // Math.trunc(numeral(group.TOTAL_BIAYA_BAYAR).value()),
            TOTAL_DURASI_LEMBUR: group.TOTAL_DURASI_LEMBUR.toFixed(2)
        }));

      // ✅ Calculate Admin Fee, Total Tagihan with Admin, Tax, and Final Total
const adminFee = Math.trunc(numeral(totalBiayaLembur * 0.05).value());
const totalTagihanWithAdmin = Math.trunc(numeral(totalBiayaLembur + adminFee).value());
const tax = Math.trunc(numeral(totalTagihanWithAdmin * 0.11).value());
const totalTagihanWithTax = Math.trunc(numeral(totalTagihanWithAdmin + tax).value());

// ✅ Extract BULAN_TRANSAKSI and BULAN_MASUK_TAGIHAN from detailed records
const latestBulanTransaksi = detailedRecords[0]?.BULAN_TRANSAKSI || "N/A";
const latestBulanMasukTagihan = detailedRecords[0]?.BULAN_MASUK_TAGIHAN || "N/A";


// ✅ Create overall summary with integer values (no separators, no decimals)
const overallTotals = {
    TOTAL_TRANSACTIONS: Math.trunc(numeral(totalTransactions).value()),
    TOTAL_BIAYA_BAYAR: Math.trunc(numeral(totalBiayaLembur).value()),
    TOTAL_DURASI_LEMBUR: Math.trunc(numeral(totalDurationLemburr).value()),
    ADMIN_FEE: Math.trunc(numeral(adminFee).value()),
    TOTAL_TAGIHAN_WITH_ADMIN: Math.trunc(numeral(totalTagihanWithAdmin).value()),
    TAX: Math.trunc(numeral(tax).value()),
    TOTAL_TAGIHAN_WITH_TAX: Math.trunc(numeral(totalTagihanWithTax).value()),
    BULAN_TRANSAKSI: latestBulanTransaksi, // ✅ Include BULAN_TRANSAKSI
    BULAN_MASUK_TAGIHAN: latestBulanMasukTagihan // ✅ Include BULAN_MASUK_TAGIHAN
};

// ✅ JSON Response (Unified format)
return res.json({
    message: `✅ Successfully generated ${reportType} report`,
    column_headers: updatedHeaders,
    detailed_records: detailedRecords, // Now formatted as an array of objects
    aggregated_by_driver: aggregatedByDriver,
    overall_totals: overallTotals,
    record_count: detailedRecords.length
})

    } catch (error) {
        console.error(`❌ Error generating ${reportType} report:`, error);
        res.status(500).json({ error: error.message });
    }
};





// ✅ Define Routes for Each Report Type Using the Centralized Function
router.get('/report/rekap-kantor', (req, res) => generateReport('rekap-kantor', req, res));
router.get('/report/rekap-pln', (req, res) => generateReport('rekap-pln', req, res));
router.get('/report/lembar-satuan', (req, res) => generateReport('lembar-satuan', req, res));
router.get('/report/sppd-sorted-grouped', (req, res) => generateReport('sppd-sorted-grouped', req, res));

module.exports = router;
