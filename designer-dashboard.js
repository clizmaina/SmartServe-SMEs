// ── Central API base ──────────────────────────────────────────────────────
function getBase() { return (window.API_BASE) || "https://smartserve-smes.onrender.com"; }

// Track if initialization has already run to prevent duplicate listeners
window._designerDashboardInitialized = window._designerDashboardInitialized || false;

// Request abort controller for cleanup
window._designerAbortController = new AbortController();

// Diagnostic load marker
console.log("designer-dashboard.js loaded");

document.addEventListener("DOMContentLoaded", function () {
    // Prevent duplicate initialization
    if (window._designerDashboardInitialized) {
        console.warn("Designer dashboard already initialized, skipping duplicate setup");
        return;
    }
    window._designerDashboardInitialized = true;
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.role !== "designer") {
        window.location.replace("business-select.html");
        return;
    }
    // Prevent back-button access after logout
    history.replaceState(null, '', window.location.href);

    console.log("Designer ID:", userData.id); // Debugging

    // Store designer ID globally for later use
    window.designerId = userData.id;

    setupEventListeners();
    initializeTabs();
    fetchDesigners();
    fetchCustomers();
});

function setupEventListeners() {
    // Only setup if not already done
    if (window._listenersSetup) {
        console.log("Event listeners already setup, skipping duplicate setup");
        return;
    }
    window._listenersSetup = true;

    const customerSelect = document.getElementById("customerSelect");
    const designerSelect = document.getElementById("designerSelect");
    const uploadPreviewButton = document.getElementById("uploadPreviewButton");
    const sendDesignerMessageButton = document.getElementById("sendDesignerMessageButton");

    if (customerSelect) {
        customerSelect.addEventListener("change", handleCustomerSelection);
    } else {
        console.error("Customer select dropdown not found.");
    }

    if (designerSelect) {
        designerSelect.addEventListener("change", function () {
            // When a designer is chosen, set global designerId and reload assigned customers
            if (this.value) {
                window.designerId = this.value;
            }
            fetchCustomers();
            clearCustomerData();
        });
    } else {
        console.warn("designerSelect dropdown not found (optional).");
    }

    if (uploadPreviewButton) {
        uploadPreviewButton.addEventListener("click", uploadPreview);
    } else {
        console.error("Upload Preview Button not found.");
    }

    if (sendDesignerMessageButton) {
        sendDesignerMessageButton.addEventListener("click", sendDesignerMessage);
    } else {
        console.error("Send Designer Message Button not found.");
    }
}

function initializeTabs() {
    showTab("customer-selection");
}

function handleCustomerSelection() {
    const customerId = this.value;
    if (customerId) {
        fetchCustomerData(customerId);
    } else {
        clearCustomerData();
    }
}

function fetchCustomerData(customerId) {
    const designerId = window.designerId;
    if (!designerId) {
        console.error("Designer ID missing in fetchCustomerData");
        return;
    }

    fetchCustomerDesigns(customerId, designerId);
    fetchCustomerMeasurements(customerId, designerId);
    fetchCustomerPayments(customerId);
    fetchCustomerChat(customerId, designerId);
    fetchCustomerDelivery(customerId, designerId);
}


function showTab(tabId) {
    try {
        // Validate tab ID
        if (!tabId || typeof tabId !== 'string') {
            console.error("Invalid tab ID:", tabId);
            return;
        }

        // Remove active class from all tabs
        const tabs = document.querySelectorAll(".tab-content");
        tabs.forEach(tab => {
            tab.classList.remove("active");
        });

        // Add active class to selected tab
        const targetTab = document.getElementById(tabId);
        if (!targetTab) {
            console.error(`Tab with id "${tabId}" not found in DOM`);
            return;
        }
        targetTab.classList.add("active");

        // Highlight active nav link
        const navLinks = document.querySelectorAll(".sidebar a[onclick*='showTab']");
        navLinks.forEach(link => {
            link.classList.remove("active");
        });
        
        const activeLink = document.querySelector(`.sidebar a[onclick="showTab('${tabId}')"]`);
        if (activeLink) {
            activeLink.classList.add("active");
        }

        // Reload delivery info when that tab is opened
        if (tabId === "customer-delivery") {
            const customerId = document.getElementById("customerSelect")?.value;
            if (customerId) {
                fetchCustomerDelivery(customerId, window.designerId);
            }
        }

        // Load inventory when that tab is opened
        if (tabId === "inventory") {
            fetchInventory();
        }

        // Load stock manager when that tab is opened
        if (tabId === "stock-manager") {
            if (typeof smLoad === 'function') {
                smLoad();
            }
        }
    } catch (e) {
        console.error("Error in showTab:", e);
    }
}
const baseUrl = `${getBase()}/`;

