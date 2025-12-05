document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();

    document.getElementById("formStatus").innerText =
        "Your request has been received! We will contact you soon.";
});
