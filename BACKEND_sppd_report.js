// BACKEND_sppd_report.js
const express = require('express');
const { getSheetData } = require('./BACKEND_service_gsheets');
const { sortDataByPriority, getStatusDriver, getMonthNames } = require('./BACKEND_utils_check');
const { Parser } = require('json2csv');

const router = express.Router();
const SHEET_NAME = 'UJICOBA_SPPD';

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

        // ✅ Add computed columns to each row (keeps all raw data intact)
        sortedData = sortedData.map((row) => {
            const { bulanTransaksi, bulanMasukTagihan } = getMonthNames(row[header.indexOf('TANGGAL_MULAI')]);
            const namaDriver = row[header.indexOf('NAMA_DRIVER')];
            return [
                ...row, // Preserve all raw columns
                bulanTransaksi, // New calculated column
                bulanMasukTagihan, // New calculated column
                getStatusDriver(namaDriver) // New calculated column
            ];
        });

        // ✅ Append new headers for calculated columns
        const updatedHeader = [...header, "BULAN_TRANSAKSI", "BULAN_MASUK_TAGIHAN", "STATUS_DRIVER"];

        // ✅ Special Logic for Rekap Kantor (Group by NAMA_DRIVER)
        let formattedData;
        let totalBiayaSPPD = 0;

        if (reportType === 'rekap-kantor') {
            const groupedData = {};
            let grandTotalBiayaSPPD = 0;
            let grandTotalDurasiInap = 0;
            let grandTotalJumlahTransaksi = 0;
        
            sortedData.forEach(row => {
                const driver = row[header.indexOf('NAMA_DRIVER')];
                const biayaSPPD = parseFloat(row[header.indexOf('TOTAL_BIAYA_SPPD')]?.replace(/\./g, '').replace(',', '.')) || 0;
                const durasiInap = parseFloat(row[header.indexOf('DURASI_INAP')]?.replace(/\./g, '').replace(',', '.')) || 0;
        
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
                grandTotalJumlahTransaksi += 1;
                grandTotalBiayaSPPD += biayaSPPD;
                grandTotalDurasiInap += durasiInap;
            });
        
            // ✅ Convert grouped data into an array format
            const summaryData = Object.values(groupedData).map(group => ({
                ...group,
                TOTAL_BIAYA_SPPD: group.TOTAL_BIAYA_SPPD.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
                TOTAL_DURASI_INAP: group.TOTAL_DURASI_INAP.toFixed(2)
            }));
        
            // ✅ Create Grand Total Data (Single Summary)
            const grandTotal = {
                JUMLAH_TRANSAKSI: grandTotalJumlahTransaksi,
                TOTAL_BIAYA_SPPD: grandTotalBiayaSPPD.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
                TOTAL_DURASI_INAP: grandTotalDurasiInap.toFixed(2)
            };
        
            // ✅ Return summarized data & grand total separately
            return res.json({
                message: "✅ Successfully generated rekap-kantor summary",
                summary: summaryData,  // Each driver's data
                grand_total: grandTotal // Single object with summed values
            });
        }
        
        
         else {
            // ✅ Standard format for other reports
            formattedData = sortedData;
            totalBiayaSPPD = sortedData.reduce((sum, row) => {
                const biayaSPPD = parseFloat(row[header.indexOf('TOTAL_BIAYA_SPPD')]?.replace(/\./g, '').replace(',', '.')) || 0;
                return sum + biayaSPPD;
            }, 0);
        }

        // ✅ Calculate Admin Fee, Total Tagihan with Admin, Tax, and Final Total
        const adminFee = totalBiayaSPPD * 0.05;
        const totalTagihanWithAdmin = totalBiayaSPPD + adminFee;
        const tax = totalTagihanWithAdmin * 0.11;
        const totalTagihanWithTax = totalTagihanWithAdmin + tax;

        // ✅ Summary Key with New Calculations
        const summary = {
            TOTAL_BIAYA_SPPD: totalBiayaSPPD.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
            ADMIN_FEE: adminFee.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
            TOTAL_TAGIHAN_WITH_ADMIN: totalTagihanWithAdmin.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
            TAX: tax.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
            TOTAL_TAGIHAN_WITH_TAX: totalTagihanWithTax.toLocaleString('id-ID', { minimumFractionDigits: 2 })
        };

        // // ✅ CSV Export Handling
        // if (req.query.format?.toLowerCase() === 'csv') {
        //     const csvParser = new Parser({ fields: updatedHeader });
        //     const csvData = csvParser.parse(formattedData);
        //     res.header('Content-Type', 'text/csv');
        //     res.attachment(`${reportType}_report.csv`);
        //     return res.send(csvData);
        // }

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
