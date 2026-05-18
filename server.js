// Production build � SmartServe SMEs
const cors = require("cors");
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 5501;
const axios = require("axios");
const session = require('express-session');
require("dotenv").config();

// ✅ CORS Setup — allows localhost, LAN, and production Render domain
const allowedOrigins = [
  "http://192.168.100.32:5502",
  "http://localhost:5502",
  "http://127.0.0.1:5502",
  "http://192.168.100.32:5503",
  "http://localhost:5503",
  "http://127.0.0.1:5503",
  "http://192.168.100.32:5504",
  "http://localhost:5504",
  "http://127.0.0.1:5504",
  "https://smartserve-smes.onrender.com"
];

// Allow any localhost/127.0.0.1 port (covers Live Server port changes)
const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// Allow LAN devices (e.g., 192.168.x.x on any port)
const lanPattern = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/;

// Allow Render subdomains
const renderPattern = /^https:\/\/.*\.onrender\.com$/;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      localhostPattern.test(origin) ||
      lanPattern.test(origin) ||
      renderPattern.test(origin)
    ) {
      callback(null, true);
    } else {
      console.log("❌ CORS Blocked:", origin);
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// ✅ Handle preflight requests for all routes
app.options('*', cors());

app.use(session({
  secret: process.env.SESSION_SECRET || 'smartserve_dev_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// ✅ Database Connection — uses Railway env vars in production, local XAMPP in dev
let dbConfig;

if (process.env.MYSQL_PUBLIC_URL) {
    const url = new URL(process.env.MYSQL_PUBLIC_URL);
    dbConfig = {
        host:     url.hostname,
        user:     url.username,
        password: url.password,
        database: url.pathname.replace('/', ''),
        port:     parseInt(url.port) || 3306,
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
    console.log("🔗 Using MYSQL_PUBLIC_URL:", url.hostname);
} else {
    dbConfig = {
        host:     process.env.DB_HOST     || "localhost",
        user:     process.env.DB_USER     || "smartstitsch",
        password: process.env.DB_PASSWORD || "smart123456",
        database: process.env.DB_NAME     || "smartstitchtech",
        port:     parseInt(process.env.DB_PORT || "3306"),
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
    console.log("🔗 Using DB_HOST:", dbConfig.host);
}

// Use a pool instead of a single connection — handles reconnects automatically
const db = mysql.createPool(dbConfig);

// Test the connection on startup
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
        console.log("⚠️  Server will continue — DB queries will fail until connection is restored.");
    } else {
        console.log("✅ Connected to MySQL database!");
        connection.release();
    }
});

// ✅ Run DB migrations — create tables if they don't exist, then alter
// Create users table first (required by all other tables)
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    password VARCHAR(300) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    business_type VARCHAR(100),
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    provider_id INT NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => { if (err) console.error("❌ users table error:", err.message); });

// Add columns if missing (safe on existing tables)
db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified TINYINT(1) NOT NULL DEFAULT 0`, () => {});
db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id INT NULL DEFAULT NULL`, () => {});
db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL DEFAULT NULL`, () => {});
db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS id_number VARCHAR(50) NULL DEFAULT NULL`, () => {});
db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified TINYINT(1) NOT NULL DEFAULT 0`, () => {});

// ✅ Delivery preferences table
db.query(`
  CREATE TABLE IF NOT EXISTS delivery_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    designer_id INT NOT NULL,
    delivery_type ENUM('pickup','delivery') NOT NULL,
    address TEXT,
    location_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_customer_designer (customer_id, designer_id)
  )
`, (err) => { if (err) console.error("❌ delivery_preferences table error:", err.message); });
// Allow same email across different business types
db.query(`ALTER TABLE users DROP INDEX email`, () => {}); // silently fails if already dropped
db.query(`ALTER TABLE users ADD UNIQUE KEY IF NOT EXISTS unique_email_business (email, business_type)`, () => {});

// ✅ Boutique tables
db.query(`
  CREATE TABLE IF NOT EXISTS boutique_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2),
    sizes VARCHAR(100),
    stock INT DEFAULT 0,
    image_url VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, () => {});

db.query(`
  CREATE TABLE IF NOT EXISTS boutique_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    product_id INT,
    item_name VARCHAR(200),
    size VARCHAR(20),
    quantity INT DEFAULT 1,
    total_price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    delivered_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, () => {});

// Add delivered_at column if it doesn't exist yet (migration for existing tables)
db.query(`ALTER TABLE boutique_orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP NULL DEFAULT NULL`, () => {});

// Boutique delivered inventory log
db.query(`
  CREATE TABLE IF NOT EXISTS boutique_delivered_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    provider_id INT NOT NULL,
    customer_id INT NOT NULL,
    item_name VARCHAR(200),
    size VARCHAR(20),
    quantity INT DEFAULT 1,
    total_price DECIMAL(10,2),
    customer_name VARCHAR(200),
    delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, () => {});

db.query(`
  CREATE TABLE IF NOT EXISTS boutique_fittings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    fitting_date DATE,
    fitting_time TIME,
    items TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, () => {});

db.query(`
  CREATE TABLE IF NOT EXISTS boutique_wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    item_name VARCHAR(200),
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, () => {});

db.query(`
  CREATE TABLE IF NOT EXISTS boutique_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    rating INT,
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, () => {});

db.query(`
  CREATE TABLE IF NOT EXISTS boutique_chat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    sender VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, () => {});

// ✅ Provider subscriptions table
db.query(`
  CREATE TABLE IF NOT EXISTS provider_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 300.00,
    mpesa_ref VARCHAR(100),
    phone VARCHAR(20),
    status ENUM('pending','active','expired') NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP NULL DEFAULT NULL,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_provider (provider_id),
    INDEX idx_status_expiry (status, expires_at)
  )
`, (err) => { if (err) console.error("❌ provider_subscriptions table error:", err.message); });

// ✅ Email sending — tries providers in order: Resend → Brevo → Gmail SMTP
// Resend has the best Gmail deliverability and works on Render free tier (uses port 465 HTTPS)
// Sign up free at https://resend.com → API Keys → Create key
// Set RESEND_API_KEY in Render environment variables

const emailPass = (process.env.EMAIL_PASS || '').replace(/\s/g, '');
const brevoKey  = process.env.BREVO_API_KEY;
const resendKey = process.env.RESEND_API_KEY;

