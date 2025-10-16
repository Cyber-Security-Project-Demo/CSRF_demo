# CSRF Demonstration App

This is a demonstration application that shows Cross-Site Request Forgery (CSRF) vulnerabilities and how to protect against them.

## Prerequisites

Make sure you have Node.js installed on your system.

## Setup and Installation

1. **Navigate to the bank-demo directory**:

   ```powershell
   cd .\bank-demo
   ```

2. **Install dependencies**:

   ```powershell
   npm install
   ```

   This will install the required packages listed in `package.json`: `express`, `body-parser`, `cookie-session`, and `csurf`.

3. **Start the server**:
   ```powershell
   npm start
   ```

## Using the Application

Once the server is running, you'll see:

```
Bank demo listening at http://localhost:3000
Login at http://localhost:3000/login
```

### Testing the Vulnerable Endpoint:

1. **Login**: Visit http://localhost:3000/login and login as Alice
2. **Access vulnerable bank page**: You'll be redirected to http://localhost:3000/bank
3. **Test CSRF attack**: Open `attacker/attacker-form.html` or `attacker/attacker-img.html` in a separate browser tab while logged into the bank

### Testing the Protected Endpoint:

1. **Access protected bank page**: Visit http://localhost:3000/bank-csrf
2. **Try the same attack**: The CSRF protection should prevent unauthorized transfers

### Monitor Results:

- Check account balances at http://localhost:3000/balances
- The success.html page will be shown after successful transfers

## Demonstrating attacks (vulnerable vs protected)

While logged in as Alice, open these demo pages in new tabs to simulate forged form posts:

- Vulnerable attack (will succeed):
  - http://localhost:3000/static/attacker-post.html → auto-submits to `/transfer`
- Protected attack (will be blocked with 403):
  - http://localhost:3000/static/attacker-post-protected.html → auto-submits to `/transfer-csrf` without a token

You can also try the original attacker examples:

- http://localhost:3000/attacker/attacker-form.html
- http://localhost:3000/attacker/attacker-img.html

Check balances at http://localhost:3000/balances to see the effect.

## How It Works

The application demonstrates:

- **Vulnerable endpoint** (`/transfer`): Accepts requests without CSRF tokens
- **Protected endpoint** (`/transfer-csrf`): Requires valid CSRF tokens for protection

The vulnerable `/transfer` endpoint in server.js accepts requests without CSRF tokens, while `/transfer-csrf` requires valid CSRF tokens for protection.

## Custom 403 CSRF page (dynamic)

When a request to `/transfer-csrf` is missing/invalid, the app returns a friendly 403 page showing:

- Method and path
- Origin and Referer headers
- Timestamp

If the client sets `Accept: application/json`, a JSON error with the same details is returned instead.

## Styling (Modern UI/UX)

The demo includes a modern, accessible, and responsive design:

- Global stylesheet: `bank-demo/public/styles.css`
- Served from Express so pages can load it at `/styles.css`
- Applied to `login.html`, `bank.html`, `bank_csrf.html`, and `success.html`

Core utility classes:

- Layout: `.container`, `.card`, `.header`, `.nav`, `.footer`
- Typography: `.subtitle`
- Forms: `.form`, `.label`, `.input`
- Buttons: `.btn`, `.btn-secondary`
- Alerts and tables: `.alert`, `.table`

Customize by editing CSS variables in `:root` inside `bank-demo/public/styles.css` (colors, radius, shadows) or extending component classes.

## Project Structure

```
bank-demo/
├── package.json
├── server.js
├── public/
│   └── styles.css
├── static/
│   ├── attacker-post.html
│   └── attacker-post-protected.html
└── views/
   ├── bank.html
   ├── bank_csrf.html
   ├── csrf_error.html
   ├── login.html
   └── success.html

attacker/
├── attacker-form.html
└── attacker-img.html
```

## Security Learning

This demo helps understand:

- How CSRF attacks work
- Why CSRF tokens are important
- How to implement CSRF protection using the `csurf` middleware
