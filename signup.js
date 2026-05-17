document.addEventListener("DOMContentLoaded", () => {
    const businessType = localStorage.getItem("businessType");
    document.getElementById("businessCategory").value = businessType || "";

    const signupForm   = document.getElementById("signup-form");
    const otpSection   = document.getElementById("otpSection");
    const otpMessage   = document.getElementById("otpMessage");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const resendBtn    = document.getElementById("resendBtn");

    // ── Step 1: collect details and send OTP ──────────────────────────────────
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await sendOtp();
    });

    resendBtn.addEventListener("click", async () => {
        await sendOtp();
    });

    async function sendOtp() {
        const name         = document.getElementById("name").value.trim();
        const email        = document.getElementById("email").value.trim();
        const password     = document.getElementById("password").value.trim();
        const role         = document.getElementById("userType").value;
        const bt           = localStorage.getItem("businessType");

        if (!name || !email || !password || !role || !bt) {
            alert("❌ Please fill in all fields and make sure you selected a business type.");
            return;
        }

        const sendOtpBtn = document.getElementById("sendOtpBtn");
        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = "Sending…";

        try {
            const res  = await fetch("http://localhost:5501/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name, email, password, role, businessType: bt })
            });
            const data = await res.json();

            if (data.success) {
                otpSection.classList.add("visible");
                otpMessage.textContent = `✅ A 6-digit code was sent to ${email}. Check your inbox (and spam folder).`;
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
            const res  = await fetch("http://localhost:5501/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, businessType: bt, otp })
            });
            const data = await res.json();

            if (data.success) {
                if (data.requiresSubscription) {
                    // Provider — must pay before logging in
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
