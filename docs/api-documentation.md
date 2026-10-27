# Finly REST API Documentation

Base URL: `http://localhost:5000/api/v1`  
Interactive Swagger Docs: `http://localhost:5000/api-docs`

## 1. Authentication Endpoints

### Register
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "name": "Rahul Sharma",
    "email": "rahul@finly.app",
    "password": "Password123!",
    "currency": "INR"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "user": { "_id": "...", "name": "Rahul Sharma", "email": "rahul@finly.app", "currency": "INR" }
    }
  }
  ```

### Login
- **POST** `/auth/login`
- **Body:** `{ "email": "rahul@finly.app", "password": "Password123!" }`
- **Response (200):** Same structure as Register.

### Refresh Tokens (Token Rotation)
- **POST** `/auth/refresh`
- **Body:** `{ "refreshToken": "eyJhbGciOi..." }`
- **Response (200):** Returns new `accessToken` and new `refreshToken`.

### Verify Email
- **POST** `/auth/verify-email`
- **Body:** `{ "token": "string" }`

### Forgot Password
- **POST** `/auth/forgot-password`
- **Body:** `{ "email": "rahul@finly.app" }`

### Reset Password
- **POST** `/auth/reset-password`
- **Body:** `{ "token": "...", "newPassword": "NewPassword123!" }`

---

## 2. Transactions

All transaction routes require `Authorization: Bearer <accessToken>`.

### List Transactions
- **GET** `/transactions?page=1&limit=20&type=expense&search=swiggy`
- **Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "67be01...",
        "amount": 350.5,
        "amountInPaise": 35050,
        "currency": "INR",
        "type": "expense",
        "merchant": "Swiggy",
        "description": "Lunch Biryani",
        "paymentMethod": "UPI",
        "paymentStatus": "success",
        "transactionDate": "2026-10-27T10:00:00.000Z",
        "categoryId": { "_id": "...", "name": "Food & Dining", "color": "#F97373" }
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
  }
  ```

### Create Transaction
- **POST** `/transactions`
- **Body:**
  ```json
  {
    "type": "expense",
    "amount": 450,
    "categoryId": "67be01...",
    "merchant": "Swiggy",
    "description": "Biryani",
    "transactionDate": "2026-10-27T12:00:00Z",
    "paymentMethod": "UPI",
    "referenceId": "UPI/123456789012"
  }
  ```

### Transaction Summary
- **GET** `/transactions/summary`
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "periodIncome": 85000,
      "periodExpense": 29849,
      "netFlow": 55151,
      "estimatedBalance": 55151,
      "currency": "INR",
      "incomeCount": 1,
      "expenseCount": 8,
      "isEstimatedBalance": true
    }
  }
  ```

---

## 3. AI Upload & Extraction

### Analyze UPI Screenshot
- **POST** `/uploads/upi-screenshot`
- **Headers:** `Content-Type: multipart/form-data`
- **Form Key:** `screenshot` (File: image/jpeg, image/png, etc.)
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "extracted": {
        "amount": 250,
        "currency": "INR",
        "transactionType": "expense",
        "category": "Food & Dining",
        "categoryId": "67be...",
        "categoryName": "Food & Dining",
        "merchant": "Chai Point",
        "description": "Payment to Chai Point",
        "transactionDate": "2026-10-27",
        "transactionTime": "14:32",
        "paymentMethod": "UPI",
        "paymentStatus": "success",
        "referenceId": "UPI/982736451234",
        "confidence": 0.94,
        "needsReview": false,
        "warnings": []
      },
      "duplicateCheck": { "isDuplicate": false },
      "attachmentPath": "1730030-abc.jpg"
    }
  }
  ```

### Confirm Transaction
- **POST** `/uploads/confirm-transaction`
- **Body:** JSON transaction payload approved by human user.

---

## 4. Budgets & Analytics

### Budgets
- **GET** `/budgets` - List all user budgets with real-time percentage and projected end-of-month spend.
- **POST** `/budgets` - Create overall or category-specific budget.
- **GET** `/budgets/:id` - Budget progress.
- **DELETE** `/budgets/:id` - Delete budget.

### Analytics
- **GET** `/analytics/overview` - Monthly income, expense, savings rate, and daily average.
- **GET** `/analytics/spending-trend?days=7` - Daily spending series for charts.
- **GET** `/analytics/category-breakdown` - Category expense shares and percentages.
- **GET** `/analytics/payment-methods` - UPI vs Cash vs Card shares.
- **GET** `/analytics/month-comparison` - Month-over-month differences.
- **GET** `/analytics/top-merchants` - Highest volume merchants.

---

## 5. Grounded AI Insights
- **GET** `/insights` - Returns active AI spending recommendations.
- **POST** `/insights/generate` - Re-evaluates transactions and triggers Gemini analysis.
- **PATCH** `/insights/:id/dismiss` - Dismisses an insight.
- **POST** `/insights/:id/feedback` - `{ "feedback": "helpful" | "not_helpful" }`.

---

## 6. Exports & Statements
- **GET** `/exports/transactions.csv` - Download CSV of all user transactions.
- **GET** `/exports/monthly-report` - Monthly JSON statement breakdown.

