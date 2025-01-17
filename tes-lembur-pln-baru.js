// 📁 tes-lembur-pln-baru.js

// 🌐 API Endpoint
const API_URL = "https://backend-sppd-production.up.railway.app/api/lembur/report/rekap-pln";

// 🌍 Global variable to store fetched data
let globalData = [];

/**
 * ✅ Format Number with Indonesian Thousand Separator (Proper Parsing)
 * @param {string|number} num - Raw number string from API response
 * @returns {string} - Formatted number with correct thousands separator
 */
const formatRupiah = (num) => {
    if (!num) return "0"; // Handle empty or undefined values

    // Convert to string for safe manipulation
    let numStr = String(num);

    // 🟢 Step 1: Remove decimal part (e.g., `354.496,00` → `354.496`)
    numStr = numStr.split(",")[0];

    // 🟢 Step 2: Ensure correct thousand separator remains (`.`)
    return numStr.replace(/,/g, "").trim(); // Ensure clean output
};





/**
 * ✅ Fetch Data from API and Store in Global Variable
 */
const fetchData = async () => {
    try {
        console.log("🟢 Fetching rekap-pln report...");
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`🚨 API Error: ${response.status} ${response.statusText}`);

        const data = await response.json();

        // 🟢 Log the FULL API response, including headers and summary
        console.log("✅ Full API Response:", data);

        globalData = data; // Store the full response without slicing

    } catch (error) {
        console.error("💀 Fetch failed:", error.message);
        globalData = {}; // Reset global data in case of failure
    }
};


/**
 * ✅ Render Data into Table
 */
const renderTable = () => {
    const $tbody = $("#data-table-body"); // Ensure correct table body ID
    $tbody.empty();

    // ✅ Check if globalData.data exists and is an array
    if (!globalData.data || !Array.isArray(globalData.data) || globalData.data.length === 0) {
        $tbody.html(`
            <tr class="border border-gray-800">
                <td colspan="13" class="text-center text-red-500 py-4">⚠️ No data available</td>
            </tr>
        `);
        return;
    }

    
    // ✅ Extract transaction-month and bulan-masuk-tagihan once (from the first record)
    const firstRecord = globalData.data[0];
    if (firstRecord) {
        $("#transaction-month").text(firstRecord[24] || "-"); // ✅ Set transaction-month
        
        const todayDay = dayjs().format("DD"); // ✅ Get only the day (e.g., "15")
        $("#bulan-masuk-tagihan").text(`${todayDay} ${firstRecord[25] || "-"}`); // ✅ Set bulan-masuk-tagihan with day + month/year from firstRecord[25]
    }

    // ✅ Iterate over `globalData.data` instead of `globalData`
    globalData.data.forEach((row, index) => {
        const biayaDibayarkan = formatRupiah(row[18]); // Apply fixed formatting
        const ketValue = row[13] === "HL" ? "HL" : ""; // ✅ Use column 13, show "HL" if HL, otherwise empty

        const htmlRow = `
            <tr class="border border-gray-800 text-xs">
                <td class="border border-gray-800 px-2 py-1 text-center">${index + 1}</td> <!-- No -->
                <td class="border border-gray-800 px-2 py-1 text-center">${row[8] || '-'}</td> <!-- Hari -->
                <td class="border border-gray-800 px-2 py-1 text-center">${row[7] || '-'}</td> <!-- Tanggal -->
                <td class="border border-gray-800 px-2 py-1 text-center">${row[2] || '-'}</td> <!-- Nama Outsourcing -->
                <td class="border border-gray-800 px-2 py-1 text-center">${row[4] || '-'}</td> <!-- Unit -->
                <td class="border border-gray-800 px-2 py-1 text-center">${row[6] || '-'}</td> <!-- Rincian Pekerjaan -->
                <td class="border border-gray-800 px-2 py-1 text-center">${row[10] || '-'}</td> <!-- Jam Mulai -->
                <td class="border border-gray-800 px-2 py-1 text-center">${row[14] || '-'}</td> <!-- Jam Selesai -->
                <td class="border border-gray-800 px-2 py-1 text-center">${row[15] || '0'} Jam</td> <!-- Total Jam Lembur -->
                <td class="border border-gray-800 px-2 py-1 text-center">${row[16] || '0'} Jam</td> <!-- Total Jam Dibayarkan -->
                <td class="border border-gray-800 px-2 py-1 text-center">${row[17] || '0'}</td> <!-- Upah Lembur -->
                <td class="border border-gray-800 px-2 py-1 text-right">${biayaDibayarkan}</td> <!-- Biaya Dibayarkan -->
                <td class="border border-gray-800 px-2 py-1 text-center">${ketValue}</td> <!-- Ket -->
            </tr>
        `;
        $tbody.append(htmlRow);
    });


$("#total-amount").text(formatRupiah(globalData.summary.TOTAL_BIAYA_SPPD || 0));
$("#total-biaya-admin").text(formatRupiah(globalData.summary.ADMIN_FEE || 0));
$("#total-invoice-without-tax").text(formatRupiah(globalData.summary.TOTAL_TAGIHAN_WITH_ADMIN || 0));
$("#total-tagihan-without-tax").text(formatRupiah(globalData.summary.TOTAL_TAGIHAN_WITH_ADMIN || 0)); // Render same value
$("#total-ppn").text(formatRupiah(globalData.summary.TAX || 0));
$("#total-final-invoice").text(formatRupiah(globalData.summary.TOTAL_TAGIHAN_WITH_TAX || 0));

// ✅ Normalize number: Remove Indonesian thousand separators (.) before converting to terbilang
const rawFinalInvoice = String(globalData.summary.TOTAL_TAGIHAN_WITH_TAX || "0").replace(/\./g, ""); // Remove all dots
const numericFinalInvoice = parseInt(rawFinalInvoice, 10); // Convert to integer

// ✅ Convert to terbilang and render
// ✅ Convert to terbilang and render with "Terbilang:" prefix
$("#terbilang").text(`Terbilang: ${angkaTerbilang(numericFinalInvoice)}`);
};

/**
 * ✅ Initialize: Fetch Data First, Then Render UI
 */
$(document).ready(async () => {
    await fetchData(); // Fetch data and store globally
    renderTable(); // Render table after data is fetched
});
