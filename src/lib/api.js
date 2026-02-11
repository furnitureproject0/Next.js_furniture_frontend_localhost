// API configuration and utilities
// Use Next.js proxy in development (localhost) to avoid CORS issues
// Next.js will proxy /api/* to http://localhost:5000/api/* in development
// Use direct URL in production
// Use environment variable for consistent server/client behavior
const getApiBaseUrl = () => {
	// Use environment variable if available (consistent for SSR)
	if (process.env.NEXT_PUBLIC_API_BASE_URL) {
		return process.env.NEXT_PUBLIC_API_BASE_URL;
	}
	// Fallback: check window only on client side
	if (typeof window !== "undefined") {
		return window.location.hostname === 'localhost' 
			? '/api'  // Use Next.js proxy in development (proxies to localhost:5000)
			: "https://backend-production-3bcd.up.railway.app/api";  // Direct URL in production
	}
	// Server-side: default to production URL (will be overridden by client)
	return "https://backend-production-3bcd.up.railway.app/api";
};

class ApiError extends Error {
	constructor(message, status, data) {
		super(message);
		this.status = status;
		this.data = data;
	}
}

const apiRequest = async (endpoint, options = {}) => {
	// Get API base URL dynamically to ensure consistency
	const baseUrl = getApiBaseUrl();
	// Ensure endpoint starts with / to properly concatenate with base URL
	const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	const url = `${baseUrl}${normalizedEndpoint}`;

	let headers = {
		"Content-Type": "application/json",
		// ...options.headers,
	};

	// Authentication: Support both Bearer token (from Authorization header) and cookies
	// If token is provided in options, add it to Authorization header
	if (options.token) {
		headers["Authorization"] = `Bearer ${options.token}`;
	}

	// Authentication is handled via cookies (current implementation) and/or Bearer token
	// No localStorage user data needed

	const config = {
		method: options.method || "GET",
		headers,
		credentials: "include", // Include cookies for authentication
		...options,
	};
	
	// Remove token from config to avoid sending it in body
	delete config.token;

	// Helper to check if an object contains any File instances
	const hasFile = (obj) => {
		if (obj instanceof File) {
			return true;
		}
		if (Array.isArray(obj)) {
			return obj.some(hasFile);
		}
		if (typeof obj === "object" && obj !== null) {
			return Object.values(obj).some(hasFile);
		}
		return false;
	};

	// Helper to recursively build FormData for nested objects/arrays
	const buildFormData = (formData, data, parentKey = "") => {
		if (data && typeof data === "object" && !(data instanceof File)) {
			Object.keys(data).forEach((key) => {
				const value = data[key];
				// Use bracket notation for nested objects/arrays in FormData
				const formKey = parentKey ? `${parentKey}[${key}]` : key;

				if (value instanceof File) {
					formData.append(formKey, value, value.name);
				} else if (Array.isArray(value)) {
					value.forEach((item, index) => {
						if (item instanceof File) {
							formData.append(`${formKey}[${index}]`, item, item.name);
						} else if (typeof item === "object" && item !== null) {
							// Stringify complex objects within arrays
							formData.append(`${formKey}[${index}]`, JSON.stringify(item));
						} else {
							formData.append(`${formKey}[${index}]`, item);
						}
					});
				} else if (typeof value === "object" && value !== null) {
					// Stringify complex objects
					formData.append(formKey, JSON.stringify(value));
				} else if (value !== undefined && value !== null) {
					// If value is already a string (like stringified JSON), append it directly
					formData.append(formKey, value);
				}
			});
		} else if (data instanceof File) {
			formData.append(parentKey, data, data.name);
		} else if (data !== undefined && data !== null) {
			formData.append(parentKey, data);
		}
	};

	// Check if this is the create order endpoint - must use multipart/form-data
	const isCreateOrderEndpoint = url.includes('/orders') && options.method === 'POST' && !url.includes('/orders/');
	
	// Handle multipart/form-data for file uploads OR create order endpoint
	if (options.body && options.method !== "GET" && (hasFile(options.body) || isCreateOrderEndpoint)) {
		const formData = new FormData();
		
		// Handle image files separately - backend expects them in req.files, not req.body
		// Check if images array contains File objects
		const images = options.body.images;
		const imageFiles = options.body._imageFiles || (images && Array.isArray(images) ? images.filter(img => img instanceof File) : []);
		
		if (imageFiles && Array.isArray(imageFiles) && imageFiles.length > 0) {
			// Add each image file with the key 'images' (not 'images[]') - backend expects req.files['images']
			// According to FRONTEND_INTEGRATION_GUIDE.md, field name should be 'images' (plural)
			imageFiles.forEach((file) => {
				if (file instanceof File) {
					formData.append('images', file, file.name);
				}
			});
		}
		
		// Build FormData from the rest of the body
		// Remove _imageFiles and images array completely - backend doesn't accept images in req.body
		const bodyForFormData = { ...options.body };
		delete bodyForFormData._imageFiles;
		delete bodyForFormData.images; // Remove images completely - backend validation rejects it
		
		// For create order endpoint, stringify JSON objects (location, destination_location, services)
		if (isCreateOrderEndpoint) {
			// Stringify location if it exists
			if (bodyForFormData.location && typeof bodyForFormData.location === 'object') {
				bodyForFormData.location = JSON.stringify(bodyForFormData.location);
			}
			// Stringify destination_location if it exists
			if (bodyForFormData.destination_location && typeof bodyForFormData.destination_location === 'object') {
				bodyForFormData.destination_location = JSON.stringify(bodyForFormData.destination_location);
			}
			// Stringify services if it exists
			if (bodyForFormData.services && Array.isArray(bodyForFormData.services)) {
				bodyForFormData.services = JSON.stringify(bodyForFormData.services);
			}
		}
		
		// Build FormData for the rest of the body
		buildFormData(formData, bodyForFormData);
		
		config.body = formData;
		// Remove Content-Type header as FormData sets it automatically with the correct boundary
		delete config.headers["Content-Type"];
	} else if (options.body && typeof options.body === "object") {
		config.body = JSON.stringify(options.body);
	}

	try {
		const response = await fetch(url, config);


		// Check if response is JSON
		let data;
		
		try {
			const text = await response.text();
			if (!text) {
				// Empty response
				data = { success: false, message: "Empty response from server" };
			} else {
				try {
					data = JSON.parse(text);
				} catch (jsonError) {
					// Response is not valid JSON
					// For 404 errors on notifications endpoint, handle gracefully (endpoint might not exist yet)
					if (response.status === 404 && url.includes('/notifications')) {
						throw new ApiError(
							"Notifications endpoint not available",
							response.status,
							{ rawResponse: text, isNotifications404: true },
						);
					}
					// Only log errors for non-notifications endpoints or non-404 errors
					if (!url.includes('/notifications') || response.status !== 404) {
						console.error("Response is not JSON. Status:", response.status);
						console.error("Response text:", text);
					}
					throw new ApiError(
						`Server returned non-JSON response: ${text.substring(0, 100)}`,
						response.status,
						{ rawResponse: text },
					);
				}
			}
		} catch (parseError) {
			// If it's already an ApiError, re-throw it
			if (parseError instanceof ApiError) {
				throw parseError;
			}
			// Otherwise, wrap it
			throw new ApiError(
				parseError.message || "Server returned non-JSON response",
				response.status,
				{ originalError: parseError },
			);
		}

		// Handle 401 (Unauthorized) as a special case - not an error, just not authenticated
		if (response.status === 401) {
			// Return null to indicate user is not authenticated (no error thrown)
			return null;
		}

		// Handle 404 (Not Found) - check if it's a report endpoint, return null gracefully
		if (response.status === 404) {
			// Check if this is a report endpoint (pattern: /orders/{id}/orderServices/{id}/report)
			const isReportEndpoint = url.includes('/orderServices/') && url.includes('/report');
			if (isReportEndpoint) {
				// For report endpoints, 404 means no report exists yet - return null instead of throwing
				// This prevents console errors when opening the report modal for the first time
				return null;
			}
		}

		// Handle success status codes (200 OK, 201 Created, 204 No Content)
		if (response.status >= 200 && response.status < 300) {
			return data;
		}

		// Throw API error for non-success responses
		// Handle cases where data might not be an object or might not have a message
		const errorMessage = (data && typeof data === 'object' && data.message) 
			? data.message
			: (typeof data === 'string' ? data : `HTTP ${response.status}: ${response.statusText}`);
		
		throw new ApiError(
			errorMessage,
			response.status,
			data && typeof data === 'object' ? data : { rawResponse: data },
		);
	} catch (error) {
		console.error("API Request Error:", error);

		// Re-throw ApiError instances as-is
		if (error instanceof ApiError) {
			throw error;
		}

		// Handle network errors
		if (error.name === "TypeError" && error.message.includes("fetch")) {
			throw new ApiError(
				"Unable to connect to server. Please check if the server is running.",
				0,
				null,
			);
		}

		// Handle other errors
		throw new ApiError(
			error.message || "Network error occurred",
			0,
			null,
		);
	}
};

