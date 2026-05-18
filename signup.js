document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("businessCategory").value = localStorage.getItem("businessType") || "";

    function getBase() { return (window.API_BASE) || "https://smartserve-smes.onrender.com"; }

    // ── Elements ──────────────────────────────────────────────────────────────
    const signupForm      = document.getElementById("signup-form");
    const otpSection      = document.getElementById("otpSection");
    const otpMessage      = document.getElementById("otpMessage");
    const verifyOtpBtn    = document.getElementById("verifyOtpBtn");
    const resendBtn       = document.getElementById("resendBtn");
    const phoneSection    = document.getElementById("phoneSection");
    const sendSmsOtpBtn   = document.getElementById("sendSmsOtpBtn");
    const smsOtpSection   = document.getElementById("smsOtpSection");
    const smsOtpMessage   = document.getElementById("smsOtpMessage");
    const verifySmsOtpBtn = document.getElementById("verifySmsOtpBtn");
    const resendSmsBtn    = document.getElementById("resendSmsBtn");

    // Stores userId after email OTP verified (before phone step)
    let pendingUserId   = null;
    let pendingUserRole = null;

    // ══════════════════════════════════════════════════════════════════════════
    // STEP 1 — Send email OTP
    // ══════════════════════════════════════════════════════════════════════════
    signupForm.addEventListener("submit", async (e) => { e.preventDefault(); await sendEmailOtp(); });
    resendBtn.addEventListener("click", async () => { await sendEmailOtp(); });

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
                            <div style="font-size:0.85rem;color:#555;margin-bottom:8px;">Your email verification code:</div>
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

    // ══════════════════════════════════════════════════════════════════════════
    // STEP 2 — Verify email OTP → create account → show phone step
    // ══════════════════════════════════════════════════════════════════════════
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
                    // Provider — go to subscription (skip phone step for now, add after payment)
                    localStorage.setItem("pendingProviderId", data.userId);
                    localStorage.setItem("pendingProviderRole", data.role);
                    window.location.href = "provider-subscription.html";
                } else {
                    // Customer — show phone + ID step
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

    // ══════════════════════════════════════════════════════════════════════════
    // STEP 3 — Send SMS OTP to phone number
    // ══════════════════════════════════════════════════════════════════════════
    sendSmsOtpBtn.addEventListener("click", async () => { await sendSmsOtp(); });
    resendSmsBtn.addEventListener("click",  async () => { await sendSmsOtp(); });

    async function sendSmsOtp() {
        const phone = document.getElementById("phoneNumber").value.trim();
        const idNum = document.getElementById("idNumber").value.trim();

        if (!phone) { alert("❌ Please enter your phone number."); return; }
        if (!idNum)  { alert("❌ Please enter your ID / Passport number."); return; }
        if (!/^(?:0[17]\d{8}|254[17]\d{8}|\+254[17]\d{8})$/.test(phone.replace(/\s/g,""))) {
            alert("❌ Enter a valid Kenyan phone number (e.g. 0712345678).");
            return;
        }
        if (!pendingUserId) { alert("❌ Session expired. Please start signup again."); return; }

        sendSmsOtpBtn.disabled = true; sendSmsOtpBtn.textContent = "Sending SMS…";

        try {
            const res  = await fetch(getBase() + "/send-phone-otp", {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ userId: pendingUserId, phone, idNumber: idNum })
            });
            const data = await res.json();

            if (data.success) {
                smsOtpSection.classList.add("visible");
                phoneSection.classList.remove("visible");

                if (data.otp) {
                    document.getElementById("smsOtpInput").value = data.otp;
                    smsOtpMessage.innerHTML = `
                        <div style="background:#e8f5e9;border:2px solid #006600;border-radius:10px;padding:16px;text-align:center;">
                            <div style="font-size:0.85rem;color:#555;margin-bottom:8px;">Your phone verification code:</div>
                            <div style="font-size:2rem;font-weight:bold;letter-spacing:8px;color:#006600;">${data.otp}</div>
                            <div style="font-size:0.78rem;color:#888;margin-top:8px;">Code pre-filled. Click "Complete Registration" to finish.</div>
                        </div>`;
                } else {
                    smsOtpMessage.innerHTML = `<div style="color:#006600;font-size:0.88rem;">📲 A 6-digit code was sent to <strong>${phone}</strong>. Enter it below.</div>`;
                }
            } else {
                alert("❌ " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Server error. Please try again.");
        } finally {
            sendSmsOtpBtn.disabled = false; sendSmsOtpBtn.textContent = "📲 Send SMS Verification Code";
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STEP 4 — Verify SMS OTP → complete registration
    // ══════════════════════════════════════════════════════════════════════════
    verifySmsOtpBtn.addEventListener("click", async () => {
        const otp = document.getElementById("smsOtpInput").value.trim();
        if (!otp || otp.length !== 6) { alert("❌ Please enter the 6-digit SMS code."); return; }
        if (!pendingUserId) { alert("❌ Session expired. Please start signup again."); return; }

        verifySmsOtpBtn.disabled = true; verifySmsOtpBtn.textContent = "Completing…";

        try {
            const res  = await fetch(getBase() + "/verify-phone-otp", {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ userId: pendingUserId, otp })
            });
            const data = await res.json();

            if (data.success) {
                alert("✅ Registration complete! Welcome to SmartServe SMEs.");
                window.location.href = "signin.html";
            } else {
                alert("❌ " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Server error. Please try again.");
        } finally {
            verifySmsOtpBtn.disabled = false; verifySmsOtpBtn.textContent = "✅ Complete Registration";
        }
    });
});
