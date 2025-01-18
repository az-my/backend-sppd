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
            } else {
                alert("❌ Submission failed: " + result.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("❌ Error submitting data. Please try again.");
        }
    });
});