export const authApi = {
	login: (credentials) =>
		apiRequest("/auth/login", {
			method: "POST",
			body: credentials,
		}),

	register: (userData) =>
		apiRequest("/auth/register", {
			method: "POST",
			body: userData,
		}),

	logout: () =>
		apiRequest("/auth/logout", {
			method: "GET",
		}),

	getMe: () =>
		apiRequest("/auth/me", {
			method: "GET",
		}),
};

// Services API endpoints
export const servicesApi = {
	getServices: () =>
		apiRequest("/services", {
			method: "GET",
		}),
	
	getAdditionById: (additionId) =>
		apiRequest(`/additions/${additionId}`, {
			method: "GET",
		}),
};

// Companies API endpoints
export const companiesApi = {
	getCompanies: () =>
		apiRequest("/companies", {
			method: "GET",
		}),
	
	getCompanyById: (companyId) =>
		apiRequest(`/companies/${companyId}`, {
			method: "GET",
		}),
};

// Customer API endpoints
export const customerApi = {
	getOrders: (filters = {}, token = null) => {
		const queryParams = new URLSearchParams();
		if (filters.client_id) {
			queryParams.append("client_id", filters.client_id);
		}
		if (filters.company_id) {
			queryParams.append("company_id", filters.company_id);
		}
		if (filters.status) {
			queryParams.append("status", filters.status);
		}
		const queryString = queryParams.toString();
		return apiRequest(`/orders${queryString ? `?${queryString}` : ""}`, {
			method: "GET",
			token,
		});
	},

	createOrder: (orderData, token = null) =>
		apiRequest("/orders", {
			method: "POST",
			body: orderData,
			token,
		}),

	getOrderById: (orderId, token = null) =>
		apiRequest(`/orders/${orderId}`, {
			method: "GET",
			token,
		}),

	acceptOffer: (offerId, token = null) =>
		apiRequest(`/offers/${offerId}/accept`, {
			method: "PATCH",
			token,
		}),

	rejectOffer: (offerId, reason, token = null) =>
		apiRequest(`/offers/${offerId}/reject`, {
			method: "PATCH",
			body: { reason },
			token,
		}),
	
	updateOrder: (orderId, orderData, token = null) =>
		apiRequest(`/orders/${orderId}`, {
			method: "PATCH",
			body: orderData,
			token,
		}),
	
	getOrderServiceCompanies: (orderId, orderServiceId, token = null) =>
		apiRequest(`/orders/${orderId}/orderServices/${orderServiceId}/companies`, {
			method: "GET",
			token,
		}),
	
	assignCompanyToOrderService: (orderId, orderServiceId, companyId, token = null) =>
		apiRequest(`/orders/${orderId}/orderServices/${orderServiceId}/assign`, {
			method: "POST",
			body: { companyId },
			token,
		}),
};

