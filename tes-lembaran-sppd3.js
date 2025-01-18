document.addEventListener('DOMContentLoaded', async () => {
    const API_URL = 'https://rj.up.railway.app/api/google-sheets/sppd-read';

    const fetchData = async () => {
        try {
            const response = await fetch(API_URL);
            const { data } = await response.json();
            console.log("📥 Raw response:", data);
            return data;
        } catch (error) {
            console.error("🚨 Oops! Error fetching data:", error);
            return [];
        }
    };

    const generateReportHTML = (row) => {
        const jabatanDriver = "Manager ULTG Banda Aceh"; // Example position, replace with actual data if available
        return `
            <div id="report-${row[0]}" class="w-full p-6 page-break text-xs rounded-lg mb-6">
                <div class="mb-6">
                    <h1 class="font-bold">PT. PALMA NAFINDO PRATAMA</h1>
                    <h2 class="font-bold">BANDA ACEH</h2>
                </div>
                <h1 class="text-center underline font-bold text-lg mb-6">SURAT PERINTAH PERJALANAN DINAS (SPPD)</h1>
                <div class="border border-black rounded-lg">
                    <table class="w-full border-collapse">
                        <tbody>
                            <!-- Points 1 to 6 -->
                            <tr class="border-b border-black">
                                <td class="border-r border-black p-2 w-auto">1.</td>
                                <td class="border-r border-black p-2 w-1/2">Pegawai yang di Perintah</td>
                                <td class="p-2 w-1/2">
                                    <div>Nama: <span>${row[2]}</span></div>
                                    <div>Jabatan: <span>Driver</span></div>
                                </td>
                            </tr>
                            <tr class="border-b border-black">
                                <td class="border-r border-black p-2 w-auto">2.</td>
                                <td class="border-r border-black p-2 w-1/2">Maksud Perjalanan Dinas</td>
                                <td class="p-2 w-1/2"><span>${row[8]}</span></td>
                            </tr>
                            <tr class="border-b border-black">
                                <td class="border-r border-black p-2 w-auto">3.</td>
                                <td class="border-r border-black p-2 w-1/2">Alat angkutan yang dipergunakan</td>
                                <td class="p-2 w-1/2"><span>${row[7]}</span></td>
                            </tr>
                            <tr class="border-b border-black">
                                <td class="border-r border-black p-2 w-auto">4.</td>
                                <td class="border-r border-black p-2 w-1/2">
                                    <div>a. Tempat berangkat (tempat kedudukan)</div>
                                    <div>b. Tempat Tujuan</div>
                                </td>
                                <td class="p-2 w-1/2">
                                    <div>a. <span>${row[3]}</span></div>
                                    <div>b. <span>${row[6]}</span></div>
                                </td>
                            </tr>
                            <tr class="border-b border-black">
                                <td class="border-r border-black p-2 w-auto">5.</td>
                                <td class="border-r border-black p-2 w-1/2">
                                    <div>a. Lama perjalanan dinas</div>
                                    <div>b. Tanggal berangkat</div>
                                    <div>c. Tanggal kembali</div>
                                </td>
                                <td class="p-2 w-1/2">
                                    <div>a. <span>${row[11]} Hari</span></div>
                                    <div>b. <span>${moment(row[9], 'DD/MM/YYYY').locale('id').format('DD MMMM YYYY')}</span></div>
                                    <div>c. <span>${moment(row[10], 'DD/MM/YYYY').locale('id').format('DD MMMM YYYY')}</span></div>
                                </td>
                            </tr>
                            <tr class="border-b border-black">
                                <td class="border-r border-black p-2 w-auto">6.</td>
                                <td class="border-r border-black p-2 w-1/2">
                                    <div>Biaya</div>
                                    <div>a. Jumlah</div>
                                    <div>b. Penanggung</div>
                                </td>
                                <td class="p-2 w-1/2">
                                    <div>&nbsp;</div>
                                    <div>Rp <span>${row[17].replace(/,\d+$/, '')}</span></div>
                                    <div>PT. PALMA NAFINDO PRATAMA</div>
                                </td>
                            </tr>
    
                            <!-- Point 7 -->
                            <tr class="border-b border-black">
                                <td class="border-r border-black p-2 w-auto align-top rowspan="2">7.</td>
                                <td class="border-r border-black p-2 w-1/2 align-top">
                                    <span class="block">Rincian biaya</span>
                                    <span class="block font-bold">1. BIAYA ANGKUTAN</span>
    
                                    <!-- Sub-items under BIAYA ANGKUTAN -->
                                    <span class="block pl-6 invisible">Angkutan 1</span>
                                    <span class="block pl-6 invisible">Angkutan 2</span>
                                    <span class="block pl-6 invisible">Angkutan 3</span>
                                    <span class="block pl-6 invisible">Angkutan 4</span>
                                    <span class="block pl-6">Airport Tax</span>
                                    <span class="block pl-6">Biaya Angkutan dari Rumah (PP)</span>
                                    <span class="block pl-6">Biaya Angkutan dari Rumah (PP)</span>
                                </td>
                                <td class="p-2 w-1/2">
                                    <!-- BIAYA ANGKUTAN TABLE -->
                                    <table class="w-full border-collapse mt-8">
                                        <tbody>

 <tr>
            <!-- Currency Symbol Column (10%) -->
            <td class="text-left  w-[10%]">
                <span class="block">Rp</span>
                <span class="block">Rp</span>
                <span class="block">Rp</span>
                <span class="block">Rp</span>
                <span class="block">Rp</span>
                <span class="block">Rp</span>
                <span class="block">Rp</span>
            </td>

            <!-- Amount Column (30%) -->
            <td class="text-right  w-[30%]">
                <span class="block">-</span>
                <span class="block">-</span>
                <span class="block">-</span>
                <span class="block">-</span>
                <span class="block">-</span>
                <span class="block">-</span>
                <span class="block">-</span>
            </td>

            <!-- Multiplier Column (15%) -->
            <td class="text-left  w-[15%]">
                <span class="block">x 1</span>
                <span class="block">x 1</span>
                <span class="block">x 1</span>
                <span class="block">x 1</span>
                <span class="block">+ Rp</span>
                <span class="block">x 1</span>
                <span class="block">x 1</span>
            </td>

            <!-- Multiplier Percentage Column (15%) -->
            <td class="text-center  w-[15%]">
                <span class="block"></span>
                <span class="block"></span>
                <span class="block"></span>
                <span class="block"></span>
                <span class="block"></span>
                <span class="block"></span>
                <span class="block"></span>
            </td>

            <!-- Result Column (30%) -->
            <td class="text-right w-[30%]">
                <span class="block">-</span>
                <span class="block">-</span>
                <span class="block">-</span>
                <span class="block">-</span>
                <span class="block">-</span>
                <span class="block">-</span>
                <span class="block">-</span>
            </td>
        </tr>
                                        
                                        
                                            </tbody>
                                    </table>
                                </td>
                            </tr>
    
                            <!-- Point 7.2 - UANG HARIAN -->
                            <tr class="border-b border-black">
                                <td class="border-r border-black p-2 w-auto align-top"></td>
                                <td class="border-r border-black p-2 w-1/2 align-top">
                                    <span class="block font-bold">2. UANG HARIAN</span>
    
                                    <!-- Sub-items under UANG HARIAN -->
                                    <span class="block pl-6">Biaya Harian</span>
                                    <span class="block pl-6">Biaya Penginapan</span>
                                </td>
                                <td class="p-2 w-1/2">
                                    <!-- UANG HARIAN TABLE -->
                                    <table class="w-full border-collapse">
                                        <tbody>

<tr>
            <!-- Currency Symbol Column (10%) -->
            <td class="text-left w-[10%]">
                <span class="block">Rp</span>
                <span class="block">Rp</span>
            </td>

            <!-- Amount Column (30%) -->
            <td class="text-right  w-[30%]">
                <span class="block">150.000</span>
                <span class="block">250.000</span>
            </td>

            <!-- Multiplier & Days Column (15%) -->
            <td class="text-center  w-[15%]">
                <span class="block">x 3 Hari</span>
                <span class="block">x 0 Hari</span>
            </td>

            <!-- Multiplier & Percentage Column (15%) -->
            <td class="text-center  w-[15%]">
                <span class="block">x 100%</span>
                <span class="block">x 100%</span>
            </td>

            <!-- Total Amount Column (30%) -->
            <td class="text-right  w-[30%]">
                <span class="block">${row[15].replace(/,\d+$/, '')}</span>
                <span class="block">${row[16].replace(/,\d+$/, '')}</span>
            </td>
        </tr>

                                        </tbody>
                                    </table>
                                </td>
                            </tr>
    
                            <!-- TOTAL -->
                            <tr class="border-b border-black">
                                <td class="border-r border-black p-2"></td>
                                <td class="text-center font-bold p-2">TOTAL</td>
                                <td class="border-l border-black font-bold text-right p-2">${row[17].replace(/,\d+$/, '')}</td>
                            </tr>
                                                        <tr class="border-b border-black">
                                <td class="border-r border-black p-2">8.</td>
                                <td class="text-center font-bold p-2">Keterangan lain - lain</td>
                                <td class="border-l border-black font-bold text-right p-2">-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="flex justify-end">
                    <div class="w-64 mt-6">
                        <div>Dikeluarkan di: Banda Aceh</div>
                        <div>Pada Tanggal&nbsp;&nbsp;: <span>${moment(row[9], 'DD/MM/YYYY').locale('id').format('DD MMMM YYYY')}</span></div>
                        <div class="mt-4 text-center">
                            <div class="font-bold">DIREKTUR</div>
                            <div class="mt-16">RIZKY NAHARDI</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    const renderReports = (data) => {
        const reportContainer = document.getElementById('reports-container');
        data.slice(1).forEach(row => {
            const reportHTML = generateReportHTML(row);
            reportContainer.innerHTML += reportHTML;
        });
    };

    const data = await fetchData();
    if (data.length > 0) {
        renderReports(data);
        console.log("✅ Reports generated successfully!");
    } else {
        console.log("❌ No data available.");
    }
});