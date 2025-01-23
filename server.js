// ✅ Load environment variables only in local development
if (process.env.RAILWAY_ENVIRONMENT !== "production") {
    require('dotenv-safe').config({
        allowEmptyValues: false,  // Prevents empty values in the .env file
        example: './.env'  // Points to the reference file for validation
    });
}

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('./BACKEND_utils_logger');
const path = require('path'); // 🔴 Fix: Import the 'path' module
// ✅ Use Google Service Account from Railway Variables
const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    : require('./service-account.json');  // Fallback for local development

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ✅ Log successful environment loading
logger.info('✅ Environment variables loaded and validated.');

// ✅ Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// ✅ Fix Clean URLs Handling
app.get('/:page', (req, res) => {
    const filePath = path.join(__dirname, 'frontend', `${req.params.page}.html`);

    res.sendFile(filePath, (err) => {
        if (err) {
            logger.warn(`❌ Page Not Found: ${req.params.page}`);
            res.sendFile(path.join(__dirname, 'frontend', '404.html'));
        }
    });
});
// ✅ Mounting Routes
app.use('/api/lembur', require('./BACKEND_lembur_crud'));
app.use('/api/sppd', require('./BACKEND_sppd_crud'));
app.use('/api/lembur', require('./BACKEND_lembur_report'));
app.use('/api/sppd', require('./BACKEND_sppd_report'));

// ✅ Health Check
app.get('/api/health', (req, res) => {
    res.json({ message: '✅ Server is healthy with Railway!' });
});

// ✅ Error Handling Middleware (Logs Errors Globally)
app.use((err, req, res, next) => {
    logger.error(`❌ Server Error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`🚀 Server running at http://localhost:${PORT}`);
});
