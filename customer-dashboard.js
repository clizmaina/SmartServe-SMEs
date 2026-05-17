document.addEventListener("DOMContentLoaded", () => {
    const uploadBtn = document.getElementById("uploadBtn");
    if (uploadBtn) uploadBtn.addEventListener("click", uploadDesign);

    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.role !== "customer") {
        window.location.replace("business-select.html");
        return;
    }
    // Prevent back-button access after logout
    history.replaceState(null, '', window.location.href);

    console.log("Customer ID:", userData.id);
    window.customerId = userData.id;

    fetchDesigner();
});

// Fetch providers for this business type and let customer select one
function fetchDesigner() {
    const designerSelect = document.getElementById("designerSelect");
    if (!designerSelect) {
        console.error("Designer select dropdown not found.");
        return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    const businessType = userData?.businessType || localStorage.getItem("businessType");

    fetch(`http://localhost:5501/available-providers?businessType=${businessType}`, { credentials: "include" })
        .then(response => response.json())
        .then(data => {
            designerSelect.innerHTML = "<option value=''>Select a designer / provider</option>";
            if (data.success && Array.isArray(data.providers) && data.providers.length > 0) {
                data.providers.forEach(provider => {
                    const option = document.createElement("option");
                    option.value = provider.id;
                    option.textContent = provider.name;
                    designerSelect.appendChild(option);
                });
            } else {
                designerSelect.innerHTML = "<option>No providers available yet.</option>";
            }
        })
        .catch(error => {
            console.error("Error fetching providers:", error);
            designerSelect.innerHTML = "<option>Error loading providers.</option>";
        });

    // When customer picks a provider, save the assignment
    designerSelect.addEventListener("change", function () {
        const providerId = this.value;
        const customerId = window.customerId;
        if (!providerId || !customerId) return;

        fetch("http://localhost:5501/select-provider", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ customerId, providerId })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                console.log("✅ Provider selected and saved.");
            }
        })
        .catch(err => console.error("Error saving provider selection:", err));
    });
}



// Function to validate designer selection
function validateDesignerSelection() {
    const designerSelect = document.getElementById("designerSelect");
    if (!designerSelect) {
        console.error("designer select dropdown not found.");
        return null;
    }

    const selectedDesignerId = designerSelect.value;
    console.log("Selected Designer ID:", selectedDesignerId); // Debugging log

    if (!selectedDesignerId) {
        alert("Please select an designerfirst.");
        return null;
    }
    return selectedDesignerId;
}

// Function to upload design
function uploadDesign(event) {
    event.preventDefault();

    if (!window.customerId) {
        console.error("Customer ID is not available.");
        return alert("Customer ID is missing. Please log in again.");
    }

    const selectedDesignerId = validateDesignerSelection();
    if (!selectedDesignerId) return;

    const fileInput = document.getElementById("designFile");
    if (!fileInput?.files.length) {
        return alert("Please select a file.");
    }

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    formData.append("customerId", window.customerId);
    formData.append("designerId", selectedDesignerId);

    console.log("Sending data:", {
        customerId: window.customerId,
        designerId: selectedDesignerId,
    });

    fetch("http://127.0.0.1:5501/upload-design", {
        method: "POST",
        body: formData,
        credentials: "include",
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || "Upload successful!");
    })
    .catch(error => {
        console.error("Error during upload:", error);
        alert("Upload failed. Please try again.");
    });
}


// Function to submit measurements

   const garmentTypeSelect = document.getElementById("garmentType");
const fieldsContainer = document.getElementById("fieldsContainer");

// Define measurement fields for each garment type
const measurementFields = {
  dress: [
    "Waist (cm)", "Bust (cm)", "Hips (cm)", "Bodice (cm)",
    "Full Length (cm)", "Sleeve Length (cm)", "Shoulder (cm)"
  ],
  trouser: [
    "Waist (cm)", "Hips (cm)", "Full Length (cm)", "Trouser Length (cm)",
    "Inseam (cm)", "Thigh (cm)", "Knee (cm)"
  ],
  shirt: [
    "Chest (cm)", "Waist (cm)", "Shoulder (cm)", "Sleeve Length (cm)",
    "Shirt Length (cm)", "Neck (cm)"
  ],
  skirt: [
    "Waist (cm)", "Hips (cm)", "Skirt Length (cm)"
  ],
  coat: [
    "Chest (cm)", "Waist (cm)", "Shoulder (cm)", "Sleeve Length (cm)",
    "Full Length (cm)", "Back Width (cm)"
  ]
};

