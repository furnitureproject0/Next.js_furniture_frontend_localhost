/**
 * Super Admin Service Layer
 * Handles all API calls for super admin functionality:
 * - User Management (GET, POST, PATCH, DELETE)
 * - Order Management (GET, PATCH)
 * - Company Management (GET, POST, PATCH)
 * 
 * Base URL: http://localhost:5000/api
 */

import { usersV2Api, siteAdminApi, companiesApi } from "@/lib/api";

// ============================================================================
// USER MANAGEMENT SERVICE
// ============================================================================
export const userService = {
	/**
	 * Fetch all users with optional filtering
	 * GET /users-v2/admin/get-users
	 * @param {Object} filters - { search?, limit?, page? }
	 * @returns {Promise<Array>} Array of users
	 */
	getAllUsers: async (filters = {}) => {
		const response = await usersV2Api.getUsers(filters);
		if (response?.success && response?.data) {
			return Array.isArray(response.data) ? response.data : response.data.users || [];
		}
		return [];
	},

	/**
	 * Search users by query
	 * GET /users-v2/admin/get-users?search=query
	 * @param {string} searchQuery - Search term (name, email, phone, etc.)
	 * @param {Object} options - { limit?, page? }
	 * @returns {Promise<Array>} Filtered users
	 */
	searchUsers: async (searchQuery, options = {}) => {
		const response = await usersV2Api.getUsers({
			search: searchQuery,
			...options,
		});
		if (response?.success && response?.data) {
			return Array.isArray(response.data) ? response.data : response.data.users || [];
		}
		return [];
	},

	/**
	 * Create a new user
	 * POST /users-v2/admin/create-user
	 * @param {Object} userData - { name, email, password, phone?, role?, company_id? }
	 * @returns {Promise<Object>} Created user object
	 */
	createUser: async (userData) => {
		const response = await usersV2Api.createUser(userData);
		if (response?.success && response?.data) {
			return response.data;
		}
		throw new Error(response?.message || "Failed to create user");
	},

	/**
	 * Update existing user
	 * PATCH /users-v2/admin/update-user/{id}
	 * @param {string|number} userId - User ID
	 * @param {Object} updates - Fields to update { name?, email?, phone?, role?, status? }
	 * @returns {Promise<Object>} Updated user object
	 */
	updateUser: async (userId, updates) => {
		const response = await usersV2Api.updateUser(userId, updates);
		if (response?.success && response?.data) {
			return response.data;
		}
		throw new Error(response?.message || "Failed to update user");
	},

	/**
	 * Delete a user
	 * DELETE /users-v2/admin/delete-user/{id}
	 * @param {string|number} userId - User ID
	 * @returns {Promise<Object>} Response confirming deletion
	 */
	deleteUser: async (userId) => {
		const response = await usersV2Api.deleteUser(userId);
		if (response?.success) {
			return response;
		}
		throw new Error(response?.message || "Failed to delete user");
	},
};

// ============================================================================
// ORDER MANAGEMENT SERVICE
// ============================================================================
export const orderService = {
	/**
	 * Fetch all orders with optional filtering
	 * GET /orders-v2/
	 * @param {Object} filters - { status?, search?, limit?, page? }
	 * @returns {Promise<Array>} Array of orders
	 */
	getAllOrders: async (filters = {}) => {
		const response = await siteAdminApi.getOrders(filters);
		if (response?.success && response?.data) {
			// Handle both array and object response structures
			if (Array.isArray(response.data)) {
				return response.data;
			}
			return response.data.orders || [];
		}
		return [];
	},

	/**
	 * Search orders by query
	 * GET /orders-v2/?search=query
	 * @param {string} searchQuery - Search term (order ID, customer name, address, etc.)
	 * @param {Object} options - { status?, limit?, page? }
	 * @returns {Promise<Array>} Filtered orders
	 */
	searchOrders: async (searchQuery, options = {}) => {
		const response = await siteAdminApi.getOrders({
			search: searchQuery,
			...options,
		});
		if (response?.success && response?.data) {
			if (Array.isArray(response.data)) {
				return response.data;
			}
			return response.data.orders || [];
		}
		return [];
	},

	/**
	 * Filter orders by status
	 * GET /orders-v2/?status=pending
	 * @param {string} status - Order status (pending, assigned, in-progress, completed, cancelled, etc.)
	 * @param {Object} options - { search?, limit?, page? }
	 * @returns {Promise<Array>} Filtered orders
	 */
	filterByStatus: async (status, options = {}) => {
		const response = await siteAdminApi.getOrders({
			status,
			...options,
		});
		if (response?.success && response?.data) {
			if (Array.isArray(response.data)) {
				return response.data;
			}
			return response.data.orders || [];
		}
		return [];
	},

	/**
	 * Get order details
	 * GET /orders-v2/{id}
	 * @param {string|number} orderId - Order ID
	 * @returns {Promise<Object>} Order details
	 */
	getOrderDetails: async (orderId) => {
		const response = await siteAdminApi.getOrder(orderId);
		if (response?.success && response?.data) {
			return response.data;
		}
		throw new Error(response?.message || "Failed to fetch order details");
	},

	/**
	 * Cancel an order
	 * PATCH /orders-v2/{id}/cancel
	 * @param {string|number} orderId - Order ID
	 * @param {string} reason - Cancellation reason
	 * @returns {Promise<Object>} Updated order object
	 */
	cancelOrder: async (orderId, reason = "") => {
		const response = await siteAdminApi.cancelOrder(orderId, reason);
		if (response?.success && response?.data) {
			return response.data;
		}
		throw new Error(response?.message || "Failed to cancel order");
	},
};

