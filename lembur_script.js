const drivers = [
    { nama: "AKMALUL BASYAR", status: "DRIVER TETAP" },
    { nama: "EDI DARMAWAN", status: "DRIVER TETAP" },
    { nama: "ERDIANSYAH", status: "DRIVER TETAP" },
    { nama: "FAISAL ANWAR", status: "DRIVER TETAP" },
    { nama: "HENDRA", status: "DRIVER SEWA" },
    { nama: "JUNAIDI", status: "DRIVER TETAP" },
    { nama: "MUHAMMAD ICHSAN", status: "DRIVER TETAP" },
    { nama: "NASRULLAH", status: "DRIVER TETAP" },
    { nama: "NUGRAHA RAMADHAN", status: "DRIVER SEWA" },
    { nama: "RIZAL SAPUTRA", status: "DRIVER TETAP" },
    { nama: "ROMI SAFRUDDIN", status: "DRIVER TETAP" },
    { nama: "SUNARYO", status: "DRIVER TETAP" },
    { nama: "SYAMAUN", status: "DRIVER TETAP" },
    { nama: "SYAHRIL", status: "DRIVER SEWA" },
    { nama: "UWIS KARNI", status: "DRIVER SEWA" },
    { nama: "VANI AL WAHABY", status: "DRIVER TETAP" },
    { nama: "YANI MULIA", status: "DRIVER TETAP" }
];

// ✅ Populate Driver Dropdown
export const populateDriverDropdown = () => {
    const driverSelect = document.getElementById("NAMA_DRIVER");
    driverSelect.innerHTML = '<option value="">Pilih Driver</option>'; 

    drivers.forEach(driver => {
        const option = document.createElement("option");
        option.value = driver.nama;
        option.textContent = driver.nama;
        driverSelect.appendChild(option);
    });
};

// ✅ Auto-Fill STATUS_DRIVER Based on Selected Driver
export const autoFillFields = () => {
    const selectedDriver = document.getElementById("NAMA_DRIVER").value;
    const statusDriverInput = document.getElementById("STATUS_DRIVER");

    const driverData = drivers.find(driver => driver.nama === selectedDriver);
    
    // ✅ Set STATUS_DRIVER if a driver is selected
    statusDriverInput.value = driverData ? driverData.status : "";
};




const unitKerjaList = [
    "ULTG BANDA ACEH",
    "ULTG LANGSA",
    "ULTG MEULABOH",
    "UPT BANDA ACEH"
];

// ✅ Populate Unit Kerja Dropdown
export const populateUnitKerjaDropdown = () => {
    const unitKerjaSelect = document.getElementById("UNIT_KERJA");
    unitKerjaSelect.innerHTML = '<option value="">Pilih Unit Kerja</option>';

    unitKerjaList.forEach(unit => {
        const option = document.createElement("option");
        option.value = unit;
        option.textContent = unit;
        unitKerjaSelect.appendChild(option);
    });
};
const unitKerjaMapping = {
    "ULTG BANDA ACEH": { 
        nama1: "MUHAMMAD ISA", jabatan1: "MAN ULTG BANDA ACEH", 
        nama2: "INDRA KURNIAWAN", jabatan2: "MANAGER", 
        pemberiTugas: "DIREKSI LAPANGAN / MANAGER UPT BANDA ACEH"
    },
    "ULTG LANGSA": { 
        nama1: "FIZKI FIRDAUS", jabatan1: "MAN ULTG LANGSA", 
        nama2: "INDRA KURNIAWAN", jabatan2: "MANAGER", 
        pemberiTugas: "DIREKSI LAPANGAN / MANAGER UPT BANDA ACEH"
    },
    "ULTG MEULABOH": { 
        nama1: "ARIS DWI SANTOSO", jabatan1: "MAN ULTG MEULABOH", 
        nama2: "INDRA KURNIAWAN", jabatan2: "MANAGER", 
        pemberiTugas: "DIREKSI LAPANGAN / MANAGER UPT BANDA ACEH"
    },
    "UPT BANDA ACEH": { 
        nama1: "INA FAJRINA AL ISRA", jabatan1: "TL ADM & UMUM", 
        nama2: "INDRA KURNIAWAN", jabatan2: "MANAGER", 
        pemberiTugas: "DIREKSI LAPANGAN / MANAGER UPT BANDA ACEH"
    }
};

