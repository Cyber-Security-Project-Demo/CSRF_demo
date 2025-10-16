// Simple Express app demonstrating CSRF vulnerable and protected endpoints
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Simple cookie session (for demo only)
app.use(
  cookieSession({
    name: "session",
    keys: ["demo-secret-1"],
    // Uncomment the following in real apps:
    // sameSite: 'lax', secure: true
  })
);

// Serve static attacker pages for convenience if you want:
// (not necessary but handy)
app.use("/static", express.static(path.join(__dirname, "static")));

// Also serve the top-level attacker folder for easy demos
app.use("/attacker", express.static(path.join(__dirname, "..", "attacker")));

// Serve public assets (CSS, images) at root path, e.g., /styles.css
app.use(express.static(path.join(__dirname, "public")));

// Simple in-memory "account" for demo
let accounts = {
  alice: { balance: 50000 },
  hacker: { balance: 0 },
};

// Serve login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Login endpoint - sets session.user
app.post("/login", (req, res) => {
  const username = req.body.username || "alice";
  req.session.user = username;
  res.redirect("/bank");
});

// Logout
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Bank dashboard (calls vulnerable form)
app.get("/bank", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "views", "bank.html"));
});

// Vulnerable transfer endpoint (NO CSRF protection) - BAD
app.post("/transfer", (req, res) => {
  if (!req.session.user) return res.status(401).send("Not logged in");
  const from = req.session.user;
  const to = req.body.to;
  const amount = Number(req.body.amount) || 0;

  if (amount <= 0) return res.send("Invalid amount");
  if (!accounts[from]) accounts[from] = { balance: 0 };
  if (!accounts[to]) accounts[to] = { balance: 0 };

  if (accounts[from].balance < amount) return res.send("Insufficient funds");

  accounts[from].balance -= amount;
  accounts[to].balance += amount;

  res.sendFile(path.join(__dirname, "views", "success.html"));
});

/* -------------------------
   CSRF-protected routes
   -------------------------*/

// csurf middleware requires cookies/sessions and must come after session setup
const csrfProtection = csurf({ cookie: false }); // we use session, not cookie token

app.get("/bank-csrf", csrfProtection, (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  // Render HTML injecting CSRF token into a form field
  const html = require("fs").readFileSync(
    path.join(__dirname, "views", "bank_csrf.html"),
    "utf8"
  );
  const replaced = html.replace("{{CSRF_TOKEN}}", req.csrfToken());
  res.send(replaced);
});

app.post("/transfer-csrf", csrfProtection, (req, res) => {
  if (!req.session.user) return res.status(401).send("Not logged in");
  const from = req.session.user;
  const to = req.body.to;
  const amount = Number(req.body.amount) || 0;

  if (amount <= 0) return res.send("Invalid amount");
  if (!accounts[from]) accounts[from] = { balance: 0 };
  if (!accounts[to]) accounts[to] = { balance: 0 };
  if (accounts[from].balance < amount) return res.send("Insufficient funds");

  accounts[from].balance -= amount;
  accounts[to].balance += amount;
  res.sendFile(path.join(__dirname, "views", "success.html"));
});

// Quick route to view balances (for demo)
app.get("/balances", (req, res) => {
  res.json(accounts);
});

// Friendly CSRF error page instead of stack trace
app.use((err, req, res, next) => {
  if (err && err.code === "EBADCSRFTOKEN") {
    // If client expects JSON, return a JSON error for API-like requests
    const acceptsJson = (req.headers["accept"] || "").includes(
      "application/json"
    );
    const details = {
      error: "Invalid CSRF token",
      status: 403,
      method: req.method,
      path: req.originalUrl || req.url,
      origin: req.headers.origin || null,
      referer: req.headers.referer || null,
      time: new Date().toISOString(),
    };
    if (acceptsJson) {
      return res.status(403).json(details);
    }

    // Otherwise, render a friendly HTML page with a few request details
    const templatePath = path.join(__dirname, "views", "csrf_error.html");
    try {
      const html = fs.readFileSync(templatePath, "utf8");
      const escape = (s) =>
        String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\"/g, "&quot;")
          .replace(/'/g, "&#39;");
      const rendered = html
        .replace(/{{METHOD}}/g, escape(details.method))
        .replace(/{{PATH}}/g, escape(details.path))
        .replace(/{{ORIGIN}}/g, escape(details.origin || "-"))
        .replace(/{{REFERER}}/g, escape(details.referer || "-"))
        .replace(/{{TIME}}/g, escape(details.time));
      return res.status(403).send(rendered);
    } catch (e) {
      // Fallback if template missing
      return res.status(403).send("Invalid CSRF token");
    }
  }
  next(err);
});

app.listen(3000, () => {
  console.log("Bank demo listening at http://localhost:3000");
  console.log("Login at http://localhost:3000/login");
});
