const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL = isLocalhost
    ? "http://localhost:3000/api/lembur/create"  // 🏠 Local Dev
    : "https://backend-sppd-production.up.railway.app/api/lembur/create";  // ☁️ Production

console.log(`🚀 API Target: ${BASE_URL}`);


export const submitLemburForm = async () => {
    console.log("🚀 Sending that Lembur data...");

    // 📝 Grab all the form data
    const formData = {
        NAMA_DRIVER: document.getElementById("NAMA_DRIVER").value.trim(),
        STATUS_DRIVER: document.getElementById("STATUS_DRIVER").value.trim(),
        UNIT_KERJA: document.getElementById("UNIT_KERJA").value.trim(),
        KOTA_UNIT_KERJA: document.getElementById("KOTA_UNIT_KERJA").value.trim(),
        PEMBERI_TUGAS: document.getElementById("PEMBERI_TUGAS").value.trim(),
        NAMA_FORM_1: document.getElementById("NAMA_FORM_1").value.trim(),
        JABATAN_FORM_1: document.getElementById("JABATAN_FORM_1").value.trim(),
        NAMA_FORM_2: document.getElementById("NAMA_FORM_2").value.trim(),
        JABATAN_FORM_2: document.getElementById("JABATAN_FORM_2").value.trim(),
        URAIAN_PEKERJAAN: document.getElementById("URAIAN_PEKERJAAN").value.trim(),
        TANGGAL_MULAI: document.getElementById("TANGGAL_MULAI").value.trim(),
        HARI_MULAI: document.getElementById("HARI_MULAI").value.trim(),
        STATUS_HARI_MULAI: document.getElementById("STATUS_HARI_MULAI").value.trim(),
        JAM_MULAI: document.getElementById("JAM_MULAI").value.trim(),
        TANGGAL_SELESAI: document.getElementById("TANGGAL_SELESAI").value.trim(),
        HARI_SELESAI: document.getElementById("HARI_SELESAI").value.trim(),
        STATUS_HARI_SELESAI: document.getElementById("STATUS_HARI_SELESAI").value.trim(),
        JAM_SELESAI: document.getElementById("JAM_SELESAI").value.trim(),
        TOTAL_JAM_LEMBUR: document.getElementById("TOTAL_JAM_LEMBUR").value.trim(),
        TOTAL_JAM_BAYAR: document.getElementById("TOTAL_JAM_BAYAR").value.trim(),
        UPAH_PER_JAM: document.getElementById("UPAH_PER_JAM").value.trim(),
        TOTAL_BIAYA: document.getElementById("TOTAL_BIAYA").value.trim()
    };

        // 🚀 Log the submitted data before sending
        console.log("📤 Submitted Data:", formData);
        

    // 🚨 Empty fields ain't welcome here
    const missingFields = Object.entries(formData)
        .filter(([key, value]) => value === "")
        .map(([key]) => key);

    if (missingFields.length > 0) {
        alert(`❌ Bruh, you forgot: ${missingFields.join(", ")}`);
        console.error("❌ Empty fields detected:", missingFields);
        return;
    }

    try {
        // 🚀 Blast off to the backend
        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ W submission! Lembur data saved.");
            console.log("✅ API Response:", result);
            document.getElementById("lemburForm").reset(); // 🧼 Clean the form
            location.reload(); // 🔄 Refresh for a fresh start
        } else {
            alert(`❌ F Submission: ${result.message}`);
            console.error("❌ Backend didn't like that:", result);
        }
    } catch (error) {
        console.error("❌ Yikes, something went wrong:", error);
        alert("❌ Bro, your data got lost in the matrix. Try again.");
    }
};