function fetchCustomerDesigns(customerId, designerId) {
  if (!customerId || !designerId) {
    console.error("Missing customerId or designerId");
    return;
  }
fetch(`${getBase()}/customer-designs/${customerId}/${designerId}`, { credentials: "include" })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
          const designList = document.getElementById("design-list");
          if (!designList) { console.warn('design-list element not found'); return; }
          designList.innerHTML = "";
        if (data.success && data.designs.length > 0) {
          data.designs.forEach(design => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
              <img src="${getBase()}${design.file_path}"
                   alt="Design"
                   style="width: 200px; border-radius: 5px; margin: 10px 0;">
              <p>Uploaded on: ${new Date(design.created_at).toLocaleString()}</p>
            `;
            designList.appendChild(listItem);
          });
        } else {
          designList.innerHTML = "<p>No designs uploaded yet.</p>";
        }
      })
      .catch(error => {
        console.error("Error fetching designs:", error);
        document.getElementById("design-list").innerHTML = "<p>Error loading designs.</p>";
      });
  }

 // ✅ Function to fetch and display a customer's measurements
 function fetchCustomerMeasurements(customerId) {
    fetch(`${getBase()}/customer-measurements/${customerId}/${window.designerId}`, { credentials: "include" })
      .then(response => response.json())
            .then(data => {
                const measurementInfo = document.getElementById("measurement-info");
                if (!measurementInfo) { console.warn('measurement-info element not found'); return; }
                measurementInfo.innerHTML = ""; // Clear previous content

            if (data.success && Array.isArray(data.measurements) && data.measurements.length > 0) {
                data.measurements.forEach(set => {
                    const section = document.createElement("div");
                    section.classList.add("measurement-set");
                    section.style.marginBottom = "15px";
                    section.style.padding = "10px";
                    section.style.border = "1px solid #444";
                    section.style.borderRadius = "8px";
                    section.style.color = "white";

                    const garmentLabel = set.garmentType || set.garment_type || set.garment || 'Garment';
                    const header = document.createElement("h3");
                    header.textContent = `👕 Garment Type: ${garmentLabel}`;
                    header.style.marginBottom = "8px";

                    const list = document.createElement("ul");
                    list.style.listStyle = "disc";
                    list.style.marginLeft = "20px";

                    const measurementsObj = set.measurements || set.measurement || set.values || {};
                    for (const [key, value] of Object.entries(measurementsObj)) {
                        const item = document.createElement("li");
                        item.textContent = `${key}: ${value} cm`;
                        list.appendChild(item);
                    }

                    section.appendChild(header);
                    section.appendChild(list);
                    measurementInfo.appendChild(section);
                });
            } else {
                measurementInfo.textContent = "No measurements uploaded by the customer.";
            }
        })
    .catch(error => {
      console.error("❌ Error fetching customer measurements:", error);
      document.getElementById("measurement-info").textContent = "Error loading measurements.";
    });
}

function fetchCustomerPayments(customerId) {
    fetch(`${getBase()}/customer-payments/${customerId}`, { credentials: "include" })
        .then(response => response.json())
        .then(data => {
            const paymentList = document.getElementById("payment-list");
            if (!paymentList) { console.warn('payment-list element not found'); return; }
            paymentList.innerHTML = "";
            if (data.success && Array.isArray(data.payments) && data.payments.length > 0) {
                data.payments.forEach(payment => {
                    const listItem = document.createElement("li");
                    listItem.innerHTML = `
                        <p>Amount: ${payment.amount}</p>
                        <p>Date: ${payment.date}</p>
                        <p>Status: ${payment.status}</p>
                    `;
                    paymentList.appendChild(listItem);
                });
            } else {
                paymentList.innerHTML = "<p>No payment records found.</p>";
            }
        })
        .catch(error => console.error("Error fetching customer payments:", error));
}

function fetchCustomerChat(customerId,designerId) {
   fetch(`${getBase()}/chat/${customerId}/${designerId}`, { credentials: "include" })
        .then(response => response.json())
        .then(data => {
            const chatDisplay = document.getElementById("chat-display");
            if (!chatDisplay) { console.warn('chat-display element not found'); return; }
            chatDisplay.innerHTML = "";
            if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
                data.messages.forEach(msg => {
                    const msgElement = document.createElement("p");
                    msgElement.innerHTML = `<strong>${msg.sender}:</strong> ${msg.message}`;
                    chatDisplay.appendChild(msgElement);
                });
            } else {
                chatDisplay.innerHTML = "<p>No chat messages yet.</p>";
            }
        })
        .catch(error => console.error("Error fetching chat messages:", error));
}

function clearCustomerData() {
    const elDesign = document.getElementById("design-list"); if (elDesign) elDesign.innerHTML = "";
    const elMeas = document.getElementById("measurement-info"); if (elMeas) elMeas.innerHTML = "";
    const elPay = document.getElementById("payment-list"); if (elPay) elPay.innerHTML = "";
    const elChat = document.getElementById("chat-display"); if (elChat) elChat.innerHTML = "";
    const elDel = document.getElementById("delivery-info-box"); if (elDel) elDel.innerHTML = "<p style='color:rgba(255,255,255,0.4);'>Select a customer first to view their delivery preference.</p>";
}
function fetchDesigners() {
    const designerSelect = document.getElementById("designerSelect");
    if (!designerSelect) return;

    fetch(`${getBase()}/available-designer`, { credentials: "include" })
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then(({ status, data }) => {
            console.log("Designer API Response:", status, data);
            designerSelect.innerHTML = "<option value=''>Select a designer</option>";
            if (data.designer?.length) {
                data.designer.forEach(designer => {
                    let option = document.createElement("option");
                    option.value = designer.id;
                    option.textContent = designer.name;
                    designerSelect.appendChild(option);
                });
            } else {
                designerSelect.innerHTML = "<option>No designer available.</option>";
            }
        })
        .catch(error => console.error("Error fetching designer:", error));
}

function fetchCustomers() {
    const designerId = window.designerId;
    fetch(`${getBase()}/my-customers/${designerId}`, { credentials: "include" })
        .then(response => response.json())
        .then(data => {
            const customerSelect = document.getElementById("customerSelect");
            if (!customerSelect) return;

            customerSelect.innerHTML = `<option value="" disabled selected>Select Customer</option>`;

            if (data.customers && data.customers.length > 0) {
                data.customers.forEach(customer => {
                    const option = document.createElement("option");
                    option.value = customer.id;
                    option.textContent = `${customer.name} (${customer.email})`;
                    customerSelect.appendChild(option);
                });
            } else {
                customerSelect.innerHTML = `<option value="" disabled selected>No customers assigned yet</option>`;
            }
        })
        .catch(error => console.error("Error fetching assigned customers:", error));
}


function uploadPreview(event) {
    event.preventDefault();

    const fileInput = document.getElementById("previewImage");
    const previewMessage = document.getElementById("preview-message");
    const customerId = document.getElementById("customerSelect")?.value;
    const userData = JSON.parse(localStorage.getItem("user"));
    const designerId = userData ? userData.id : null;

    if (!customerId) {
        alert("Please select a customer first.");
        return;
    }
    if (!designerId) {
        alert("Designer ID is missing. Please log in again.");
        return;
    }
    if (!fileInput || fileInput.files.length === 0) {
        if (previewMessage) previewMessage.textContent = "Please select a file.";
        return;
    }

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    formData.append("customerId", customerId);
    formData.append("designerId", designerId);  // ✅ Now sending designerId

    console.log("Uploading preview for Customer ID:", customerId, "DesignerID:", designerId);

    fetch(`${getBase()}/upload-preview`, {
        method: "POST",
        body: formData,
        credentials: "include"
    })
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then(({ status, data }) => {
            console.log("Upload Preview Response:", status, data);
            if (previewMessage) previewMessage.textContent = data.message || "Upload successful!";
        })
        .catch(error => {
            console.error("Upload failed:", error);
            if (previewMessage) previewMessage.textContent = "Upload failed. Please try again.";
        });
}

function sendDesignerMessage(event) {
    event.preventDefault();

    const messageInput = document.getElementById("designerMessage");
    const customerSelect = document.getElementById("customerSelect");

    if (!messageInput) {
        console.error("designerMessage input not found in DOM.");
        return;
    }
    if (!customerSelect) {
        console.error("customerSelect dropdown not found in DOM.");
        alert("Customer selection field missing. Please reload the page.");
        return;
    }

    const message = messageInput.value.trim();
    const customerId = customerSelect.value;

    const userData = JSON.parse(localStorage.getItem("user"));
    const designerId = userData ? userData.id : null;
    
    if (!customerId) {
        alert("Please select a customer first.");
        return;
    }
    if (!designerId) {
        alert("Designer ID is missing. Please log in again.");
        return;
    }
    if (!message) {
        alert("Message cannot be empty.");
        return;
    }

    const requestData = { sender: "designer", message, customerId, designerId };
    console.log("Sending data:", requestData);

    fetch(`${getBase()}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
        credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const chatDisplay = document.getElementById("chat-display");
            if (chatDisplay) chatDisplay.innerHTML += `<p><strong>Designer:</strong> ${message}</p>`;
            messageInput.value = "";
        } else {
            console.error("Server error:", data);
            alert("Message sending failed.");
        }
    })
    .catch(error => {
        console.error("Message sending failed:", error);
    });
}