// ✅ Auto-Fill Form Data Based on UNIT_KERJA
export const autoFillUnitKerja = () => {
    const selectedUnitKerja = document.getElementById("UNIT_KERJA").value;
    const kotaUnitKerjaInput = document.getElementById("KOTA_UNIT_KERJA");
    const namaForm1Input = document.getElementById("NAMA_FORM_1");
    const jabatanForm1Input = document.getElementById("JABATAN_FORM_1");
    const namaForm2Input = document.getElementById("NAMA_FORM_2");
    const jabatanForm2Input = document.getElementById("JABATAN_FORM_2");
    const pemberiTugasInput = document.getElementById("PEMBERI_TUGAS");

    const unitKerjaToKotaMapping = {
        "ULTG BANDA ACEH": "BANDA ACEH",
        "ULTG LANGSA": "LANGSA",
        "ULTG MEULABOH": "MEULABOH",
        "UPT BANDA ACEH": "BANDA ACEH"
    };

    // ✅ Set KOTA_UNIT_KERJA
    kotaUnitKerjaInput.value = unitKerjaToKotaMapping[selectedUnitKerja] || "";

    // ✅ Auto-Fill NAMA_FORM_1, JABATAN_FORM_1, NAMA_FORM_2, JABATAN_FORM_2, PEMBERI_TUGAS
    if (unitKerjaMapping[selectedUnitKerja]) {
        const { nama1, jabatan1, nama2, jabatan2, pemberiTugas } = unitKerjaMapping[selectedUnitKerja];
        namaForm1Input.value = nama1;
        jabatanForm1Input.value = jabatan1;
        namaForm2Input.value = nama2;
        jabatanForm2Input.value = jabatan2;
        pemberiTugasInput.value = pemberiTugas;
    } else {
        namaForm1Input.value = "";
        jabatanForm1Input.value = "";
        namaForm2Input.value = "";
        jabatanForm2Input.value = "";
        pemberiTugasInput.value = "";
    }
};



// ✅ Define Public Holidays (Example: Indonesia)
const publicHolidays = [
    "2024-12-25", // Christmas
    "2024-12-31", // New Year’s Eve
    "2025-01-01"  // New Year’s Day
];

// ✅ Function to Get Previous Month Start & End Date
const getPreviousMonthLimits = () => {
    const now = dayjs();
    const lastMonth = now.subtract(1, "month");

    return {
        minDate: lastMonth.startOf("month").format("YYYY-MM-DD"),
        maxDate: lastMonth.endOf("month").format("YYYY-MM-DD")
    };
};

// ✅ Set TANGGAL_MULAI Constraints (Previous Month Only)
export const setTanggalMulaiLimits = () => {
    const tanggalMulaiInput = document.getElementById("TANGGAL_MULAI");
    const { minDate, maxDate } = getPreviousMonthLimits();

    tanggalMulaiInput.min = minDate;
    tanggalMulaiInput.max = maxDate;

    console.log(`✅ TANGGAL_MULAI allowed range: ${minDate} - ${maxDate}`);
};

// ✅ Generate Time Options in 30-Minute Increments
const generateTimeOptions = (startHour, endHour) => {
    let times = [];
    for (let h = startHour; h <= endHour; h++) {
        times.push(`${String(h).padStart(2, "0")}:00`);
        if (h !== endHour) times.push(`${String(h).padStart(2, "0")}:30`);
    }
    return times;
};

// ✅ Determine Status (Weekday, Weekend, or Public Holiday)
const checkDayStatus = (date) => {
    if (!date) return "";
    if (publicHolidays.includes(date)) return "HL";

    const dayOfWeek = dayjs(date).day();
    return (dayOfWeek === 6 || dayOfWeek === 0) ? "HL" : "HK";
};

// ✅ Update JAM_MULAI Dropdown Options
export const updateJamMulaiOptions = () => {
    const tanggalMulai = document.getElementById("TANGGAL_MULAI").value;
    const jamMulaiSelect = document.getElementById("JAM_MULAI");
    const isWeekendOrHoliday = checkDayStatus(tanggalMulai) !== "Weekday";

    // ✅ Set allowed range
    const minHour = isWeekendOrHoliday ? 0 : 17;
    const maxHour = 24;

    // ✅ Generate Time Options
    jamMulaiSelect.innerHTML = generateTimeOptions(minHour, maxHour)
        .map(time => `<option value="${time}">${time}</option>`)
        .join("");

    console.log(`✅ JAM_MULAI range updated: ${minHour}:00 - ${maxHour}:00`);
};

