/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	// Disable static optimization for pages that need fresh data
	experimental: {
		staleTimes: {
			dynamic: 0,
			static: 0,
		},
	},
	async rewrites() {
		// In development, proxy API requests to localhost:5000 to avoid CORS issues
		// In production, proxy to production backend
		// Note: Socket.IO requires direct connection - cannot use proxy due to WebSocket upgrade
		const isDevelopment = process.env.NODE_ENV === 'development';
		const apiDestination = isDevelopment
			? "http://localhost:5000/api/:path*"
			: "https://backend-production-3bcd.up.railway.app/api/:path*";

		return [
			{
				source: "/api/:path*",
				destination: apiDestination,
			},
			// Socket.IO cannot use proxy - requires direct connection
			// Backend CORS must be configured to allow localhost:3000
		];
	},
	async headers() {
		return [
			{
				source: "/api/:path*",
				headers: [
					{ key: "Access-Control-Allow-Credentials", value: "true" },
					{ key: "Access-Control-Allow-Origin", value: "*" },
					{
						key: "Access-Control-Allow-Methods",
						value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
					},
					{
						key: "Access-Control-Allow-Headers",
						value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
					},
				],
			},
			{
				// Add cache control headers for dashboard pages to prevent caching
				source: "/(site-admin|company-admin|client)/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "no-cache, no-store, must-revalidate",
					},
					{ key: "Pragma", value: "no-cache" },
					{ key: "Expires", value: "0" },
				],
			},
		];
	},
};

module.exports = nextConfig;