// Company Admin API endpoints
export const companyAdminApi = {
	getOrders: (filters = {}) => {
		// Use /orders endpoint with company_id filter
		// This endpoint should return orders assigned to the specified company
		const queryParams = new URLSearchParams();
		if (filters.company_id) {
			queryParams.append("company_id", filters.company_id);
		}
		if (filters.status) {
			queryParams.append("status", filters.status);
		}
		const queryString = queryParams.toString();
		return apiRequest(`/orders${queryString ? `?${queryString}` : ""}`, {
			method: "GET",
		});
	},
	
	checkClientEmail: (email) =>
		apiRequest("/companies/clients/check-email", {
			method: "POST",
			body: { email },
		}),
	
	createClient: (companyId, clientData) =>
		apiRequest(`/companies/${companyId}/clients`, {
			method: "POST",
			body: clientData,
		}),
	
	createOrder: (companyId, orderData) =>
		apiRequest(`/companies/${companyId}/orders`, {
			method: "POST",
			body: orderData,
		}),
	
	acceptOrderService: (orderId, orderServiceId) =>
		apiRequest(`/orders/${orderId}/orderServices/${orderServiceId}/accept`, {
			method: "PATCH",
		}),
	
	rejectOrderService: (orderId, orderServiceId) =>
		apiRequest(`/orders/${orderId}/orderServices/${orderServiceId}/reject`, {
			method: "PATCH",
		}),
	
	sendOrderServiceOffer: (orderId, orderServiceId, offerData) =>
		apiRequest(`/orders/${orderId}/orderServices/${orderServiceId}/offers`, {
			method: "POST",
			body: offerData,
		}),
	
	cancelOffer: (offerId) =>
		apiRequest(`/offers/${offerId}/cancel`, {
			method: "PATCH",
		}),
	
	getCompanyEmployees: (companyId, params = {}) => {
		const queryParams = new URLSearchParams();
		if (params.page) queryParams.append("page", params.page);
		if (params.limit) queryParams.append("limit", params.limit);
		if (params.role) queryParams.append("role", params.role);
		if (params.status) queryParams.append("status", params.status);
		if (params.sort !== undefined) queryParams.append("sort", params.sort);
		
		const queryString = queryParams.toString();
		return apiRequest(`/companies/${companyId}/employees${queryString ? `?${queryString}` : ""}`, {
			method: "GET",
		});
	},

	addCompanyEmployee: (companyId, employeeData) =>
		apiRequest(`/companies/${companyId}/employees`, {
			method: "POST",
			body: employeeData,
		}),

	inviteExistingEmployee: (companyId, employmentData) =>
		apiRequest(`/companies/${companyId}/employments`, {
			method: "POST",
			body: employmentData,
		}),

	updateEmployment: (companyId, employmentId, employmentData) =>
		apiRequest(`/companies/${companyId}/employments/${employmentId}`, {
			method: "PATCH",
			body: employmentData,
		}),

	terminateEmployment: (companyId, employmentId) =>
		apiRequest(`/companies/${companyId}/employments/${employmentId}/terminate`, {
			method: "PATCH",
		}),

	cancelEmployment: (companyId, employmentId) =>
		apiRequest(`/companies/${companyId}/employments/${employmentId}/cancel`, {
			method: "PATCH",
		}),
	
	getOfferAssignments: (offerId) =>
		apiRequest(`/offers/${offerId}/assignments`, {
			method: "GET",
		}),
	
	assignEmployeeToOffer: (offerId, assignmentData) =>
		apiRequest(`/offers/${offerId}/assignments`, {
			method: "POST",
			body: assignmentData,
		}),
	
	cancelAssignment: (offerId, assignmentId) =>
		apiRequest(`/offers/${offerId}/assignments/${assignmentId}/cancel`, {
			method: "PATCH",
		}),
	
	makeEmployeeLeader: (offerId, employeeId) =>
		apiRequest(`/offers/${offerId}/employees/${employeeId}/make-leader`, {
			method: "PATCH",
		}),
};

