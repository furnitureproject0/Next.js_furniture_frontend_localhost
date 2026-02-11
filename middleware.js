import { NextResponse } from "next/server";

export function middleware(request) {
	// Get the pathname of the request (e.g. /, /dashboard, /login)
	// const { pathname } = request.nextUrl;

	// // Define public routes that don't require authentication
	// const publicRoutes = ["/login"];

	// // Define API routes that should be excluded from redirect (except protected ones)
	// const publicApiRoutes = ["/api/auth/login", "/api/auth/register"];

	// // Define static assets and Next.js internal routes that should be excluded
	// const staticAssets =
	// 	pathname.startsWith("/_next/") ||
	// 	pathname.startsWith("/favicon.ico") ||
	// 	pathname.startsWith("/public/") ||
	// 	(pathname.includes(".") && !pathname.startsWith("/api/"));

	// // Skip middleware for static assets and Next.js internals
	// if (staticAssets) {
	// 	return NextResponse.next();
	// }

	// // Skip middleware for public routes
	// if (publicRoutes.includes(pathname)) {
	// 	return NextResponse.next();
	// }

	// // Skip middleware for public API routes
	// if (publicApiRoutes.includes(pathname)) {
	// 	return NextResponse.next();
	// }

	// // Check for authentication cookie
	// const isAuthenticated =
	// 	request.cookies.get("authenticated")?.value === "true";

	// // If not authenticated, redirect to login (except for API routes which should return 401)
	// if (!isAuthenticated) {
	// 	if (pathname.startsWith("/api/")) {
	// 		return NextResponse.json(
	// 			{ success: false, message: "Authentication required" },
	// 			{ status: 401 },
	// 		);
	// 	}

	// 	const loginUrl = new URL("/login", request.url);
	// 	// Add the current path as a redirect parameter
	// 	if (pathname !== "/") {
	// 		loginUrl.searchParams.set("redirect", pathname);
	// 	}
	// 	return NextResponse.redirect(loginUrl);
	// }

	// return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!_next/static|_next/image|favicon.ico|public/).*)",
	],
};
