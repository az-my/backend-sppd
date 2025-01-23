export function setupFormSubmission(form, apiEndpoint) {
    // 🔍 Ensure form is valid
    if (!form || !(form instanceof HTMLFormElement)) {
        console.error("❌ Invalid form element received!", form);
        alert("⚠️ Form submission error: Invalid form.");
        return;
    }

    console.log(`📌 Processing form: ${form.id}`);

    // ✅ Automatically determine API base URL (Dev vs. Prod)
    const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const baseApiUrl = isLocal ? "http://localhost:3000/api" : "https://backend-sppd-production.up.railway.app/api";
    const fullApiUrl = `${baseApiUrl}${apiEndpoint}`;

    console.log(`📌 Using API Endpoint: ${fullApiUrl}`);

    // ✅ Validate form before submission
    if (!validateForm(form)) {
        console.error("❌ Form validation failed! Some required fields are missing.");
        alert("⚠️ Submission failed. Please check required fields.");
        return;
    }

    // ✅ Collect all input values dynamically, including readonly fields
    const formData = new FormData(form);
    const jsonObject = {};

    formData.forEach((value, key) => {
        jsonObject[key] = value;
    });

    console.log("📤 Form Data Ready to Submit:", jsonObject);

    if (Object.keys(jsonObject).length === 0) {
        console.error("❌ No data found in the form!");
        // alert("⚠️ Cannot submit empty form!");
        return;
    }

    // ✅ Submit data to API
    fetch(fullApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonObject)
    })
        .then(async (response) => {
            console.log("📡 API Request Sent, Awaiting Response...");
            const result = await response.json();

            if (response.ok) {
                alert(`✅ Submission successful!`);
                console.log("✅ API Response:", result);
                location.reload(); // 🔄 Refresh after submission
            } else {
                alert(`❌ Submission failed: ${result.message}`);
                console.error("❌ Server Error:", result);
            }
        })
        .catch((error) => {
            console.error("❌ Error submitting form:", error);
            alert("⚠️ Submission error. Please try again.");
        });
}

// ✅ Simple form validation function
function validateForm(form) {
    if (!form || !(form instanceof HTMLFormElement)) {
        console.error("❌ Invalid form passed to validation!", form);
        return false;
    }

    const requiredFields = form.querySelectorAll("[required]");
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            console.error(`⚠️ Required field missing: ${field.name}`);
            return false;
        }
    }
    return true;
}