async function sendEmail({ to, toName, subject, html }) {

    // ── Option A: Resend HTTP API (best Gmail deliverability, works everywhere) ─
    if (resendKey) {
        try {
            const response = await axios.post(
                'https://api.resend.com/emails',
                {
                    from: 'SmartServe SMEs <onboarding@resend.dev>',
                    to: [to],
                    reply_to: process.env.EMAIL_USER || 'smartstitchtech01@gmail.com',
                    subject,
                    html
                },
                {
                    headers: {
                        'Authorization': `Bearer ${resendKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );
            console.log(`✅ Email sent via Resend to ${to} | id: ${response.data.id}`);
            return { success: true };
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message;
            console.error('❌ Resend error:', errMsg);
            // fall through to Brevo
        }
    }

    // ── Option B: Brevo HTTP API ───────────────────────────────────────────────
    if (brevoKey) {
        try {
            const response = await axios.post(
                'https://api.brevo.com/v3/smtp/email',
                {
                    sender: {
                        name: 'SmartServe SMEs',
                        email: 'noreply@smartserve.brevo.com'
                    },
                    to: [{ email: to, name: toName || to }],
                    replyTo: {
                        email: process.env.EMAIL_USER || 'smartstitchtech01@gmail.com',
                        name: 'SmartServe SMEs'
                    },
                    subject,
                    htmlContent: html,
                    tags: ['otp', 'transactional']
                },
                {
                    headers: {
                        'api-key': brevoKey,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 15000
                }
            );
            console.log(`✅ Email sent via Brevo to ${to} | messageId: ${response.data.messageId}`);
            return { success: true };
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message;
            console.error('❌ Brevo API error:', errMsg);
            // fall through to Gmail
        }
    }

    // ── Option C: Gmail SMTP (only works locally, blocked on Render free) ─────
    if (process.env.EMAIL_USER && emailPass) {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user: process.env.EMAIL_USER, pass: emailPass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 20000
        });
        const info = await transporter.sendMail({
            from: `"SmartServe SMEs" <${process.env.EMAIL_USER}>`,
            to, subject, html
        });
        console.log(`✅ Email sent via Gmail SMTP to ${to}`);
        return { success: true, messageId: info.messageId };
    }

    throw new Error('No email provider configured. Set RESEND_API_KEY in environment variables.');
}

console.log(`📧 Email provider: ${resendKey ? 'Resend ✅' : brevoKey ? 'Brevo' : process.env.EMAIL_USER ? 'Gmail SMTP' : '⚠️ NONE'}`);

// ✅ In-memory OTP store: { "email|businessType": { otp, expiresAt, userData } }
const otpStore = {};



// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/', // Destination folder for uploaded files
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ✅ Health Check (API only)
app.get("/health", (req, res) => {
    res.json({ success: true, message: "Server is running!" });
});

// ✅ Email test endpoint — visit /test-email?to=youraddress@gmail.com on Render to verify
app.get("/test-email", async (req, res) => {
    const to = req.query.to || process.env.EMAIL_USER || 'smartstitchtech01@gmail.com';
    try {
        await sendEmail({
            to,
            toName: 'SmartServe Test',
            subject: 'SmartServe SMEs — Email Test',
            html: `<h2 style="color:#006600;">✅ Email is working!</h2>
                   <p>Your SmartServe SMEs email system is configured correctly.</p>
                   <p>OTP verification emails will be delivered successfully.</p>
                   <p style="color:#888;font-size:0.8rem;">Sent at: ${new Date().toISOString()}</p>`
        });
        res.json({ success: true, message: `✅ Test email sent to ${to}` });
    } catch (err) {
        console.error("❌ Test email error:", err.message);
        res.json({ success: false, message: "❌ Email failed: " + err.message });
    }
});

// ✅ DB Status check
app.get("/db-status", (req, res) => {
    db.query("SELECT 1", (err) => {
        if (err) {
            return res.json({ success: false, error: err.message, host: process.env.DB_HOST || "localhost" });
        }
        res.json({ success: true, message: "✅ Database connected", host: process.env.DB_HOST || "localhost" });
    });
});

// ✅ Root — serve the website homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ STEP 1 — Send OTP before signup completes
app.post("/send-otp", async (req, res) => {
    const { email, name, password, role, businessType } = req.body;

    if (!email || !name || !password || !role || !businessType) {
        return res.status(400).json({ success: false, message: "❌ Missing required fields" });
    }

    // Check if this email+businessType combo already exists
    const [existing] = await db.promise().query(
        "SELECT id FROM users WHERE email = ? AND business_type = ?",
        [email, businessType]
    );
    if (existing.length > 0) {
        return res.status(409).json({ success: false, message: "❌ This email is already registered for this business type." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const key = `${email}|${businessType}`;
    otpStore[key] = { otp, expiresAt, userData: { name, email, password, role, businessType } };

    try {
        await sendEmail({
            to: email,
            toName: name,
            subject: `${otp} is your SmartServe SMEs verification code`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px;">
                    <h2 style="color:#006600;">SmartServe SMEs — Verify your email</h2>
                    <p>Hi <strong>${name}</strong>,</p>
                    <p>Use the code below to complete your registration for <strong>${businessType}</strong>:</p>
                    <div style="font-size:2.5rem;font-weight:bold;letter-spacing:10px;text-align:center;padding:20px;background:#f4f4f4;border-radius:8px;margin:20px 0;color:#006600;">${otp}</div>
                    <p>This code expires in <strong>10 minutes</strong>.</p>
                    <p style="color:#888;font-size:0.85rem;">If you didn't request this, ignore this email.</p>
                    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
                    <p style="color:#aaa;font-size:0.75rem;">SmartServe SMEs — Kenya's digital platform for small businesses</p>
                </div>
            `
        });
        console.log(`✅ OTP email sent to ${email}`);
        // Always return OTP in response so user can see it on screen
        // (email may be delayed or filtered — on-screen code ensures signup always works)
        res.json({ 
            success: true, 
            message: "✅ OTP sent to your email. Your code is also shown below in case email is delayed:",
            otp: otp
        });
    } catch (err) {
        console.error("❌ Email send error:", err.code, err.message);
        // Email failed but OTP is stored — return it directly so signup can still work
        res.json({
            success: true,
            message: "⚠️ Email delivery failed. Your verification code is: " + otp,
            otp: otp  // shown only when email fails
        });
    }
});

// ✅ STEP 2 — Verify OTP and complete signup
app.post("/signup", async (req, res) => {
    const { email, businessType, otp } = req.body;

    if (!email || !businessType || !otp) {
        return res.status(400).json({ success: false, message: "❌ Missing email, businessType, or OTP" });
    }

    const key = `${email}|${businessType}`;
    const record = otpStore[key];

    if (!record) {
        return res.status(400).json({ success: false, message: "❌ No OTP found. Please request a new one." });
    }
    if (Date.now() > record.expiresAt) {
        delete otpStore[key];
        return res.status(400).json({ success: false, message: "❌ OTP has expired. Please request a new one." });
    }
    if (record.otp !== otp.trim()) {
        return res.status(400).json({ success: false, message: "❌ Incorrect OTP." });
    }

    // OTP valid — create the user
    const { name, password, role } = record.userData;
    delete otpStore[key];

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (name, email, password, role, business_type, is_verified) VALUES (?, ?, ?, ?, ?, 1)";
        db.query(query, [name, email, hashedPassword, role, businessType], (err, results) => {
            if (err) {
                console.error("❌ Database Error:", err.sqlMessage);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ success: false, message: "❌ This email is already registered for this business type." });
                }
                return res.status(500).json({ success: false, message: "❌ Server error", error: err.sqlMessage });
            }
            const newUserId = results.insertId;
            // If provider/designer → signal frontend to go to subscription payment
            const isProvider = (role === "designer");
            res.json({
                success: true,
                message: "✅ Signup successful!",
                userId: newUserId,
                role,
                requiresSubscription: isProvider
            });
        });
    } catch (error) {
        console.error("❌ Catch Error:", error.message);
        res.status(500).json({ success: false, message: "❌ Server error", error: error.message });
    }
});

// ✅ STEP 3 — Send SMS OTP to phone number (after email verified)
// In-memory phone OTP store: { userId: { otp, expiresAt, phone, idNumber } }
const phoneOtpStore = {};

app.post("/send-phone-otp", async (req, res) => {
    const { userId, phone, idNumber } = req.body;
    if (!userId || !phone || !idNumber) {
        return res.status(400).json({ success: false, message: "❌ userId, phone and idNumber are required." });
    }

    // Normalize phone
    let normalizedPhone = phone.replace(/\s+/g, "");
    if (normalizedPhone.startsWith("0"))       normalizedPhone = "254" + normalizedPhone.slice(1);
    else if (normalizedPhone.startsWith("+"))  normalizedPhone = normalizedPhone.slice(1);

    // Check user exists
    const [users] = await db.promise().query("SELECT id FROM users WHERE id = ?", [userId]);
    if (!users.length) return res.status(404).json({ success: false, message: "❌ User not found." });

    // Save phone + ID to user record
    await db.promise().query(
        "UPDATE users SET phone = ?, id_number = ? WHERE id = ?",
        [normalizedPhone, idNumber.trim(), userId]
    );

    // Generate 6-digit OTP
    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    phoneOtpStore[userId] = { otp, expiresAt, phone: normalizedPhone };

    // Try to send SMS via Africa's Talking (if configured)
    // If not configured, return OTP directly so signup still works
    const atApiKey   = process.env.AT_API_KEY;
    const atUsername = process.env.AT_USERNAME || "sandbox";

    if (atApiKey && atApiKey !== "YOUR_AT_API_KEY") {
        try {
            const atRes = await axios.post(
                "https://api.africastalking.com/version1/messaging",
                new URLSearchParams({
                    username: atUsername,
                    to:       "+" + normalizedPhone,
                    message:  `Your SmartServe SMEs verification code is: ${otp}. Valid for 10 minutes.`,
                    from:     "SmartServe"
                }),
                {
                    headers: {
                        "apiKey":       atApiKey,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept":       "application/json"
                    },
                    timeout: 15000
                }
            );
            console.log(`✅ SMS sent to +${normalizedPhone}`);
            return res.json({ success: true, message: `✅ SMS code sent to your phone.` });
        } catch (smsErr) {
            console.error("❌ SMS send error:", smsErr.response?.data || smsErr.message);
            // Fall through — return OTP directly
        }
    }

    // SMS not configured or failed — return OTP on screen
    console.log(`📱 Phone OTP for user ${userId}: ${otp}`);
    res.json({
        success: true,
        message: "⚠️ SMS delivery unavailable. Your code is shown below.",
        otp: otp
    });
});

// ✅ STEP 4 — Verify phone OTP and mark phone as verified
app.post("/verify-phone-otp", async (req, res) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: "❌ userId and otp are required." });
    }

    const record = phoneOtpStore[userId];
    if (!record) {
        return res.status(400).json({ success: false, message: "❌ No OTP found. Please request a new one." });
    }
    if (Date.now() > record.expiresAt) {
        delete phoneOtpStore[userId];
        return res.status(400).json({ success: false, message: "❌ OTP has expired. Please request a new one." });
    }
    if (record.otp !== otp.trim()) {
        return res.status(400).json({ success: false, message: "❌ Incorrect code. Please try again." });
    }

    // Mark phone as verified
    delete phoneOtpStore[userId];
    await db.promise().query("UPDATE users SET phone_verified = 1 WHERE id = ?", [userId]);

    res.json({ success: true, message: "✅ Phone verified successfully! Your account is now complete." });
});

