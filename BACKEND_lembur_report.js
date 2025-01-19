// BACKEND_sppd_report.js
const express = require('express');
const { getSheetData } = require('./BACKEND_service_gsheets');
const { sortDataByPriority, getStatusDriver, getMonthNames, isPastMidnight, splitPastMidnightRecord, getDayName } = require('./BACKEND_utils_lembur');
const { Parser } = require('json2csv');

const router = express.Router();
const SHEET_NAME = 'UJICOBA_LEMBUR';

/**
 * ✅ Generate Report (Reusable for All Report Types)
 * @param {string} reportType - "rekap-kantor", "rekap-pln", "lembar-satuan"
 */
const generateReport = async (reportType, req, res) => {
    try {
        const data = await getSheetData(SHEET_NAME);
        const header = data[0]; // Raw header columns
        const rows = data.slice(1); // Raw data excluding header

        // ✅ Apply consistent sorting logic
        let sortedData = sortDataByPriority(rows, header);

        // ✅ Store processed data
        let finalData = [];

        // ✅ Add computed columns to each row (keeps all raw data intact)
        sortedData.forEach((row) => {
            const { bulanTransaksi, bulanMasukTagihan } = getMonthNames(row[header.indexOf('TANGGAL_MULAI')]);
            const tanggalLembur = row[header.indexOf('TANGGAL_MULAI')];
            const tanggalSelesai = row[header.indexOf('TANGGAL_SELESAI')];
            const pastMidnight = isPastMidnight(tanggalLembur, tanggalSelesai) ? 'TRUE' : 'FALSE';

            if (pastMidnight === 'TRUE') {
                // ✅ If past midnight, split into two records
                const splitRecords = splitPastMidnightRecord(row, header);
                splitRecords.forEach((record) => {
                    finalData.push([
                        ...record, // Preserve all raw columns
                        bulanTransaksi, // New calculated column
                        bulanMasukTagihan, // New calculated column
                       
                        pastMidnight // New calculated column
                    ]);
                });
            } else {
                // ✅ If NOT past midnight, keep original record
                finalData.push([
                    ...row, // Preserve all raw columns
                    bulanTransaksi, // New calculated column
                    bulanMasukTagihan, // New calculated column
                   
                    pastMidnight // New calculated column
                ]);
            }
        });

        // ✅ Append new headers for calculated columns
        const updatedHeader = [...header, "BULAN_TRANSAKSI", "BULAN_MASUK_TAGIHAN", "HARI_SELESAI", "PAST_MIDNIGHT"];

        // ✅ Special Logic for Rekap Kantor (Group by NAMA_DRIVER)
        let formattedData;
        let totalBiayaSPPD = 0;

        if (reportType === 'rekap-kantor') {
            const groupedData = {};
            finalData.forEach(row => {
                const driver = row[header.indexOf('NAMA_DRIVER')];
                const biayaSPPD = parseFloat(row[header.indexOf('TOTAL_BIAYA')]?.replace(/\./g, '').replace(',', '.')) || 0;
                totalBiayaSPPD += biayaSPPD;

                if (!groupedData[driver]) {
                    groupedData[driver] = {
                        NAMA_DRIVER: driver,
                        JUMLAH_TRANSAKSI: 0,
                        TOTAL_BIAYA_SPPD: 0,
                        RECORDS: []
                    };
                }
                groupedData[driver].JUMLAH_TRANSAKSI += 1;
                groupedData[driver].TOTAL_BIAYA_SPPD += biayaSPPD;
                groupedData[driver].RECORDS.push(row);
            });

            // ✅ Convert grouped data into array format for CSV export
            formattedData = Object.values(groupedData).map(group => ({
                ...group,
                TOTAL_BIAYA_SPPD: group.TOTAL_BIAYA_SPPD.toLocaleString('id-ID', { minimumFractionDigits: 2 })
            }));
        } else {
            // ✅ Standard format for other reports
            formattedData = finalData;
            totalBiayaSPPD = finalData.reduce((sum, row) => {
                const biayaSPPD = parseFloat(row[header.indexOf('TOTAL_BIAYA')]?.replace(/\./g, '').replace(',', '.')) || 0;
                return sum + biayaSPPD;
            }, 0);
        }

        // ✅ Calculate Admin Fee, Total Tagihan with Admin, Tax, and Final Total
        const adminFee = totalBiayaSPPD * 0.05;
        const totalTagihanWithAdmin = totalBiayaSPPD + adminFee;
        const tax = totalTagihanWithAdmin * 0.11;
        const totalTagihanWithTax = totalTagihanWithAdmin + tax;

       // ✅ Ensure the header includes BULAN_TRANSAKSI & BULAN_MASUK_TAGIHAN
//const updatedHeader = [...header, "BULAN_TRANSAKSI", "BULAN_MASUK_TAGIHAN", "HARI_SELESAI", "PAST_MIDNIGHT"];

// ✅ Ensure the header includes BULAN_TRANSAKSI & BULAN_MASUK_TAGIHAN
const bulanTransaksiIndex = updatedHeader.indexOf("BULAN_TRANSAKSI");
const bulanMasukTagihanIndex = updatedHeader.indexOf("BULAN_MASUK_TAGIHAN");

// ✅ Extract values from the last row in finalData (ensuring latest values)
const latestBulanTransaksi = finalData.length > 0 && bulanTransaksiIndex !== -1
    ? finalData[finalData.length - 1][bulanTransaksiIndex]
    : "Unknown";

const latestBulanMasukTagihan = finalData.length > 0 && bulanMasukTagihanIndex !== -1
    ? finalData[finalData.length - 1][bulanMasukTagihanIndex]
    : "Unknown";
    
// ✅ Updated Summary Key with BULAN_TRANSAKSI & BULAN_MASUK_TAGIHAN
const summary = {
    TOTAL_BIAYA_SPPD: totalBiayaSPPD.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
    ADMIN_FEE: adminFee.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
    TOTAL_TAGIHAN_WITH_ADMIN: totalTagihanWithAdmin.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
    TAX: tax.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
    TOTAL_TAGIHAN_WITH_TAX: totalTagihanWithTax.toLocaleString('id-ID', { minimumFractionDigits: 2 }),

    // ✅ Correctly fetched values from the latest record
    LATEST_BULAN_TRANSAKSI: latestBulanTransaksi,
    LATEST_BULAN_MASUK_TAGIHAN: latestBulanMasukTagihan
};

// ✅ Debugging: Log the summary to check values
console.log("📌 Final Summary:", summary);


        // ✅ CSV Export Handling
        if (req.query.format?.toLowerCase() === 'csv') {
            const csvParser = new Parser({ fields: updatedHeader });
            const csvData = csvParser.parse(formattedData);
            res.header('Content-Type', 'text/csv');
            res.attachment(`${reportType}_report.csv`);
            return res.send(csvData);
        }

        // ✅ JSON Response
        res.json({
            message: `✅ Successfully generated ${reportType} report`,
            summary,
            total_records: formattedData.length,
            header: updatedHeader,
            data: formattedData
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
