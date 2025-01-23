export function renderTable(moduleName, endpoint, rawData) {
    console.log(`📊 Rendering Table for Module: ${moduleName}, Endpoint: ${endpoint}`);

    const tableBody = document.querySelector("#laporan tbody");
    const tableHead = document.querySelector("#laporan thead");

    if (!tableBody || !tableHead) {
        console.error("⚠️ Table elements not found in DOM. Ensure the table exists with the correct ID.");
        return;
    }

    // ✅ Log API response before processing
    console.log("📦 API Raw Response:", rawData);

    // ✅ Define expected headers based on module & endpoint
    const tableConfig = {
        lembur: {
            "report/rekap-pln": [
                "HARI_MULAI",
                "TANGGAL_MULAI",
                "NAMA_DRIVER",
                "UNIT_KERJA",
                "URAIAN_PEKERJAAN",
                "JAM_MULAI",
                "JAM_SELESAI",
                "TOTAL_JAM_LEMBUR",
                "TOTAL_JAM_BAYAR",
                "UPAH_PER_JAM",
                "TOTAL_BIAYA_BAYAR",
                "STATUS_HARI_MULAI"
            ],
            "report/rekap-kantor": [
                "NAMA_DRIVER",
                "JUMLAH_TRANSAKSI",
                "TOTAL_BIAYA_BAYAR",
            ]
        },
        sppd: {
            "report/rekap-pln": [
                "NAMA_DRIVER",
                "TANGGAL_MULAI",
                "TANGGAL_SELESAI",
                "JABATAN_PEMBERI_TUGAS",
                "KOTA_TUJUAN",
                
                "TOTAL_BIAYA_BAYAR",
                "DURASI_TRIP"
            ],
            "report/rekap-kantor": [
                "NAMA_DRIVER",
                "JUMLAH_TRANSAKSI",
                "TOTAL_BIAYA_BAYAR"
            ]
        }
    };


    // ✅ Get expected headers
    let expectedHeaders = tableConfig[moduleName]?.[endpoint] || [];

    // ✅ Select correct dataset
    let tableData = [];
    if (endpoint === "report/rekap-kantor") {
        tableData = rawData.aggregated_by_driver || [];
        console.log("✅ Using `aggregated_by_driver` for `rekap-kantor`.");
    } else if (endpoint === "report/rekap-pln") {
        tableData = rawData.detailed_records || [];
        console.log("✅ Using `detailed_records` for `rekap-pln`.");
    } else {
        console.error("❌ No matching endpoint logic found for:", endpoint);
    }

    // 🔹 Debugging Logs
    console.log("📦 Extracted Table Data:", tableData);
    console.log("📝 Expected Table Headers:", expectedHeaders);

    // 🔹 Handle case where `tableData` is empty
    if (!Array.isArray(tableData) || tableData.length === 0) {
        console.error("❌ No data received! `tableData` is empty.");
        console.warn("🔍 Possible Reasons:");
        console.warn("- Backend did not return `aggregated_by_driver` or `detailed_records`.");
        console.warn("- API structure might have changed.");
        console.warn("- Table config might be incorrect.");
        console.log("📦 API Raw Data:", rawData);
        return;
    }

    // ✅ Clear previous table content
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

// ✅ Define Header Mapping for Each Module
const headerMappings = {
    "sppd": {
        "report/rekap-pln": {
            "NAMA_DRIVER": "NAMA",
            "JABATAN_PEMBERI_TUGAS": "PEJABAT PEMBERI TUGAS",
            "KOTA_TUJUAN": "TUJUAN",
            "TOTAL_BIAYA_BAYAR": "JUMLAH",
            "DURASI_TRIP": "KET."
        },
        "report/rekap-kantor": {
            "NAMA_DRIVER": "NAMA DRIVER",
            
            "JUMLAH_TRANSAKSI": "JUMLAH SPPD",
            "TOTAL_BIAYA_BAYAR": "JUMLAH BIAYA SPPD",
            "DURASI_TRIP": "KET."
        }

    },
    "lembur": {
        "report/rekap-pln": {
            "HARI_MULAI": "HARI",
            "TANGGAL_MULAI": "TANGGAL",
            "NAMA_DRIVER": "NAMA OUTSOURCING",
            "UNIT_KERJA": "UNIT",
            "URAIAN_PEKERJAAN": "RINCIAN PEKERJAAN",
            "TOTAL_JAM_BAYAR": "TOTAL JAM YANG DIBAYARKAN",
            "UPAH_PER_JAM": "UPAH LEMBUR SEJAM",
            "TOTAL_BIAYA_BAYAR": "BIAYA YANG DIBAYARKAN",
            "STATUS_HARI_MULAI":"KET."
        },
        "report/rekap-kantor": {

            "NAMA_DRIVER": "NAMA DRIVER",
            "TOTAL_BIAYA_BAYAR": "JUMLAH BIAYA LEMBUR",
            "JUMLAH_TRANSAKSI":"JUMLAH LEMBUR"
        }
    }
};

// ✅ Get Current Header Mapping Based on Active Module & Endpoint
const activeHeaderMapping = headerMappings[moduleName]?.[endpoint] || {};

// ✅ Check if "Tanggal SPPD" should be grouped (only for "rekap-pln" in SPPD)
const hasTanggalSPPD = moduleName === "sppd" && endpoint === "report/rekap-pln";
const filteredHeaders = expectedHeaders.filter(header => !["TANGGAL_MULAI", "TANGGAL_SELESAI"].includes(header.trim()));

// ✅ Render Table Headers Dynamically with Renamed Headers
tableHead.innerHTML = `
    <tr class="bg-yellow-50 text-black text-center">
        <th class="px-2 py-1 border border-gray-800 text-xs break-all" rowspan="${hasTanggalSPPD ? 2 : 1}">No</th>
        ${expectedHeaders.map(header => {
            const cleanHeader = header.trim();
            const displayHeader = activeHeaderMapping[cleanHeader] || cleanHeader.replace(/_/g, ' ').toUpperCase();

            // ✅ Group "Tanggal SPPD" only for "rekap-pln" in SPPD
            if (hasTanggalSPPD && cleanHeader === "TANGGAL_MULAI") {
                return `<th class="px-4 py-2 border border-gray-800 text-xs break-all" colspan="3">Tanggal SPPD</th>`;
            }

            // ✅ Skip "TANGGAL_SELESAI" since it's inside "Tanggal SPPD"
            if (hasTanggalSPPD && cleanHeader === "TANGGAL_SELESAI") {
                return "";
            }

            return `<th class="px-4 py-2 border border-gray-800 text-xs break-all" rowspan="${hasTanggalSPPD ? 2 : 1}">
                ${displayHeader}
            </th>`;
        }).join("")}
    </tr>

    ${hasTanggalSPPD ? `
    <tr class="bg-yellow-50 text-black text-center">
        <th class="px-4 py-2 border border-gray-800 text-xs break-all">Mulai</th>
        <th class="px-4 py-2 border border-gray-800 text-xs break-all">s/d</th>
        <th class="px-4 py-2 border border-gray-800 text-xs break-all">Sampai</th>
    </tr>
    ` : ""}
`;



    console.log("🔍 Checking Object Keys vs. Headers...");
    if (tableData.length > 0) {
        console.log("📝 Object Keys:", Object.keys(tableData[0]));
        console.log("📌 Expected Headers:", expectedHeaders);
    }





// ✅ Render Table Rows (Matching Only Desired Headers)
// ✅ Render Table Rows Dynamically
tableData.forEach((row, index) => {
    console.log("🔍 Row Data:", row); // Debugging each row
    const tableRow = document.createElement("tr");
    tableRow.classList.add("hover:bg-gray-100");

    tableRow.innerHTML = `
        <td class="text-center border border-gray-800">${index + 1}</td>
        ${expectedHeaders.map((header, idx) => {
            let cellValue = row[header] || "-";
            let extraClass = "text-center"; // ✅ Default text alignment is centered
            const cleanHeader = header.trim();

            console.log(`🛠 Current idx is ${idx}, Header: ${header}`); // ✅ Debugging Log

            // ✅ Special Formatting for SPPD (rekap-pln) - Date Formatting
            if (["TANGGAL_MULAI", "TANGGAL_SELESAI"].includes(cleanHeader)) {
                if (typeof cellValue === "string") {
                    cellValue = cellValue.trim();
                }

                const date = new Date(cellValue);
                if (!isNaN(date.getTime())) {
                    cellValue = date.toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                    });
                }
            }
                        // ✅ Apply Thousand Separator for TOTAL_BIAYA_BAYAR
                        if (["UPAH_PER_JAM"].includes(cleanHeader)) {
                            if (!isNaN(cellValue) && cellValue !== "-") {
                                cellValue = parseFloat(cellValue).toLocaleString("id-ID", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                            extraClass = "text-center"; // ✅ Apply right alignment ONLY for this column
                        }
            // ✅ Apply Thousand Separator for TOTAL_BIAYA_BAYAR
            if (["TOTAL_BIAYA_BAYAR", "TOTAL BIAYA BAYAR"].includes(cleanHeader)) {
                if (!isNaN(cellValue) && cellValue !== "-") {
                    cellValue = parseInt(cellValue, 10).toLocaleString("id-ID");
                }
                extraClass = "text-right"; // ✅ Apply right alignment ONLY for this column
            }

            // ✅ Render "Tanggal SPPD" as grouped columns (rekap-pln only)
            if (hasTanggalSPPD && cleanHeader === "TANGGAL_MULAI") {
                return `
                    <td class="px-2 py-1 border border-gray-800 text-center">${cellValue}</td>
                    <td class="px-2 py-1 border border-gray-800 text-center font-bold">s/d</td>
                `;
            }

            // ✅ Skip "TANGGAL_SELESAI" since it's inside "Tanggal SPPD"
            if (hasTanggalSPPD && cleanHeader === "TANGGAL_SELESAI") {
                return `<td class="px-2 py-1 border border-gray-800 text-center">${cellValue}</td>`;
            }

            // ✅ Conditional Logic: Add "hari" suffix for DURASI_TRIP / KET. in SPPD (rekap-pln)
            if (moduleName === "sppd" && endpoint === "report/rekap-pln" && ["DURASI_TRIP", "KET."].includes(cleanHeader)) {
                cellValue = `${cellValue} hari`;
            }

            // ✅ Conditional Logic: Handle STATUS_HARI_MULAI / KET. in LEMBUR (rekap-pln)
            if (moduleName === "lembur" && endpoint === "report/rekap-pln" && ["STATUS_HARI_MULAI", "KET."].includes(cleanHeader)) {
                if (cellValue === "HK") {
                    cellValue = ""; // ✅ If "HK", return empty
                } else if (cellValue === "HL") {
                    cellValue = "HL"; // ✅ If "HL", render as is
                }
            }

            return `<td class="px-2 py-1 border border-gray-800 ${extraClass}">${cellValue}</td>`;
        }).join("")}
    `;

    tableBody.appendChild(tableRow);
});

console.log("✅ Table Rendered Successfully!");
}



