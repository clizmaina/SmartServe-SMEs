// ── Central API base — reads from config.js, works on Render and locally ──
function getBase() {
    return (window.API_BASE) || "https://smartserve-smes.onrender.com";
}

document.addEventListener("DOMContentLoaded", () => {
    const uploadBtn = document.getElementById("uploadBtn");
    if (uploadBtn) uploadBtn.addEventListener("click", uploadDesign);

    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.role !== "customer") {
        window.location.replace("business-select.html");
        return;
    }
    history.replaceState(null, '', window.location.href);

    console.log("Customer ID:", userData.id);
    window.customerId = userData.id;
    window.customerName = userData.name || '';

    fetchDesigner();
});

// ── Fetch providers for this business type ────────────────────────────────
function fetchDesigner() {
    const designerSelect = document.getElementById("designerSelect");
    if (!designerSelect) return;

    const userData     = JSON.parse(localStorage.getItem("user"));
    const businessType = userData?.businessType || localStorage.getItem("businessType");

    fetch(`${getBase()}/available-providers?businessType=${encodeURIComponent(businessType)}`, { credentials: "include" })
        .then(r => r.json())
        .then(data => {
            designerSelect.innerHTML = "<option value=''>Select a designer / provider</option>";
            if (data.success && Array.isArray(data.providers) && data.providers.length > 0) {
                data.providers.forEach(p => {
                    const opt = document.createElement("option");
                    opt.value = p.id;
                    opt.textContent = p.name;
                    designerSelect.appendChild(opt);
                });
            } else {
                designerSelect.innerHTML = "<option>No providers available yet.</option>";
            }
        })
        .catch(() => {
            designerSelect.innerHTML = "<option>Error loading providers.</option>";
        });

    designerSelect.addEventListener("change", function () {
        const providerId = this.value;
        const customerId = window.customerId;
        if (!providerId || !customerId) return;

        fetch(`${getBase()}/select-provider`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ customerId, providerId })
        })
        .then(r => r.json())
        .then(data => { if (data.success) console.log("✅ Provider selected."); })
        .catch(err => console.error("Error saving provider selection:", err));
    });
}

// ── Validate designer selection ───────────────────────────────────────────
function validateDesignerSelection() {
    const designerSelect = document.getElementById("designerSelect");
    if (!designerSelect) return null;
    const id = designerSelect.value;
    if (!id) { alert("Please select a designer first."); return null; }
    return id;
}

// ── Upload design ─────────────────────────────────────────────────────────
function uploadDesign(event) {
    event.preventDefault();
    if (!window.customerId) return alert("Customer ID is missing. Please log in again.");

    const selectedDesignerId = validateDesignerSelection();
    if (!selectedDesignerId) return;

    const fileInput = document.getElementById("designFile");
    if (!fileInput?.files.length) return alert("Please select a file.");

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    formData.append("customerId", window.customerId);
    formData.append("designerId", selectedDesignerId);

    fetch(`${getBase()}/upload-design`, {
        method: "POST",
        body: formData,
        credentials: "include",
    })
    .then(r => { if (!r.ok) throw new Error(`Server error: ${r.status}`); return r.json(); })
        .then(data => {
        const msg = document.getElementById("uploadMessage");
        if (msg) { msg.style.color = "#4ade80"; msg.textContent = data.message || "✅ Upload successful!"; }
        else alert(data.message || "Upload successful!");
        try { window.aiAssistant && window.aiAssistant.showHypeMessage(window.customerName || 'friend', 'uploaded a design'); } catch(e){}
    })
    .catch(error => {
        console.error("Upload error:", error);
        alert("Upload failed. Please try again.");
    });
}

// ── Measurement fields per garment type ───────────────────────────────────
const garmentTypeSelect = document.getElementById("garmentType");
const fieldsContainer   = document.getElementById("fieldsContainer");

const measurementFields = {
    dress:   ["Waist (cm)", "Bust (cm)", "Hips (cm)", "Bodice (cm)", "Full Length (cm)", "Sleeve Length (cm)", "Shoulder (cm)"],
    trouser: ["Waist (cm)", "Hips (cm)", "Full Length (cm)", "Trouser Length (cm)", "Inseam (cm)", "Thigh (cm)", "Knee (cm)"],
    shirt:   ["Chest (cm)", "Waist (cm)", "Shoulder (cm)", "Sleeve Length (cm)", "Shirt Length (cm)", "Neck (cm)"],
    skirt:   ["Waist (cm)", "Hips (cm)", "Skirt Length (cm)"],
    coat:    ["Chest (cm)", "Waist (cm)", "Shoulder (cm)", "Sleeve Length (cm)", "Full Length (cm)", "Back Width (cm)"]
};

if (garmentTypeSelect) {
    garmentTypeSelect.addEventListener("change", () => {
        const selected = garmentTypeSelect.value;
        if (!fieldsContainer) return;
        fieldsContainer.innerHTML = "";
        if (selected && measurementFields[selected]) {
            measurementFields[selected].forEach(label => {
                const div = document.createElement("div");
                div.classList.add("form-field");
                div.innerHTML = `<label style="color:white;">${label}</label>
                    <input type="number" step="0.1" name="${label}" required class="form-input" />`;
                fieldsContainer.appendChild(div);
            });
        }
    });
}

