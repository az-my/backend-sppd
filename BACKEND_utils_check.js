// BACKEND_utils_check.js
const unitPriority = [
    "UPT Banda Aceh",
    "ULTG Banda Aceh",
    "ULTG Meulaboh",
    "ULTG Langsa"
].map(unit => unit.toLowerCase()); // Case-insensitive handling

const driverSewaList = ["SYAHRIL", "UWIS KARNI", "NUGRAHA RAMADHAN", "HENDRA"];

// ✅ Determine Driver Type (Tetap or Sewa)
const getStatusDriver = (namaDriver) =>
    driverSewaList.some(driver => driver.toUpperCase() === namaDriver.toUpperCase())
        ? "DRIVER-SEWA"
        : "DRIVER-TETAP";

// ✅ Convert Date String (dd/mm/yyyy) to JS Date Object
const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * ✅ Generate BULAN_TRANSAKSI and BULAN_MASUK_TAGIHAN from TANGGAL_MULAI
 */
const getMonthNames = (dateStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const bulanTransaksi = `${monthNames[month - 1]} ${year}`;
    const bulanMasukTagihan = `${monthNames[month % 12]} ${month === 12 ? year + 1 : year}`;
    return { bulanTransaksi, bulanMasukTagihan };
};

/**
 * ✅ Sorting Logic:
 * 1. Driver Tetap First, Driver Sewa Second
 * 2. Sort by Unit Order
 * 3. Sort by Tanggal Mulai (Oldest to Newest)
 * 4. Group by Driver Name
 */
const sortDataByPriority = (data, header) => {
    const tanggalMulaiIndex = header.indexOf("TANGGAL_MULAI");
    const namaDriverIndex = header.indexOf("NAMA_DRIVER");
    const unitIndex = header.indexOf("UNIT");

    // ✅ Step 1: Sort by Driver Type
    data.sort((a, b) => {
        const driverTypeA = getStatusDriver(a[namaDriverIndex]);
        const driverTypeB = getStatusDriver(b[namaDriverIndex]);
        if (driverTypeA !== driverTypeB) {
            return driverTypeA === "DRIVER-TETAP" ? -1 : 1;
        }

        // ✅ Step 2: Sort by Unit Priority
        const unitA = a[unitIndex].toLowerCase();
        const unitB = b[unitIndex].toLowerCase();
        const unitPriorityA = unitPriority.indexOf(unitA);
        const unitPriorityB = unitPriority.indexOf(unitB);
        if (unitPriorityA !== unitPriorityB) {
            return unitPriorityA - unitPriorityB;
        }

        // ✅ Step 3: Sort by Tanggal Mulai (Oldest to Newest)
        return parseDate(a[tanggalMulaiIndex]) - parseDate(b[tanggalMulaiIndex]);
    });

    // ✅ Step 4: Group by Nama Driver
    const groupedData = [];
    const seenDrivers = new Set();
    data.forEach(row => {
        const driverName = row[namaDriverIndex];
        if (!seenDrivers.has(driverName)) {
            seenDrivers.add(driverName);
            const driverRecords = data.filter(item => item[namaDriverIndex] === driverName);
            groupedData.push(...driverRecords);
        }
    });

    return groupedData;
};
const checkSppdData = (data) => {
    const requiredFields = [
        "NAMA_DRIVER",
        "STATUS_DRIVER",  // ✅ Added STATUS_DRIVER
        "UNIT_KERJA",
        "KOTA_UNIT_KERJA",
        "NAMA_PEMBERI_TUGAS",
        "JABATAN_PEMBERI_TUGAS",
        "KOTA_TUJUAN",
        "ALAT_ANGKUTAN",
        "MAKSUD_PERJALANAN",
        "TANGGAL_MULAI",
        "TANGGAL_SELESAI",
        "HOTEL_STATUS",
        "DURASI_TRIP",
        "DURASI_INAP",
        "BUDGET_BIAYA_HARIAN",
        "BUDGET_HOTEL",
        "TOTAL_BIAYA_HARIAN",
        "TOTAL_BIAYA_PENGINAPAN",
        "TOTAL_BIAYA_SPPD"
    ];

    // ✅ Check for missing fields
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        throw new Error(`❌ Missing required fields: ${missingFields.join(', ')}`);
    }

    /**
     * ✅ Convert Date to DD/MM/YYYY format and ensure it's saved as a string.
     * @param {string|Date} dateObj - Date to transform
     * @returns {string} - Formatted date in DD/MM/YYYY
     */
    const transformDateToDDMMYYYY = (dateObj) => {
        const date = new Date(dateObj);
        if (isNaN(date)) {
            throw new Error(`❌ Invalid date provided.`);
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`; // Prevents single quote formatting
    };

    // ✅ Ensure date fields are cleaned and correctly formatted
    const dateFields = ['TANGGAL_MULAI', 'TANGGAL_SELESAI'];
    dateFields.forEach(field => {
        data[field] = transformDateToDDMMYYYY(data[field]);  // Format corrected to DD/MM/YYYY
    });

    // ✅ Clean all numeric fields and ensure no single quote issue
    const numericFields = [
        'BUDGET_BIAYA_HARIAN', 'BUDGET_HOTEL',
        'TOTAL_BIAYA_HARIAN', 'TOTAL_BIAYA_PENGINAPAN',
        'TOTAL_BIAYA_SPPD', 'DURASI_TRIP', 'DURASI_INAP'
    ];

    numericFields.forEach(field => {
        if (typeof data[field] === 'string') {
            // ✅ Convert Indonesian format to proper float format
            data[field] = data[field]
                .replace(/\./g, '')   // Remove thousands separator
                .replace(',', '.');   // Convert decimal separator
        }
        
        // ✅ Convert to a proper number
        data[field] = parseFloat(data[field]);
        if (isNaN(data[field])) {
            throw new Error(`❌ ${field} must be a valid number.`);
        }
    });
};

/**
 * ✅ Export the function for use in other files
 */
module.exports = { checkSppdData };



module.exports = {
    getStatusDriver,
    sortDataByPriority,
    parseDate,
    getMonthNames,
    checkSppdData
};