function logoutDesigner() {
    // Abort all pending requests
    if (window._designerAbortController) {
        window._designerAbortController.abort();
        window._designerAbortController = new AbortController();
    }

    fetch(`${getBase()}/logout`, { method: "POST", credentials: "include" })
        .then(response => response.json())
        .then(data => {
            console.log("Logout Response:", data);
            if (data.success) {
                // Clear all cached data and state
                clearDesignerState();
                localStorage.removeItem('user');
                localStorage.removeItem('businessType');
                window.location.replace("business-select.html");
            } else {
                alert("Logout failed.");
            }
        })
        .catch(error => console.error("Logout Error:", error));
}

// Function to clean up all designer state when logging out
function clearDesignerState() {
    // Clear global state
    window.designerId = null;
    window._invData = null;
    window._deliveredOrders = null;
    window._smTrends = null;
    window._designerDashboardInitialized = false;
    window._listenersSetup = false;

    // Clear element content
    const elementsToClean = [
        "design-list", "measurement-info", "payment-list", "chat-display",
        "delivery-info-box", "tbl-customers", "tbl-designs", "tbl-measurements",
        "tbl-deliveries", "tbl-previews", "tbl-delivered-orders",
        "sm-grid", "sm-trends-chart", "sm-top-grid", "sm-orders-list"
    ];
    elementsToClean.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });

    console.log("Designer state cleared");
}


