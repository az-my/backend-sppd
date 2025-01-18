// ✅ Driver Dataset (Sorted Alphabetically)
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
    { nama: "SYAHRIL", status: "DRIVER SEWA" },
    { nama: "UWIS KARNI", status: "DRIVER SEWA" },
    { nama: "VANI AL WAHABY", status: "DRIVER TETAP" },
    { nama: "YANI MULIA", status: "DRIVER TETAP" }
].sort((a, b) => a.nama.localeCompare(b.nama)); // ✅ Sort Alphabetically

// ✅ Function to Populate Driver Dropdown
function populateDriverDropdown() {
    const driverSelect = document.getElementById("NAMA_DRIVER");
    driverSelect.innerHTML = '<option value="">Pilih Driver</option>'; // Default Option

    drivers.forEach(driver => {
        const option = document.createElement("option");
        option.value = driver.nama;
        option.textContent = driver.nama;
        driverSelect.appendChild(option);
    });
}

// ✅ Function to Auto-Fill Status Driver
function updateStatusDriver() {
    const driverSelect = document.getElementById("NAMA_DRIVER");
    const statusDriverInput = document.getElementById("STATUS_DRIVER");

    driverSelect.addEventListener("change", function () {
        const selectedDriver = drivers.find(driver => driver.nama === this.value);
        statusDriverInput.value = selectedDriver ? selectedDriver.status : "";
    });
}




// ✅ Function to Format Date as YYYY-MM-DD (Fix Timezone Issues)
function formatDateForInput(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ✅ Function to Get Last Month's Min & Max Dates
function getLastMonthRange() {
    const today = new Date();
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0); // ✅ Ensures the last day is correct

    return {
        minDate: formatDateForInput(firstDayLastMonth),
        maxDate: formatDateForInput(lastDayLastMonth)
    };
}

// ✅ Restrict TANGGAL_MULAI to Last Month
function restrictTanggalMulai() {
    const tanggalMulaiInput = document.getElementById("TANGGAL_MULAI");
    if (!tanggalMulaiInput) return;

    const { minDate, maxDate } = getLastMonthRange();
    tanggalMulaiInput.setAttribute("min", minDate);
    tanggalMulaiInput.setAttribute("max", maxDate);
}

// ✅ Restrict TANGGAL_SELESAI Based on TANGGAL_MULAI (Matching Max Date)
function restrictTanggalSelesai() {
    const tanggalMulaiInput = document.getElementById("TANGGAL_MULAI");
    const tanggalSelesaiInput = document.getElementById("TANGGAL_SELESAI");
    if (!tanggalMulaiInput || !tanggalSelesaiInput) return;

    tanggalMulaiInput.addEventListener("change", function () {
        const selectedDate = new Date(this.value);
        const { maxDate } = getLastMonthRange(); // ✅ Ensures correct last day
        if (!isNaN(selectedDate)) {
            tanggalSelesaiInput.setAttribute("min", formatDateForInput(selectedDate));
            tanggalSelesaiInput.setAttribute("max", maxDate);
        }
    });
}

// ✅ Function to Calculate DURASI_TRIP
function calculateDurasiTrip() {
    const tanggalMulaiInput = document.getElementById("TANGGAL_MULAI");
    const tanggalSelesaiInput = document.getElementById("TANGGAL_SELESAI");
    const durasiTripInput = document.getElementById("DURASI_TRIP");

    if (!tanggalMulaiInput || !tanggalSelesaiInput || !durasiTripInput) return;

    function updateDurasi() {
        const tanggalMulai = new Date(tanggalMulaiInput.value);
        const tanggalSelesai = new Date(tanggalSelesaiInput.value);

        if (!isNaN(tanggalMulai) && !isNaN(tanggalSelesai) && tanggalSelesai >= tanggalMulai) {
            const durasi = Math.ceil((tanggalSelesai - tanggalMulai) / (1000 * 60 * 60 * 24)) + 1; // ✅ Includes Start Day
            durasiTripInput.value = durasi;
        } else {
            durasiTripInput.value = "";
        }
    }

    tanggalMulaiInput.addEventListener("change", updateDurasi);
    tanggalSelesaiInput.addEventListener("change", updateDurasi);
}

