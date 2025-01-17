// BACKEND_service_gsheets.js
// 🔥 Google Sheets Service for Handling Data Operations

const { google } = require('googleapis');
const logger = require('./BACKEND_utils_logger'); // Import the logger

/**
 * ✅ Authenticate and return the Google Sheets Client with Error Logging
 */
const getGSheetsClient = () => {
    let creds;
    try {
        creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
        if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');
    } catch (error) {
        logger.error(`❌ Failed to load Google Service Account credentials: ${error.message}`);
        throw new Error(`❌ Failed to load Google Service Account credentials: ${error.message}`);
    }

    const auth = new google.auth.GoogleAuth({
        credentials: creds,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    logger.info('✅ Google Sheets client successfully authenticated.');
    return google.sheets({ version: 'v4', auth });
};

module.exports = { getGSheetsClient };


/**
 * ✅ Fetch all data from a Google Sheet.
 * @param {string} sheetName - The name of the Google Sheet tab.
 * @returns {Array} - Returns the entire sheet data as an array of rows.
 */
const getSheetData = async (sheetName) => {
    try {
        const sheets = getGSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: sheetName,
        });
        return response.data.values;
    } catch (error) {
        throw new Error(`❌ Failed to fetch data from ${sheetName}: ${error.message}`);
    }
};

/**
 * ✅ Add a new row to a Google Sheet.
 * @param {string} sheetName - The name of the Google Sheet tab.
 * @param {Array} data - Data to be added as a new row (Array format).
 */
const addSheetData = async (sheetName, data) => {
    try {
        const sheets = getGSheetsClient();
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: sheetName,
            valueInputOption: 'RAW',
            resource: { values: data },
        });
    } catch (error) {
        throw new Error(`❌ Failed to add data to ${sheetName}: ${error.message}`);
    }
};

/**
 * ✅ Update an existing row in Google Sheet by matching the ID (first column).
 * @param {string} sheetName - The name of the Google Sheet tab.
 * @param {string} id - The unique ID for the row to be updated.
 * @param {Object} newData - The new data to replace the existing row.
 */
const updateSheetData = async (sheetName, id, newData) => {
    try {
        const sheets = getGSheetsClient();
        const data = await getSheetData(sheetName);
        const header = data.shift(); // Separate the header row
        const updatedData = data.map((row) => 
            row[0] === id ? Object.values(newData) : row
        );

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: sheetName,
            valueInputOption: 'RAW',
            resource: { values: [header, ...updatedData] },
        });
    } catch (error) {
        throw new Error(`❌ Failed to update data in ${sheetName}: ${error.message}`);
    }
};

/**
 * ✅ Delete a row in Google Sheets by matching the ID (first column).
 * @param {string} sheetName - The name of the Google Sheet tab.
 * @param {string} id - The unique ID for the row to be deleted.
 */
const deleteSheetData = async (sheetName, id) => {
    try {
        const sheets = getGSheetsClient();
        const data = await getSheetData(sheetName);
        const header = data.shift(); // Separate the header row
        const filteredData = data.filter(row => row[0] !== id); // Remove matching ID row

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: sheetName,
            valueInputOption: 'RAW',
            resource: { values: [header, ...filteredData] },
        });
    } catch (error) {
        throw new Error(`❌ Failed to delete data from ${sheetName}: ${error.message}`);
    }
};

module.exports = { getSheetData, addSheetData, updateSheetData, deleteSheetData };
