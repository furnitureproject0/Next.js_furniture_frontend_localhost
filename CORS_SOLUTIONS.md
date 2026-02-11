# CORS Issue Solutions

You're getting a CORS error because your frontend (localhost:3000) is trying to access your backend API (https://pra-delal.online/api) and the server doesn't allow cross-origin requests.

## Quick Solutions (Choose One)

### Solution 1: Use the Proxy Approach (Recommended)

Update your `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=/api/proxy
```

This will route all API calls through Next.js proxy, avoiding CORS issues entirely.

### Solution 2: Fix Backend CORS (Best Long-term Solution)

Add CORS headers to your backend server. If using Express.js:

```javascript
const cors = require("cors");

app.use(
	cors({
		origin: ["http://localhost:3000", "https://your-frontend-domain.com"],
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
	}),
);
```

### Solution 3: Temporary No-CORS Mode (Limited Functionality)

Update `src/lib/api.js`:

```javascript
const config = {
	method: options.method || "GET",
	headers: {
		"Content-Type": "application/json",
	},
	mode: "no-cors", // This bypasses CORS but limits response access
	...options,
};
```

**Note:** This limits what you can read from the response.

## Testing Steps

1. I've added a `ConnectionTest` component to your login page
2. Open your login page and use the test buttons to see which approach works
3. Check the browser console for detailed error messages

## Current Setup

-   **Frontend:** http://localhost:3000
-   **Backend:** https://pra-delal.online/api
-   **Issue:** Backend doesn't send proper CORS headers

## What to Do Next

1. **Test the connection** using the ConnectionTest component
2. **Try the proxy approach** by changing the env variable
3. **Contact your backend developer** to add CORS headers
4. **Remove the ConnectionTest component** once everything works

## Files I've Created/Modified

-   ✅ `src/components/ConnectionTest.js` - Debug component
-   ✅ `src/app/api/proxy/[...path]/route.js` - Next.js proxy
-   ✅ `next.config.js` - Next.js configuration
-   ✅ Updated API configuration with better error handling

The proxy approach should work immediately without requiring backend changes!
