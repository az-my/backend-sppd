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
                "KOTA_TUJUAN",
                "JABATAN_PEMBERI_TUGAS",
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

    // ✅ Render Table Headers with Conditional "S/D" Header for SPPD
    tableHead.innerHTML = `
    <tr class="bg-primary text-white text-center">
        <th class="px-2 py-1 border border-gray-800 text-xs break-all">No</th>
        ${expectedHeaders.map((header, index) => `
            ${moduleName === "sppd" && endpoint === "report/rekap-pln" && index === 2 ? `
                <th class="px-4 py-2 border border-gray-800 text-xs break-all overflow-hidden w-auto"
                    style="word-break: break-word; overflow-wrap: break-word;">
                    
                </th>
            ` : ""}
            <th class="px-4 py-2 border border-gray-800 text-xs break-all overflow-hidden w-auto"
                style="word-break: break-word; overflow-wrap: break-word;">
                ${header.replace(/_/g, ' ').toUpperCase()}
            </th>
        `).join("")}
    </tr>
`;



    console.log("🔍 Checking Object Keys vs. Headers...");
    if (tableData.length > 0) {
        console.log("📝 Object Keys:", Object.keys(tableData[0]));
        console.log("📌 Expected Headers:", expectedHeaders);
    }

    // // ✅ Render Table Rows (Matching Only Desired Headers)
    // tableData.forEach((row, index) => {
    //     console.log("🔍 Row Data:", row);  // Debugging each row
    //     const tableRow = document.createElement("tr");
    //     tableRow.classList.add("hover:bg-gray-100");

    //     tableRow.innerHTML = `
    //         <td class="text-center border border-gray-800">${index + 1}</td>
    //         ${expectedHeaders.map(header => `
    //             <td class="px-4 py-2 border border-gray-800 whitespace-normal border">
    //                 ${row[header] || "-"} 
    //             </td>
    //         `).join("")}
    //     `;

    //     tableBody.appendChild(tableRow);
    // });
    // ✅ Render Table Rows (Matching Only Desired Headers)
    tableData.forEach((row, index) => {
        console.log("🔍 Row Data:", row);  // Debugging each row
        const tableRow = document.createElement("tr");
        tableRow.classList.add("hover:bg-gray-100");

        tableRow.innerHTML = `
        <td class="text-center border border-gray-800">${index + 1}</td>
        ${expectedHeaders.map((header, idx) => {
            let cellValue = row[header] || "-";
            let extraClass = "text-center"; // ✅ Default text alignment is left
            const cleanHeader = header.trim(); // ✅ Trim header to avoid hidden spaces
    
            console.log(`🛠 Current idx is ${idx}, Header: ${header}`); // ✅ Debugging Log
    
            // ✅ Special Formatting for SPPD (rekap-pln) - Date Formatting
            if (moduleName === "sppd" && endpoint === "report/rekap-pln") {
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
            }
    
                // ✅ Apply Thousand Separator for TOTAL_BIAYA_BAYAR Variants
            if (["TOTAL_BIAYA_BAYAR", "TOTAL BIAYA BAYAR"].includes(cleanHeader)) {
                if (!isNaN(cellValue) && cellValue !== "-") {
                    cellValue = parseInt(cellValue, 10).toLocaleString("id-ID"); // Format as thousands separator
                }
                extraClass = "text-right"; // ✅ Apply text-right class ONLY for this column
            }

            let cellHtml = `
                <td class="px-2 py-1 border border-gray-800 whitespace-normal ${extraClass}">
                    ${cellValue}
                </td>
            `;
    
            // ✅ Insert "s/d" AFTER the second column (idx === 2) ONLY for module "sppd" and endpoint "rekap-pln"
            if (moduleName === "sppd" && endpoint === "report/rekap-pln" && idx === 1) {
                console.log(`🛠 Appending additional "s/d" column after idx 2`);
                cellHtml += `
                    <td class="px-2 py-1 border text-center border-gray-800 whitespace-normal">s/d</td>
                `;
            }
    
            return cellHtml;
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

                // ✅ Apply thousand separator for formatted fields, otherwise render as-is
                if (formattedFields.includes(apiKey) && !isNaN(value) && value !== "-") {
                    value = new Intl.NumberFormat("id-ID").format(Number(value)); // Add thousand separator
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



