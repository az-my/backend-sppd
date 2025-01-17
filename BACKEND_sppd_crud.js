// BACKEND_sppd_crud.js
// 🏗️ SPPD CRUD Controller (Create, Read, Update, Delete) with Custom Add Logic

const express = require('express');
const { getSheetData, addSheetData, updateSheetData, deleteSheetData } = require('./BACKEND_service_gsheets');
const { checkSppdData } = require('./BACKEND_utils_check');
const { v4: uuidv4 } = require('uuid'); // Import UUID library
const router = express.Router();

// 🔑 Google Sheet Name for SPPD
const SHEET_NAME = 'database_sppd';

/**
 * ✅ Create SPPD Entry with Custom Logic:
 * - If the ID exists, adjust the date by +1 day and create a new entry.
 */
router.post('/create', async (req, res) => {
    try {
        const newData = req.body;
        // ✅ Generate UUID and TANGGAL_INPUT on the fly
        newData.UUID = uuidv4();
        newData.TANGGAL_INPUT = new Date().toLocaleString('id-ID');

        // ✅ Basic Data Structure Validation
        checkSppdData(newData);

        // ✅ Fetch existing data to perform validation
        const existingData = await getSheetData(SHEET_NAME);
        const header = existingData[0];
        const rows = existingData.slice(1);

        const namaDriverIndex = header.indexOf('NAMA_DRIVER');
        const tanggalMulaiIndex = header.indexOf('TANGGAL_MULAI');
        const tanggalSelesaiIndex = header.indexOf('TANGGAL_SELESAI');

        // ✅ Convert input date to Date object for comparison
        let tanggalMulai = new Date(newData.TANGGAL_MULAI.split('/').reverse().join('-')); // Convert DD/MM/YYYY to YYYY-MM-DD

        // ✅ Check for overlapping conditions with the same driver and adjust date if necessary
        for (const row of rows) {
            const existingDriver = row[namaDriverIndex];
            const existingTanggalSelesai = row[tanggalSelesaiIndex]
                ? new Date(row[tanggalSelesaiIndex].split('/').reverse().join('-'))
                : null;

            // ✅ If driver matches and the submitted start date is <= existing end date, adjust the date
            if (
                existingDriver === newData.NAMA_DRIVER &&
                existingTanggalSelesai &&
                tanggalMulai <= existingTanggalSelesai
            ) {
                tanggalMulai.setDate(existingTanggalSelesai.getDate() + 1);
                newData.TANGGAL_MULAI = tanggalMulai.toISOString().split('T')[0];
            }
        }

        // ✅ Prepare data for saving in the correct order of columns
        const orderedData = [
            newData.UUID,
            newData.TANGGAL_INPUT,
            newData.NAMA_DRIVER,
            newData.ASAL,
            newData.UNIT,
            newData.PEMBERI_TUGAS,
            newData.TUJUAN,
            newData.ALAT_ANGKUTAN,
            newData.MAKSUD_PERJALANAN,
            newData.TANGGAL_MULAI,
            newData.TANGGAL_SELESAI,
            newData.DURASI,
            newData.HOTEL,
            newData.BUDGET_BIAYA_HARIAN,
            newData.BUDGET_HOTEL,
            newData.TOTAL_BIAYA_HARIAN,
            newData.TOTAL_BIAYA_PENGINAPAN,
            newData.TOTAL_BIAYA_SPPD
        ];

        // ✅ Save the new entry into Google Sheets
        await addSheetData(SHEET_NAME, [orderedData]);

        res.status(201).json({
            message: '✅ New Entry Added Successfully!',
            data: orderedData
        });
    } catch (error) {
        console.error('❌ Error adding SPPD entry:', error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Read All SPPD Entries
router.get('/read', async (req, res) => {
    try {
        const data = await getSheetData(SHEET_NAME);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Update SPPD Entry by ID
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        checkSppdData(updatedData);
        await updateSheetData(SHEET_NAME, id, updatedData);
        res.json({ message: '✅ SPPD entry updated!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete SPPD Entry by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await deleteSheetData(SHEET_NAME, id);
        res.json({ message: '🗑️ SPPD entry deleted!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