export function renderSummary(summary, endpoint, moduleName) {

    if (!summary) {
        console.warn("⚠️ No summary data available!");
        return;
    }

  // ✅ Get today's date in Indonesian format (e.g., "25 Januari 2024")
const todayDate = moment().locale("id").format("DD");

// ✅ Map API summary keys to their corresponding <td> IDs
const summaryMapping = {
    "TOTAL_BIAYA_BAYAR": "total-amount",
    "ADMIN_FEE": "total-biaya-admin",
    "TOTAL_TAGIHAN_WITH_ADMIN": "total-tagihan-without-tax",
    "TOTAL_TAGIHAN_WITH_TAX": "total-final-invoice",
    "TAX": "total-ppn",
    "BULAN_TRANSAKSI": "transaction-month",
    "BULAN_MASUK_TAGIHAN": "bulan-masuk-tagihan"
};

// ✅ Fields that should have thousand separators
const formattedFields = [
    "TOTAL_BIAYA_BAYAR",
    "ADMIN_FEE",
    "TOTAL_TAGIHAN_WITH_ADMIN",
    "TOTAL_TAGIHAN_WITH_TAX",
    "TAX"
];

// ✅ Loop through the mapping & update elements
Object.entries(summaryMapping).forEach(([apiKey, tdId]) => {
    const elements = document.querySelectorAll(`#${tdId}`);

    if (elements.length > 0) {
        elements.forEach(el => {
            let value = summary[apiKey] ?? "-"; // Use raw value if available

            // ✅ Apply thousand separator for formatted fields
            if (formattedFields.includes(apiKey) && !isNaN(value) && value !== "-") {
                value = new Intl.NumberFormat("id-ID").format(Number(value));
            }

            // ✅ Add today's date prefix for "bulan-masuk-tagihan"
            if (apiKey === "BULAN_MASUK_TAGIHAN" && value !== "-") {
                value = `${todayDate} ${value}`; // Prefix today's day to the value
            }

            el.textContent = value; // Render the value
        });
    }
});


    // ✅ Convert TOTAL_TAGIHAN_WITH_TAX to Terbilang (if available)
    // ✅ Log the endpoint being processed
    // console.log(`🔍 Current Endpoint: ${endpoint}`);
    let totalTagihan;
    if (endpoint === "report/rekap-kantor") {
        totalTagihan = summary["TOTAL_BIAYA_BAYAR"];
    } else {
        totalTagihan = summary["TOTAL_TAGIHAN_WITH_TAX"];
    }

    if (totalTagihan && !isNaN(totalTagihan)) {
        const terbilangText = angkaTerbilang(parseInt(totalTagihan)); // ✅ Use raw integer value
        document.getElementById("terbilang").textContent = `Terbilang: ${terbilangText} rupiah`;
    } else {
        console.warn("⚠️ TOTAL_TAGIHAN is missing or invalid.");
    }

    console.log("✅ Summary Rendered Successfully!");
}



