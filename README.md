# Finly — Every Rupee Counts.
### AI-Powered Personal Finance Tracker for India

Finly is a personal finance application built with **React Native (Expo)**, **Express.js (TypeScript)**, **MongoDB**, and **Google Gemini 2.5 Flash Vision AI**. It simplifies expense tracking for Indian users through instant UPI payment screenshot extraction, automated budgeting, and grounded financial savings insights.

---

## ✨ Key Features

- 📸 **AI UPI Screenshot & Receipt Scanner:** Upload Google Pay, PhonePe, Paytm, or paper bill receipts. Gemini Vision automatically detects amounts in ₹, merchant names, transaction dates, and categories.
- 🔍 **Human Confirmation Review:** Extracted details are displayed on a dedicated review screen for verification before anything is saved to the database. Includes duplicate detection warnings.
- 💰 **INR-First Accounting:** Native ₹ formatting (`₹1,25,000.00`), minor unit precision (integer paise) to prevent floating-point calculation errors.
- 📊 **Smart Dashboard & 7-Day Activity:** Real-time tracked balance, income, expenses, category pie charts, and daily spending trend bars.
- 🎯 **Budgets & Threshold Warnings:** Set monthly or category budgets with proactive alerts at 50%, 75%, 90%, and 100% capacity.
- 💡 **Grounded AI Financial Assistant:** Real math-backed savings suggestions (e.g. food delivery overspending, recurring subscription review).
- 🎨 **Polished Theme System:** Vibrant light and dark themes with instantaneous theme switching.
- 🔒 **Enterprise-Grade Security:** Bcrypt hashing, short-lived JWTs, cryptographic refresh token rotation, biometric lock support, and per-user database isolation.
- 📁 **Data Export & Privacy:** One-click CSV export of all transactions and account deletion with complete cascade cleanup.

---

## 🏗️ Architecture

```
finly/
├── backend/            # Express.js, TypeScript, Mongoose, Gemini AI, Pino, Vitest
│   ├── src/
│   │   ├── config/     # Database, Environment, CORS
│   │   ├── routes/     # Auth, User, Transactions, Uploads, Budgets, Analytics, Insights
│   │   ├── services/   # Business logic, Gemini Vision, Categorization, Calculations
│   │   ├── models/     # 8 Normalized Mongoose models
│   │   └── utils/      # Currency (Paise), Dates, Logging, JWT, Seed Script
│   └── tests/          # 14 automated API tests (Supertest + Vitest)
│
├── frontend/           # React Native, Expo Router, Reanimated, TanStack Query, Zustand
│   ├── app/            # File-based navigation (auth, tabs, transactions, upload, budgets)
│   ├── src/
│   │   ├── components/ # Header, BalanceCard, TransactionItem, BudgetCard, Charts
│   │   ├── store/      # Zustand AuthStore & ThemeStore
│   │   ├── theme/      # Color tokens (#635BFF, #20C997, #F97373), Typography
│   │   └── utils/      # INR formatter, Export helper, Storage
│   └── tests/          # Frontend unit tests
│
└── docs/               # Architecture, API Documentation, Database Schema, Setup, Security
```

---

## 🚀 Quick Start Guide

### 1. Start MongoDB
Ensure MongoDB is running locally:
```powershell
Get-Service -Name "*mongo*"
```

### 2. Run the Backend
```bash
cd finly/backend
npm install
npm run seed      # Creates sample Indian transactions and demo account
npm run dev       # Starts server at http://localhost:5000
```
- Health Check: `http://localhost:5000/api/v1/health`
- Interactive Swagger Docs: `http://localhost:5000/api-docs`
- Run Tests: `npm test` (14/14 tests pass)

### 3. Run the Mobile Frontend
```bash
cd finly/frontend
npm install
npx expo start --web
```
- Press **w** in the terminal to view in your web browser.
- Scan the terminal QR code using **Expo Go** to test on a physical Android or iOS device.

### 4. Demo Login Credentials
- **Email:** `demo@finly.app`
- **Password:** `DemoPassword123!`
*(Or tap the ⚡ Fill Demo Account button on the login screen!)*

---

## 🧪 Testing

```bash
# Backend Automated Tests
cd finly/backend && npm test

# Frontend Unit Tests
cd finly/frontend && npm test
```

---

## 📄 License
ISC. Finly — Every Rupee Counts.