// ✅ Fetch and display customer delivery preference
function fetchCustomerDelivery(customerId, designerId) {
    const box = document.getElementById("delivery-info-box");
    if (!box) return;

    if (!customerId || !designerId) {
        box.innerHTML = "<p style='color:rgba(255,255,255,0.4);'>Select a customer first.</p>";
        return;
    }

    box.innerHTML = "<p style='color:rgba(212,168,67,0.6);'>Loading…</p>";

    fetch(`${getBase()}/delivery-preference/${customerId}/${designerId}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            // Show the mark-delivered section whenever a customer is selected
            const markSection = document.getElementById("mark-delivered-section");
            if (markSection) {
                markSection.style.display = "block";
                // Reset button state when switching customers
                const btn = document.getElementById("markDeliveredBtn");
                const delivMsg = document.getElementById("deliveredMsg");
                if (btn) { btn.disabled = false; btn.textContent = "🚚 Mark as Delivered & Save to Inventory"; }
                if (delivMsg) delivMsg.textContent = "";
            }

            if (!data.success || !data.preference) {
                box.innerHTML = `
                  <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
                               border-radius:10px; padding:16px 20px; color:rgba(255,255,255,0.5); font-size:0.88rem;">
                    ℹ️ This customer has not set a delivery preference yet.
                  </div>`;
                return;
            }

            const p = data.preference;
            const isDelivery = p.delivery_type === "delivery";
            const typeColor  = isDelivery ? "#60a5fa" : "#4ade80";
            const typeIcon   = isDelivery ? "🚚" : "🏪";
            const typeLabel  = isDelivery ? "Home Delivery" : "Pick Up from Shop";

            box.innerHTML = `
              <div style="display:flex; flex-direction:column; gap:14px;">

                <!-- Type badge -->
                <div style="display:inline-flex; align-items:center; gap:10px;
                             background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12);
                             border-radius:12px; padding:14px 20px;">
                  <span style="font-size:2rem;">${typeIcon}</span>
                  <div>
                    <p style="font-size:0.78rem; color:rgba(255,255,255,0.45); margin-bottom:2px;">Delivery Option</p>
                    <p style="font-size:1.05rem; font-weight:600; color:${typeColor};">${typeLabel}</p>
                  </div>
                </div>

                ${isDelivery && p.address ? `
                <!-- Address -->
                <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
                             border-radius:10px; padding:14px 18px;">
                  <p style="font-size:0.78rem; color:rgba(255,255,255,0.45); margin-bottom:4px;">📍 Delivery Address</p>
                  <p style="font-size:0.92rem; color:rgba(255,255,255,0.9);">${p.address}</p>
                </div>` : ""}

                ${isDelivery && p.location_notes ? `
                <!-- Notes -->
                <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
                             border-radius:10px; padding:14px 18px;">
                  <p style="font-size:0.78rem; color:rgba(255,255,255,0.45); margin-bottom:4px;">🗺️ Location Notes</p>
                  <p style="font-size:0.92rem; color:rgba(255,255,255,0.9);">${p.location_notes}</p>
                </div>` : ""}

                <!-- Timestamp -->
                <p style="font-size:0.75rem; color:rgba(255,255,255,0.3);">
                  Last updated: ${new Date(p.updated_at).toLocaleString()}
                </p>
              </div>`;
        })
        .catch(err => {
            console.error("❌ Error fetching delivery preference:", err);
            box.innerHTML = "<p style='color:#ff8a9a;'>Error loading delivery preference.</p>";
        });
}

// ============================================================
// ✅ MARK TAILORING ORDER AS DELIVERED
// ============================================================

async function markTailoringDelivered() {
    const btn = document.getElementById("markDeliveredBtn");
    const msg = document.getElementById("deliveredMsg");
    const customerId = document.getElementById("customerSelect")?.value;
    const designerId = window.designerId;

    if (!customerId || !designerId) {
        msg.style.color = "#ffd700";
        msg.textContent = "⚠️ Please select a customer first.";
        return;
    }

    btn.disabled = true;
    btn.textContent = "⏳ Saving...";
    msg.textContent = "";

    try {
        const res  = await fetch(`${getBase()}/tailoring/mark-delivered`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ designerId, customerId })
        });
        const data = await res.json();

        if (data.success) {
            msg.style.color = "#4ade80";
            msg.textContent = "✅ " + data.message;
            btn.textContent = "✅ Delivered";
        } else {
            msg.style.color = "#ff8a9a";
            msg.textContent = "❌ " + (data.message || "Failed to save.");
            btn.disabled = false;
            btn.textContent = "🚚 Mark as Delivered & Save to Inventory";
        }
    } catch (err) {
        console.error("❌ Error marking delivery:", err);
        msg.style.color = "#ff8a9a";
        msg.textContent = "❌ Could not connect to server.";
        btn.disabled = false;
        btn.textContent = "🚚 Mark as Delivered & Save to Inventory";
    }
}

// ============================================================
// ✅ INVENTORY — all customer records in one place
// ============================================================

// Raw data cache for filtering
window._invData = null;

async function fetchInventory() {
    // Wait for designerId to be set (retry up to 3 seconds)
    let designerId = window.designerId;
    if (!designerId) {
        const userData = JSON.parse(localStorage.getItem("user"));
        designerId = userData?.id;
        if (designerId) window.designerId = designerId;
    }
    if (!designerId) {
        showInvError("Please log in as a designer to view inventory.");
        return;
    }

    // Cancel previous requests if any
    if (window._inventoryAbortController) {
        window._inventoryAbortController.abort();
    }
    window._inventoryAbortController = new AbortController();
    const signal = window._inventoryAbortController.signal;

    // Show loading state in all tables
    ["customers","designs","measurements","deliveries","previews","delivered-orders"].forEach(s => {
        const cols = { customers:3, designs:4, measurements:5, deliveries:6, previews:4, "delivered-orders":6 };
        const el = document.getElementById("tbl-" + s);
        if (el) el.innerHTML = `<tr><td colspan="${cols[s]}" class="inv-empty">⏳ Loading…</td></tr>`;
    });

    try {
        const [invRes, delRes] = await Promise.all([
            fetch(`${getBase()}/designer-inventory/${designerId}`, { credentials: "include", signal }),
            fetch(`${getBase()}/tailoring/delivered-inventory/${designerId}`, { credentials: "include", signal })
        ]);

        // Handle request abortion
        if (signal.aborted) {
            console.log("Inventory fetch was aborted");
            return;
        }

        // Handle inventory response
        if (!invRes.ok) {
            const txt = await invRes.text().catch(() => "");
            console.error("Inventory API error:", invRes.status, invRes.statusText, txt);
            showInvError(`Failed to load inventory (status ${invRes.status}).`);
            // clear stats
            ["stat-customers","stat-designs","stat-measurements","stat-pickup","stat-delivery","stat-previews"].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = "-";
            });
            return;
        }

        const data = await invRes.json().catch(e => {
            console.error("Failed to parse inventory JSON:", e);
            return null;
        });

        if (!data || !data.success) {
            const msg = data && data.message ? data.message : "Failed to load inventory.";
            console.error("Inventory fetch returned error:", msg, data);
            showInvError(msg);
            return;
        }

        // Delivered inventory is optional; tolerate failures
        let delData = { items: [] };
        if (delRes && delRes.ok) {
            delData = await delRes.json().catch(e => {
                console.warn("Could not parse delivered-inventory JSON:", e);
                return { items: [] };
            });
        } else if (delRes && !delRes.ok) {
            console.warn("Delivered-inventory API returned non-OK status:", delRes.status);
        }

        // Cache for filtering
        window._invData = data;
        window._deliveredOrders = (delData && delData.items) ? delData.items : [];

        // Update stats (use safe defaults)
        const stats = data.stats || {};
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setEl("stat-customers",    stats.totalCustomers    ?? 0);
        setEl("stat-designs",      stats.totalDesigns      ?? 0);
        setEl("stat-measurements", stats.totalMeasurements ?? 0);
        setEl("stat-pickup",       stats.pickupCount       ?? 0);
        setEl("stat-delivery",     stats.deliveryCount     ?? 0);
        setEl("stat-previews",     stats.totalPreviews     ?? 0);

        renderInventory(data, "");

    } catch (err) {
        // Don't log abort errors as they're expected
        if (err.name !== "AbortError") {
            console.error("❌ Inventory fetch error:", err);
            showInvError(err && err.message ? err.message : "Error connecting to server.");
        }
    }
}

function renderInventory(data, searchTerm) {
    const q = searchTerm.toLowerCase().trim();

    // ── Customers ──
    const customers = data.customers.filter(c =>
        !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
    if (document.getElementById("count-customers")) {
        document.getElementById("count-customers").textContent = `(${customers.length})`;
    }
    const tblC = document.getElementById("tbl-customers");
    if (customers.length === 0) {
        tblC.innerHTML = `<tr><td colspan="3" class="inv-empty">No customers found.</td></tr>`;
    } else {
        tblC.innerHTML = customers.map((c, i) => `
            <tr>
              <td style="color:rgba(255,255,255,0.35);">${i + 1}</td>
              <td><strong style="color:#fff;">${escHtml(c.name)}</strong></td>
              <td style="color:rgba(255,255,255,0.6);">${escHtml(c.email)}</td>
            </tr>`).join("");
    }

    // ── Designs ──
    const designs = data.designs.filter(d =>
        !q || d.customer_name.toLowerCase().includes(q)
    );
    if (document.getElementById("count-designs")) {
        document.getElementById("count-designs").textContent = `(${designs.length})`;
    }
    const tblD = document.getElementById("tbl-designs");
    if (designs.length === 0) {
        tblD.innerHTML = `<tr><td colspan="4" class="inv-empty">No designs uploaded yet.</td></tr>`;
    } else {
        tblD.innerHTML = designs.map((d, i) => `
            <tr>
              <td style="color:rgba(255,255,255,0.35);">${i + 1}</td>
              <td>
                <img src="${getBase()}${escHtml(d.file_path)}"
                     class="inv-thumb"
                     alt="design"
                     onclick="window.open('${getBase()}${escHtml(d.file_path)}','_blank')"
                     onerror="this.style.display='none'">
              </td>
              <td><strong style="color:#fff;">${escHtml(d.customer_name)}</strong></td>
              <td style="color:rgba(255,255,255,0.5);">${fmtDate(d.created_at)}</td>
            </tr>`).join("");
    }

    // ── Measurements ──
    const measurements = data.measurements.filter(m =>
        !q || m.customer_name.toLowerCase().includes(q) || m.garment_type.toLowerCase().includes(q)
    );
    if (document.getElementById("count-measurements")) {
        document.getElementById("count-measurements").textContent = `(${measurements.length})`;
    }
    const tblM = document.getElementById("tbl-measurements");
    if (measurements.length === 0) {
        tblM.innerHTML = `<tr><td colspan="5" class="inv-empty">No measurements submitted yet.</td></tr>`;
    } else {
        tblM.innerHTML = measurements.map((m, i) => {
            // Show first 3 key measurements as a summary
            const entries = Object.entries(m.measurements || {}).slice(0, 3);
            const summary = entries.map(([k, v]) => `${k}: <strong>${v} cm</strong>`).join(" &nbsp;·&nbsp; ");
            return `
            <tr>
              <td style="color:rgba(255,255,255,0.35);">${i + 1}</td>
              <td><strong style="color:#fff;">${escHtml(m.customer_name)}</strong></td>
              <td><span class="badge badge-garment">${escHtml(m.garment_type)}</span></td>
              <td style="color:rgba(255,255,255,0.7); font-size:0.82rem;">${summary || "—"}</td>
              <td style="color:rgba(255,255,255,0.5);">${fmtDate(m.created_at)}</td>
            </tr>`;
        }).join("");
    }

    // ── Deliveries ──
    const deliveries = data.deliveries.filter(d =>
        !q || d.customer_name.toLowerCase().includes(q)
    );
    if (document.getElementById("count-deliveries")) {
        document.getElementById("count-deliveries").textContent = `(${deliveries.length})`;
    }
    const tblDel = document.getElementById("tbl-deliveries");
    if (deliveries.length === 0) {
        tblDel.innerHTML = `<tr><td colspan="6" class="inv-empty">No delivery preferences set yet.</td></tr>`;
    } else {
        tblDel.innerHTML = deliveries.map((d, i) => {
            const isDelivery = d.delivery_type === "delivery";
            const badge = isDelivery
                ? `<span class="badge badge-delivery">🚚 Delivery</span>`
                : `<span class="badge badge-pickup">🏪 Pick Up</span>`;
            return `
            <tr>
              <td style="color:rgba(255,255,255,0.35);">${i + 1}</td>
              <td><strong style="color:#fff;">${escHtml(d.customer_name)}</strong></td>
              <td>${badge}</td>
              <td style="color:rgba(255,255,255,0.7);">${d.address ? escHtml(d.address) : "<span style='color:rgba(255,255,255,0.3);'>—</span>"}</td>
              <td style="color:rgba(255,255,255,0.6); font-size:0.82rem;">${d.location_notes ? escHtml(d.location_notes) : "<span style='color:rgba(255,255,255,0.3);'>—</span>"}</td>
              <td style="color:rgba(255,255,255,0.5);">${fmtDate(d.updated_at)}</td>
            </tr>`;
        }).join("");
    }

    // ── Previews ──
    const previews = data.previews.filter(p =>
        !q || p.customer_name.toLowerCase().includes(q)
    );
    if (document.getElementById("count-previews")) {
        document.getElementById("count-previews").textContent = `(${previews.length})`;
    }
    const tblP = document.getElementById("tbl-previews");
    if (previews.length === 0) {
        tblP.innerHTML = `<tr><td colspan="4" class="inv-empty">No previews uploaded yet.</td></tr>`;
    } else {
        tblP.innerHTML = previews.map((p, i) => `
            <tr>
              <td style="color:rgba(255,255,255,0.35);">${i + 1}</td>
              <td>
                <img src="${getBase()}${escHtml(p.image_url)}"
                     class="inv-thumb"
                     alt="preview"
                     onclick="window.open('${getBase()}${escHtml(p.image_url)}','_blank')"
                     onerror="this.style.display='none'">
              </td>
              <td><strong style="color:#fff;">${escHtml(p.customer_name)}</strong></td>
              <td style="color:rgba(255,255,255,0.5);">${fmtDate(p.created_at)}</td>
            </tr>`).join("");
    }

    // ── Delivered Orders ──
    const deliveredOrders = (window._deliveredOrders || []).filter(d =>
        !q || (d.customer_name || "").toLowerCase().includes(q)
    );
    if (document.getElementById("count-delivered-orders")) {
        document.getElementById("count-delivered-orders").textContent = `(${deliveredOrders.length})`;
    }
    const tblDO = document.getElementById("tbl-delivered-orders");
    if (tblDO) {
        if (deliveredOrders.length === 0) {
            tblDO.innerHTML = `<tr><td colspan="6" class="inv-empty">No delivered orders yet.</td></tr>`;
        } else {
            tblDO.innerHTML = deliveredOrders.map((d, i) => {
                const isDelivery = d.delivery_type === "delivery";
                const badge = isDelivery
                    ? `<span class="badge badge-delivery">🚚 Delivery</span>`
                    : `<span class="badge badge-pickup">🏪 Pick Up</span>`;
                return `
                <tr>
                  <td style="color:rgba(255,255,255,0.35);">${i + 1}</td>
                  <td><strong style="color:#fff;">${escHtml(d.customer_name || "—")}</strong></td>
                  <td><span class="badge badge-garment">${escHtml(d.garment_type || "—")}</span></td>
                  <td>${badge}</td>
                  <td style="color:rgba(255,255,255,0.7);">${d.address ? escHtml(d.address) : "<span style='color:rgba(255,255,255,0.3);'>—</span>"}</td>
                  <td style="color:rgba(255,255,255,0.5);">${fmtDate(d.delivered_at)}</td>
                </tr>`;
            }).join("");
        }
    }

    // Apply section filter
    applySectionFilter();
}

function filterInventory() {
    if (!window._invData) return;
    const q = document.getElementById("inv-search-input")?.value || "";
    renderInventory(window._invData, q);
}

function applySectionFilter() {
    const filter = document.getElementById("inv-section-filter")?.value || "all";
    const sections = ["customers", "designs", "measurements", "deliveries", "previews", "delivered-orders"];
    sections.forEach(s => {
        const el = document.getElementById("section-" + s);
        if (el) el.style.display = (filter === "all" || filter === s) ? "block" : "none";
    });
}

function showInvError(msg) {
    ["customers","designs","measurements","deliveries","previews","delivered-orders"].forEach(s => {
        const cols = { customers:3, designs:4, measurements:5, deliveries:6, previews:4, "delivered-orders":6 };
        const el = document.getElementById("tbl-" + s);
        if (el) el.innerHTML = `<tr><td colspan="${cols[s]}" class="inv-empty" style="color:#ff8a9a;">❌ ${msg}</td></tr>`;
    });
}

// Helpers
function escHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function fmtDate(dateStr) {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleDateString("en-KE", {
            day: "2-digit", month: "short", year: "numeric"
        });
    } catch { return dateStr; }
}

// All functionality is now integrated into showTab function above
// No need for additional wrapping
