export function renderTable(moduleName, endpoint, rawData, rawHeaders) {
    console.log(`📊 Rendering Table for Module: ${moduleName}, Endpoint: ${endpoint}`);

    const tableBody = document.querySelector("#laporan tbody");
    const tableHead = document.querySelector("#laporan thead tr");

    if (!tableBody || !tableHead) {
        console.error("⚠️ Table elements not found in DOM.");
        return;
    }

    // ✅ Specify Only the Desired Headers (Matching API Headers Exactly)
    const tableConfig = {
        lembur: {
            "report/rekap-pln": [
                "HARI_MULAI", "TANGGAL_MULAI", "NAMA_DRIVER", "UNIT_KERJA", "URAIAN_PEKERJAAN",
                "JAM_MULAI", "JAM_SELESAI", "TOTAL_JAM_LEMBUR", "TOTAL_JAM_BAYAR",
                "UPAH_PER_JAM", "TOTAL_BIAYA", "STATUS_HARI_MULAI"
            ]
        },
        sppd: {
            "report/rekap-pln": [
                "NAMA_DRIVER", "TANGGAL_MULAI", "TANGGAL_SELESAI","JABATAN_PEMBERI_TUGAS","KOTA_TUJUAN","TOTAL_BIAYA_SPPD","DURASI_TRIP"
            ]
        },
        
        
    };

    const expectedHeaders = tableConfig[moduleName]?.[endpoint];

    if (!expectedHeaders) {
        console.error(`🚨 No column mapping found for ${moduleName}/${endpoint}`);
        return;
    }

    console.log("📝 Expected Table Headers:", expectedHeaders);

    // ✅ Clear previous table content
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

// ✅ Render Table Headers (Force Break Words & Conditional Column)
tableHead.innerHTML = `
    <tr class="bg-primary text-white text-center">
        <th class="px-4 py-2 border border-gray-800 text-xs break-all">No</th>
        ${expectedHeaders.map((header, index) => `
            <th class="px-4 py-2 border border-gray-800 text-xs break-all overflow-hidden w-auto"
                style="word-break: break-word; overflow-wrap: break-word;">
                ${header.replace(/_/g, ' ').toUpperCase()}
            </th>
            ${moduleName === "sppd" && index === 1 ? `
                <th class="px-4 py-2 border border-gray-800 text-xs break-all overflow-hidden w-auto"
                    style="word-break: break-word; overflow-wrap: break-word;">
                    S/D
                </th>` : ""}
        `).join("")}
    </tr>
`;





    // ✅ Render Table Rows (Matching Only Desired Headers)
    rawData.forEach((row, index) => {
        const tableRow = document.createElement("tr");
        tableRow.classList.add("hover:bg-gray-100");

        tableRow.innerHTML = `
        <td class="text-center border border-gray-800">${index + 1}</td>
        ${expectedHeaders.map((header, idx) => `
            <td class="px-4 py-2 border border-gray-800 whitespace-normal border">
                ${row[rawHeaders.indexOf(header)] || "-"}
            </td>
            ${moduleName === "sppd" && idx === 1 ? `
                <td class="px-4 py-2 border border-gray-800 whitespace-normal border">S/D</td>
            ` : ""}
        `).join("")}
    `;
    

        tableBody.appendChild(tableRow);
    });

    console.log("✅ Table Rendered Successfully!");
}

export function renderSummary(summary) {
    console.log("📊 Rendering Summary...", summary);

    if (!summary) {
        console.warn("⚠️ No summary data available!");
        return;
    }

    // ✅ Map API summary keys to their corresponding <td> IDs
    const summaryMapping = {
        "TOTAL_BIAYA_SPPD": "total-amount",
        "ADMIN_FEE": "total-biaya-admin",
        "TOTAL_TAGIHAN_WITH_ADMIN": "total-tagihan-without-tax",
        "TOTAL_TAGIHAN_WITH_TAX": "total-final-invoice",
        "TAX": "total-ppn",
        "LATEST_BULAN_TRANSAKSI": "transaction-month",
        "LATEST_BULAN_MASUK_TAGIHAN": "bulan-masuk-tagihan"
    };

    // ✅ Loop through the mapping
    Object.entries(summaryMapping).forEach(([apiKey, tdId]) => {
        // 🔍 Get all elements with the same ID (using querySelectorAll)
        const elements = document.querySelectorAll(`#${tdId}`);

        // ✅ If elements exist, update all of them
        if (elements.length > 0) {
            elements.forEach(el => {
                el.textContent = summary[apiKey] || "-"; // ✅ FIXED: Use `summary` instead of `summaryData`
            });
        }
    });

        // ✅ Convert TOTAL_TAGIHAN_WITH_TAX to Terbilang (if available)
        const totalTagihan = summary["TOTAL_TAGIHAN_WITH_TAX"]?.replace(/\./g, "").replace(",", ".");
        if (totalTagihan && !isNaN(totalTagihan)) {
            const terbilangText = angkaTerbilang(parseInt(totalTagihan));
            document.getElementById("terbilang").textContent = `Terbilang: ${terbilangText} rupiah`;
        } else {
            console.warn("⚠️ TOTAL_TAGIHAN_WITH_TAX is missing or invalid.");
        }

        

    console.log("✅ Summary Rendered Successfully!");
}