// Notifications API endpoints
export const notificationsApi = {
	// GET /notifications - Get all notifications with pagination
	getNotifications: (filters = {}) => {
		const queryParams = new URLSearchParams();
		if (filters.page) {
			queryParams.append("page", filters.page);
		}
		if (filters.limit) {
			queryParams.append("limit", filters.limit);
		}
		if (filters.is_read !== undefined) {
			queryParams.append("is_read", filters.is_read);
		}
		if (filters.show !== undefined) {
			queryParams.append("show", filters.show);
		}
		const queryString = queryParams.toString();
		return apiRequest(`/notifications${queryString ? `?${queryString}` : ""}`, {
			method: "GET",
		});
	},
	
	// GET /notifications/:id - Get notification by ID
	getNotificationById: (notificationId) =>
		apiRequest(`/notifications/${notificationId}`, {
			method: "GET",
		}),
	
	// PATCH /notifications/:id/read - Mark notification as read
	markNotificationAsRead: (notificationId) =>
		apiRequest(`/notifications/${notificationId}/read`, {
			method: "PATCH",
		}),
	
	// PATCH /notifications/read-all - Mark all notifications as read
	markAllNotificationsAsRead: () =>
		apiRequest("/notifications/read-all", {
			method: "PATCH",
		}),
	
	// PATCH /notifications/:id/hide - Hide notification
	hideNotification: (notificationId) =>
		apiRequest(`/notifications/${notificationId}/hide`, {
			method: "PATCH",
		}),
	
	// PATCH /notifications/hide-all - Hide all notifications
	hideAllNotifications: () =>
		apiRequest("/notifications/hide-all", {
			method: "PATCH",
		}),
};

