// BACKEND_sppd_report.js
const express = require('express');
const { getSheetData } = require('./BACKEND_service_gsheets');
const { sortDataByPriority, getStatusDriver, getMonthNames, isPastMidnight, splitPastMidnightRecord, getDayName } = require('./BACKEND_utils_lembur');
const { Parser } = require('json2csv');

const router = express.Router();
const SHEET_NAME = 'UJICOBA_LEMBUR';
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
        let totalSPPD = 0;
        let totalDurationInap = 0;

        detailedRecords.forEach(row => {
            const driver = row["NAMA_DRIVER"];
            const biayaSPPD = parseFloat((row["TOTAL_BIAYA"] || "0").replace(/\./g, '').replace(',', '.')) || 0;
           
            // const durasiInap = parseFloat((row["TOTAL_JAM_LEMBUR"] || "0").replace(/\./g, '').replace(',', '.')) || 0;
            const durasiInap = 0;
            if (!groupedData[driver]) {
                groupedData[driver] = {
                    NAMA_DRIVER: driver,
                    JUMLAH_TRANSAKSI: 0,
                    TOTAL_BIAYA_SPPD: 0,
                    TOTAL_DURASI_INAP: 0
                };
            }

            // ✅ Accumulate per driver
            groupedData[driver].JUMLAH_TRANSAKSI += 1;
            groupedData[driver].TOTAL_BIAYA_SPPD += biayaSPPD;
            groupedData[driver].TOTAL_DURASI_INAP += durasiInap;

            // ✅ Accumulate for grand total
            totalTransactions += 1;
            totalSPPD += biayaSPPD;
            totalDurationInap += durasiInap;
        });

        // ✅ Convert grouped data into an array format
        const aggregatedByDriver = Object.values(groupedData).map(group => ({
            ...group,
            TOTAL_BIAYA_SPPD: group.TOTAL_BIAYA_SPPD.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
            TOTAL_DURASI_INAP: group.TOTAL_DURASI_INAP.toFixed(2)
        }));

        // ✅ Calculate Admin Fee, Total Tagihan with Admin, Tax, and Final Total
        const adminFee = totalSPPD * 0.05;
        const totalTagihanWithAdmin = totalSPPD + adminFee;
        const tax = totalTagihanWithAdmin * 0.11;
        const totalTagihanWithTax = totalTagihanWithAdmin + tax;

        // ✅ Create overall summary
        const overallTotals = {
            TOTAL_TRANSACTIONS: totalTransactions,
            TOTAL_BIAYA_SPPD: totalSPPD.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
            TOTAL_DURASI_INAP: totalDurationInap.toFixed(2),
            ADMIN_FEE: adminFee.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
            TOTAL_TAGIHAN_WITH_ADMIN: totalTagihanWithAdmin.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
            TAX: tax.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
            TOTAL_TAGIHAN_WITH_TAX: totalTagihanWithTax.toLocaleString('id-ID', { minimumFractionDigits: 2 })
        };

        // ✅ JSON Response (Unified format)
        return res.json({
            message: `✅ Successfully generated ${reportType} report`,
            column_headers: updatedHeaders,
            detailed_records: detailedRecords, // Now formatted as an array of objects
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