// ✅ Update JAM_SELESAI Dropdown Based on Selected JAM_MULAI
export const updateJamSelesaiOptions = () => {
    const jamMulaiSelect = document.getElementById("JAM_MULAI").value;
    const jamSelesaiSelect = document.getElementById("JAM_SELESAI");
    const tanggalMulai = document.getElementById("TANGGAL_MULAI").value;
    const isWeekendOrHoliday = checkDayStatus(tanggalMulai) !== "Weekday";

    if (!jamMulaiSelect) {
        jamSelesaiSelect.innerHTML = "";
        return;
    }

    // ✅ Set max duration
    const maxHourDiff = isWeekendOrHoliday ? 12 : 4;
    const jamMulaiHour = parseInt(jamMulaiSelect.split(":")[0], 10);
    const jamMulaiMinute = parseInt(jamMulaiSelect.split(":")[1], 10);

    // ✅ Generate Time Options (Start from JAM_MULAI + 30 min)
    let times = [];
    let totalMinutes = jamMulaiHour * 60 + jamMulaiMinute + 30; // ⬅️ Start from +30 minutes

    for (let i = 0; i < maxHourDiff * 2; i++) {
        let newHour = Math.floor(totalMinutes / 60);
        let newMinute = totalMinutes % 60;
        let formattedTime = `${String(newHour % 24).padStart(2, "0")}:${String(newMinute).padStart(2, "0")}`;
        times.push(formattedTime);
        totalMinutes += 30; // Increment 30 minutes
    }

    // ✅ Update JAM_SELESAI dropdown
    jamSelesaiSelect.innerHTML = times
        .map(time => `<option value="${time}">${time}</option>`)
        .join("");

    console.log(`✅ JAM_SELESAI range updated: ${times[0]} - ${times[times.length - 1]}`);
};


// ✅ Auto-Fill TANGGAL_SELESAI Based on JAM_SELESAI
export const autoFillTanggalSelesai = () => {
    const tanggalMulaiInput = document.getElementById("TANGGAL_MULAI").value;
    const jamSelesaiInput = document.getElementById("JAM_SELESAI").value;
    const tanggalSelesaiInput = document.getElementById("TANGGAL_SELESAI");

    if (!tanggalMulaiInput || !jamSelesaiInput) {
        tanggalSelesaiInput.value = "";
        return;
    }

    const jamSelesaiHour = parseInt(jamSelesaiInput.split(":")[0], 10);
    
    // ✅ If past midnight, increase `TANGGAL_SELESAI` by 1 day
    tanggalSelesaiInput.value = jamSelesaiHour < parseInt(document.getElementById("JAM_MULAI").value.split(":")[0], 10)
        ? dayjs(tanggalMulaiInput).add(1, "day").format("YYYY-MM-DD")
        : tanggalMulaiInput;

    console.log(`✅ Auto-filled TANGGAL_SELESAI: ${tanggalSelesaiInput.value}`);

    // ✅ After setting `TANGGAL_SELESAI`, update `HARI_SELESAI` and `STATUS_HARI_SELESAI`
    updateDayNames();
    updateDayStatus();
};


// ✅ Determine Day Name (HARI_MULAI & HARI_SELESAI)
export const updateDayNames = () => {
    const tanggalMulaiInput = document.getElementById("TANGGAL_MULAI").value;
    const tanggalSelesaiInput = document.getElementById("TANGGAL_SELESAI").value;
    const hariMulaiInput = document.getElementById("HARI_MULAI");
    const hariSelesaiInput = document.getElementById("HARI_SELESAI");

    if (tanggalMulaiInput) {
        hariMulaiInput.value = dayjs(tanggalMulaiInput).locale("id").format("dddd");
    }

    if (tanggalSelesaiInput) {
        hariSelesaiInput.value = dayjs(tanggalSelesaiInput).locale("id").format("dddd");
    }
};

