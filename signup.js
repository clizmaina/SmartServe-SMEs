document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("businessCategory").value = localStorage.getItem("businessType") || "";

    function getBase() { return (window.API_BASE) || "https://smartserve-smes.onrender.com"; }

    const signupForm   = document.getElementById("signup-form");
    const otpSection   = document.getElementById("otpSection");
    const otpMessage   = document.getElementById("otpMessage");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const resendBtn    = document.getElementById("resendBtn");
    const phoneSection = document.getElementById("phoneSection");
    const saveBtn      = document.getElementById("saveDetailsBtn");
    const saveMsg      = document.getElementById("saveDetailsMsg");

    let pendingUserId   = null;
    let pendingUserRole = null;

    // ── STEP 1: Send email OTP ────────────────────────────────────────────────
    signupForm.addEventListener("submit", async (e) => { e.preventDefault(); await sendEmailOtp(); });
    resendBtn.addEventListener("click",   async () => { await sendEmailOtp(); });

    async function sendEmailOtp() {
        const name     = document.getElementById("name").value.trim();
        const email    = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const role     = document.getElementById("userType").value;
        const bt       = localStorage.getItem("businessType");

        if (!name || !email || !password || !role || !bt) {
            alert("❌ Please fill in all fields and make sure you selected a business type.");
            return;
        }

        const btn = document.getElementById("sendOtpBtn");
        btn.disabled = true; btn.textContent = "Sending…";

        try {
            const res  = await fetch(getBase() + "/send-otp", {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ name, email, password, role, businessType: bt })
            });
            const data = await res.json();

            if (data.success) {
                otpSection.classList.add("visible");
                if (data.otp) {
                    document.getElementById("otpInput").value = data.otp;
                    otpMessage.innerHTML = `
                        <div style="background:#e8f5e9;border:2px solid #006600;border-radius:10px;padding:16px;text-align:center;">
                            <div style="font-size:0.85rem;color:#555;margin-bottom:8px;">Your verification code:</div>
                            <div style="font-size:2rem;font-weight:bold;letter-spacing:8px;color:#006600;">${data.otp}</div>
                            <div style="font-size:0.78rem;color:#888;margin-top:8px;">Code pre-filled. Click "Verify Email Code" to continue.</div>
                        </div>`;
                } else {
                    otpMessage.textContent = data.message || `✅ A 6-digit code was sent to ${email}. Check your inbox.`;
                }
            } else {
                alert("❌ " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Server error. Please try again.");
        } finally {
            btn.disabled = false; btn.textContent = "Send Verification Code";
        }
    }

    // ── STEP 2: Verify email OTP → show personal details form ────────────────
    verifyOtpBtn.addEventListener("click", async () => {
        const email = document.getElementById("email").value.trim();
        const otp   = document.getElementById("otpInput").value.trim();
        const bt    = localStorage.getItem("businessType");

        if (!otp || otp.length !== 6) { alert("❌ Please enter the 6-digit code."); return; }

        verifyOtpBtn.disabled = true; verifyOtpBtn.textContent = "Verifying…";

        try {
            const res  = await fetch(getBase() + "/signup", {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ email, businessType: bt, otp })
            });
            const data = await res.json();

            if (data.success) {
                pendingUserId   = data.userId;
                pendingUserRole = data.role;

                if (data.requiresSubscription) {
                    // Provider — go to subscription page
                    localStorage.setItem("pendingProviderId", data.userId);
                    localStorage.setItem("pendingProviderRole", data.role);
                    window.location.href = "provider-subscription.html";
                } else {
                    // Show personal details step
                    otpSection.classList.remove("visible");
                    phoneSection.classList.add("visible");
                }
            } else {
                alert("❌ " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Server error. Please try again.");
        } finally {
            verifyOtpBtn.disabled = false; verifyOtpBtn.textContent = "Verify Email Code";
        }
    });

    // ── STEP 3: Save phone + ID then redirect to login ────────────────────────
    saveBtn.addEventListener("click", async () => {
        const phone = document.getElementById("phoneNumber").value.trim();
        const idNum = document.getElementById("idNumber").value.trim();

        if (!pendingUserId) {
            // No userId — account was already created, just go to login
            window.location.href = "signin.html";
            return;
        }

        saveBtn.disabled = true; saveBtn.textContent = "Saving…";
        saveMsg.style.color = "rgba(0,102,0,0.8)";
        saveMsg.textContent = "Saving your details…";

        try {
            await fetch(getBase() + "/save-personal-details", {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ userId: pendingUserId, phone, idNumber: idNum })
            });
            // Redirect regardless of save result — account is already created
        } catch (err) {
            console.error(err);
        }

        saveMsg.style.color = "#006600";
        saveMsg.textContent = "✅ Registration complete! Redirecting to login…";
        setTimeout(() => { window.location.href = "signin.html"; }, 1200);
    });
});
