const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);


/**
 * ✅ Check if the work session crosses midnight
 * @param {string} tanggalLembur - Date in "DD/MM/YYYY" format
 * @param {string} tanggalSelesai - Date in "DD/MM/YYYY" format
 * @returns {boolean} - Returns TRUE if the date crosses midnight, otherwise FALSE
 */
const isPastMidnight = (tanggalLembur, tanggalSelesai) => {
    return tanggalLembur !== tanggalSelesai;
};

/**
 * ✅ Split a record into two if it crosses midnight
 * @param {Array} row - The original row data
 * @param {Array} header - Column headers
 * @returns {Array} - Returns either 1 or 2 processed records
 */
const splitPastMidnightRecord = (row, header) => {
    const tanggalMulaiIndex = header.indexOf("TANGGAL_MULAI");
    const tanggalSelesaiIndex = header.indexOf("TANGGAL_SELESAI");
    const hariMulaiIndex = header.indexOf("HARI_MULAI");
    const statusHariMulaiIndex = header.indexOf("STATUS_HARI_MULAI");
    const jamMulaiIndex = header.indexOf("JAM_MULAI");
    const jamSelesaiIndex = header.indexOf("JAM_SELESAI");
    const totalJamLemburIndex = header.indexOf("TOTAL_JAM_LEMBUR");
    const totalJamBayarIndex = header.indexOf("TOTAL_JAM_BAYAR");
    const totalBiayaIndex = header.indexOf("TOTAL_BIAYA");

    const tanggalMulai = row[tanggalMulaiIndex];
    const tanggalSelesai = row[tanggalSelesaiIndex];
    const hariMulai = row[hariMulaiIndex];
    const statusHariMulai = row[statusHariMulaiIndex];
    const jamMulai = row[jamMulaiIndex]; // Example: "23:00"
    const jamSelesai = row[jamSelesaiIndex]; // Example: "03:00"

    // Convert times to dayjs objects
    const jamMulaiTime = dayjs(jamMulai, "HH:mm", true);
    const jamSelesaiTime = dayjs(jamSelesai, "HH:mm", true);

    // Hours split
    const firstRecordHours = 24 - jamMulaiTime.hour(); // Until midnight
    const secondRecordHours = jamSelesaiTime.hour(); // After midnight

    // ✅ Calculate `TOTAL_JAM_BAYAR` based on `STATUS_HARI_MULAI`
    const calculateTotalJamBayar = (hours, statusHari) => {
        let totalJamBayar = 0;
        if (statusHari === "HK") {
            totalJamBayar = hours > 1 ? (1 * 1.5) + ((hours - 1) * 2.0) : (hours * 1.5);
        } else if (statusHari === "HL") {
            if (hours <= 8) {
                totalJamBayar = hours * 2.0;
            } else if (hours === 9) {
                totalJamBayar = (8 * 2.0) + (1 * 3.0);
            } else {
                totalJamBayar = (8 * 2.0) + (1 * 3.0) + ((hours - 9) * 4.0);
            }
        }
        return totalJamBayar;
    };

    // ✅ Function to format numbers with Indonesian thousand separator
    const formatToRupiah = (value) => {
        return parseInt(value, 10).toLocaleString("id-ID");
    };

    // ✅ First Record (Before Midnight)
    const firstRecord = [...row];
    firstRecord[tanggalSelesaiIndex] = tanggalMulai; // Adjust tanggal selesai
    firstRecord[hariMulaiIndex] = hariMulai; // Same as hari mulai
    firstRecord[statusHariMulaiIndex] = statusHariMulai; // Same as status hari mulai
    firstRecord[jamSelesaiIndex] = "24:00"; // Ends at midnight
    firstRecord[totalJamLemburIndex] = firstRecordHours; // Updated total jam lembur
    firstRecord[totalJamBayarIndex] = calculateTotalJamBayar(firstRecordHours, statusHariMulai).toFixed(2); // Total jam bayar
    firstRecord[totalBiayaIndex] = formatToRupiah(firstRecord[totalJamBayarIndex] * 22156); // ✅ Format to Indonesian Rupiah

    // ✅ Second Record (After Midnight)
    const secondRecord = [...row];
    secondRecord[tanggalMulaiIndex] = tanggalSelesai; // Adjust tanggal mulai
    secondRecord[hariMulaiIndex] = row[header.indexOf("HARI_SELESAI")]; // Move HARI_SELESAI to HARI_MULAI
    secondRecord[statusHariMulaiIndex] = row[header.indexOf("STATUS_HARI_SELESAI")]; // Move STATUS_HARI_SELESAI to STATUS_HARI_MULAI
    secondRecord[tanggalSelesaiIndex] = tanggalSelesai; // Same as tanggal mulai
    secondRecord[jamMulaiIndex] = "00:00"; // Starts from midnight
    secondRecord[totalJamLemburIndex] = secondRecordHours; // Updated total jam lembur
    secondRecord[totalJamBayarIndex] = calculateTotalJamBayar(secondRecordHours, secondRecord[statusHariMulaiIndex]).toFixed(2); // Total jam bayar
    secondRecord[totalBiayaIndex] = formatToRupiah(secondRecord[totalJamBayarIndex] * 22156); // ✅ Format to Indonesian Rupiah

    return [firstRecord, secondRecord];
};




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
    // ✅ Ensure header is valid
    if (!Array.isArray(header)) {
        console.error("❌ Header is not an array:", header);
        throw new Error("Header is not an array");
    }

    // ✅ Get indexes for relevant columns
    const tanggalMulaiIndex = header.indexOf("TANGGAL_MULAI");
    const namaDriverIndex = header.indexOf("NAMA_DRIVER");
    const unitIndex = header.indexOf("UNIT_KERJA"); // Adjusted column name
    const statusDriverIndex = header.indexOf("STATUS_DRIVER"); // ✅ NEW: Define this index!

    if (tanggalMulaiIndex === -1 || namaDriverIndex === -1 || unitIndex === -1 || statusDriverIndex === -1) {
        console.error("❌ One or more required columns are missing in header:", header);
        throw new Error("Missing required columns in header");
    }

    // ✅ Step 1: Sort by Driver Type (Using Direct STATUS_DRIVER Column)
    data.sort((a, b) => {
        const driverTypeA = a[statusDriverIndex]; // ✅ Directly using STATUS_DRIVER
        const driverTypeB = b[statusDriverIndex];

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
        'NAMA_DRIVER', 'ASAL', 'UNIT', 'PEMBERI_TUGAS',
        'TUJUAN', 'ALAT_ANGKUTAN', 'MAKSUD_PERJALANAN',
        'TANGGAL_MULAI', 'TANGGAL_SELESAI', 'DURASI',
        'HOTEL', 'BUDGET_BIAYA_HARIAN', 'BUDGET_HOTEL',
        'TOTAL_BIAYA_HARIAN', 'TOTAL_BIAYA_PENGINAPAN',
        'TOTAL_BIAYA_SPPD'
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
        'TOTAL_BIAYA_SPPD', 'DURASI'
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
    checkSppdData,
    isPastMidnight,
    splitPastMidnightRecord
};
