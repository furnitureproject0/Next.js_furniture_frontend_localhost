"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Extract token directly from URL (synchronous, for immediate use)
 * This is used to get token before React hooks are ready
 */
const getTokenFromUrl = () => {
	if (typeof window === "undefined") return null;
	
	const urlParams = new URLSearchParams(window.location.search);
	const token = urlParams.get("token");
	
	if (token) {
		// Store in sessionStorage for persistence
		sessionStorage.setItem("clientOrderToken", token);
		return token;
	}
	
	// Try to get from sessionStorage if not in URL
	return sessionStorage.getItem("clientOrderToken");
};

/**
 * Custom hook to extract and manage client token from URL query parameter
 * Used for client order pages accessed via email links
 * @returns {object} - { token, hasToken }
 */
export const useClientToken = () => {
	const searchParams = useSearchParams();
	// Initialize with token from URL immediately (synchronous)
	const [token, setToken] = useState(() => getTokenFromUrl());

	useEffect(() => {
		// Extract token from URL query parameter (from useSearchParams)
		const tokenFromUrl = searchParams.get("token");
		
		if (tokenFromUrl) {
			setToken(tokenFromUrl);
			// Store in sessionStorage for persistence during navigation
			if (typeof window !== "undefined") {
				sessionStorage.setItem("clientOrderToken", tokenFromUrl);
			}
		} else if (!token) {
			// Try to get from sessionStorage if not in URL and token is not already set
			if (typeof window !== "undefined") {
				const storedToken = sessionStorage.getItem("clientOrderToken");
				if (storedToken) {
					setToken(storedToken);
				}
			}
		}
	}, [searchParams, token]);

	return {
		token,
		hasToken: !!token,
	};
};

