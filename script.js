document.getElementById("leadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const statusBox = document.getElementById("form-status");

    const data = {
        name: form.name.value,
        business: form.business.value,
        phone: form.phone.value,
        message: form.message.value,
    };

    statusBox.innerText = "Submitting...";

    try {
        await fetch("YOUR_GOOGLE_SHEETS_WEBHOOK_URL", {
            method: "POST",
            body: JSON.stringify(data),
        });

        statusBox.innerText = "Your details are submitted successfully!";
        form.reset();

    } catch (error) {
        statusBox.innerText = "Submission failed. Please try again.";
    }
});
