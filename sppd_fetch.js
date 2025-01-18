// ✅ Smart Backend URL Detection
const BASE_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:3000/api/sppd"
  : "https://backend-sppd-production.up.railway.app/api/sppd";

/**
 * ✅ Fetch & Render SPPD Data into Table
 */
const loadSppdData = async () => {
    console.log("🚀 Fetching SPPD Data...");

    try {
        const response = await fetch(`${BASE_URL}/read`);
        if (!response.ok) {
            throw new Error(`❌ Failed to fetch SPPD data. Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("✅ SPPD Data Fetched Successfully:", data); // Log fetched data
        renderSppdTable(data); // ✅ Call render function
    } catch (error) {
        console.error("❌ Error fetching SPPD data:", error);
    }
};

const rowsPerPage = 10; // ✅ Set number of rows per page
let currentPage = 1;
let sortedData = []; // Will hold the sorted data globally



const renderSppdTable = (data) => {
    const tableBody = document.getElementById("sppdTableBody");
    const tableHead = document.getElementById("sppdTableHead");
    const paginationDiv = document.getElementById("paginationControls");

    if (!tableBody || !tableHead || !paginationDiv) {
        console.error("❌ Table elements not found!");
        return;
    }

    tableBody.innerHTML = "";
    tableHead.innerHTML = "";
    paginationDiv.innerHTML = "";

    if (data.length <= 1) {
        console.log("⚠️ No SPPD Data Available.");
        tableBody.innerHTML = `<tr><td colspan="100" class="text-center text-gray-500 py-2">No data available.</td></tr>`;
        return;
    }

    console.log("✅ Sorting & Rendering SPPD Data...");

    // Extract column headers from the first row
    const headers = data[0];

    // ✅ Sort Data by "TANGGAL_INPUT" (Latest First)
    sortedData = data.slice(1).sort((a, b) => {
        const dateA = new Date(a[headers.indexOf("TANGGAL_INPUT")]); 
        const dateB = new Date(b[headers.indexOf("TANGGAL_INPUT")]); 
        return dateB - dateA; // Latest first
    });

    // ✅ Render Table Headers
    const headerRow = document.createElement("tr");
    headerRow.classList.add("bg-gray-200", "text-gray-700", "border");
    headerRow.innerHTML = `<th class="px-2 py-1 border">#</th>` + 
        headers.map(col => `<th class="px-2 py-1 border">${col}</th>`).join("");
    
    tableHead.appendChild(headerRow);

    // ✅ Render Pagination
    renderPaginatedTable(headers);
    renderPaginationControls();
};


// ✅ Extend Day.js with Plugins
dayjs.extend(window.dayjs_plugin_localizedFormat); // Enable localized format
dayjs.locale('id'); // ✅ Set to Indonesian locale

const formatDate = (dateStr, withTime = false) => {
    if (!dateStr) return "-"; // Handle empty dates
    const parsedDate = dayjs(dateStr, ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD"], true);
    
    if (!parsedDate.isValid()) return dateStr; // Return original if invalid

    return withTime 
        ? parsedDate.format("DD MMM YYYY HH:mm")  // Full timestamp
        : parsedDate.format("DD MMM YYYY");                // Date only
};


const renderPaginatedTable = (headers) => {
    const tableBody = document.getElementById("sppdTableBody");
    tableBody.innerHTML = "";

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    paginatedData.forEach((row, index) => {
        const rowData = Object.fromEntries(headers.map((key, i) => [key, row[i]]));

        const tr = document.createElement("tr");
        tr.classList.add("border-b", "text-sm", "text-gray-700");

        tr.innerHTML = `<td class="px-2 py-1 border">${startIndex + index + 1}</td>` + 
        headers.map(key => {
            let value = rowData[key] || "-";
        
            // ✅ Apply Date Formatting Based on Column Name
            if (key === "TANGGAL_INPUT") {
                value = formatDate(value, true); // Include time
            } else if (key === "TANGGAL_MULAI" || key === "TANGGAL_SELESAI") {
                value = formatDate(value, false); // Date only
            }
        
            return `<td class="px-2 py-1 border">${value}</td>`;
        }).join("");

        tableBody.appendChild(tr);
    });

    console.log(`✅ Table Rendered (Page ${currentPage})`);
};

// ✅ Render Pagination Controls
const renderPaginationControls = () => {
    const paginationDiv = document.getElementById("paginationControls");
    paginationDiv.innerHTML = "";

    const totalPages = Math.ceil(sortedData.length / rowsPerPage);

    const prevButton = document.createElement("button");
    prevButton.innerText = "Previous";
    prevButton.classList.add("px-3", "py-1", "mr-2", "bg-gray-300", "rounded");
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderPaginatedTable(sortedData[0]); // Pass headers for proper rendering
            renderPaginationControls();
        }
    };

    const nextButton = document.createElement("button");
    nextButton.innerText = "Next";
    nextButton.classList.add("px-3", "py-1", "ml-2", "bg-gray-300", "rounded");
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPaginatedTable(sortedData[0]);
            renderPaginationControls();
        }
    };

    const pageInfo = document.createElement("span");
    pageInfo.innerText = ` Page ${currentPage} of ${totalPages} `;
    pageInfo.classList.add("text-sm", "font-semibold");

    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextButton);
};




// ✅ Export function for global use
export { loadSppdData };
