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
    // Convert 'YYYY-MM-DD' to a Date object
    const date = new Date(dateStr);

    // List of month names
    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // Extract year and month
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based index (0 = Januari)

    // Calculate next month and its year
    const nextMonth = (month + 1) % 12;
    const nextYear = month === 11 ? year + 1 : year;

    const bulanTransaksi = `${monthNames[month]} ${year}`;
    const bulanMasukTagihan = `${monthNames[nextMonth]} ${nextYear}`;

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
    const unitIndex = header.indexOf("UNIT_KERJA");

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
        "STATUS_DRIVER",
        "UNIT_KERJA",
        "KOTA_UNIT_KERJA",
        "NAMA_PEMBERI_TUGAS",
        "JABATAN_PEMBERI_TUGAS",
        "KOTA_TUJUAN",
        "ALAT_ANGKUTAN",
        "MAKSUD_PERJALANAN",
        "TANGGAL_MULAI",   // ✅ No conversion, just ensure it exists
        "TANGGAL_SELESAI", // ✅ No conversion, just ensure it exists
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

    // ✅ Ensure numeric fields are properly formatted
    const numericFields = [
        'BUDGET_BIAYA_HARIAN', 'BUDGET_HOTEL',
        'TOTAL_BIAYA_HARIAN', 'TOTAL_BIAYA_PENGINAPAN',
        'TOTAL_BIAYA_SPPD', 'DURASI_TRIP', 'DURASI_INAP'
    ];

    numericFields.forEach(field => {
        if (typeof data[field] === 'string') {
            data[field] = data[field]
                .replace(/\./g, '')   // Remove thousands separator
                .replace(',', '.');   // Convert decimal separator
        }

        data[field] = parseFloat(data[field]);
        if (isNaN(data[field])) {
            throw new Error(`❌ ${field} must be a valid number.`);
        }
    });

    console.log("✅ Processed Data:", data);
};


const checkLemburData = (data) => {
    const requiredFields = [
        "NAMA_DRIVER", "STATUS_DRIVER", "UNIT_KERJA", "KOTA_UNIT_KERJA", "PEMBERI_TUGAS",
        "NAMA_FORM_1", "JABATAN_FORM_1", "NAMA_FORM_2", "JABATAN_FORM_2", "URAIAN_PEKERJAAN",
        "TANGGAL_MULAI", "HARI_MULAI", "STATUS_HARI_MULAI", "JAM_MULAI",
        "TANGGAL_SELESAI", "HARI_SELESAI", "STATUS_HARI_SELESAI", "JAM_SELESAI",
        "TOTAL_JAM_LEMBUR", "TOTAL_JAM_BAYAR", "UPAH_PER_JAM", "TOTAL_BIAYA"
    ];

    const missingFields = requiredFields.filter(field => !data[field]);

    return missingFields; // Return missing fields array (empty if all fields exist)
};





module.exports = {
    getStatusDriver,
    sortDataByPriority,
    parseDate,
    getMonthNames,
    checkSppdData,
    checkLemburData
};



