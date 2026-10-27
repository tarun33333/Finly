# Finly Security & Privacy Architecture

## 1. Authentication & Session Management
- **Password Security:** Passwords are hashed using `bcryptjs` with 12 salt rounds before storage. Plaintext passwords are never logged or persisted.
- **Short-Lived Access Tokens:** JWT access tokens expire after 15 minutes (`ACCESS_TOKEN_TTL=15m`).
- **Refresh Token Rotation:** Refresh tokens are tracked in MongoDB using cryptographic SHA-256 hashes (`RefreshToken.tokenHash`). Upon every refresh request:
  - The previous refresh token is immediately marked `revoked: true`.
  - A new refresh token is issued.
  - If a revoked token is presented (potential token reuse attack), all active sessions for that user account are immediately revoked.
- **Biometric Security:** Native biometric authorization (Face ID / Fingerprint) locks the app UI without exposing raw biometric data to the application layer.

## 2. Authorization & Per-User Isolation
- **Ownership Verification:** Every mutation and query (Transactions, Categories, Budgets, Goals, Insights) strictly filters on `userId: req.user._id`.
- **Cross-User Tampering Prevention:** Supplying another user's ObjectId in a URL parameter returns an HTTP 404 response.

## 3. Rate Limiting & Abuse Prevention
- **Authentication Limiter:** Restricted to 20 requests per 15 minutes to block brute-force password cracking and credential stuffing.
- **AI & Upload Limiter:** Restricted to 60 requests per 15 minutes to prevent abuse of image processing and LLM endpoints.
- **Standard API Limiter:** 300 requests per 15 minutes per IP.

## 4. Input Validation & Security Headers
- **Zod Schema Validation:** Every incoming request payload (body, query parameters, URL params) is validated against strict schemas before execution.
- **Helmet Middleware:** Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and modern Content Security Policy.
- **CORS Restrictions:** Origin checking against whitelist domains.

## 5. File Uploads & Privacy Safeguards
- **File Validation:** Enforces MIME whitelist (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) and maximum size of 8 MB.
- **Randomized Identifiers:** Files are stored using cryptographic random UUID names rather than client-supplied filenames to prevent path traversal.
- **Private Access:** Uploaded receipts are not exposed through unrestricted public buckets.
- **Redacted Structured Logging:** Pino structured logger automatically redacts sensitive keys: `password`, `passwordHash`, `refreshToken`, `token`, `authorization`, `apiKey`.

## 6. Financial Accuracy & Accounting Integrity
- **Minor Unit Storage:** Stored as integer paise (`amountInPaise`) to eliminate floating-point representation bugs.
- **Duplicate Detection Window:** Automatically alerts users if a payment with the same reference ID or matching amount and merchant was recorded within +/- 24 hours.
- **No False Bank Claims:** Finly clearly labels balances as "Estimated Tracked Balance" based on recorded transactions, without claiming direct unverified core banking API access.

