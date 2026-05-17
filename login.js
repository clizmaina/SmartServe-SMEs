document.addEventListener("DOMContentLoaded", function () {

    console.log("LOGIN JS LOADED");

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async (event) => {

            event.preventDefault();

            const email =
                document.getElementById("email")
                .value.trim();

            const password =
                document.getElementById("password")
                .value.trim();

            if (!email || !password) {

                alert(
                    "⚠️ Please enter both email and password."
                );

                return;
            }

            try {

                const response = await fetch(
                    "http://localhost:5501/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                            "application/json"
                        },

                        credentials: "include",

                        body: JSON.stringify({
                            email,
                            password,
                            businessType: localStorage.getItem("businessType")
                        })
                    }
                );

                const data = await response.json();

                console.log(data);

                // Provider with expired/missing subscription
                if (data.requiresSubscription) {
                    localStorage.setItem("pendingProviderId", data.userId);
                    localStorage.setItem("pendingProviderRole", data.role);
                    localStorage.setItem("businessType", data.businessType);
                    window.location.href = "provider-subscription.html";
                    return;
                }

                if (data.success) {

                    alert("✅ Login successful!");

                    // Save user
                    localStorage.setItem(
                        "user",

                        JSON.stringify({

                            id: data.userId,

                            role: data.role,

                            businessType:
                                data.businessType

                        })
                    );

                    // Redirect by business type and role
                    const bt = data.businessType;
                    const role = data.role;

                    const dashboardMap = {
                        tailoring: {
                            customer: "customer-dashboard.html",
                            designer: "designer-dashboard.html"
                        },
                        salon: {
                            customer: "salon-customer-dashboard.html",
                            provider: "salon-provider-dashboard.html"
                        },
                        restaurant: {
                            customer: "restaurant-customer-dashboard.html",
                            provider: "restaurant-provider-dashboard.html"
                        },
                        boutique: {
                            customer: "boutique-customer-dashboard.html",
                            provider: "boutique-provider-dashboard.html"
                        },
                        hardware: {
                            customer: "hardware-customer-dashboard.html",
                            provider: "hardware-provider-dashboard.html"
                        },
                        cyber: {
                            customer: "cyber-customer-dashboard.html",
                            provider: "cyber-provider-dashboard.html"
                        },
                        agrovet: {
                            customer: "agrovet-customer-dashboard.html",
                            provider: "agrovet-provider-dashboard.html"
                        }
                    };

                    if (dashboardMap[bt]) {
                        // For tailoring: designer role → designer dashboard, else customer
                        // For others: designer role maps to provider
                        const roleKey = (bt === "tailoring")
                            ? (role === "designer" ? "designer" : "customer")
                            : (role === "designer" ? "provider" : "customer");

                        const target = dashboardMap[bt][roleKey];
                        if (target) {
                            window.location.href = target;
                        } else {
                            window.location.href = dashboardMap[bt]["customer"];
                        }
                    } else {
                        alert("⚠️ Unknown business type: " + bt);
                        console.log(bt);
                    }

                } else {

                    alert(
                        "❌ " +
                        (
                          data.message ||
                          "Invalid credentials"
                        )
                    );

                }

            } catch (error) {

                console.error(
                    "❌ Error during login:",
                    error
                );

                alert(
                  "❌ Login failed. Please check your connection and try again."
                );

            }

        });

    }

});