// ✅ USER LOGIN — matches on email + businessType so one email can have multiple business accounts
app.post("/login", async (req, res) => {
    const { email, password, businessType } = req.body;

    if (!email || !password || !businessType) {
        return res.status(400).json({ success: false, message: "❌ Missing email, password, or business type" });
    }

    try {
        const [results] = await db.promise().query(
            "SELECT * FROM users WHERE email = ? AND business_type = ?",
            [email, businessType]
        );

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "❌ No account found for this email and business type." });
        }

        const user = results[0];

        if (!user.is_verified) {
            return res.status(403).json({ success: false, message: "❌ Email not verified. Please complete signup." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "❌ Invalid email or password" });
        }

        // ── Subscription check for providers ──────────────────────────────────
        const isProvider = (user.role === "designer");
        if (isProvider) {
            const [subs] = await db.promise().query(
                `SELECT * FROM provider_subscriptions
                 WHERE provider_id = ? AND status = 'active' AND expires_at > NOW()
                 ORDER BY expires_at DESC LIMIT 1`,
                [user.id]
            );
            if (subs.length === 0) {
                // No active subscription — return special flag so frontend redirects to payment
                return res.json({
                    success: false,
                    requiresSubscription: true,
                    userId: user.id,
                    role: user.role,
                    businessType: user.business_type,
                    name: user.name,
                    message: "❌ Your subscription has expired or is not active. Please pay KSh 300 to continue."
                });
            }
            // Attach subscription expiry to response
            const sub = subs[0];
            req.session.userId = user.id;
            req.session.role = user.role;
            return res.json({
                success: true,
                message: "✅ Login successful",
                userId: user.id,
                role: user.role,
                businessType: user.business_type,
                name: user.name,
                subscriptionExpiresAt: sub.expires_at
            });
        }

        // Regular customer login
        req.session.userId = user.id;
        req.session.role = user.role;
        res.json({
            success: true,
            message: "✅ Login successful",
            userId: user.id,
            role: user.role,
            businessType: user.business_type,
            name: user.name
        });

    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({ success: false, message: "❌ Server error" });
    }
});

// ✅ USER LOGOUT
app.post("/logout", (req, res) => {
    res.json({ success: true, message: "✅ Logout successful" });
});

// ✅ Fetch Available Customers — for provider dashboards, filtered by business type
app.get("/customers", (req, res) => {
    const businessType = req.query.businessType;
    let query = "SELECT id, name, email FROM users WHERE role='customer'";
    const params = [];
    if (businessType) {
        query += " AND business_type = ?";
        params.push(businessType);
    }
    db.query(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: "❌ Error fetching customers", error: err.message });
        }
        res.json({ success: true, customers: rows });
    });
});

// ✅ Customer selects a provider — saves provider_id on the customer's user record
app.post("/select-provider", async (req, res) => {
    const { customerId, providerId } = req.body;
    if (!customerId || !providerId) {
        return res.status(400).json({ success: false, message: "❌ Missing customerId or providerId" });
    }
    try {
        await db.promise().query(
            "UPDATE users SET provider_id = ? WHERE id = ?",
            [providerId, customerId]
        );
        res.json({ success: true, message: "✅ Provider selected successfully." });
    } catch (err) {
        console.error("❌ Error selecting provider:", err);
        res.status(500).json({ success: false, message: "❌ Server error" });
    }
});

// ✅ Fetch customers assigned to a specific provider
app.get("/my-customers/:providerId", async (req, res) => {
    const { providerId } = req.params;
    try {
        const [rows] = await db.promise().query(
            "SELECT id, name, email FROM users WHERE provider_id = ? AND role = 'customer'",
            [providerId]
        );
        res.json({ success: true, customers: rows });
    } catch (err) {
        console.error("❌ Error fetching assigned customers:", err);
        res.status(500).json({ success: false, message: "❌ Server error" });
    }
});

// ✅ Fetch available providers for a given business type (for customer to choose from)
app.get("/available-providers", async (req, res) => {
    const { businessType } = req.query;
    if (!businessType) {
        return res.status(400).json({ success: false, message: "❌ businessType required" });
    }
    try {
        const [rows] = await db.promise().query(
            "SELECT id, name, email FROM users WHERE role = 'designer' AND business_type = ?",
            [businessType]
        );
        res.json({ success: true, providers: rows });
    } catch (err) {
        console.error("❌ Error fetching providers:", err);
        res.status(500).json({ success: false, message: "❌ Server error" });
    }
});

app.get("/customer-designs/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM customer_designs WHERE customer_id = ?",
      [customerId]
    );
    res.json({ success: true, designs: rows });
  } catch (error) {
    console.error("❌ Error fetching customer designs:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/get-customer-id", (req, res) => {
    console.log("Session data:", req.session); // Debugging: Print session data

    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: "❌ Not logged in" });
    }

    const sql = "SELECT id FROM users WHERE id = ?";
    db.query(sql, [req.session.userId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "❌ Database error" });
        if (results.length === 0) return res.status(404).json({ success: false, message: "❌ User not found" });

        res.json({ success: true, customerId: results[0].id });
    });
});

// Upload Design Route (Example)
app.use('/uploads', express.static('uploads'));
app.get("/chat/:id", async (req, res) => {
    const customerId = req.params.id;
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM chat WHERE customer_id = ?",
            [customerId]
        );
        res.json({ success: true, messages: rows });
    } catch (error) {
        console.error("Error fetching chat:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

app.post("/upload-design", upload.single("image"), (req, res) => {
  const { customerId,designerId } = req.body;

if (!customerId) {
    console.log("Missing or invalid Parameters:", req.body);
    return res.status(400).json({ message: "Customer ID is required." });
}
 
    const imageUrl = "/uploads/" + req.file.filename;

    db.query(
        "INSERT INTO customer_designs (customer_id, designer_id, file_path) VALUES (?, ?, ?)",
        [customerId, designerId, imageUrl],
        (err, results) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }
            res.json({ success: true, message: "Design uploaded successfully!" });
        }
    );
}); 

