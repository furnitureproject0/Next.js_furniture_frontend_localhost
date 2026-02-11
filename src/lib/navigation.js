/**
 * Navigation utilities for handling redirects with optional force refresh
 */

/**
 * Navigate to a path with optional force refresh
 * @param {string} path - The path to navigate to
 * @param {boolean} forceRefresh - Whether to force a full page refresh
 */
export const navigateTo = (path, forceRefresh = true) => {
	if (forceRefresh && typeof window !== "undefined") {
		window.location.href = path;
	} else {
		// For server-side or when force refresh is disabled, return the path
		// This can be used with Next.js router
		return path;
	}
};

/**
 * Force refresh the current page
 */
export const forceRefresh = () => {
	if (typeof window !== "undefined") {
		window.location.reload();
	}
};

/**
 * Navigate with replace (no history entry) and optional force refresh
 * @param {string} path - The path to navigate to
 * @param {boolean} forceRefresh - Whether to force a full page refresh
 */
export const replaceTo = (path, forceRefresh = true) => {
	if (forceRefresh && typeof window !== "undefined") {
		window.location.replace(path);
	} else {
		return path;
	}
};

/**
 * Get role-based dashboard path
 * @param {string} role - User role
 * @returns {string} Dashboard path for the role
 */
export const getDashboardPath = (role) => {
	const normalizedRole = role?.replace(/_/g, "-");

	switch (normalizedRole) {
		case "super-admin":
			return "/super-admin/dashboard";
		case "site-admin":
			return "/site-admin/dashboard";
		case "company-admin":
			return "/company-admin/dashboard";
		case "client":
		case "customer":
			return "/client/dashboard";
		case "driver":
			return "/driver/dashboard";
		case "worker":
			return "/worker/dashboard";
		default:
			return "/login";
	}
};
