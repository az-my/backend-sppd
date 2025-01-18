document.addEventListener("DOMContentLoaded", () => {
    const sppdForm = document.getElementById("sppdForm");

    if (!sppdForm) return;

    sppdForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // ✅ Prevent default form submission

        const formData = new FormData(sppdForm);
        const jsonData = {};

        // ✅ Convert FormData to JSON
        formData.forEach((value, key) => {
            jsonData[key] = value;
        });

         // ✅ Manually Add Disabled (Auto-Filled) Fields
         jsonData["KOTA_UNIT_KERJA"] = document.getElementById("KOTA_UNIT_KERJA").value;
         jsonData["STATUS_DRIVER"] = document.getElementById("STATUS_DRIVER").value;
         jsonData["DURASI_TRIP"] = document.getElementById("DURASI_TRIP").value;
         jsonData["DURASI_INAP"] = document.getElementById("DURASI_INAP").value;
         jsonData["BUDGET_BIAYA_HARIAN"] = document.getElementById("BUDGET_BIAYA_HARIAN").value;
         jsonData["BUDGET_HOTEL"] = document.getElementById("BUDGET_HOTEL").value;
         jsonData["TOTAL_BIAYA_HARIAN"] = document.getElementById("TOTAL_BIAYA_HARIAN").value;
         jsonData["TOTAL_BIAYA_PENGINAPAN"] = document.getElementById("TOTAL_BIAYA_PENGINAPAN").value;
         jsonData["TOTAL_BIAYA_SPPD"] = document.getElementById("TOTAL_BIAYA_SPPD").value;
        console.log("Submitting Data:", jsonData); // ✅ Debugging: Check data before sending

        try {
            const response = await fetch("http://localhost:3000/api/sppd/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jsonData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ Data successfully submitted!");
                sppdForm.reset(); // ✅ Clear form after submission
                location.reload(); // ✅ Reload the page
            } else {
                alert("❌ Submission failed: " + result.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("❌ Error submitting data. Please try again.");
        }
    });
});
