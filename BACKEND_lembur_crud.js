// BACKEND_lembur_crud.js
// 🏗️ Lembur CRUD Controller (Create, Read, Update, Delete)

const express = require('express');
const { getSheetData, addSheetData, updateSheetData, deleteSheetData } = require('./BACKEND_service_gsheets');
const { checkLemburData } = require('./BACKEND_utils_check');
const router = express.Router();

// 🔑 Google Sheet Name for Lembur
const SHEET_NAME = 'database_lembur';

// ✅ Create Lembur Entry
router.post('/create', async (req, res) => {
    try {
        const data = req.body;
        checkLemburData(data); // Validate input
        await addSheetData(SHEET_NAME, [Object.values(data)]);
        res.status(201).json({ message: '🔥 Lembur entry created!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
