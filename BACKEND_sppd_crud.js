// BACKEND_sppd_crud.js
// 🏗️ SPPD CRUD Controller (Create, Read, Update, Delete) with Custom Add Logic

const express = require('express');
const { getSheetData, addSheetData, updateSheetData, deleteSheetData } = require('./BACKEND_service_gsheets');
const { checkSppdData } = require('./BACKEND_utils_check');
const { v4: uuidv4 } = require('uuid'); // Import UUID library
const router = express.Router();

// 🔑 Google Sheet Name for SPPD
const SHEET_NAME = 'UJICOBA_SPPD';

/**
 * ✅ Create SPPD Entry with Custom Logic:
 * - If the ID exists, adjust the date by +1 day and create a new entry.
 */
router.post('/create', async (req, res) => {
    try {
        const newData = req.body;

        // ✅ Generate UUID and standardize TANGGAL_INPUT (YYYY-MM-DD)
        newData.UUID = uuidv4();
        newData.TANGGAL_INPUT = new Date().toISOString().split('T')[0]; // Standard format

        // ✅ Validate Data Structure
        checkSppdData(newData);

        // ✅ Fetch existing data for validation
        const existingData = await getSheetData(SHEET_NAME);
        const header = existingData[0];
        const rows = existingData.slice(1);

        const namaDriverIndex = header.indexOf('NAMA_DRIVER');
        const tanggalSelesaiIndex = header.indexOf('TANGGAL_SELESAI');

        let tanggalMulai = new Date(newData.TANGGAL_MULAI); // ✅ Convert incoming date safely

        // ✅ Check for overlapping `TANGGAL_MULAI` for the same driver
        for (const row of rows) {
            const existingDriver = row[namaDriverIndex];
            const existingTanggalSelesai = row[tanggalSelesaiIndex]
                ? new Date(row[tanggalSelesaiIndex]) // ✅ Convert string to Date safely
                : null;

            if (
                existingDriver === newData.NAMA_DRIVER && // ✅ Match Driver
                existingTanggalSelesai && // ✅ Ensure TANGGAL_SELESAI exists
                tanggalMulai <= existingTanggalSelesai // ✅ Overlap detected
            ) {
                tanggalMulai.setDate(existingTanggalSelesai.getDate() + 1); // ✅ Adjust +1 day
                newData.TANGGAL_MULAI = tanggalMulai.toISOString().split('T')[0]; // ✅ Keep YYYY-MM-DD format
            }
        }



        const dayjs = require('dayjs'); // ✅ Import Day.js

        const formatDateForGoogleSheets = (dateStr) => {
            if (!dateStr) return "";
            const [year, month, day] = dateStr.split('-'); // Convert YYYY-MM-DD to DD/MM/YYYY
            return `${day}/${month}/${year}`; // ✅ No apostrophe, no formula, just pure date
        };


        // ✅ Prepare Data in Correct Order
        const orderedData = [
            newData.UUID,
            newData.TANGGAL_INPUT,
            newData.NAMA_DRIVER,
            newData.STATUS_DRIVER,
            newData.UNIT_KERJA,
            newData.KOTA_UNIT_KERJA,
            newData.NAMA_PEMBERI_TUGAS,
            newData.JABATAN_PEMBERI_TUGAS,
            newData.KOTA_TUJUAN,
            newData.ALAT_ANGKUTAN,
            newData.MAKSUD_PERJALANAN,
            formatDateForGoogleSheets(newData.TANGGAL_MULAI),  // ✅ Convert before saving
            formatDateForGoogleSheets(newData.TANGGAL_SELESAI), // ✅ Convert before saving
            newData.HOTEL_STATUS,
            newData.DURASI_TRIP,
            newData.DURASI_INAP,
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