// Employee API endpoints (for workers and drivers)
export const employeeApi = {
	getAssignments: () =>
		apiRequest("/employee/assignments", {
			method: "GET",
		}),

	acceptOffer: (offerId) =>
		apiRequest(`/employee/offers/${offerId}/accept`, {
			method: "PATCH",
		}),

	rejectOffer: (offerId) =>
		apiRequest(`/employee/offers/${offerId}/reject`, {
			method: "PATCH",
		}),

	getEmployments: (page = 1, limit = 10) => {
		const queryParams = new URLSearchParams();
		if (page) queryParams.append("page", page);
		if (limit) queryParams.append("limit", limit);
		const queryString = queryParams.toString();
		return apiRequest(`/employee/employments${queryString ? `?${queryString}` : ""}`, {
			method: "GET",
		});
	},

	acceptEmployment: (employmentId) =>
		apiRequest(`/employee/employments/${employmentId}/accept`, {
			method: "PATCH",
		}),

	rejectEmployment: (employmentId) =>
		apiRequest(`/employee/employments/${employmentId}/reject`, {
			method: "PATCH",
		}),

	// Report endpoints
	createReport: (orderId, orderServiceId, reportData) =>
		apiRequest(`/orders/${orderId}/orderServices/${orderServiceId}/report`, {
			method: "POST",
			body: reportData,
		}),

	updateReport: (orderId, orderServiceId, reportData) =>
		apiRequest(`/orders/${orderId}/orderServices/${orderServiceId}/report`, {
			method: "PATCH",
			body: reportData,
		}),

	getReport: (orderId, orderServiceId) =>
		apiRequest(`/orders/${orderId}/orderServices/${orderServiceId}/report`, {
			method: "GET",
		}),
};

// Site Admin API endpoints
export const siteAdminApi = {
	getOrders: (filters = {}) => {
		const queryParams = new URLSearchParams();
		if (filters.status) {
			queryParams.append("status", filters.status);
		}
		if (filters.page) {
			queryParams.append("page", filters.page);
		}
		if (filters.limit) {
			queryParams.append("limit", filters.limit);
		}
		if (filters.search) {
			queryParams.append("search", filters.search);
		}
		if (filters.date) {
			queryParams.append("date", filters.date);
		}
		if (filters.service_id) {
			queryParams.append("service_id", filters.service_id);
		}
		const queryString = queryParams.toString();
		return apiRequest(`/orders${queryString ? `?${queryString}` : ""}`, {
			method: "GET",
		});
	},
	
	createOrder: (orderData) =>
		apiRequest("/site-admin/orders", {
			method: "POST",
			body: orderData,
		}),
	
	cancelOrder: (orderId, reason) =>
		apiRequest(`/orders/${orderId}/cancel`, {
			method: "PATCH",
			body: { reason },
		}),
};

export { ApiError };

