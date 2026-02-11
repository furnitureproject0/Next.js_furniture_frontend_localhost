// Authentication utility functions

// User data is no longer stored in localStorage
// Authentication is handled via cookies only
export const getStoredUser = () => {
	return null; // Always return null - no localStorage storage
};

export const setStoredUser = (user) => {
	// No-op: User data is not stored in localStorage
	// Authentication is handled via cookies
};

export const clearStoredUser = () => {
	// No-op: No localStorage to clear
	// Cookies are managed by the server
};

export const setAuthCookie = (authenticated = true) => {
	if (typeof document === "undefined") return;

	if (authenticated) {
		document.cookie = `authenticated=true; path=/; max-age=${
			7 * 24 * 60 * 60
		}; SameSite=Lax`;
	} else {
		document.cookie =
			"authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
	}
};

export const isUserAuthenticated = () => {
	// Cannot check authentication without localStorage
	// Use Redux state or API call instead
	return false;
};
