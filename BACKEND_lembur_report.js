// BACKEND_lembur_report.js
// 📊 Lembur Reporting Controller (Different Report Types)

const express = require('express');
const { getSheetData } = require('./BACKEND_service_gsheets');
const router = express.Router();

// 🔑 Google Sheet Name for Lembur
const SHEET_NAME = 'database_lembur';

// ✅ Rekap Kantor Report
router.get('/report/rekap-kantor', async (req, res) => {
    try {
        const data = await getSheetData(SHEET_NAME);
        const filteredData = data.filter(row => row[3] === 'Kantor');
        res.json(filteredData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Rekap PLN Report (Custom Transformation)
router.get('/report/rekap-pln', async (req, res) => {
    try {
        const data = await getSheetData(SHEET_NAME);
        const transformedData = data.filter(row => row[3] === 'PLN').map(row => ({
            name: row[0],
            adjustedHours: row[2] * 1.2
        }));
        res.json(transformedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Lembar Satuan Report
router.get('/report/lembar-satuan', async (req, res) => {
    try {
        const data = await getSheetData(SHEET_NAME);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
