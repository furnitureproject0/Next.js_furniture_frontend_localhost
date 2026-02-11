# CORS Setup Guide

The "Referrer Policy strict-origin-when-cross-origin" error indicates a CORS (Cross-Origin Resource Sharing) issue. Here are several solutions:

## Solution 1: Backend CORS Configuration (Recommended)

Add CORS middleware to your backend server. If you're using Express.js:

```javascript
const cors = require("cors");

app.use(
	cors({
		origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Your frontend URLs
		credentials: true, // Allow cookies
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
	}),
);
```

## Solution 2: Next.js Proxy (Current Implementation)

I've configured Next.js to proxy API requests. This means:

-   In development: API calls go to `/api/*` which proxies to your backend
-   In production: Direct calls to your backend URL

## Solution 3: Direct API with CORS Headers

If you can't modify the backend, try this configuration:

```javascript
// In src/lib/api.js
const config = {
	method: options.method || "GET",
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
	mode: "no-cors", // This bypasses CORS but limits response access
	...options,
};
```

## Testing the Connection

1. Add the ApiTest component to your login page temporarily:

```javascript
import ApiTest from "@/components/ApiTest";

// Add this to your login page JSX
<ApiTest />;
```

2. Check browser console for detailed error messages
3. Verify your backend is running on the correct port
4. Test the API endpoints directly in Postman/browser

## Backend Server Requirements

Make sure your backend server:

1. Is running on the correct port (default: 3001)
2. Has CORS properly configured
3. Accepts JSON requests
4. Returns proper JSON responses
5. Handles preflight OPTIONS requests

## Environment Variables

Update your `.env.local`:

```env
# For direct API calls
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# For proxy approach (recommended in development)
# NEXT_PUBLIC_API_BASE_URL=/api
```

## Quick Fix for Testing

If you need a quick fix for testing, you can temporarily disable CORS in your browser:

-   Chrome: Start with `--disable-web-security --user-data-dir=/tmp/chrome_dev_session`
-   This is NOT recommended for production

## Debugging Steps

1. Open browser DevTools → Network tab
2. Try to login and watch the network requests
3. Look for:
    - Request URL
    - Request headers
    - Response status
    - CORS errors in console

The most common issues are:

-   Backend not running
-   Wrong API URL
-   Missing CORS headers on backend
-   Incorrect request format
