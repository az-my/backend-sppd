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

// ✅ Create Lembur Entry
router.post('/create', async (req, res) => {
    try {
        const data = req.body;

        // ✅ Auto-generate UUID (limit to 4 characters)
        const generatedUUID = uuidv4().replace(/-/g, "").substring(0, 4);

        // ✅ Auto-generate TANGGAL_INPUT with full date-time format
        const tanggalInput = dayjs().format("YYYY-MM-DD HH:mm:ss");

        // ✅ Validate input using checkLemburData
        const missingFields = checkLemburData(data);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: "❌ Invalid data. Please fill in all required fields.",
                missingFields: missingFields
            });
        }

        // ✅ Ensure UUID and TANGGAL_INPUT are the first two columns in the correct order
        const orderedData = {
            UUID: generatedUUID,
            TANGGAL_INPUT: tanggalInput,
            ...data  // Append the rest of the user-provided fields
        };

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