// Submit Measurements Route (Example)
// ✅ Submit Measurements Route
app.post("/submit-measurements", (req, res) => {
  const { garmentType, measurements, designerId, userId } = req.body;

  if (!garmentType || !measurements || !designerId || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing garment type, measurements, customer ID, or designer ID." });
  }

  const measurementsJSON = JSON.stringify(measurements);

  const sql = `
    INSERT INTO customer_measurements (user_id, designer_id, garment_type, measurements_json, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [userId, designerId, garmentType, measurementsJSON], (err, result) => {
    if (err) {
      console.error("❌ Error inserting measurements:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error while saving measurements." });
    }

    console.log(`✅ Measurements saved for customer ${userId} and designer ${designerId}`);
    res.json({ success: true, message: "Measurements submitted successfully!" });
  });
});

// ✅ Fetch Available designer
app.get("/available-designer", async (req, res) => {
  try {
    const [designers] = await db.promise().query(
      "SELECT id, name FROM users WHERE role='designer'"
    );
    console.log("🎨 Designers fetched from DB:", designers); // <--- add this line
    res.json({ success: true, designer: designers });
  } catch (error) {
    console.error("Error fetching designers:", error);
    res.status(500).json({ success: false, message: "Error fetching designers" });
  }
});

// ✅ Fetch Measurements
// ✅ Fetch Customer Measurements (for Designer Dashboard)
app.get("/customer-measurements/:customerId/:designerId", async (req, res) => {
  const { customerId, designerId } = req.params;

  try {
    const [rows] = await db.promise().query(
      "SELECT garment_type, measurements_json, created_at FROM customer_measurements WHERE user_id = ? AND designer_id = ? ORDER BY created_at DESC",
      [customerId, designerId]
    );

    const measurements = rows.map(row => ({
      garmentType: row.garment_type,
      measurements: JSON.parse(row.measurements_json),
      createdAt: row.created_at
    }));

    res.json({ success: true, measurements });
  } catch (error) {
    console.error("❌ Error fetching customer measurements:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ✅ Fetch Payments
app.post('/api/simple-mpesa-pay', async (req, res) => {
    const { amount, customerPhone, customerId } = req.body;

    try {
        // 1. Get M-Pesa Access Token (same as before)
        const accessToken = await getAccessToken();

        // 2. Initiate STK Push (similar to before, but you might not immediately need the callback URL for the initial request)
        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                BusinessShortCode: yourShortcode,
                Password: generatePassword(), // Implement password generation
                Timestamp: generateTimestamp(),
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: customerPhone,
                PartyB: yourShortcode,
                PhoneNumber: customerPhone,
                CallBackURL: 'SOME_DUMMY_URL', // You might not need a real callback here initially
                AccountReference: `SIMPLE_PAY_${customerId}`,
                TransactionDesc: 'Simple M-Pesa Payment',
            },
            { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
        );

        console.log('Simple M-Pesa STK Push Response:', response.data);
        const checkoutRequestID = response.data.CheckoutRequestID;

        // 3. Save initial payment info to your DB with 'pending' status and the checkoutRequestID
        await db.saveSimplePayment({ customerId, amount, phone: customerPhone, checkoutRequestID, status: 'pending' });

        res.json({ success: true, message: 'M-Pesa payment initiated. Check your phone.' });

    } catch (error) {
        console.error('Error initiating simple M-Pesa:', error.response ? error.response.data : error.message);
        res.json({ success: false, message: 'Failed to initiate payment.' });
    }
});

// You would then have another API endpoint (e.g., `/api/check-payment-status/:checkoutRequestId`)
// that your frontend could poll or your backend could run periodically to query the
// M-Pesa API for the transaction status using the CheckoutRequestID.

// ✅ Fetch Product Previews
app.get("/product-previews/:customerId", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT id, image_url FROM product_previews");
        res.json({ success: true, previews: rows });
    } catch (error) {
        console.error("Error fetching product previews:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Fetch Chat Messages
// ✅ Fetch chat messages between a customer and a designer
app.get("/chat/:customerId/:designerId", async (req, res) => {
  const { customerId, designerId } = req.params;

  // 🔍 Basic validation
  if (!customerId || !designerId) {
    return res
      .status(400)
      .json({ success: false, message: "❌ Missing customerId or designerId" });
  }

  try {
    // 🧠 Fetch messages from chat table ordered by timestamp (or ID)
    const [rows] = await db.promise().query(
      `SELECT sender, message, timestamp 
       FROM chat 
       WHERE customer_id = ? AND designer_id = ? 
       ORDER BY timestamp ASC`,
      [customerId, designerId]
    );

    // 📨 Respond with messages
    res.json({ success: true, messages: rows });
  } catch (error) {
    console.error("❌ Error fetching chat messages:", error);
    res
      .status(500)
      .json({ success: false, message: "❌ Internal Server Error", error: error.message });
  }
});


// ✅ Send a Chat Message
// ✅ Handle sending chat messages between customer and designer
// ✅ Fixed Send Message Endpoint
// ✅ Send chat message
app.post("/send-message", (req, res) => {
  const { sender, message, customerId, designerId } = req.body;

  // Validate
  if (!sender || !message || !customerId || !designerId) {
    return res.status(400).json({
      success: false,
      message: "❌ Missing sender, message, customerId, or designerId",
    });
  }

  const query = `
    INSERT INTO chat (sender, message, timestamp, customer_id, designer_id)
    VALUES (?, ?, NOW(), ?, ?)
  `;

  db.query(query, [sender, message, customerId, designerId], (err) => {
    if (err) {
      console.error("❌ Error inserting chat message:", err);
      return res.status(500).json({
        success: false,
        message: "❌ Database error sending message",
        error: err.message,
      });
    }

    res.json({ success: true, message: "✅ Message sent successfully!" });
  });
});

app.post('/upload-design', upload.single('design'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const adminId = req.body.designerId;
    const customerId = req.body.customerId;
    const filePath = `/uploads/${req.file.filename}`;

    db.query(
        "INSERT INTO customer_designs (customer_id, designer_id, file_path) VALUES (?, ?, ?)",
        [customerId, adminId, filePath],
        (err, results) => {
            if (err) {
                console.error("Error saving design:", err);
                return res.status(500).json({ success: false, message: 'Error saving design to database.' });
            }
            res.json({ success: true, message: 'Design uploaded and saved successfully.' });
        }
    );
});
app.get("/customer-designs/:customerId/:designerId", async (req, res) => {
  const { customerId, designerId } = req.params;

  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM customer_designs WHERE customer_id = ? AND designer_id = ?",
      [customerId, designerId]
    );

    res.json({ success: true, designs: rows });
  } catch (error) {
    console.error("❌ Error fetching customer designs:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post('/upload-preview', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const adminId = req.body.adminId;
    const customerId = req.body.customerId;
    const imageUrl = `/uploads/${req.file.filename}`;

    db.query(
        "INSERT INTO product_previews (customer_id, admin_id, image_url) VALUES (?, ?, ?)",
        [customerId, adminId, imageUrl],
        (err, results) => {
            if (err) {
                console.error("Error saving preview:", err);
                return res.status(500).json({ success: false, message: 'Error saving preview to database.' });
            }
            res.json({ success: true, message: 'File uploaded and preview saved successfully.', imageUrl });
        }
    );
});



// ============================================================
// ✅ PROVIDER SUBSCRIPTION SYSTEM — KSh 300 / month
// ============================================================

// Get subscription status for a provider
app.get("/subscription/status/:providerId", async (req, res) => {
    const { providerId } = req.params;
    try {
        const [rows] = await db.promise().query(
            `SELECT * FROM provider_subscriptions
             WHERE provider_id = ? AND status = 'active' AND expires_at > NOW()
             ORDER BY expires_at DESC LIMIT 1`,
            [providerId]
        );
        if (rows.length === 0) {
            // Check if there's a pending payment
            const [pending] = await db.promise().query(
                `SELECT * FROM provider_subscriptions WHERE provider_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1`,
                [providerId]
            );
            return res.json({
                success: true,
                active: false,
                pending: pending.length > 0,
                subscription: pending[0] || null
            });
        }
        res.json({ success: true, active: true, subscription: rows[0] });
    } catch (err) {
        console.error("❌ Subscription status error:", err);
        res.status(500).json({ success: false, message: "❌ Server error" });
    }
});

// Initiate subscription payment via M-Pesa STK push
app.post("/subscription/pay", async (req, res) => {
    const { providerId, phone } = req.body;
    if (!providerId || !phone) {
        return res.status(400).json({ success: false, message: "❌ providerId and phone are required." });
    }

    // Normalize phone: 07XXXXXXXX → 2547XXXXXXXX
    let normalizedPhone = phone.replace(/\s+/g, "");
    if (normalizedPhone.startsWith("0")) {
        normalizedPhone = "254" + normalizedPhone.slice(1);
    } else if (normalizedPhone.startsWith("+")) {
        normalizedPhone = normalizedPhone.slice(1);
    }

    // Create a pending subscription record
    let subId;
    try {
        const [result] = await db.promise().query(
            `INSERT INTO provider_subscriptions (provider_id, amount, phone, status) VALUES (?, 300.00, ?, 'pending')`,
            [providerId, normalizedPhone]
        );
        subId = result.insertId;
    } catch (err) {
        console.error("❌ Error creating subscription record:", err);
        return res.status(500).json({ success: false, message: "❌ Server error creating subscription." });
    }

    // Try STK push (will fail gracefully if keys are not configured)
    try {
        const consumerKeyEnv    = process.env.MPESA_CONSUMER_KEY    || consumerKey;
        const consumerSecretEnv = process.env.MPESA_CONSUMER_SECRET || consumerSecret;
        const passkeyEnv        = process.env.MPESA_PASSKEY         || passkey;
        const shortcodeEnv      = process.env.MPESA_SHORTCODE       || shortcode;
        const callbackEnv       = process.env.MPESA_CALLBACK_URL    || callbackURL;

        if (consumerKeyEnv === "YOUR_CONSUMER_KEY") {
            // Keys not configured — return pending state, user must use manual ref
            return res.json({
                success: true,
                stkPushed: false,
                subscriptionId: subId,
                message: "⚠️ M-Pesa STK push not configured. Please use the manual payment option below.",
                manualPayment: true
            });
        }

        const auth = Buffer.from(`${consumerKeyEnv}:${consumerSecretEnv}`).toString("base64");
        const tokenRes = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            { headers: { Authorization: `Basic ${auth}` } }
        );
        const token = tokenRes.data.access_token;

        const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
        const password  = Buffer.from(shortcodeEnv + passkeyEnv + timestamp).toString("base64");

        const stkRes = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: shortcodeEnv,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerBuyGoodsOnline",
                Amount: 300,
                PartyA: normalizedPhone,
                PartyB: shortcodeEnv,
                PhoneNumber: normalizedPhone,
                CallBackURL: callbackEnv,
                AccountReference: `SmartStitch-Sub-${providerId}`,
                TransactionDesc: "SmartStitch Monthly Subscription"
            },
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );

        // Store checkout request ID for callback matching
        await db.promise().query(
            "UPDATE provider_subscriptions SET mpesa_ref = ? WHERE id = ?",
            [stkRes.data.CheckoutRequestID, subId]
        );

        res.json({
            success: true,
            stkPushed: true,
            subscriptionId: subId,
            checkoutRequestId: stkRes.data.CheckoutRequestID,
            message: "📲 M-Pesa prompt sent to your phone. Enter your PIN to complete payment."
        });

    } catch (stkErr) {
        console.error("❌ STK push failed:", stkErr.response?.data || stkErr.message);
        // STK failed but record exists — allow manual fallback
        res.json({
            success: true,
            stkPushed: false,
            subscriptionId: subId,
            message: "⚠️ Could not send M-Pesa prompt. Please use the manual payment option.",
            manualPayment: true
        });
    }
});

// M-Pesa callback — auto-activates subscription when payment confirmed
app.post("/subscription/mpesa-callback", async (req, res) => {
    try {
        const body = req.body?.Body?.stkCallback;
        if (!body) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

        const resultCode = body.ResultCode;
        const checkoutId = body.CheckoutRequestID;

        if (resultCode === 0) {
            // Payment successful
            const items = body.CallbackMetadata?.Item || [];
            const mpesaCode = items.find(i => i.Name === "MpesaReceiptNumber")?.Value || "";

            await db.promise().query(
                `UPDATE provider_subscriptions
                 SET status = 'active', mpesa_ref = ?, paid_at = NOW(),
                     expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY)
                 WHERE mpesa_ref = ? AND status = 'pending'`,
                [mpesaCode, checkoutId]
            );
        } else {
            // Payment failed/cancelled
            await db.promise().query(
                "UPDATE provider_subscriptions SET status = 'expired' WHERE mpesa_ref = ? AND status = 'pending'",
                [checkoutId]
            );
        }
        res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (err) {
        console.error("❌ Subscription callback error:", err);
        res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }
});

// Manual M-Pesa reference submission (fallback when STK push isn't live)
app.post("/subscription/manual-verify", async (req, res) => {
    const { subscriptionId, mpesaRef, providerId } = req.body;
    if (!subscriptionId || !mpesaRef || !providerId) {
        return res.status(400).json({ success: false, message: "❌ Missing required fields." });
    }

    // Check the ref isn't already used
    const [existing] = await db.promise().query(
        "SELECT id FROM provider_subscriptions WHERE mpesa_ref = ? AND status = 'active'",
        [mpesaRef.trim().toUpperCase()]
    );
    if (existing.length > 0) {
        return res.status(409).json({ success: false, message: "❌ This M-Pesa reference has already been used." });
    }

    try {
        await db.promise().query(
            `UPDATE provider_subscriptions
             SET status = 'active', mpesa_ref = ?, paid_at = NOW(),
                 expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY)
             WHERE id = ? AND provider_id = ? AND status = 'pending'`,
            [mpesaRef.trim().toUpperCase(), subscriptionId, providerId]
        );
        res.json({ success: true, message: "✅ Subscription activated! You can now log in." });
    } catch (err) {
        console.error("❌ Manual verify error:", err);
        res.status(500).json({ success: false, message: "❌ Server error." });
    }
});

// Check STK push payment status (polling)
app.get("/subscription/check/:subscriptionId", async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            "SELECT status, expires_at FROM provider_subscriptions WHERE id = ?",
            [req.params.subscriptionId]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, status: rows[0].status, expiresAt: rows[0].expires_at });
    } catch (err) {
        res.status(500).json({ success: false, message: "❌ Server error" });
    }
});

const { error } = require("console");
const consumerKey = "YOUR_CONSUMER_KEY"; // from Daraja
const consumerSecret = "YOUR_CONSUMER_SECRET"; // from Daraja
const shortcode = "3326904"; // Buy Goods Till
const passkey = "YOUR_PASSKEY"; // from Daraja
const callbackURL = "https://your-ngrok-url.ngrok.app/api/mpesa/callback"; // use ngrok/public URL

// Function: Generate access token
async function getAccessToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
}

// Route: Initiate STK Push
app.post("/api/mpesa/stk-push", async (req, res) => {
  try {
    const { customerPhone, amount, customerId } = req.body;
    if (!customerPhone || !amount || !customerId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const token = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    const stkRequest = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: customerPhone,
      PartyB: shortcode,
      PhoneNumber: customerPhone,
      CallBackURL: callbackURL,
      AccountReference: `Customer${customerId}`,
      TransactionDesc: "Test Payment",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkRequest,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    res.json({
      message: "M-Pesa payment request sent. Enter your PIN on your phone.",
      transactionId: response.data.CheckoutRequestID,
    });
  } catch (error) {
    console.error("STK Push Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Payment initiation failed." });
  }
});

// Route: Callback
app.post("/api/mpesa/callback", (req, res) => {
  console.log("M-Pesa Callback:", JSON.stringify(req.body, null, 2));
  res.json({ message: "Callback received" });
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// ✅ Serve all HTML/CSS/JS frontend files from the project root
app.use(express.static(path.join(__dirname)));

app.post("/ask-ai", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: "❌ Question is required." });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ OPENROUTER_API_KEY is not set in .env");
      return res.status(500).json({ success: false, message: "❌ AI service not configured. Contact admin." });
    }

    // ── Model fallback chain — tries each in order until one succeeds ──────
    const models = [
      "google/gemma-3-12b-it:free",
      "google/gemma-4-31b-it:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "mistralai/devstral-small:free",
    ];

    const systemPrompt = `You are an expert master tailor and fashion consultant with 20+ years of experience in bespoke tailoring, garment construction, and fashion design. You specialize in:

TAILORING & GARMENT CONSTRUCTION:
- Taking and interpreting body measurements (bust, waist, hips, inseam, shoulder width, sleeve length, back length, etc.)
- Pattern making, cutting, and sewing techniques for dresses, suits, trousers, shirts, skirts, coats, and traditional garments
- Fitting adjustments: taking in/letting out seams, hemming, altering sleeves, adjusting darts and pleats
- Garment construction order, seam allowances, and finishing techniques (serging, French seams, Hong Kong finish)
- Understanding ease (wearing ease vs design ease) and how it affects fit

FABRICS & MATERIALS:
- Properties of fabrics: cotton, linen, silk, wool, chiffon, satin, velvet, denim, polyester, spandex, organza, tulle, ankara/kitenge, kente, and more
- Fabric care: washing, ironing temperatures, dry cleaning, storage
- Fabric quantity calculations for different garment types and sizes
- Interfacing, lining, underlining, and interlining choices
- Fabric shrinkage, grain lines, and nap direction

FASHION & STYLE:
- Current and classic fashion trends for formal, casual, office, and traditional wear
- African fashion: ankara prints, kitenge, kente, aso-oke, and other traditional fabrics and styles
- Body type dressing: what styles flatter different body shapes (pear, apple, hourglass, rectangle, inverted triangle)
- Color theory, pattern mixing, and accessorizing
- Occasion dressing: weddings, funerals, office, parties, church, graduations

BUSINESS & PRICING:
- Estimating tailoring costs and pricing garments
- Turnaround times for different garment types
- Client communication and managing expectations
- Order tracking and delivery