// ✅ Function to Handle Hotel Switcher & Update DURASI_INAP
// ✅ Function to Handle Hotel Switcher & Auto-Update DURASI_INAP
function handleHotelSwitcher() {
    const hotelSwitch = document.getElementById("HOTEL");
    const hotelStatusField = document.getElementById("HOTEL_STATUS"); // ✅ Hidden field
    const durasiInapInput = document.getElementById("DURASI_INAP");
    const durasiTripInput = document.getElementById("DURASI_TRIP");

    if (!hotelSwitch || !hotelStatusField || !durasiInapInput || !durasiTripInput) return;

    // ✅ Default state = OFF (No)
    hotelSwitch.checked = false;
    hotelStatusField.value = "No";
    durasiInapInput.value = 0;

    function updateDurasiInap() {
        const durasiTrip = parseInt(durasiTripInput.value) || 0;
        if (hotelSwitch.checked) {
            hotelStatusField.value = "Yes"; // ✅ Update hidden field
            durasiInapInput.value = durasiTrip; // ✅ DURASI_INAP = DURASI_TRIP
        } else {
            hotelStatusField.value = "No"; // ✅ Update hidden field
            durasiInapInput.value = 0; // ✅ DURASI_INAP = 0
        }
    }

    // ✅ Listen for changes in hotel switcher & DURASI_TRIP updates
    hotelSwitch.addEventListener("change", updateDurasiInap);
    durasiTripInput.addEventListener("input", updateDurasiInap); // ✅ Updates DURASI_INAP dynamically
}



// ✅ Function to Auto-Fill Budget & Total Costs
function updateBudgetAndTotalCosts() {
    const durasiTripInput = document.getElementById("DURASI_TRIP");
    const durasiInapInput = document.getElementById("DURASI_INAP");
    const budgetHarianInput = document.getElementById("BUDGET_BIAYA_HARIAN");
    const budgetHotelInput = document.getElementById("BUDGET_HOTEL");
    const totalBiayaHarianInput = document.getElementById("TOTAL_BIAYA_HARIAN");
    const totalBiayaPenginapanInput = document.getElementById("TOTAL_BIAYA_PENGINAPAN");
    const totalBiayaSPPDInput = document.getElementById("TOTAL_BIAYA_SPPD");
    const hotelSwitch = document.getElementById("HOTEL"); // ✅ Hotel switch input

    if (!durasiTripInput || !durasiInapInput || !budgetHarianInput || !budgetHotelInput || 
        !totalBiayaHarianInput || !totalBiayaPenginapanInput || !totalBiayaSPPDInput || !hotelSwitch) return;

    // ✅ Set constant budget values
    const BUDGET_BIAYA_HARIAN = 150000;
    const BUDGET_HOTEL = 250000;

    budgetHarianInput.value = BUDGET_BIAYA_HARIAN;
    budgetHotelInput.value = BUDGET_HOTEL;

    function calculateTotals() {
        const durasiTrip = parseInt(durasiTripInput.value) || 0;
        const isHotelChecked = hotelSwitch.checked; // ✅ Check hotel state

        // ✅ If hotel is ON, DURASI_INAP = DURASI_TRIP, else DURASI_INAP = 0
        const durasiInap = isHotelChecked ? durasiTrip : 0;
        durasiInapInput.value = durasiInap;

        // ✅ Calculate totals
        const totalBiayaHarian = durasiTrip * BUDGET_BIAYA_HARIAN;
        const totalBiayaPenginapan = durasiInap * BUDGET_HOTEL;
        const totalBiayaSPPD = totalBiayaHarian + totalBiayaPenginapan;

        totalBiayaHarianInput.value = totalBiayaHarian;
        totalBiayaPenginapanInput.value = totalBiayaPenginapan;
        totalBiayaSPPDInput.value = totalBiayaSPPD;
    }

    // ✅ Listen for changes in DURASI_TRIP, HOTEL SWITCH, TANGGAL_MULAI, and TANGGAL_SELESAI
    durasiTripInput.addEventListener("input", calculateTotals);
    hotelSwitch.addEventListener("change", calculateTotals); // ✅ Recalculate when hotel state changes
    document.getElementById("TANGGAL_MULAI").addEventListener("change", calculateTotals);
    document.getElementById("TANGGAL_SELESAI").addEventListener("change", calculateTotals);
}



// ✅ Initialize Date Restrictions on Page Load
document.addEventListener("DOMContentLoaded", () => {
    populateDriverDropdown(),
    updateStatusDriver();
    restrictTanggalMulai(); // ✅ Restrict TANGGAL_MULAI to last month
    restrictTanggalSelesai(); // ✅ Ensure correct min/max for TANGGAL_SELESAI
    calculateDurasiTrip(); // 
    handleHotelSwitcher(); 
    updateBudgetAndTotalCosts();//✅ Calculate DURASI_TRIP based on selected dates
});
