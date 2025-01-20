// BACKEND_lembur_crud.js
// 🏗️ Lembur CRUD Controller (Create, Read, Update, Delete)

const express = require('express');
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');
const { getSheetData, addSheetData, updateSheetData, deleteSheetData } = require('./BACKEND_service_gsheets');
const { checkLemburData } = require('./BACKEND_utils_check');
const router = express.Router();

// 🔑 Google Sheet Name for Lembur
const SHEET_NAME = 'UJICOBA_LEMBUR';

// ✅ Define the correct field order based on DB schema
const dbColumnOrder = [
    "UUID", "TANGGAL_INPUT", "NAMA_DRIVER", "STATUS_DRIVER", "UNIT_KERJA", "KOTA_UNIT_KERJA",
    "PEMBERI_TUGAS", "NAMA_FORM_1", "JABATAN_FORM_1", "NAMA_FORM_2", "JABATAN_FORM_2",
    "URAIAN_PEKERJAAN", "TANGGAL_MULAI", "HARI_MULAI", "STATUS_HARI_MULAI", "JAM_MULAI",
    "TANGGAL_SELESAI", "HARI_SELESAI", "STATUS_HARI_SELESAI", "JAM_SELESAI",
    "TOTAL_JAM_LEMBUR", "TOTAL_JAM_BAYAR", "UPAH_PER_JAM", "TOTAL_BIAYA"
];

// ✅ Create Lembur Entry
router.post("/create", async (req, res) => {
    try {
        const data = req.body;
        console.log("📌 Raw Request Body:", data);

        // ✅ Auto-generate UUID and Timestamp
        const generatedUUID = uuidv4().replace(/-/g, "").substring(0, 4);
        const tanggalInput = dayjs().format("YYYY-MM-DD HH:mm:ss");

        // ✅ Reorder Data to Match DB Column Order
        const orderedData = { UUID: generatedUUID, TANGGAL_INPUT: tanggalInput };
        
        // ✅ Fill the orderedData object with data based on the correct column order
        dbColumnOrder.slice(2).forEach((column) => {
            orderedData[column] = data[column] || ""; // Fill missing fields with empty strings
        });

        console.log("✅ Ordered Data for Submission:", orderedData);

        // ✅ Add to Google Sheets (Ensures correct column order)
        await addSheetData(SHEET_NAME, [Object.values(orderedData)]);

        res.status(201).json({ 
            message: '🔥 Lembur entry created successfully!',
            generatedUUID: orderedData.UUID,
            tanggalInput: orderedData.TANGGAL_INPUT
        });

    } catch (err) {
        console.error("❌ Error creating Lembur entry:", err);
        res.status(500).json({ error: "Internal Server Error. Please try again." });
    }
});



// ✅ Read All Lembur Entries
router.get('/read', async (req, res) => {
    try {
        const data = await getSheetData(SHEET_NAME);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Update Lembur Entry by ID
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        checkLemburData(updatedData);
        await updateSheetData(SHEET_NAME, id, updatedData);
        res.json({ message: '✅ Lembur entry updated!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete Lembur Entry by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await deleteSheetData(SHEET_NAME, id);
        res.json({ message: '🗑️ Lembur entry deleted!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