// ============================================================================
// COMPANY MANAGEMENT SERVICE
// ============================================================================
export const companyService = {
	/**
	 * Fetch all companies with optional filtering
	 * GET /companies
	 * @param {Object} filters - { search?, type?, status?, limit?, page? }
	 * @returns {Promise<Array>} Array of companies
	 */
	getAllCompanies: async (filters = {}) => {
		const response = await companiesApi.getCompanies();
		if (response?.success && response?.data) {
			// Apply frontend filtering if needed
			let companies = Array.isArray(response.data) ? response.data : response.data.companies || [];
			
			// Filter by search if provided
			if (filters.search) {
				const searchLower = filters.search.toLowerCase();
				companies = companies.filter(c =>
					c.name?.toLowerCase().includes(searchLower) ||
					c.email?.toLowerCase().includes(searchLower)
				);
			}
			
			return companies;
		}
		return [];
	},

	/**
	 * Search companies by query
	 * GET /companies?search=query
	 * @param {string} searchQuery - Search term (name, email, etc.)
	 * @param {Object} options - { limit?, page? }
	 * @returns {Promise<Array>} Filtered companies
	 */
	searchCompanies: async (searchQuery, options = {}) => {
		const response = await companiesApi.searchCompanies(searchQuery);
		if (response?.success && response?.data) {
			let companies = Array.isArray(response.data) ? response.data : response.data.companies || [];
			
			// Pagination if provided
			if (options.limit && options.page) {
				const start = (options.page - 1) * options.limit;
				companies = companies.slice(start, start + options.limit);
			}
			
			return companies;
		}
		return [];
	},

	/**
	 * Get single company details
	 * GET /companies/{id}
	 * @param {string|number} companyId - Company ID
	 * @returns {Promise<Object>} Company details
	 */
	getCompanyDetails: async (companyId) => {
		const response = await companiesApi.getCompanyById(companyId);
		if (response?.success && response?.data) {
			return response.data;
		}
		throw new Error(response?.message || "Failed to fetch company details");
	},

	/**
	 * Create a new company
	 * POST /companies
	 * @param {Object} companyData - { name, email, phone?, url?, type?, address? }
	 * @returns {Promise<Object>} Created company object
	 */
	createCompany: async (companyData) => {
		const response = await companiesApi.createCompany(companyData);
		if (response?.success && response?.data) {
			return response.data;
		}
		throw new Error(response?.message || "Failed to create company");
	},

	/**
	 * Update existing company
	 * PATCH /companies/{id}
	 * @param {string|number} companyId - Company ID
	 * @param {Object} updates - Fields to update { name?, email?, phone?, url?, type?, address? }
	 * @returns {Promise<Object>} Updated company object
	 */
	updateCompany: async (companyId, updates) => {
		const response = await companiesApi.updateCompany(companyId, updates);
		if (response?.success && response?.data) {
			return response.data;
		}
		throw new Error(response?.message || "Failed to update company");
	},

	/**
	 * Activate a company
	 * PATCH /companies/{id}/activate
	 * @param {string|number} companyId - Company ID
	 * @returns {Promise<Object>} Updated company object
	 */
	activateCompany: async (companyId) => {
		const response = await companiesApi.activateCompany(companyId);
		if (response?.success && response?.data) {
			return response.data;
		}
		throw new Error(response?.message || "Failed to activate company");
	},

	/**
	 * Suspend a company
	 * PATCH /companies/{id}/suspend
	 * @param {string|number} companyId - Company ID
	 * @returns {Promise<Object>} Updated company object
	 */
	suspendCompany: async (companyId) => {
		const response = await companiesApi.suspendCompany(companyId);
		if (response?.success && response?.data) {
			return response.data;
		}
		throw new Error(response?.message || "Failed to suspend company");
	},
};

export default {
	userService,
	orderService,
	companyService,
};
