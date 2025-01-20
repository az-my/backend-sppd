export default async function fetchAndRenderTable(moduleName, tableSelector) {
    const table = document.querySelector(tableSelector);
    if (!table) {
        console.error(`❌ Error: Table with selector "${tableSelector}" not found.`);
        return;
    }

    const tableHead = table.querySelector("thead");
    const tableBody = table.querySelector("tbody");

    // ✅ Handle Dev & Production Environments (Including 127.0.0.1)
    const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const BASE_URL = isLocal 
        ? "http://localhost:3000/api/" 
        : "https://backend-sppd-production.up.railway.app/api/";

    const apiUrl = `${BASE_URL}${moduleName}/read`;

    try {
        // ✅ Fetch Data
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Failed to fetch ${moduleName} data`);

        const rawData = await response.json();
        console.log(`🚀 Raw Response for ${moduleName}:`, rawData);

        if (!Array.isArray(rawData) || rawData.length === 0) throw new Error(`No ${moduleName} data available`);

        // ✅ Extract Headers from First Row
        const headers = rawData[0]; // First row contains headers
        const data = rawData.slice(1); // The rest are data rows

        console.log("🚀 Extracted Headers:", headers);
        console.log("🚀 Transformed Data:", data);

        // ✅ Convert Array of Arrays to Array of Objects
        const formattedData = data.map(row => {
            let obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] ?? "-"; // Assign each value
            });
            return obj;
        });

        console.log("🚀 Final Transformed Data:", formattedData);

        tableHead.innerHTML = `
        <tr class="bg-primary text-white text-center">
            <th class="px-4 py-2 whitespace-normal break-words text-sm w-20">No</th>
            ${headers.map(header => `
                <th class="px-4 py-2 whitespace-normal break-words text-left text-sm w-auto">${header.replace(/_/g, ' ').toUpperCase()}</th>
            `).join("")}
        </tr>
    `;
    


        // ✅ Populate Table Rows
        tableBody.innerHTML = ""; 
        formattedData.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td class="text-center">${index + 1}</td>
            ${headers.map(header => `<td class="px-4 py-2 whitespace-normal">${item[header]}</td>`).join("")}
        `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error(`Error fetching ${moduleName} data:`, error);
        tableBody.innerHTML = `<tr><td colspan="100%" class="text-center text-error font-bold">❌ Gagal mengambil data ${moduleName}</td></tr>`;
    }
}
