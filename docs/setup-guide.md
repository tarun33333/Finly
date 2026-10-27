# Finly Setup & Local Development Guide

## Prerequisites
- **Node.js**: v20.0.0+ (Tested on v22.15.0)
- **npm**: v10.0.0+
- **MongoDB**: v7.0+ or v8.0+ running locally on port 27017
- **Expo Go** or an Android/iOS emulator (for mobile testing) or a modern web browser

---

## 1. Backend Setup

1. Open a terminal and navigate to `backend`:
   ```bash
   cd finly/backend
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   *Verify that `MONGODB_URI=mongodb://127.0.0.1:27017/finly` matches your local MongoDB.*
   *(Optional) Add your Google Gemini API key to `GEMINI_API_KEY` for live AI screenshot reading.*

3. Seed demo data (Indian transactions, categories, budgets, sample user):
   ```bash
   npm run seed
   ```
   *Demo credentials created:*
   - **Email:** `demo@finly.app`
   - **Password:** `DemoPassword123!`

4. Start backend in development mode:
   ```bash
   npm run dev
   ```
   Expected output:
   - Server running at `http://localhost:5000/api/v1`
   - Interactive Swagger API docs: `http://localhost:5000/api-docs`
   - Health check: `http://localhost:5000/api/v1/health`

5. Run automated tests:
   ```bash
   npm test
   ```

---

## 2. Frontend Setup

1. In a separate terminal, navigate to `frontend`:
   ```bash
   cd finly/frontend
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   - For web or local simulator: `EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1`
   - For a physical phone on the same Wi-Fi: change `localhost` to your computer's LAN IP (e.g. `http://192.168.1.15:5000/api/v1`).

3. Start the Expo application:
   ```bash
   npx expo start
   ```
   - Press **w** in the terminal to open in your web browser.
   - Scan the QR code with **Expo Go** on Android or the Camera app on iOS to run on your phone.

4. Run frontend unit tests:
   ```bash
   npm test
   ```

---

## 3. Evaluator Quick-Start Verification

1. Start backend: `cd finly/backend && npm run dev`
2. Start frontend: `cd finly/frontend && npx expo start --web`
3. On the Welcome screen, click **Sign In**.
4. Tap **⚡ Fill Demo Account (demo@finly.app)** to immediately load realistic Indian transaction history, category breakdowns, budgets, and savings calculations.
5. Upload a UPI screenshot or click **Add Expense** to record new transactions in INR.

