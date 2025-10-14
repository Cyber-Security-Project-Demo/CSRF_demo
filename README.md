# CSRF Demonstration App

This is a demonstration application that shows Cross-Site Request Forgery (CSRF) vulnerabilities and how to protect against them.

## Prerequisites

Make sure you have Node.js installed on your system.

## Setup and Installation

1. **Navigate to the bank-demo directory**:

   ```bash
   cd bank-demo
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

   This will install the required packages listed in `package.json`: `express`, `body-parser`, `cookie-session`, and `csurf`.

3. **Start the server**:
   ```bash
   node server.js
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

## How It Works

The application demonstrates:

- **Vulnerable endpoint** (`/transfer`): Accepts requests without CSRF tokens
- **Protected endpoint** (`/transfer-csrf`): Requires valid CSRF tokens for protection

The vulnerable `/transfer` endpoint in server.js accepts requests without CSRF tokens, while `/transfer-csrf` requires valid CSRF tokens for protection.

## Project Structure

```
bank-demo/
├── package.json
├── server.js
└── views/
    ├── bank_csrf.html
    ├── bank.html
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