Always give practical, specific, actionable advice. When discussing measurements, always specify the unit (cm or inches). When recommending fabrics, mention where they can typically be sourced. Keep responses clear and friendly. If a question is outside tailoring/fashion, politely redirect to your area of expertise.`;

    let lastError = null;

    for (const model of models) {
      try {
        console.log(`🤖 Trying model: ${model}`);
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user",   content: question },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:5501",
              "X-Title": "SmartServe SMEs Tailoring AI",
            },
            timeout: 30000, // 30s per model attempt
          }
        );

        const reply = response.data?.choices?.[0]?.message?.content;
        if (reply && reply.trim()) {
          console.log(`✅ Got reply from: ${model}`);
          return res.json({ success: true, reply, model });
        }
        // Empty reply — try next model
        console.warn(`⚠️ Empty reply from ${model}, trying next…`);
      } catch (modelErr) {
        const status = modelErr.response?.status;
        const errMsg = modelErr.response?.data?.error?.message || modelErr.message;
        console.warn(`⚠️ Model ${model} failed (${status}): ${errMsg}`);
        lastError = errMsg;
        // Rate limited or unavailable — try next model
        if (status === 429 || status === 503 || status === 502) continue;
        // Other error on first model — still try the rest
        continue;
      }
    }

    // All models failed
    console.error("❌ All AI models failed. Last error:", lastError);
    res.status(503).json({
      success: false,
      message: "❌ AI is temporarily unavailable. All models are busy — please try again in a moment.",
    });

  } catch (error) {
    const errData = error.response?.data;
    const errMsg  = error.message;
    console.error("❌ AI request failed:", errData || errMsg);
    res.status(500).json({
      success: false,
      message: errData?.error?.message || errData?.message || "❌ AI request failed. Please try again.",
    });
  }
});

// ============================================================
// ✅ DELIVERY PREFERENCE ROUTES
// ============================================================

// Save / update delivery preference
app.post("/delivery-preference", async (req, res) => {
  const { customerId, designerId, deliveryType, address, locationNotes } = req.body;
  if (!customerId || !designerId || !deliveryType) {
    return res.status(400).json({ success: false, message: "❌ Missing required fields." });
  }
  if (!["pickup", "delivery"].includes(deliveryType)) {
    return res.status(400).json({ success: false, message: "❌ deliveryType must be 'pickup' or 'delivery'." });
  }
  try {
    await db.promise().query(
      `INSERT INTO delivery_preferences (customer_id, designer_id, delivery_type, address, location_notes)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         delivery_type = VALUES(delivery_type),
         address = VALUES(address),
         location_notes = VALUES(location_notes),
         updated_at = NOW()`,
      [customerId, designerId, deliveryType, address || null, locationNotes || null]
    );
    res.json({ success: true, message: "✅ Delivery preference saved." });
  } catch (err) {
    console.error("❌ Error saving delivery preference:", err);
    res.status(500).json({ success: false, message: "❌ Server error." });
  }
});

// Get delivery preference for a customer (optionally filtered by designer)
app.get("/delivery-preference/:customerId/:designerId", async (req, res) => {
  const { customerId, designerId } = req.params;
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM delivery_preferences WHERE customer_id = ? AND designer_id = ? LIMIT 1",
      [customerId, designerId]
    );
    if (rows.length === 0) {
      return res.json({ success: true, preference: null });
    }
    res.json({ success: true, preference: rows[0] });
  } catch (err) {
    console.error("❌ Error fetching delivery preference:", err);
    res.status(500).json({ success: false, message: "❌ Server error." });
  }
});

// ✅ Fetch customer payments (for designer dashboard)
app.get("/customer-payments/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    // Try mpesa_payments table first, fall back gracefully if it doesn't exist
    const [rows] = await db.promise().query(
      `SELECT id, amount, status, created_at AS date
       FROM mpesa_payments
       WHERE customer_id = ?
       ORDER BY created_at DESC`,
      [customerId]
    );
    res.json({ success: true, payments: rows });
  } catch (err) {
    // Table may not exist yet — return empty rather than crashing
    console.warn("⚠️ customer-payments query failed (table may not exist):", err.message);
    res.json({ success: true, payments: [] });
  }
});

// ============================================================
// ✅ DESIGNER INVENTORY — all customer records in one place
// ============================================================

app.get("/designer-inventory/:designerId", async (req, res) => {
  const { designerId } = req.params;
  if (!designerId) return res.status(400).json({ success: false, message: "❌ designerId required" });

  try {
    // 1. All customers assigned to this designer
    const [customers] = await db.promise().query(
      `SELECT id, name, email FROM users WHERE provider_id = ? AND role = 'customer'`,
      [designerId]
    );

    // 2. All designs uploaded for this designer
    const [designs] = await db.promise().query(
      `SELECT cd.id, cd.customer_id, cd.file_path, cd.uploaded_at AS created_at, u.name AS customer_name
       FROM customer_designs cd
       JOIN users u ON cd.customer_id = u.id
       WHERE cd.designer_id = ?
       ORDER BY cd.uploaded_at DESC`,
      [designerId]
    );

    // 3. All measurements submitted to this designer
    const [measurements] = await db.promise().query(
      `SELECT cm.id, cm.user_id AS customer_id, cm.garment_type, cm.measurements_json, cm.created_at, u.name AS customer_name
       FROM customer_measurements cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.designer_id = ?
       ORDER BY cm.created_at DESC`,
      [designerId]
    );

    // 4. All delivery preferences for this designer
    const [deliveries] = await db.promise().query(
      `SELECT dp.id, dp.customer_id, dp.delivery_type, dp.address, dp.location_notes, dp.updated_at, u.name AS customer_name
       FROM delivery_preferences dp
       JOIN users u ON dp.customer_id = u.id
       WHERE dp.designer_id = ?
       ORDER BY dp.updated_at DESC`,
      [designerId]
    );

    // 5. All previews uploaded by this designer
    const [previews] = await db.promise().query(
      `SELECT pp.id, pp.customer_id, pp.image_url, pp.uploaded_at AS created_at, u.name AS customer_name
       FROM product_previews pp
       JOIN users u ON pp.customer_id = u.id
       WHERE pp.admin_id = ?
       ORDER BY pp.uploaded_at DESC`,
      [designerId]
    );

    // Summary stats
    const stats = {
      totalCustomers:    customers.length,
      totalDesigns:      designs.length,
      totalMeasurements: measurements.length,
      totalDeliveries:   deliveries.length,
      totalPreviews:     previews.length,
      pickupCount:       deliveries.filter(d => d.delivery_type === "pickup").length,
      deliveryCount:     deliveries.filter(d => d.delivery_type === "delivery").length,
    };

    res.json({
      success: true,
      stats,
      customers,
      designs,
      measurements: measurements.map(m => ({
        ...m,
        measurements: (() => { try { return JSON.parse(m.measurements_json); } catch { return {}; } })()
      })),
      deliveries,
      previews
    });

  } catch (err) {
    console.error("❌ Error fetching designer inventory:", err);
    res.status(500).json({ success: false, message: "❌ Server error" });
  }
});

// ============================================================
// ✅ BOUTIQUE ROUTES
// ============================================================

// -- Products --
app.get("/boutique/products/:providerId", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM boutique_products WHERE provider_id = ? ORDER BY created_at DESC",
      [req.params.providerId]
    );
    res.json({ success: true, products: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/boutique/products", upload.single("image"), async (req, res) => {
  const { providerId, name, category, price, sizes, stock } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    await db.promise().query(
      "INSERT INTO boutique_products (provider_id, name, category, price, sizes, stock, image_url) VALUES (?,?,?,?,?,?,?)",
      [providerId, name, category, price, sizes, stock, imageUrl]
    );
    res.json({ success: true, message: "✅ Product added." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/boutique/products/:id", async (req, res) => {
  try {
    await db.promise().query("DELETE FROM boutique_products WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "✅ Product deleted." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// -- Orders --
app.get("/boutique/orders/customer/:customerId", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT o.*, p.name AS provider_name FROM boutique_orders o LEFT JOIN users p ON o.provider_id = p.id WHERE o.customer_id = ? ORDER BY o.created_at DESC",
      [req.params.customerId]
    );
    res.json({ success: true, orders: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get("/boutique/orders/provider/:providerId", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT o.*, u.name AS customer_name FROM boutique_orders o LEFT JOIN users u ON o.customer_id = u.id WHERE o.provider_id = ? ORDER BY o.created_at DESC",
      [req.params.providerId]
    );
    res.json({ success: true, orders: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/boutique/orders", async (req, res) => {
  const { customerId, providerId, productId, itemName, size, quantity, totalPrice } = req.body;
  try {
    await db.promise().query(
      "INSERT INTO boutique_orders (customer_id, provider_id, product_id, item_name, size, quantity, total_price) VALUES (?,?,?,?,?,?,?)",
      [customerId, providerId, productId, itemName, size, quantity, totalPrice]
    );
    res.json({ success: true, message: "✅ Order placed." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.put("/boutique/orders/:id/status", async (req, res) => {
  try {
    await db.promise().query("UPDATE boutique_orders SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
    res.json({ success: true, message: "✅ Order status updated." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// -- Fittings --
app.get("/boutique/fittings/customer/:customerId", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT f.*, u.name AS provider_name FROM boutique_fittings f LEFT JOIN users u ON f.provider_id = u.id WHERE f.customer_id = ? ORDER BY f.fitting_date ASC",
      [req.params.customerId]
    );
    res.json({ success: true, fittings: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get("/boutique/fittings/provider/:providerId", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT f.*, u.name AS customer_name FROM boutique_fittings f LEFT JOIN users u ON f.customer_id = u.id WHERE f.provider_id = ? ORDER BY f.fitting_date ASC",
      [req.params.providerId]
    );
    res.json({ success: true, fittings: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/boutique/fittings", async (req, res) => {
  const { customerId, providerId, fittingDate, fittingTime, items } = req.body;
  try {
    await db.promise().query(
      "INSERT INTO boutique_fittings (customer_id, provider_id, fitting_date, fitting_time, items) VALUES (?,?,?,?,?)",
      [customerId, providerId, fittingDate, fittingTime, items]
    );
    res.json({ success: true, message: "✅ Fitting booked." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.put("/boutique/fittings/:id/status", async (req, res) => {
  try {
    await db.promise().query("UPDATE boutique_fittings SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
    res.json({ success: true, message: "✅ Fitting status updated." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// -- Wishlist --
app.get("/boutique/wishlist/:customerId", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM boutique_wishlist WHERE customer_id = ? ORDER BY created_at DESC",
      [req.params.customerId]
    );
    res.json({ success: true, wishlist: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/boutique/wishlist", async (req, res) => {
  const { customerId, itemName, price } = req.body;
  try {
    await db.promise().query(
      "INSERT INTO boutique_wishlist (customer_id, item_name, price) VALUES (?,?,?)",
      [customerId, itemName, price]
    );
    res.json({ success: true, message: "✅ Added to wishlist." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/boutique/wishlist/:id", async (req, res) => {
  try {
    await db.promise().query("DELETE FROM boutique_wishlist WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "✅ Removed from wishlist." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// -- Reviews --
app.get("/boutique/reviews/:providerId", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT r.*, u.name AS customer_name FROM boutique_reviews r LEFT JOIN users u ON r.customer_id = u.id WHERE r.provider_id = ? ORDER BY r.created_at DESC",
      [req.params.providerId]
    );
    res.json({ success: true, reviews: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/boutique/reviews", async (req, res) => {
  const { customerId, providerId, rating, review } = req.body;
  try {
    await db.promise().query(
      "INSERT INTO boutique_reviews (customer_id, provider_id, rating, review) VALUES (?,?,?,?)",
      [customerId, providerId, rating, review]
    );
    res.json({ success: true, message: "✅ Review submitted." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// -- Chat --
app.get("/boutique/chat/:customerId/:providerId", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM boutique_chat WHERE customer_id = ? AND provider_id = ? ORDER BY created_at ASC",
      [req.params.customerId, req.params.providerId]
    );
    res.json({ success: true, messages: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/boutique/chat", async (req, res) => {
  const { customerId, providerId, sender, message } = req.body;
  if (!customerId || !providerId || !sender || !message) {
    return res.status(400).json({ success: false, message: "Missing fields." });
  }
  try {
    await db.promise().query(
      "INSERT INTO boutique_chat (customer_id, provider_id, sender, message) VALUES (?,?,?,?)",
      [customerId, providerId, sender, message]
    );
    res.json({ success: true, message: "✅ Message sent." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// -- Inventory (provider stock update) --
app.put("/boutique/products/:id/stock", async (req, res) => {
  try {
    await db.promise().query("UPDATE boutique_products SET stock = ? WHERE id = ?", [req.body.stock, req.params.id]);
    res.json({ success: true, message: "✅ Stock updated." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================================
// ✅ TAILORING (DESIGNER) DELIVERED INVENTORY
// ============================================================

// Create tailoring delivered inventory table if it doesn't exist
db.query(`
  CREATE TABLE IF NOT EXISTS tailoring_delivered_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    designer_id INT NOT NULL,
    customer_id INT NOT NULL,
    customer_name VARCHAR(200),
    garment_type VARCHAR(100),
    delivery_type ENUM('pickup','delivery') DEFAULT 'pickup',
    address TEXT,
    notes TEXT,
    delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => { if (err) console.error("❌ tailoring_delivered_inventory table error:", err.message); });

