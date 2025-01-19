const fetchSppdRekapPln = async () => {
    const url = 'https://backend-sppd-production.up.railway.app/api/sppd/report/rekap-pln';
    try {
        console.log('👀 Fetching SPPD rekap PLN data...');
        const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error(`🚨 Oof! API said: ${response.status} ${response.statusText}`);

        const result = await response.json();
        console.log('✨ Data secured:', result);

        if (result.data && Array.isArray(result.data)) {
            renderTable(result.data);
            renderTransactionDetails(result.data[0]); // Use first row for month details
        } else {
            console.error('🚨 API returned unexpected data structure', result);
        }

        if (result.summary) {
            renderSummary(result.summary);
        }

    } catch (error) {
        console.error('😵‍💫 API fumbled:', error.message);
    }
};

const renderTable = (data) => {
    const tbody = document.getElementById('data-table-body');
    tbody.innerHTML = '';

    const normalizeNumber = (value) => {
        if (!value) return 0;
        return parseFloat(value.replace(/\./g, '').replace(/,/g, '.'));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        moment.locale('id'); // Set locale to Indonesian
        return moment(dateString, 'DD/MM/YYYY').format('DD-MMM-YYYY');
    };

    data.forEach((row, index) => {
        const formattedAmount = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(normalizeNumber(row[17]));
        const tanggalMulai = formatDate(row[11]);
        const tanggalSelesai = formatDate(row[12]);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="border border-gray-800 px-2 py-1 text-center">${index + 1}</td>
            <td class="border border-gray-800 px-2 py-1 text-center">${row[2] || '-'}</td>
            <td class="border border-gray-800 px-2 py-1 text-center">${row[11] || '-'}</td>
            <td class="border border-gray-800 px-2 py-1 text-center">s/d</td>
            <td class="border border-gray-800 px-2 py-1 text-center">${row[12] || '-'}</td>
            <td class="border border-gray-800 px-2 py-1 text-center">${row[6] || '-'}</td>
            <td class="border border-gray-800 px-2 py-1 text-center">${row[8] || '-'}</td>
            <td class="border border-gray-800 px-2 py-1 text-right">
                <div class="flex justify-between w-full">
                    <span class="text-left">Rp</span>
                    <span class="text-right">${row[20] || '-'}</span>
                </div>
            </td>
            <td class="border border-gray-800 px-2 py-1 text-center">${row[14] ? `${row[14]} hari` : '-'}</td>
        `;
        tbody.appendChild(tr);
    });
};




const renderSummary = (summary) => {
    const totalFinalInvoiceRaw = summary.TOTAL_TAGIHAN_WITH_TAX || '0';

    // 🔹 Step 1: Normalize Indonesian-formatted numbers (convert to JS format)
    const normalizeNumber = (value) => {
        if (!value) return 0;
        return parseFloat(value.replace(/\./g, '').replace(/,/g, '.'));
    };

    // 🔹 Step 2: Process and format numbers
    const totalFinalInvoice = normalizeNumber(totalFinalInvoiceRaw);

    document.getElementById('total-amount').textContent = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(normalizeNumber(summary.TOTAL_BIAYA_SPPD));
    document.getElementById('total-biaya-admin').textContent = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(normalizeNumber(summary.ADMIN_FEE));
    document.getElementById('total-invoice-without-tax').textContent = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(normalizeNumber(summary.TOTAL_TAGIHAN_WITH_ADMIN));
    document.getElementById('total-ppn').textContent = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(normalizeNumber(summary.TAX));
    document.getElementById('total-final-invoice').textContent = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(totalFinalInvoice);

    // 🔹 Step 3: Convert to Terbilang (Bahasa) after normalization
    if (window.angkaTerbilang) {
        const terbilangText = angkaTerbilang(totalFinalInvoice, { decimal: '.' });
        document.getElementById('terbilang-amount').textContent = `Terbilang: ${terbilangText} rupiah`;
    } else {
        console.error("❌ angka-terbilang-js is not loaded!");
    }
};







const renderTransactionDetails = (firstRow) => {
    if (!firstRow) return;

    const transactionMonth = firstRow[19] || '-'; // Example: "Desember 2024"
    const bulanMasukTagihan = firstRow[20] || '-'; // Example: "Januari 2025"

    // Get today's date dynamically
    const today = new Date();
    const todayFormatted = `${today.getDate()} ${bulanMasukTagihan}`; // Example: "15 Januari 2025"

    document.querySelectorAll('#transaction-month').forEach(el => el.textContent = transactionMonth);
    document.querySelectorAll('#bulan-masuk-tagihan').forEach(el => el.textContent = todayFormatted);
};

document.addEventListener('DOMContentLoaded', fetchSppdRekapPln);