# Finly Production Deployment Guide

Finly is engineered with complete separation between the frontend mobile application and backend REST API, allowing both layers to scale and deploy independently.

---

## 1. Backend Deployment

### Deployment Options
- **Containerized:** Docker container deployed to AWS ECS, Google Cloud Run, Azure Container Apps, or Render.
- **Node.js Process:** Linux VPS managed by PM2 behind an NGINX reverse proxy with Let's Encrypt SSL.

### Production Environment Variables
Set the following environment variables in your production environment:

```env
NODE_ENV=production
PORT=5000
API_PREFIX=/api/v1
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/finly?retryWrites=true&w=majority
JWT_ACCESS_SECRET=<64-character-cryptographically-secure-random-secret>
JWT_REFRESH_SECRET=<64-character-cryptographically-secure-random-secret>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=30
GEMINI_API_KEY=<production_gemini_api_key>
GEMINI_MODEL=gemini-2.5-flash
GOOGLE_CLIENT_ID=<production_google_oauth_client_id>
GOOGLE_CLIENT_SECRET=<production_google_oauth_client_secret>
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<sendgrid_api_key>
EMAIL_FROM=support@finly.app
CORS_ORIGINS=https://app.finly.app,finly://
MAX_UPLOAD_MB=8
UPLOAD_STORAGE=s3
```

### Production Build & Launch
```bash
cd finly/backend
npm install --omit=dev
npm run build
node dist/server.js
```

---

## 2. Frontend Mobile Deployment (EAS / Expo)

### EAS Build (Android & iOS)
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. Configure `eas.json`:
   ```json
   {
     "build": {
       "production": {
         "env": {
           "EXPO_PUBLIC_API_URL": "https://api.finly.app/api/v1"
         }
       }
     }
   }
   ```

3. Build Android App Bundle (AAB):
   ```bash
   eas build --platform android --profile production
   ```

4. Build iOS App (IPA):
   ```bash
   eas build --platform ios --profile production
   ```

### Web Deployment
To host the web version (PWA / Web App):
```bash
cd finly/frontend
npx expo export -p web
```
Upload the resulting `dist/` directory to Vercel, Cloudflare Pages, or AWS S3 + CloudFront.

