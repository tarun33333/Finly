# Finly Architecture Documentation

## 1. System Overview

**Finly** ("Every Rupee Counts") is a production-minded personal finance management application designed primarily for Indian users, built with React Native (Expo) and a Node.js/Express TypeScript backend powered by MongoDB and Google Gemini 2.5 Flash Vision AI.

```
┌───────────────────────────────────────────────────────────────┐
│                     React Native (Expo)                       │
│  - Expo Router (File-based navigation)                        │
│  - Zustand (Theme & Auth State)                               │
│  - TanStack Query (Server State & Invalidation)               │
│  - React Native Reanimated                                    │
│  - SecureStore (JWT Tokens) & AsyncStorage (Preferences)      │
└───────────────────────────────▲───────────────────────────────┘
                                │ REST API (JSON / Multipart)
                                │ JWT Bearer Auth & Auto-Rotation
┌───────────────────────────────▼───────────────────────────────┐
│                     Express.js Backend                        │
│  - Controllers (Thin route handlers)                          │
│  - Services (Business logic & calculations)                   │
│  - Middleware (Auth, Upload validation, Rate limit, Errors)   │
│  - Zod Request Validation                                     │
└──────────────────────▲──────────────────────────────▲─────────┘
                       │                              │
┌──────────────────────▼───────┐      ┌───────────────▼─────────┐
│       MongoDB (Local/Atlas)  │      │   Google Gemini 2.5     │
│  - 8 Normalized Models       │      │   - UPI Receipt OCR     │
│  - Minor unit precision      │      │   - Cash Bill Extraction│
│  - Compound indexes          │      │   - Grounded Insights   │
└──────────────────────────────┘      └─────────────────────────┘
```

## 2. Core Architectural Pillars

### A. Mobile Client Architecture
- **Expo Router:** Modular file-based navigation with strict typed routing. Grouped into `(auth)` for authentication and onboarding, and `(tabs)` for the 5-destination bottom navigation bar (Home, Transactions, Analytics, Budgets, Profile).
- **Offline & Token Security:** Sensitive access and refresh tokens are stored in `expo-secure-store` on native platforms (with web compatibility fallback). Non-sensitive user theme and display preferences use `AsyncStorage`.
- **Server State Management:** TanStack Query caches all API data, supports pull-to-refresh on all primary screens, and provides instantaneous invalidation when transactions, budgets, or categories are updated.
- **Biometric Security:** Supports biometric unlocking (Face ID / Fingerprint) through `expo-local-authentication`.

### B. Backend Architecture
- **Layered Clean Architecture:**
  1. `routes/`: Express endpoint definitions and middleware chaining.
  2. `validators/`: Zod schemas validating request body, query, and path params.
  3. `controllers/`: Thin handlers parsing requests and delegating to services.
  4. `services/`: Core financial calculations, duplicate detection, AI orchestration, and database manipulation.
  5. `models/`: Mongoose schemas with compound indexes, ownership checks, and strict validation.
- **Accounting Precision:** All financial figures are converted to integer minor units (paise for INR: 1 Rupee = 100 Paise) to eliminate IEEE 754 floating-point rounding errors.
- **User Isolation:** All database queries require matching `userId: req.user._id`. Users cannot view or mutate another user's financial records.

### C. AI Vision Processing Pipeline
1. User selects screenshot (Google Pay, PhonePe, Paytm, CRED) or paper receipt.
2. Mobile client sends multipart upload to `/api/v1/uploads/upi-screenshot` or `/api/v1/uploads/receipt`.
3. Backend validates file size (max 8MB), mime type (JPEG, PNG, WEBP, PDF), and saves with random UUID.
4. `gemini.service.ts` submits image payload with a specialized structured prompt to `GEMINI_MODEL` (`gemini-2.5-flash`).
5. Gemini returns strict JSON containing:
   - `amount`, `currency` (INR)
   - `merchant`, `description`
   - `transactionDate`, `transactionTime`
   - `paymentMethod` (UPI, Cash)
   - `paymentStatus` (success, pending, failed)
   - `referenceId` (UPI UTR / Ref No)
   - `confidence`, `warnings`
6. `categorization.service.ts` predicts category based on merchant keyword rules + past confirmed user habits.
7. `transaction.service.ts` runs duplicate detection checking for identical UTR or matching amount+merchant within a +/- 24h window.
8. The proposed transaction details are returned to the client for **Human Confirmation** on `review-import.tsx`. Transactions are never auto-saved without user review.

