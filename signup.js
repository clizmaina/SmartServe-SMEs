document.addEventListener("DOMContentLoaded", () => {
    const businessType = localStorage.getItem("businessType");
    document.getElementById("businessCategory").value = businessType || "";

    const signupForm   = document.getElementById("signup-form");
    const otpSection   = document.getElementById("otpSection");
    const otpMessage   = document.getElementById("otpMessage");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const resendBtn    = document.getElementById("resendBtn");

    // Base URL — uses config.js on live site, falls back to localhost for local dev
    function getBase() {
        return (window.API_BASE) || "http://localhost:5501";
    }

    // ── Step 1: collect details and send OTP ──────────────────────────────────
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await sendOtp();
    });

    resendBtn.addEventListener("click", async () => {
        await sendOtp();
    });

    async function sendOtp() {
        const name     = document.getElementById("name").value.trim();
        const email    = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const role     = document.getElementById("userType").value;
        const bt       = localStorage.getItem("businessType");

        if (!name || !email || !password || !role || !bt) {
            alert("❌ Please fill in all fields and make sure you selected a business type.");
            return;
        }

        const sendOtpBtn = document.getElementById("sendOtpBtn");
        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = "Sending…";

        try {
            const res = await fetch(getBase() + "/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name, email, password, role, businessType: bt })
            });
            const data = await res.json();

            if (data.success) {
                otpSection.classList.add("visible");
                if (data.otp) {
                    // Show OTP on screen — pre-fill the input
                    document.getElementById("otpInput").value = data.otp;
                    otpMessage.innerHTML = `
                        <div style="background:#e8f5e9;border:2px solid #006600;border-radius:10px;padding:16px;text-align:center;">
                            <div style="font-size:0.85rem;color:#555;margin-bottom:8px;">Your verification code:</div>
                            <div style="font-size:2rem;font-weight:bold;letter-spacing:8px;color:#006600;">${data.otp}</div>
                            <div style="font-size:0.78rem;color:#888;margin-top:8px;">Code pre-filled below. Click "Verify & Create Account" to continue.</div>
                        </div>
                    `;
                } else {
                    otpMessage.textContent = data.message || ("✅ A 6-digit code was sent to " + email + ". Check your inbox (and spam folder).");
                }
            } else {
                alert("❌ " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Server error. Please try again.");
        } finally {
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = "Send Verification Code";
        }
    }

    // ── Step 2: verify OTP and complete signup ────────────────────────────────
    verifyOtpBtn.addEventListener("click", async () => {
        const email = document.getElementById("email").value.trim();
        const otp   = document.getElementById("otpInput").value.trim();
        const bt    = localStorage.getItem("businessType");

        if (!otp || otp.length !== 6) {
            alert("❌ Please enter the 6-digit code.");
            return;
        }

        verifyOtpBtn.disabled = true;
        verifyOtpBtn.textContent = "Verifying…";

        try {
            const res = await fetch(getBase() + "/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, businessType: bt, otp })
            });
            const data = await res.json();

            if (data.success) {
                if (data.requiresSubscription) {
                    localStorage.setItem("pendingProviderId", data.userId);
                    localStorage.setItem("pendingProviderRole", data.role);
                    window.location.href = "provider-subscription.html";
                } else {
                    alert("✅ Account created! Redirecting to login…");
                    window.location.href = "signin.html";
                }
            } else {
                alert("❌ " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Server error. Please try again.");
        } finally {
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.textContent = "Verify & Create Account";
        }
    });
});
