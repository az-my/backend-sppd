// server.js
// ✅ Now using dotenv-safe for strict environment validation

require('dotenv-safe').config({
    allowEmptyValues: false,  // Prevents empty values in the .env file
    example: './.env'  // Points to the reference file for validation
});

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('./BACKEND_utils_logger');

// Importing routes
const lemburCrud = require('./BACKEND_lembur_crud');
const sppdCrud = require('./BACKEND_sppd_crud');
const lemburReport = require('./BACKEND_lembur_report');
const sppdReport = require('./BACKEND_sppd_report');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ✅ Log successful environment loading
logger.info('✅ Environment variables loaded and validated.');

// ✅ Mounting Routes
app.use('/api/lembur', lemburCrud);
app.use('/api/sppd', sppdCrud);
app.use('/api/lembur', lemburReport);
app.use('/api/sppd', sppdReport);

// ✅ Health Check
app.get('/api/health', (req, res) => {
    res.json({ message: '✅ Server is healthy with dotenv-safe!' });
});

// ✅ Error Handling Middleware (Logs Errors Globally)
app.use((err, req, res, next) => {
    logger.error(`❌ Server Error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// ✅ Start Server with Validated Environment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`🚀 Server running at http://localhost:${PORT}`);
});