const measurementForm = document.getElementById("measurementForm");
if (measurementForm) {
    measurementForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedGarment    = garmentTypeSelect?.value;
        if (!selectedGarment)    return alert("Please select a garment type!");
        const selectedDesignerId = validateDesignerSelection();
        if (!selectedDesignerId) return;
        if (!window.customerId)  return alert("Customer ID missing. Please log in again.");

        const data = { garmentType: selectedGarment, measurements: {}, designerId: selectedDesignerId, userId: window.customerId };
        document.querySelectorAll("#fieldsContainer input").forEach(input => {
            const label = input.previousElementSibling.textContent.replace("(cm)", "").trim();
            data.measurements[label] = input.value;
        });

        try {
            const res = await fetch(`${getBase()}/submit-measurements`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const response = await res.json();
            alert(response.message || "Measurements submitted successfully!");
        } catch (err) {
            console.error("❌ Error submitting measurements:", err);
            alert("Error submitting measurements.");
        }
    });
}

// ── Refresh chat messages ─────────────────────────────────────────────────
function refreshChat() {
    if (!window.customerId) return;
    const selectedDesignerId = validateDesignerSelection();
    if (!selectedDesignerId) return;

    fetch(`${getBase()}/chat/${window.customerId}/${selectedDesignerId}`, { credentials: "include" })
    .then(r => r.json())
    .then(data => {
        const chatMessages = document.getElementById("chat-messages");
        if (!chatMessages) return;
        chatMessages.innerHTML = "";
        if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
            data.messages.forEach(msg => {
                chatMessages.innerHTML += `<li><strong>${msg.sender}:</strong> ${msg.message}</li>`;
            });
        } else {
            chatMessages.innerHTML = "<li>No messages yet.</li>";
        }
    })
    .catch(() => {
        const el = document.getElementById("chat-messages");
        if (el) el.innerHTML = "<li>Error loading chat.</li>";
    });
}

// ── Logout ────────────────────────────────────────────────────────────────
function logoutUser() {
    fetch(`${getBase()}/logout`, { method: "POST", credentials: "include" })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            localStorage.clear();
            sessionStorage.clear();
            document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "business-select.html";
        } else {
            alert("Logout failed. Try again.");
        }
    })
    .catch(() => { window.location.href = "business-select.html"; });
}

// ── Show tab ──────────────────────────────────────────────────────────────
function showTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
        tab.style.display = "";
    });
    const target = document.getElementById(tabId);
    if (target) target.classList.add("active");

    if (tabId === "view-previews") viewPreviews();
    if (tabId === "chat")          refreshChat();
}

// ── M-Pesa payment ────────────────────────────────────────────────────────
function showMpesaPaymentOption() {
    const method    = document.getElementById("paymentMethod")?.value;
    const mpesaForm = document.getElementById("mpesaPaymentForm");
    if (mpesaForm) mpesaForm.style.display = method === "mpesa" ? "block" : "none";
}

function initiateMpesaPayment() {
    const mpesaNumber    = document.getElementById("mpesaNumber")?.value.trim();
    const paymentMessage = document.getElementById("paymentMessage");

    if (!/^(?:2547\d{8}|07\d{8})$/.test(mpesaNumber)) {
        paymentMessage.textContent = "❌ Enter a valid Kenyan M-Pesa number (07XXXXXXXX or 2547XXXXXXXX).";
        paymentMessage.style.color = "red";
        return;
    }
    const amount = prompt("Enter the amount to pay:");
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        paymentMessage.textContent = "❌ Please enter a valid amount.";
        paymentMessage.style.color = "red";
        return;
    }

    fetch(`${getBase()}/api/mpesa/stk-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerPhone: mpesaNumber, amount: parseFloat(amount), customerId: window.customerId || 1 }),
    })
    .then(r => r.json())
    .then(data => {
        paymentMessage.textContent = data.message || "✅ Check your phone to enter your M-Pesa PIN.";
        paymentMessage.style.color = "green";
        try { window.aiAssistant && window.aiAssistant.showHypeMessage(window.customerName || 'friend', 'payment'); } catch(e){}
    })
    .catch(() => {
        paymentMessage.textContent = "❌ Failed to initiate M-Pesa payment.";
        paymentMessage.style.color = "red";
    });
}

// ── Send chat message ─────────────────────────────────────────────────────
function sendCustomerMessage() {
    const message            = document.getElementById("customerMessage")?.value.trim();
    const chatMessages       = document.getElementById("chat-messages");
    const selectedDesignerId = validateDesignerSelection();

    if (!selectedDesignerId || !message) { alert("Message cannot be empty."); return; }

    fetch(`${getBase()}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "customer", message, designerId: selectedDesignerId, customerId: window.customerId }),
        credentials: "include"
    })
    .then(r => r.json())
    .then(() => {
        if (chatMessages) chatMessages.innerHTML += `<li><strong>Customer:</strong> ${message}</li>`;
        document.getElementById("customerMessage").value = "";
    })
    .catch(err => console.error("Message sending failed:", err));
}

// ── View previews ─────────────────────────────────────────────────────────
function viewPreviews() {
    const selectedDesignerId = validateDesignerSelection();
    if (!selectedDesignerId) return;

    fetch(`${getBase()}/product-previews/${selectedDesignerId}`, { credentials: "include" })
    .then(r => r.json())
    .then(data => {
        const previewList = document.getElementById("preview-list");
        if (!previewList) return;
        previewList.innerHTML = "";
        if (data.success && Array.isArray(data.previews) && data.previews.length > 0) {
            data.previews.forEach(preview => {
                previewList.innerHTML += `<li><img src="${preview.image_url}" alt="Product Preview"></li>`;
            });
        } else {
            previewList.innerHTML = "<li>No previews available.</li>";
        }
    })
    .catch(() => {
        const el = document.getElementById("preview-list");
        if (el) el.innerHTML = "<li>Error loading previews.</li>";
    });
}
