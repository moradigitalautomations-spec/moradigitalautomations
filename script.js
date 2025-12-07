// ⭐ Paste your webhook URL here (ONLY HERE!)
const WEBHOOK_URL = "https://n8n-nypw.onrender.com/webhook/mora-lead";

// ----------------------------
// Lead Form Submit Handler
// ----------------------------
document.getElementById("leadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const status = document.getElementById("status");
    status.textContent = "Sending...";
    status.style.color = "#FFD700";

    if (!WEBHOOK_URL || WEBHOOK_URL.includes("https://n8n-nypw.onrender.com/webhook/mora-lead")) {
        status.textContent = "Webhook not configured — please paste your webhook URL into script.js.";
        status.style.color = "red";
        return;
    }

    // Collect form values
    const payload = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        service: document.getElementById("service").value.trim(),
        message: document.getElementById("message").value.trim(),
        source: "Mora Digital Automations Website"
    };

    // Validate
    if (!payload.name || !payload.phone || !payload.email) {
        status.textContent = "Name, phone, and email are required.";
        status.style.color = "red";
        return;
    }

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Webhook response not OK");
        }

        status.textContent = "Message sent successfully! ✔";
        status.style.color = "lightgreen";

        document.getElementById("leadForm").reset();

    } catch (error) {
        status.textContent = "Error sending data. Check your webhook or internet.";
        status.style.color = "red";
    }
});
