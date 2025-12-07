// 🔗 Your N8N Webhook URL (Configured)
const WEBHOOK_URL = "https://n8n-nypw.onrender.com/webhook/mora-lead";

document.getElementById("contactForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const service = document.getElementById("service").value;
    const message = document.getElementById("message").value.trim();
    const statusBox = document.getElementById("statusMessage");

    statusBox.innerHTML = "⏳ Sending…";
    statusBox.style.color = "black";

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                phone,
                email,
                service,
                message
            })
        });

        if (response.ok) {
            statusBox.innerHTML = "✅ Message sent successfully!";
            statusBox.style.color = "green";
            document.getElementById("contactForm").reset();
        } else {
            statusBox.innerHTML = "❌ Failed to send message. Check webhook or CORS.";
            statusBox.style.color = "red";
        }
    } catch (error) {
        console.error(error);
        statusBox.innerHTML = "❌ Error sending message";
        statusBox.style.color = "red";
    }
});
