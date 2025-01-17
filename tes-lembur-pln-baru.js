<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan LEMBUR PLN</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/daisyui@2.51.4/dist/full.css" rel="stylesheet" type="text/css" />
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.10.7/dayjs.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg=="
        crossorigin="anonymous"
        referrerpolicy="no-referrer"></script>
</head>
<body class="bg-white-100 flex flex-col justify-center items-center min-h-screen p-6">



    <!-- Centered Table -->
    <div id="laporan-wrapper" class="overflow-x-auto w-auto text-center">
        <table id="laporan" class="w-auto text-xs align-middle break-words ">
            <!-- Table Title -->
            <thead>
                <tr>
                    <th colspan="11" class="text-center">
                        <div class="pl-8 font-semibold text-sm mt-1">
                            <br>REKAPITULASI KERJA LEMBUR OUTSOURCING <br />
                            UPT BANDA ACEH <br><span id="transaction-month" class="uppercase"></span><br>
                        </div>
                    </th>
                </tr>
                <!-- Column Headers -->
                <tr>
                    <th class="border border-gray-800 px-2 py-1 text-center uppercase">No</th>
                    <th class="border border-gray-800 px-2 py-1 text-center uppercase">Hari</th>
                    <th class="border border-gray-800 px-2 py-1 text-center uppercase">Tanggal</th>
                    <th class="border border-gray-800 px-2 py-1 text-center uppercase">Nama Outsourcing</th>
                    <th class="border border-gray-800 px-2 py-1 text-center uppercase">Unit</th>
                    <th class="border border-gray-800 px-2 py-1 text-center break-words uppercase">Rincian Pekerjaan</th>
                    <th class="border border-gray-800 px-2 py-1 text-center uppercase">Jam Mulai</th>
                    <th class="border border-gray-800 px-2 py-1 text-center uppercase">Jam Selesai</th>
                    <th class="border border-gray-800 px-2 py-1 text-center uppercase">Total Jam<br>Lembur</th>
                    <th class="border border-gray-800 px-2 py-1 text-center w-auto uppercase  ">Total Jam Yang<br>Dibayarkan</th>
                    <th class="border border-gray-800 px-2 py-1 text-center uppercase">Upah<br>Lembur<br>SeJam</th>
                    <th class="border border-gray-800 px-2 py-1 text-center uppercase">Biaya Yang<br>Dibayarkan</th>
                    <th class="border border-gray-800 px-2 py-1 text-center uppercase">Ket</th>
                </tr>
                <tr ><th colspan="11" class="border border-gray-800 pl-8 py-1 text-center align-middle uppercase"><span id="transaction-month"></span></th></tr>
            </thead>
            <tbody id="data-table-body">
                <!-- Dynamic data will be rendered here -->
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="11" class="border border-gray-800 px-2 py-1 font-semibold text-right uppercase ">Lembur <span id="transaction-month"></span></td>
                    <td class="border border-gray-800 px-2 py-1 text-right" id="total-amount"></td>
                    <td class="border border-gray-800 px-2 py-1 text-right" id="total-amount"></td>
                </tr>
                <tr>
                    <td colspan="11" class="border border-gray-800 px-2 py-1 font-semibold text-right uppercase">Biaya Admin (5%)</td>
                    <td class="border border-gray-800 px-2 py-1 text-right" id="total-biaya-admin"></td>
                    <td class="border border-gray-800 px-2 py-1 text-right" id="total-biaya-admin"></td>
                </tr>
                <tr>
                    <td colspan="11" class="border border-gray-800 px-2 py-1 font-semibold text-right uppercase">Total Lembur <span id="transaction-month"></span></td>
                    <td class="border border-gray-800 px-2 py-1 text-right" id="total-invoice-without-tax"></td>
                    <td class="border border-gray-800 px-2 py-1 text-right" id="total-invoice-without-tax"></td>
                </tr>
                <tr>
                    <td colspan="11" class="border border-gray-800 px-2 py-1 font-semibold text-right uppercase text-white">a</td>
                    <td class="border border-gray-800 px-2 py-1 text-right" id=""></td>
                    <td colspan="11" class="border border-gray-800 px-2 py-1 font-semibold text-right uppercase text-white">a</td>
                </tr>
                <tr>
                    <td colspan="11" class="border border-gray-800 px-2 py-1 font-semibold text-right uppercase">Total Tagihan Lembur <span id="transaction-month"></span></td>
                    <td class="border border-gray-800 px-2 py-1 text-right" id="total-tagihan-without-tax"></td>
                    <td class="border border-gray-800 px-2 py-1 text-right" id="total-tagihan-without-tax"></td>
                </tr>
                <tr>
                    <td colspan="11" class="border border-gray-800 px-2 py-1 font-semibold text-right">PPN (11%)</td>
                    <td class="border border-gray-800 px-2 py-1 text-right" id="total-ppn"></td>
                    <td class="border border-gray-800 px-2 py-1 text-right" id="total-ppn"></td>
                </tr>
                <tr>
                    <td colspan="11" class="border border-gray-800 px-2 py-1 font-semibold text-right uppercase">Total Tagihan Lembur <span id="transaction-month"></span>+ PPN</td>
                    <td class="border border-gray-800 px-2 py-1 text-right" id="total-final-invoice"></td>
                    <td class="border border-gray-800 px-2 py-1 text-right" id="total-final-invoice"></td>
                </tr>
                <tr>
                    <td colspan="13" class="italic border border-gray-800 px-2 py-1 font-semibold text-left" id="terbilang">
                        <span>Terbilang: </span>
                    </td>
                    
                </tr>
                
                <!-- Signature Section Restored -->
                <tr>
                    <td colspan="4" class="border-t border-gray-800 px-2 py-8 text-center align-bottom">
                        
                        <br>KSO PT. PALMA NAFINDO PRATAMA - PT. SANOBAR GUNAJAYA<br>LEADER KSO<br><br><br><br><br><br><br><u>RIZKY NAHARDI</u>
                    </td>
                    <td colspan="6"></td>

                    <td colspan="3" class="border-t border-gray-800 px-2 py-8 text-center align-bottom">
                        Banda Aceh, 15 <span id="bulan-masuk-tagihan"></span><br>PT PLN (PERSERO) UPT BANDA ACEH		
                        <br>MANAGER<br><br><br><br><br><br><br><u>INDRA KURNIAWAN</u>
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>

    <!-- External JavaScript restored -->
    <script src="lembur-frontend-report-pln.js"></script>

</body>
</html>
