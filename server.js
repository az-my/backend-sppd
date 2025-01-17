require('dotenv-safe').config({ allowEmptyValues: false, example: './.env' });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('./BACKEND_utils_logger');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

logger.info('✅ Environment variables loaded and validated.');

const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production';
const serviceAccountPath = path.join(__dirname, 'service-account.json');

if (isRailway) {
    logger.info('🚀 Running on Railway, writing service-account.json...');
    fs.writeFileSync(serviceAccountPath, process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} else {
    logger.info('🛠️ Running locally, using existing service-account.json...');
}

// Load Google Sheets API
const { google } = require('googleapis');
const sheets = google.sheets({
    version: 'v4',
    auth: new google.auth.GoogleAuth({
        keyFile: serviceAccountPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    }),
});

// API Routes
const lemburCrud = require('./BACKEND_lembur_crud');
const sppdCrud = require('./BACKEND_sppd_crud');
const lemburReport = require('./BACKEND_lembur_report');
const sppdReport = require('./BACKEND_sppd_report');

app.use('/api/lembur', lemburCrud);
app.use('/api/sppd', sppdCrud);
app.use('/api/lembur', lemburReport);
app.use('/api/sppd', sppdReport);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ message: `✅ Server running on ${isRailway ? 'Railway' : 'Localhost'}` });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(`❌ Server Error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`🚀 Server running at http://localhost:${PORT}`);
});
