const WEBHOOK_URL = "https://n8n-nypw.onrender.com/webhook-test/mora-lead";

document.getElementById("leadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const status = document.getElementById("status");
    status.textContent = "Sending...";
    status.style.color = "gold";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email) {
        status.textContent = "Please provide name and email.";
        status.style.color = "red";
        return;
    }

    const payload = { 
        name, email, phone, service, message,
        source: "Mora Website"
    };

    try {
        const res = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error("Server error");
        }

        status.textContent = "Message sent successfully!";
        status.style.color = "lightgreen";

        document.getElementById("leadForm").reset();

    } catch (err) {
        status.textContent = "Couldn't reach server. Check webhook.";
        status.style.color = "red";
    }
});