// -- Mark a tailoring order as delivered (saves to tailoring_delivered_inventory) --
app.post("/tailoring/mark-delivered", async (req, res) => {
  const { designerId, customerId } = req.body;
  if (!designerId || !customerId) {
    return res.status(400).json({ success: false, message: "❌ designerId and customerId are required." });
  }
  try {
    // Get customer info
    const [users] = await db.promise().query(
      "SELECT id, name FROM users WHERE id = ?",
      [customerId]
    );
    if (!users.length) {
      return res.status(404).json({ success: false, message: "❌ Customer not found." });
    }
    const customer = users[0];

    // Get delivery preference
    const [prefs] = await db.promise().query(
      "SELECT * FROM delivery_preferences WHERE customer_id = ? AND designer_id = ? LIMIT 1",
      [customerId, designerId]
    );
    const pref = prefs[0] || {};

    // Get latest garment type from measurements
    const [meas] = await db.promise().query(
      "SELECT garment_type FROM customer_measurements WHERE user_id = ? AND designer_id = ? ORDER BY created_at DESC LIMIT 1",
      [customerId, designerId]
    );
    const garmentType = meas[0]?.garment_type || "Custom Garment";

    // Check if already delivered today (prevent duplicates)
    const [existing] = await db.promise().query(
      `SELECT id FROM tailoring_delivered_inventory
       WHERE designer_id = ? AND customer_id = ?
       AND DATE(delivered_at) = CURDATE()`,
      [designerId, customerId]
    );
    if (existing.length) {
      return res.json({ success: true, message: "ℹ️ Already marked as delivered today." });
    }

    // Insert into delivered inventory
    await db.promise().query(
      `INSERT INTO tailoring_delivered_inventory
         (designer_id, customer_id, customer_name, garment_type, delivery_type, address, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        designerId,
        customerId,
        customer.name,
        garmentType,
        pref.delivery_type || "pickup",
        pref.address || null,
        pref.location_notes || null
      ]
    );

    res.json({ success: true, message: "✅ Order marked as delivered and saved to inventory." });
  } catch (err) {
    console.error("❌ Error marking tailoring delivery:", err);
    res.status(500).json({ success: false, message: "❌ Server error." });
  }
});

// -- Get tailoring delivered inventory for a designer --
app.get("/tailoring/delivered-inventory/:designerId", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM tailoring_delivered_inventory WHERE designer_id = ? ORDER BY delivered_at DESC`,
      [req.params.designerId]
    );
    res.json({ success: true, items: rows });
  } catch (err) {
    console.error("❌ Error fetching tailoring delivered inventory:", err);
    res.status(500).json({ success: false, message: "❌ Server error." });
  }
});