// Dynamically render fields based on selection
garmentTypeSelect.addEventListener("change", () => {
  const selectedGarment = garmentTypeSelect.value;
  fieldsContainer.innerHTML = "";

  if (selectedGarment && measurementFields[selectedGarment]) {
    measurementFields[selectedGarment].forEach(label => {
      const div = document.createElement("div");
      div.classList.add("form-field");
      div.innerHTML = `
        <label style="color:white;">${label}</label>
        <input type="number" step="0.1" name="${label}" required class="form-input" />
      `;
      fieldsContainer.appendChild(div);
    });
  }
});

// Handle form submission
document.getElementById("measurementForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedGarment = garmentTypeSelect.value;
  if (!selectedGarment) return alert("Please select a garment type!");

  const selectedDesignerId = validateDesignerSelection();
  if (!selectedDesignerId) return;

  if (!window.customerId) {
    alert("Customer ID missing. Please log in again.");
    return;
  }

  const data = {
    garmentType: selectedGarment,
    measurements: {},
    designerId: selectedDesignerId,
    userId: window.customerId
  };

  document.querySelectorAll("#fieldsContainer input").forEach(input => {
    const label = input.previousElementSibling.textContent.replace("(cm)", "").trim();
    data.measurements[label] = input.value;
  });

  console.log("📏 Sending Measurements:", data);

  try {
    const res = await fetch("http://127.0.0.1:5501/submit-measurements", {
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

// Function to refresh chat messages
function refreshChat() {
    if (!window.customerId) {
        console.error("Customer ID is not available yet.");
        return;
    }

    const selectedDesignerId = validateDesignerSelection();
    if (!selectedDesignerId) return;

    fetch(`http://127.0.0.1:5501/chat/${window.customerId}/${selectedDesignerId}`, { credentials: "include" })
    .then(response => response.json())
    .then(data => {
        const chatMessages = document.getElementById("chat-messages");
        
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
        document.getElementById("chat-messages").innerHTML = "<li>Error loading chat.</li>";
    });
}

// Function to log out user
function logoutUser() {
    fetch("http://127.0.0.1:5501/logout", {
        method: "POST",
        credentials: "include"
    })
    .then(response => response.json())
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
    .catch(error => {
        console.error("Logout error:", error);
        window.location.href = "business-select.html";
    });
}

// Function to show the selected tab
function showTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
        tab.style.display = "";
    });
    const target = document.getElementById(tabId);
    if (target) target.classList.add("active");

    if (tabId === "view-previews") viewPreviews();
    if (tabId === "chat") refreshChat();
}

// Show/hide M-Pesa form when payment method changes 
function showMpesaPaymentOption() {
    const method = document.getElementById("paymentMethod").value;
    const mpesaForm = document.getElementById("mpesaPaymentForm");

    if (method === "mpesa") {
        mpesaForm.style.display = "block";
    } else {
        mpesaForm.style.display = "none";
    }
}

// Function to handle M-Pesa payment
function initiateMpesaPayment() {
    const mpesaNumber = document.getElementById("mpesaNumber").value.trim();
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

    fetch("http://127.0.0.1:5501/api/mpesa/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            customerPhone: mpesaNumber,
            amount: parseFloat(amount),
            customerId: window.customerId || 1,
        }),
    })
    .then(response => response.json())
    .then(data => {
        paymentMessage.textContent = data.message || "✅ Check your phone to enter your M-Pesa PIN.";
        paymentMessage.style.color = "green";
    })
    .catch(error => {
        console.error("Payment error:", error);
        paymentMessage.textContent = "❌ Failed to initiate M-Pesa payment.";
        paymentMessage.style.color = "red";
    });
}

// Function to send a chat message
function sendCustomerMessage() {
    const message = document.getElementById("customerMessage").value.trim();
    const chatMessages = document.getElementById("chat-messages");
    const selectedDesignerId = validateDesignerSelection();

    if (!selectedDesignerId || !message) {
        alert("Message cannot be empty.");
        return;
    }

    fetch("http://127.0.0.1:5501/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sender: "customer",
            message,
            designerId: selectedDesignerId,
            customerId
        }),
        credentials: "include"
    })
    .then(response => response.json())
    .then(() => {
        chatMessages.innerHTML += `<li><strong>Customer:</strong> ${message}</li>`;
        document.getElementById("customerMessage").value = "";
    })
    .catch(error => {
        console.error("Message sending failed:", error);
    });
}

function viewPreviews() {
    const selectedDesignerId = validateDesignerSelection();
    if (!selectedDesignerId) return;

    fetch(`http://127.0.0.1:5501/product-previews/${selectedDesignerId}`, { credentials: "include" })
    .then(response => response.json())
    .then(data => {
        const previewList = document.getElementById("preview-list");
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
        document.getElementById("preview-list").innerHTML = "<li>Error loading previews.</li>";
    });
}
// NOTE: askTailoringAI is defined in the inline script in customer-dashboard.html
