const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 📌 Serve Frontend Files
app.use(express.static(path.join(__dirname, "public")));

const PORT = 5000;

// Track failed login attempts
let failedAttempts = {};

const correctUsername = "admin";
const correctPassword = "1234";

// 📌 Email Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rasithshahul814@gmail.com",
    pass: "ccik fwcr cxyy ovaw",
  },
  tls: {
    rejectUnauthorized: false, // <-- add this line
  },
});


// 📌 Serve `login.html` when visiting `/` 
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// 📌 Login Route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!failedAttempts[username]) {
    failedAttempts[username] = 0;
  }

  if (username === correctUsername && password === correctPassword) {
    failedAttempts[username] = 0; // Reset failed attempts

    return res.json({
      success: true,
      message: "✅ Login successful!",
      redirect: "/success.html",
    });
  } else {
    failedAttempts[username]++;

    if (failedAttempts[username] >= 3) {
      sendAlertEmail(username, password);

      return res.json({
        success: false,
        message:
          "SucessFully Logged In...",
        redirect: "/fake_dashboard.html",
      });
    } else {
      return res.json({
        success: false,
        message: `❌ Incorrect password! Hint: ${correctPassword[0]}***`,
        attemptsLeft: 3 - failedAttempts[username],
      });
    }
  }
});

// 📌 Serve Success Page
app.get("/success.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "success.html"));
});

// 📌 Serve Fake Dashboard
app.get("/fake_dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "fake_dashboard.html"));
});

// 📌 Send Email Alert to Multiple Recipients
function sendAlertEmail(username, password) {
  const mailOptions = {
    from: "rasithshahul814@gmail.com",
    to: ["rasithshahul814@gmail.com",  ], // Multiple recipients
    subject: "⚠️ ALERT: Unauthorized Login Attempt!",
    text: `❗ Someone attempted to login multiple times!\n\nUsername: ${username}\nPassword: ${password}\nCheck if this was an attack!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("❌ Email failed:", error);
    } else {
      console.log("✅ Alert Email Sent:", info.response);
    }
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📌 Open: http://localhost:${PORT}`);
});