// -- Mark order as delivered + save to delivered inventory --
app.put("/boutique/orders/:id/deliver", async (req, res) => {
  const orderId = req.params.id;
  try {
    // Fetch the order first
    const [orders] = await db.promise().query(
      `SELECT o.*, u.name AS customer_name
       FROM boutique_orders o
       LEFT JOIN users u ON o.customer_id = u.id
       WHERE o.id = ?`,
      [orderId]
    );
    if (!orders.length) {
      return res.status(404).json({ success: false, message: "❌ Order not found." });
    }
    const order = orders[0];
    if (order.status === "delivered") {
      return res.json({ success: true, message: "ℹ️ Order already marked as delivered." });
    }

    // Update order status
    await db.promise().query(
      "UPDATE boutique_orders SET status = 'delivered', delivered_at = NOW() WHERE id = ?",
      [orderId]
    );

    // Save to delivered inventory log
    await db.promise().query(
      `INSERT INTO boutique_delivered_inventory
         (order_id, provider_id, customer_id, item_name, size, quantity, total_price, customer_name, delivered_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [orderId, order.provider_id, order.customer_id, order.item_name, order.size,
       order.quantity, order.total_price, order.customer_name]
    );

    res.json({ success: true, message: "✅ Order marked as delivered and saved to inventory." });
  } catch (e) {
    console.error("❌ Error marking delivery:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// -- Get delivered inventory for a provider --
app.get("/boutique/delivered-inventory/:providerId", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM boutique_delivered_inventory WHERE provider_id = ? ORDER BY delivered_at DESC`,
      [req.params.providerId]
    );
    res.json({ success: true, items: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================================
// ✅ SMART ITEMS STOCKED — Stock & Trends API
// ============================================================

// Create tables
db.query(`CREATE TABLE IF NOT EXISTS smart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`, (err) => { if (err) console.error("❌ smart_items:", err.message); });

db.query(`CREATE TABLE IF NOT EXISTS smart_item_samples (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  path VARCHAR(300) NOT NULL,
  description VARCHAR(200),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES smart_items(id) ON DELETE CASCADE
)`, (err) => { if (err) console.error("❌ smart_item_samples:", err.message); });

db.query(`CREATE TABLE IF NOT EXISTS smart_item_sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  month_label VARCHAR(10) NOT NULL,
  month_year VARCHAR(7) NOT NULL,
  units_sold INT DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  UNIQUE KEY unique_item_month (item_id, month_year),
  FOREIGN KEY (item_id) REFERENCES smart_items(id) ON DELETE CASCADE
)`, (err) => { if (err) console.error("❌ smart_item_sales:", err.message); });

db.query(`CREATE TABLE IF NOT EXISTS smart_item_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  designer_id INT NOT NULL,
  item_id INT NOT NULL,
  item_name VARCHAR(100),
  style_desc VARCHAR(300),
  style_img VARCHAR(300),
  delivery_type ENUM('pickup','delivery') DEFAULT 'pickup',
  address TEXT,
  notes TEXT,
  payment_method VARCHAR(50),
  price DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, (err) => { if (err) console.error("❌ smart_item_orders:", err.message); });

// Seed default items if empty
db.query("SELECT COUNT(*) AS cnt FROM smart_items", (err, rows) => {
    if (err || rows[0].cnt > 0) return;
    const defaults = [
        ["Dress",   2500, 0],
        ["Trouser", 1500, 3],
        ["Shirt",   1200, 12],
        ["Skirt",   1100, 0],
        ["Coat",    3500, 7]
    ];
    defaults.forEach(([name, price, stock]) => {
        db.query("INSERT IGNORE INTO smart_items (name,price,stock) VALUES (?,?,?)", [name,price,stock]);
    });
    const months = [["Dec","2025-12"],["Jan","2026-01"],["Feb","2026-02"],["Mar","2026-03"],["Apr","2026-04"],["May","2026-05"]];
    const sales  = { Dress:[80,65,45,90,110,95], Trouser:[40,42,38,45,50,55], Shirt:[60,55,48,62,58,75], Skirt:[25,22,30,48,60,72], Coat:[90,85,70,30,15,10] };
    const prices = { Dress:2500, Trouser:1500, Shirt:1200, Skirt:1100, Coat:3500 };
    setTimeout(() => {
        db.query("SELECT id,name FROM smart_items", (e2, items) => {
            if (e2 || !items) return;
            items.forEach(item => {
                (sales[item.name]||[]).forEach((u,i) => {
                    db.query("INSERT IGNORE INTO smart_item_sales (item_id,month_label,month_year,units_sold,revenue) VALUES (?,?,?,?,?)",
                        [item.id, months[i][0], months[i][1], u, u*(prices[item.name]||0)]);
                });
            });
        });
    }, 1500);
});

// GET /smart-items/stock
app.get("/smart-items/stock", async (req, res) => {
    try {
        const [items]   = await db.promise().query("SELECT id,name,price,stock FROM smart_items ORDER BY name ASC");
        const [samples] = await db.promise().query("SELECT item_id,id,path,description FROM smart_item_samples ORDER BY uploaded_at ASC");
        const smap = {};
        samples.forEach(s => { if (!smap[s.item_id]) smap[s.item_id]=[]; smap[s.item_id].push(s); });
        res.json({ success:true, items: items.map(i => ({ ...i, samples: smap[i.id]||[] })) });
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// GET /smart-items/trends
app.get("/smart-items/trends", async (req, res) => {
    try {
        const [items] = await db.promise().query("SELECT id,name,price FROM smart_items ORDER BY name ASC");
        const [sales] = await db.promise().query("SELECT item_id,month_label,month_year,units_sold,revenue FROM smart_item_sales ORDER BY month_year ASC");
        const smap = {};
        sales.forEach(s => { if (!smap[s.item_id]) smap[s.item_id]=[]; smap[s.item_id].push({ month:s.month_label, units_sold:s.units_sold, revenue:parseFloat(s.revenue) }); });
        res.json({ success:true, trends: items.map(i => ({ name:i.name, price:i.price, monthly:smap[i.id]||[] })) });
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST /smart-items/stock/:id
app.post("/smart-items/stock/:id", async (req, res) => {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) return res.status(400).json({ success:false, message:"❌ Valid stock required." });
    try {
        await db.promise().query("UPDATE smart_items SET stock=? WHERE id=?", [stock, req.params.id]);
        res.json({ success:true, message:`✅ Stock updated to ${stock} units.` });
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST /smart-items/samples/:id  (upload sample image, max 10)
app.post("/smart-items/samples/:id", upload.single("image"), async (req, res) => {
    const itemId = req.params.id;
    if (!req.file) return res.status(400).json({ success:false, message:"❌ No image uploaded." });
    try {
        const [rows] = await db.promise().query("SELECT COUNT(*) AS cnt FROM smart_item_samples WHERE item_id=?", [itemId]);
        if (rows[0].cnt >= 10) return res.status(400).json({ success:false, message:"❌ Max 10 samples already uploaded." });
        const p = `/uploads/${req.file.filename}`;
        await db.promise().query("INSERT INTO smart_item_samples (item_id,path,description) VALUES (?,?,?)", [itemId, p, req.body.description||""]);
        res.json({ success:true, message:`✅ Sample uploaded (${rows[0].cnt+1}/10).`, path:p });
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// DELETE /smart-items/samples/:sampleId
app.delete("/smart-items/samples/:sampleId", async (req, res) => {
    try {
        await db.promise().query("DELETE FROM smart_item_samples WHERE id=?", [req.params.sampleId]);
        res.json({ success:true, message:"✅ Sample removed." });
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// GET /smart-items/alerts
app.get("/smart-items/alerts", async (req, res) => {
    try {
        const [items] = await db.promise().query("SELECT id,name,stock FROM smart_items WHERE stock<=5 ORDER BY stock ASC");
        res.json({ success:true, alerts: items.map(i => ({
            item:i.name, stock:i.stock,
            type: i.stock===0 ? "OUT_OF_STOCK" : "LOW_STOCK",
            message: i.stock===0
                ? `🚨 URGENT: '${i.name}' is OUT OF STOCK. Customers are waiting. Restock immediately.`
                : `⚠️ LOW STOCK: '${i.name}' has only ${i.stock} unit(s) left. Please add more stock.`
        }))});
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST /smart-items/order — customer places an order
app.post("/smart-items/order", async (req, res) => {
    const { customerId, designerId, itemId, itemName, styleDesc, styleImg, deliveryType, address, notes, paymentMethod, price } = req.body;
    if (!customerId || !designerId || !itemId) {
        return res.status(400).json({ success:false, message:"❌ Missing required fields." });
    }
    try {
        await db.promise().query(
            `INSERT INTO smart_item_orders (customer_id,designer_id,item_id,item_name,style_desc,style_img,delivery_type,address,notes,payment_method,price)
             VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [customerId, designerId, itemId, itemName, styleDesc, styleImg, deliveryType||'pickup', address||'', notes||'', paymentMethod||'', price||0]
        );
        res.json({ success:true, message:"✅ Order placed successfully." });
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// GET /smart-items/orders/:designerId — designer sees all orders
app.get("/smart-items/orders/:designerId", async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            `SELECT o.*, u.name AS customer_name, u.email AS customer_email
             FROM smart_item_orders o
             LEFT JOIN users u ON o.customer_id = u.id
             WHERE o.designer_id = ?
             ORDER BY o.created_at DESC`,
            [req.params.designerId]
        );
        res.json({ success:true, orders: rows });
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// PUT /smart-items/orders/:id/status — designer updates order status
app.put("/smart-items/orders/:id/status", async (req, res) => {
    try {
        await db.promise().query("UPDATE smart_item_orders SET status=? WHERE id=?", [req.body.status, req.params.id]);
        res.json({ success:true, message:"✅ Order status updated." });
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// Seed default items if empty
db.query("SELECT COUNT(*) AS cnt FROM smart_items", (err, rows) => {
    if (err || rows[0].cnt > 0) return;
    const defaults = [
        ["Dress",   2500, 0],
        ["Trouser", 1500, 3],
        ["Shirt",   1200, 12],
        ["Skirt",   1100, 0],
        ["Coat",    3500, 7]
    ];
    defaults.forEach(([name, price, stock]) => {
        db.query("INSERT IGNORE INTO smart_items (name,price,stock) VALUES (?,?,?)", [name,price,stock]);
    });
    const months = [["Dec","2025-12"],["Jan","2026-01"],["Feb","2026-02"],["Mar","2026-03"],["Apr","2026-04"],["May","2026-05"]];
    const sales  = { Dress:[80,65,45,90,110,95], Trouser:[40,42,38,45,50,55], Shirt:[60,55,48,62,58,75], Skirt:[25,22,30,48,60,72], Coat:[90,85,70,30,15,10] };
    const prices = { Dress:2500, Trouser:1500, Shirt:1200, Skirt:1100, Coat:3500 };
    setTimeout(() => {
        db.query("SELECT id,name FROM smart_items", (e2, items) => {
            if (e2 || !items) return;
            items.forEach(item => {
                (sales[item.name]||[]).forEach((u,i) => {
                    db.query("INSERT IGNORE INTO smart_item_sales (item_id,month_label,month_year,units_sold,revenue) VALUES (?,?,?,?,?)",
                        [item.id, months[i][0], months[i][1], u, u*(prices[item.name]||0)]);
                });
            });
        });
    }, 1500);
});

// GET /smart-items/stock
app.get("/smart-items/stock", async (req, res) => {
    try {
        const [items]   = await db.promise().query("SELECT id,name,price,stock FROM smart_items ORDER BY name ASC");
        const [samples] = await db.promise().query("SELECT item_id,id,path,description FROM smart_item_samples ORDER BY uploaded_at ASC");
        const smap = {};
        samples.forEach(s => { if (!smap[s.item_id]) smap[s.item_id]=[]; smap[s.item_id].push(s); });
        res.json({ success:true, items: items.map(i => ({ ...i, samples: smap[i.id]||[] })) });
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// GET /smart-items/trends
app.get("/smart-items/trends", async (req, res) => {
    try {
        const [items] = await db.promise().query("SELECT id,name,price FROM smart_items ORDER BY name ASC");
        const [sales] = await db.promise().query("SELECT item_id,month_label,month_year,units_sold,revenue FROM smart_item_sales ORDER BY month_year ASC");
        const smap = {};
        sales.forEach(s => { if (!smap[s.item_id]) smap[s.item_id]=[]; smap[s.item_id].push({ month:s.month_label, units_sold:s.units_sold, revenue:parseFloat(s.revenue) }); });
        res.json({ success:true, trends: items.map(i => ({ name:i.name, price:i.price, monthly:smap[i.id]||[] })) });
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST /smart-items/stock/:id
app.post("/smart-items/stock/:id", async (req, res) => {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) return res.status(400).json({ success:false, message:"❌ Valid stock required." });
    try {
        await db.promise().query("UPDATE smart_items SET stock=? WHERE id=?", [stock, req.params.id]);
        res.json({ success:true, message:`✅ Stock updated to ${stock} units.` });
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST /smart-items/samples/:id  (upload sample image, max 10)
app.post("/smart-items/samples/:id", upload.single("image"), async (req, res) => {
    const itemId = req.params.id;
    if (!req.file) return res.status(400).json({ success:false, message:"❌ No image uploaded." });
    try {
        const [rows] = await db.promise().query("SELECT COUNT(*) AS cnt FROM smart_item_samples WHERE item_id=?", [itemId]);
        if (rows[0].cnt >= 10) return res.status(400).json({ success:false, message:"❌ Max 10 samples already uploaded." });
        const p = `/uploads/${req.file.filename}`;
        await db.promise().query("INSERT INTO smart_item_samples (item_id,path,description) VALUES (?,?,?)", [itemId, p, req.body.description||""]);
        res.json({ success:true, message:`✅ Sample uploaded (${rows[0].cnt+1}/10).`, path:p });
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// DELETE /smart-items/samples/:sampleId
app.delete("/smart-items/samples/:sampleId", async (req, res) => {
    try {
        await db.promise().query("DELETE FROM smart_item_samples WHERE id=?", [req.params.sampleId]);
        res.json({ success:true, message:"✅ Sample removed." });
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// GET /smart-items/alerts
app.get("/smart-items/alerts", async (req, res) => {
    try {
        const [items] = await db.promise().query("SELECT id,name,stock FROM smart_items WHERE stock<=5 ORDER BY stock ASC");
        res.json({ success:true, alerts: items.map(i => ({
            item:i.name, stock:i.stock,
            type: i.stock===0 ? "OUT_OF_STOCK" : "LOW_STOCK",
            message: i.stock===0
                ? `🚨 URGENT: '${i.name}' is OUT OF STOCK. Customers are waiting. Restock immediately.`
                : `⚠️ LOW STOCK: '${i.name}' has only ${i.stock} unit(s) left. Please add more stock.`
        }))});
    } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
