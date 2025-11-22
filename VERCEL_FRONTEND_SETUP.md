# Vercel Frontend Deployment - Environment Variables

## Issue Fixed
The frontend was hardcoded to use `http://localhost:5000/api/v1` instead of the deployed backend URL.

## Solution
The code now automatically detects the environment:
- **Local development**: Uses `http://localhost:5000/api/v1`
- **Production (Vercel)**: Uses `https://shophubbackend.vercel.app/api/v1`

## Setting Environment Variable in Vercel

### Option 1: Set in Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

   **Name:** `NEXT_PUBLIC_API_URL`
   
   **Value:** `https://shophubbackend.vercel.app/api/v1`
   
   **Environment:** Select all (Production, Preview, Development)

4. Click **Save**
5. **Redeploy** your application for the changes to take effect

### Option 2: Use Automatic Detection (Current Implementation)

The code now automatically uses:
- `http://localhost:5000/api/v1` when running on localhost
- `https://shophubbackend.vercel.app/api/v1` when deployed to Vercel

**No environment variable needed** if you're okay with this default behavior.

## Verification

After setting the environment variable and redeploying:

1. Open your deployed frontend
2. Open browser DevTools → Network tab
3. Try to login or make any API call
4. Check the request URL - it should be `https://shophubbackend.vercel.app/api/v1/...`

## Files Updated

1. ✅ `src/lib/apiConfig.jsx` - Now uses environment-aware URL detection
2. ✅ `src/app/(admin)/admin/test-upload/page.jsx` - Fixed hardcoded localhost URL

## Important Notes

- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- After adding/changing environment variables in Vercel, you **must redeploy** for changes to take effect
- The backend URL should end with `/api/v1` (not just `/api`)

