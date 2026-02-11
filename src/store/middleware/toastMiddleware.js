import { isRejected, isRejectedWithValue } from "@reduxjs/toolkit";

// Store reference to toast function - will be set by ToastProvider
let toastHandler = null;

export const setToastHandler = (handler) => {
	toastHandler = handler;
};

export const toastMiddleware = (store) => (next) => (action) => {
	// Check if action is a rejected thunk (both with and without value)
	if (isRejected(action) || isRejectedWithValue(action)) {
		const errorPayload = action.payload;
		const error = action.error;
		
		// Extract error message
		let errorMessage = "An error occurred";
		
		// Try to get message from payload first
		if (errorPayload) {
			if (typeof errorPayload === "string") {
				errorMessage = errorPayload;
			} else if (errorPayload.message) {
				errorMessage = errorPayload.message;
			} else if (errorPayload.error) {
				errorMessage = errorPayload.error;
			} else if (errorPayload.data?.message) {
				errorMessage = errorPayload.data.message;
			}
		} 
		// Fallback to error object
		else if (error?.message) {
			errorMessage = error.message;
		}

		// Show toast if handler is available
		if (toastHandler && errorMessage) {
			// Skip toast for specific error types that should be handled silently
			const lowerMessage = errorMessage.toLowerCase();
			
			// Skip auth errors (401) - these are handled separately
			if (
				errorMessage.includes("401") || 
				lowerMessage.includes("unauthorized") ||
				lowerMessage.includes("not authenticated")
			) {
				// Don't show toast for auth errors
				return next(action);
			}

			// Skip checkAuth errors (they're expected when user is not logged in)
			if (action.type?.includes("checkAuth")) {
				return next(action);
			}

			// Show error toast
			toastHandler.error(errorMessage);
		}
	}

	return next(action);
};