// ✅ Determine Status (Weekday, Weekend, or Public Holiday)
export const updateDayStatus = () => {
    const tanggalMulaiInput = document.getElementById("TANGGAL_MULAI").value;
    const tanggalSelesaiInput = document.getElementById("TANGGAL_SELESAI").value;
    const statusHariMulaiInput = document.getElementById("STATUS_HARI_MULAI");
    const statusHariSelesaiInput = document.getElementById("STATUS_HARI_SELESAI");

    statusHariMulaiInput.value = checkDayStatus(tanggalMulaiInput);
    statusHariSelesaiInput.value = checkDayStatus(tanggalSelesaiInput);
};


// ✅ Constants
const UPAH_PER_JAM = 22156;

// ✅ Calculate Total Jam Lembur
export const calculateTotalJamLembur = () => {
    const jamMulai = document.getElementById("JAM_MULAI").value;
    const jamSelesai = document.getElementById("JAM_SELESAI").value;
    const totalJamLemburInput = document.getElementById("TOTAL_JAM_LEMBUR");

    if (!jamMulai || !jamSelesai) {
        totalJamLemburInput.value = "";
        return;
    }

    const jamMulaiMinutes = parseInt(jamMulai.split(":")[0]) * 60 + parseInt(jamMulai.split(":")[1]);
    const jamSelesaiMinutes = parseInt(jamSelesai.split(":")[0]) * 60 + parseInt(jamSelesai.split(":")[1]);

    // ✅ Handle Cross-Midnight Case
    let totalMinutes = jamSelesaiMinutes >= jamMulaiMinutes
        ? jamSelesaiMinutes - jamMulaiMinutes
        : (1440 - jamMulaiMinutes) + jamSelesaiMinutes; 

    const totalHours = totalMinutes / 60;
    totalJamLemburInput.value = totalHours.toFixed(2);

    console.log(`✅ Total Jam Lembur: ${totalHours}`);
    calculateTotalJamBayar();
};

// ✅ Calculate Total Jam Bayar Based on Rules
export const calculateTotalJamBayar = () => {
    const totalJamLembur = parseFloat(document.getElementById("TOTAL_JAM_LEMBUR").value);
    const statusHariMulai = document.getElementById("STATUS_HARI_MULAI").value;
    const totalJamBayarInput = document.getElementById("TOTAL_JAM_BAYAR");

    if (isNaN(totalJamLembur) || totalJamLembur <= 0) {
        totalJamBayarInput.value = "";
        return;
    }

    let totalBayar = 0;
    
    if (statusHariMulai === "HK") {
        // ✅ First hour ×1.5, remaining hours ×2.0
        totalBayar += Math.min(1, totalJamLembur) * 1.5;
        if (totalJamLembur > 1) {
            totalBayar += (totalJamLembur - 1) * 2.0;
        }
    } else {
        // ✅ Weekend/Public Holiday Rule
        totalBayar += Math.min(8, totalJamLembur) * 2.0;
        if (totalJamLembur > 8) {
            totalBayar += Math.min(1, totalJamLembur - 8) * 3.0;
        }
        if (totalJamLembur > 9) {
            totalBayar += (totalJamLembur - 9) * 4.0;
        }
    }

    totalJamBayarInput.value = totalBayar.toFixed(2);

    console.log(`✅ Total Jam Bayar: ${totalBayar}`);
    calculateTotalBiaya();
};

// ✅ Calculate Total Biaya
export const calculateTotalBiaya = () => {
    const totalJamBayar = parseFloat(document.getElementById("TOTAL_JAM_BAYAR").value);
    const totalBiayaInput = document.getElementById("TOTAL_BIAYA");

    if (isNaN(totalJamBayar) || totalJamBayar <= 0) {
        totalBiayaInput.value = "";
        return;
    }

    const totalBiaya = totalJamBayar * UPAH_PER_JAM;
    totalBiayaInput.value = totalBiaya.toFixed(2); // ✅ Default format, keeping decimals

    console.log(`✅ Total Biaya: ${totalBiaya.toFixed(2)}`);
};


// ✅ Auto-fill Upah Per Jam
export const autoFillUpahPerJam = () => {
    document.getElementById("UPAH_PER_JAM").value = UPAH_PER_JAM.toFixed(2); // ✅ Default format with decimals
};




