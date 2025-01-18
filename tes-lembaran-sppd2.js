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
                    <div class="flex border-b border-black">
                        <div class="w-10 border-r border-black p-2">1.</div>
                        <div class="flex-1 border-r border-black p-2">Pegawai yang di Perintah</div>
                        <div class="flex-1 p-2">
                            <div>Nama: ${row[2]}</div>
                            <div>Jabatan: ${jabatanDriver}</div>
                        </div>
                    </div>
                    <div class="flex border-b border-black">
                        <div class="w-10 border-r border-black p-2">2.</div>
                        <div class="flex-1 border-r border-black p-2">Maksud Perjalanan Dinas</div>
                        <div class="flex-1 p-2">${row[8]}</div>
                    </div>
                    <div class="flex border-b border-black">
                        <div class="w-10 border-r border-black p-2">3.</div>
                        <div class="flex-1 border-r border-black p-2">Alat angkutan yang dipergunakan</div>
                        <div class="flex-1 p-2">${row[7]}</div>
                    </div>
                    <div class="flex border-b border-black">
                        <div class="w-10 border-r border-black p-2">4.</div>
                        <div class="flex-1 border-r border-black p-2">
                            <div>a. Tempat berangkat (tempat kedudukan)</div>
                            <div>b. Tempat Tujuan</div>
                        </div>
                        <div class="flex-1 p-2">
                            <div>a. ${row[3]}</div>
                            <div>b. ${row[6]}</div>
                        </div>
                    </div>
                    <div class="flex border-b border-black">
                        <div class="w-10 border-r border-black p-2">5.</div>
                        <div class="flex-1 border-r border-black p-2">
                            <div>a. Lama perjalanan dinas</div>
                            <div>b. Tanggal berangkat</div>
                            <div>c. Tanggal kembali</div>
                        </div>
                        <div class="flex-1 p-2">
                            <div>a. ${row[11]} Hari</div>
                            <div>b. ${row[9]}</div>
                            <div>c. ${row[10]}</div>
                        </div>
                    </div>
                    <div class="flex border-b border-black">
                        <div class="w-10 border-r border-black p-2">6.</div>
                        <div class="flex-1 border-r border-black p-2">
                            <div>Biaya</div>
                            <div>a. Jumlah</div>
                            <div>b. Penanggung</div>
                        </div>
                        <div class="flex-1 p-2">
                            <div>&nbsp;</div>
                            <div>Rp ${row[17]}</div>
                            <div>PT. PALMA NAFINDO PRATAMA</div>
                        </div>
                    </div>
                    <div class="flex border-b border-black">
                        <div class="w-10 border-r border-black p-2">7.</div>
                        <div class="flex-1 p-2">
                            <div class="mb-4">
                                <div>Rincian biaya</div>
                                <div class="font-bold">1. BIAYA ANGKUTAN</div>
                                <div class="flex ml-4">
                                    <div class="flex-1"></div>
                                    <div class="w-24">Rp -</div>
                                    <div class="w-12">x</div>
                                    <div class="w-12">0</div>
                                </div>
                                <div class="flex ml-4">
                                    <div class="flex-1"></div>
                                    <div class="w-24">Rp -</div>
                                    <div class="w-12">x</div>
                                    <div class="w-12">0</div>
                                </div>
                                <div class="flex ml-4">
                                    <div class="flex-1"></div>
                                    <div class="w-24">Rp -</div>
                                    <div class="w-12">x</div>
                                    <div class="w-12">0</div>
                                </div>
                                <div class="flex ml-4">
                                    <div class="flex-1"></div>
                                    <div class="w-24">Rp -</div>
                                    <div class="w-12">x</div>
                                    <div class="w-12">0</div>
                                </div>
                                <div class="flex ml-4">
                                    <div class="flex-1">Airport Tax</div>
                                    <div class="w-24">Rp -</div>
                                    <div class="w-12">x</div>
                                    <div class="w-12">0</div>
                                </div>
                                <div class="flex ml-4">
                                    <div class="flex-1">Biaya Angkutan dari Rumah (PP)</div>
                                    <div class="w-24">Rp -</div>
                                    <div class="w-12">x</div>
                                    <div class="w-12">1</div>
                                </div>
                            </div>
                            <div>
                                <div class="font-bold">2. UANG HARIAN</div>
                                <div class="flex ml-4">
                                    <div class="flex-1 w-auto">Biaya Harian</div>
                                    <div class="w-auto p-1">Rp  ${row[13]}</div>
                                    <div class="w-auto p-1">x</div>
                                    <div class="w-auto p-1"></div>
                                    <div class="w-auto p-1">${row[11]}</div>
                                    <div class="w-auto p-1">hari</div>
                                    <div class="w-auto p-1">x</div>
                                    <div class="w-auto p-1">100%</div>
                                </div>
                                <div class="flex ml-4">
                                    <div class="flex-1 auto">Biaya Penginapan</div>
                                    <div class="w-auto p-1">Rp ${row[14]}</div>
                                    <div class="w-auto p-1">x</div>
                                    <div class="w-auto p-1"></div>
                                    <div class="w-auto p-1">0</div>
                                    <div class="w-auto p-1">hari</div>
                                    <div class="w-auto p-1">x</div>
                                    <div class="w-auto p-1">100%</div>
                                </div>
                            </div>
                        </div>
                        <div class="border-l border-black w-auto text-right">
                            <div >&nbsp;</div>
                            <div class="w-auto p-0">&nbsp;</div>
                            <div class="w-auto p-0">-</div>
                            <div class="w-auto p-0">-</div>
                            <div class="w-auto p-0">-</div>
                            <div class="w-auto p-0">-</div>
                            <div class="w-auto p-0">-</div>
                            <div class="w-auto p-0">-</div>
                            <div class="w-auto p-0 mb-6">&nbsp;</div>
                            <div class="w-auto p-1">${row[15]}</div>
                            <div class="w-auto p-1">${row[16]}</div>
                        </div>
                    </div>
                    <div class="flex justify-space-between border-b border-black">
                        <div class="w-10 border-r border-black">&nbsp;</div>
                        <div class="flex-1 text-center font-bold">TOTAL</div>
                        <div class="w-auto border-l border-black font-bold text-right p-1">${row[17]}</div>
                    </div>
                    <div class="flex">
                        <div class="w-10 border-r border-black p-2">8.</div>
                        <div class="flex-1 border-r border-black p-2">Keterangan lain - lain</div>
                        <div class="flex-1 p-2"></div>
                    </div>
                </div>
                <div class="flex justify-end">
                    <div class="w-64 mt-6">
                        <div>Dikeluarkan di: Banda Aceh</div>
                        <div>Pada Tanggal: ${row[9]}</div>
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