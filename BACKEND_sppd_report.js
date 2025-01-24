// BACKEND_sppd_report.js
const express = require('express');
const { getSheetData } = require('./BACKEND_service_gsheets');
const { sortDataByPriority, getStatusDriver, getMonthNames } = require('./BACKEND_utils_check');
const { Parser } = require('json2csv');

const router = express.Router();
const SHEET_NAME = 'UJICOBA_SPPD';
const numeral = require("numeral");
/**
 * ✅ Generate Report (Reusable for All Report Types)
 * @param {string} reportType - "rekap-kantor", "rekap-pln", "lembar-satuan"
 */
const generateReport = async (reportType, req, res) => {
    try {
        const data = await getSheetData(SHEET_NAME);
        const headers = data[0]; // Column headers
        const rows = data.slice(1); // Data rows

        // ✅ Sort data before processing
        let sortedData = sortDataByPriority(rows, headers);

        // ✅ Convert raw rows to objects using headers as keys
        let detailedRecords = sortedData.map(row =>
            Object.fromEntries(headers.map((key, index) => [key, row[index] || "-"]))
        );

        // ✅ Append computed columns (bulanTransaksi, bulanMasukTagihan, statusDriver)
        detailedRecords = detailedRecords.map((row) => {
            const { bulanTransaksi, bulanMasukTagihan } = getMonthNames(row["TANGGAL_MULAI"]);
            return {
                ...row,
                BULAN_TRANSAKSI: bulanTransaksi,
                BULAN_MASUK_TAGIHAN: bulanMasukTagihan,
                STATUS_DRIVER: getStatusDriver(row["NAMA_DRIVER"])
            };
        });

        // ✅ Update headers to include computed columns
        const updatedHeaders = [...headers, "BULAN_TRANSAKSI", "BULAN_MASUK_TAGIHAN", "STATUS_DRIVER"];

        // ✅ Initialize grouping and summary calculations
        const groupedData = {};
        let totalTransactions = 0;
        let totalSPPD = 0;
        let totalDurationInap = 0;
        let totalDurationTrip = 0;

        detailedRecords.forEach(row => {
            const parseLocalizedNumber = (str) => {
                if (!str) return 0; // Handle null, undefined, or empty values
                const normalized = str.replace(/\./g, "").replace(",", ".");
                return parseFloat(normalized) || 0;
            };
        
            const driver = row["NAMA_DRIVER"];
            console.log("Raw TOTAL_BIAYA_BAYAR:", row["TOTAL_BIAYA_BAYAR"]); // Debugging raw values
        
            // ✅ List all financial fields that need conversion
            const financialFields = [
                "TOTAL_BIAYA_BAYAR",
                "TOTAL_BIAYA_PENGINAPAN",
                "TOTAL_BIAYA_HARIAN",
                "BUDGET_BIAYA_HARIAN",
                "BUDGET_HOTEL"
            ];
        
            // ✅ Convert each financial field
            financialFields.forEach(field => {
                if (row[field]) {
                    row[field] = parseLocalizedNumber(row[field]); // Convert and override the value
                }
            });
        
            // ✅ Convert DURASI_INAP safely
            const durasiInap = parseFloat((row["DURASI_INAP"] || "0").replace(/\./g, '').replace(',', '.')) || 0;
            const durasiTrip = parseFloat((row["DURASI_TRIP"] || "0").replace(/\./g, '').replace(',', '.')) || 0;
            console.log(`Parsed TOTAL_BIAYA_BAYAR: ${row["TOTAL_BIAYA_BAYAR"]}`);
        
            // ✅ Initialize driver-based grouping
            if (!groupedData[driver]) {
                groupedData[driver] = {
                    NAMA_DRIVER: driver,
                    JUMLAH_TRANSAKSI: 0,
                    TOTAL_BIAYA_BAYAR: 0,
                    TOTAL_BIAYA_PENGINAPAN: 0,
                    TOTAL_BIAYA_HARIAN: 0,
                    BUDGET_BIAYA_HARIAN: 0,
                    BUDGET_HOTEL: 0,
                    TOTAL_DURASI_INAP: 0,
                    TOTAL_DURASI_TRIP: 0
                };
            }
        
            // ✅ Accumulate values per driver
            groupedData[driver].JUMLAH_TRANSAKSI += 1;
            groupedData[driver].TOTAL_BIAYA_BAYAR += row["TOTAL_BIAYA_BAYAR"];
            groupedData[driver].TOTAL_BIAYA_PENGINAPAN += row["TOTAL_BIAYA_PENGINAPAN"];
            groupedData[driver].TOTAL_BIAYA_HARIAN += row["TOTAL_BIAYA_HARIAN"];
            groupedData[driver].BUDGET_BIAYA_HARIAN += row["BUDGET_BIAYA_HARIAN"];
            groupedData[driver].BUDGET_HOTEL += row["BUDGET_HOTEL"];
            groupedData[driver].TOTAL_DURASI_INAP += durasiInap;
            groupedData[driver].TOTAL_DURASI_TRIP+= durasiTrip;
        
            // ✅ Accumulate for grand totals
            totalTransactions += 1;
            totalSPPD += row["TOTAL_BIAYA_BAYAR"];
            totalDurationInap += durasiInap;
            totalDurationTrip += durasiTrip;
        });
        
        // ✅ Convert grouped data into an array format
        const aggregatedByDriver = Object.values(groupedData).map(group => ({
            ...group,
            TOTAL_BIAYA_BAYAR: Math.trunc(numeral(group.TOTAL_BIAYA_BAYAR).value()),
            TOTAL_DURASI_INAP: group.TOTAL_DURASI_INAP.toFixed(2),
            TOTAL_DURASI_TRIP: group.TOTAL_DURASI_TRIP.toFixed(2)
        }));

// ✅ Calculate Admin Fee, Total Tagihan with Admin, Tax, and Final Total
const adminFee = totalSPPD * 0.05;
const totalTagihanWithAdmin = totalSPPD + adminFee;
const tax = totalTagihanWithAdmin * 0.11;
const totalTagihanWithTax = totalTagihanWithAdmin + tax;

// ✅ Extract BULAN_TRANSAKSI and BULAN_MASUK_TAGIHAN from detailed records
const latestBulanTransaksi = detailedRecords[0]?.BULAN_TRANSAKSI || "N/A";
const latestBulanMasukTagihan = detailedRecords[0]?.BULAN_MASUK_TAGIHAN || "N/A";


// ✅ Create overall summary (including missing TOTAL_TAGIHAN_WITH_TAX)
const overallTotals = {
    TOTAL_TRANSACTIONS: totalTransactions,
    // TOTAL_BIAYA_BAYAR: totalSPPD.toLocaleString('id-ID', { minimumFractionDigits: 0 }),
     TOTAL_BIAYA_BAYAR: Math.trunc(numeral(totalSPPD).value()),
    TOTAL_DURASI_INAP: totalDurationInap.toFixed(2),
    TOTAL_DURASI_TRIP: totalDurationTrip.toFixed(2),
    ADMIN_FEE: Math.trunc(numeral(adminFee).value()),
    TOTAL_TAGIHAN_WITH_ADMIN: Math.trunc(numeral(totalTagihanWithAdmin).value()),
    TAX: Math.trunc(numeral(tax).value()),
    TOTAL_TAGIHAN_WITH_TAX: Math.trunc(numeral(totalTagihanWithTax).value()), // ✅ Fix missing key
    BULAN_TRANSAKSI: latestBulanTransaksi, // ✅ Include BULAN_TRANSAKSI
    BULAN_MASUK_TAGIHAN: latestBulanMasukTagihan // ✅ Include BULAN_MASUK_TAGIHAN
};

        // ✅ JSON Response (Unified format)
        return res.json({
            message: `✅ Successfully generated ${reportType} report`,
            column_headers: updatedHeaders,
            detailed_records: detailedRecords, // Now formatted as array of objects
            aggregated_by_driver: aggregatedByDriver,
            overall_totals: overallTotals,
            record_count: detailedRecords.length
        });

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
