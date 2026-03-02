/**
 * Super Admin Data Transformers
 * Converts API responses to frontend format with proper error handling
 */

// ============================================================================
// USER TRANSFORMERS
// ============================================================================

/**
 * Transform backend user to frontend format
 */
export const transformUser = (backendUser) => {
	if (!backendUser) return null;
	
	return {
		id: backendUser.id,
		name: backendUser.user_name || backendUser.name || "Unknown",
		email: backendUser.email || "",
		phone: backendUser.phone || "",
		role: backendUser.user_role || backendUser.role || "client",
		company: backendUser.company_name || (backendUser.company ? backendUser.company.name : ""),
		companyId: backendUser.company_id || (backendUser.company ? backendUser.company.id : null),
		status: backendUser.status || "active",
		created: backendUser.date_added || backendUser.createdAt || new Date().toISOString(),
		lastLogin: backendUser.last_login || "Never",
		avatar: backendUser.avatar || null,
		// Raw data for actions
		_original: backendUser,
	};
};

/**
 * Transform array of backend users
 */
export const transformUsers = (backendUsers) => {
	if (!Array.isArray(backendUsers)) {
		console.warn('transformUsers: Expected array, received:', typeof backendUsers);
		return [];
	}
	return backendUsers.map(transformUser).filter(Boolean);
};

// ============================================================================
// ORDER TRANSFORMERS
// ============================================================================

/**
 * Transform backend order to frontend format
 */
export const transformOrder = (backendOrder) => {
	if (!backendOrder) return null;
	
	return {
		id: backendOrder.id,
		customer: backendOrder.customer_name || backendOrder.customer || "Unknown",
		customerId: backendOrder.customer_id,
		service: backendOrder.service_name || backendOrder.service || "General",
		status: backendOrder.status || "pending",
		date: backendOrder.scheduled_date || backendOrder.date || "Not Set",
		time: backendOrder.scheduled_time || backendOrder.time || null,
		fromAddress: backendOrder.pickup_location || backendOrder.from_address || "—",
		toAddress: backendOrder.delivery_location || backendOrder.to_address || "—",
		price: backendOrder.price || backendOrder.estimated_price || null,
		currency: backendOrder.currency || "CHF",
		priority: backendOrder.priority || "normal",
		notes: backendOrder.notes || "",
		createdAt: backendOrder.created_at || backendOrder.createdAt,
		updatedAt: backendOrder.updated_at || backendOrder.updatedAt,
		// Raw data for actions
		_original: backendOrder,
	};
};

/**
 * Transform array of backend orders
 */
export const transformOrders = (backendOrders) => {
	if (!Array.isArray(backendOrders)) {
		console.warn('transformOrders: Expected array, received:', typeof backendOrders);
		return [];
	}
	return backendOrders.map(transformOrder).filter(Boolean);
};

// ============================================================================
// COMPANY TRANSFORMERS
// ============================================================================

/**
 * Transform backend company to frontend format
 */
export const transformCompany = (backendCompany) => {
	if (!backendCompany) return null;
	
	return {
		id: backendCompany.id,
		name: backendCompany.name || "Unknown",
		email: backendCompany.email || "",
		phone: backendCompany.phones?.[0]?.number || backendCompany.phone || "",
		url: backendCompany.url || "",
		logo: backendCompany.logo || null,
		type: backendCompany.type || "internal",
		status: backendCompany.status || "active",
		available: backendCompany.status !== "suspended",
		address: backendCompany.address || "",
		city: backendCompany.city || "",
		country: backendCompany.country || "",
		zipCode: backendCompany.zip_code || "",
		services: backendCompany.services?.map(s => s.name || s) || [],
		serviceCount: backendCompany.services?.length || 0,
		employees: backendCompany.employees?.length || 0,
		createdAt: backendCompany.created_at || backendCompany.createdAt,
		updatedAt: backendCompany.updated_at || backendCompany.updatedAt,
		joined: backendCompany.created_at 
			? new Date(backendCompany.created_at).toLocaleDateString()
			: new Date(backendCompany.createdAt).toLocaleDateString(),
		lastActivity: backendCompany.updated_at
			? new Date(backendCompany.updated_at).toLocaleDateString()
			: new Date(backendCompany.updatedAt).toLocaleDateString(),
		// Raw data for actions
		_original: backendCompany,
	};
};

/**
 * Transform array of backend companies
 */
export const transformCompanies = (backendCompanies) => {
	if (!Array.isArray(backendCompanies)) {
		console.warn('transformCompanies: Expected array, received:', typeof backendCompanies);
		return [];
	}
	return backendCompanies.map(transformCompany).filter(Boolean);
};

// ============================================================================
// RESPONSE EXTRACTORS
// ============================================================================

/**
 * Extract data array from various API response formats
 */
export const extractArrayData = (response, key = 'data') => {
	if (!response) return [];
	
	// Direct array response
	if (Array.isArray(response)) return response;
	
	// Nested in key
	if (response[key] && Array.isArray(response[key])) return response[key];
	
	// Nested in data.items or data.list
	if (response.data) {
		if (Array.isArray(response.data)) return response.data;
		if (response.data.items && Array.isArray(response.data.items)) return response.data.items;
		if (response.data.list && Array.isArray(response.data.list)) return response.data.list;
		if (response.data.users && Array.isArray(response.data.users)) return response.data.users;
		if (response.data.orders && Array.isArray(response.data.orders)) return response.data.orders;
		if (response.data.companies && Array.isArray(response.data.companies)) return response.data.companies;
	}
	
	return [];
};

/**
 * Extract single item from various API response formats
 */
export const extractSingleData = (response, key = 'data') => {
	if (!response) return null;
	
	if (response[key]) {
		if (typeof response[key] === 'object' && !Array.isArray(response[key])) {
			return response[key];
		}
	}
	
	return null;
};

const perAdminTransformers = {
   // Users
   transformUser,
   transformUsers,
   // Orders
   transformOrder,
   transformOrders,
   // Companies
   transformCompany,
   transformCompanies,
   // Utilities
   extractArrayData,
   extractSingleData,
};

export default perAdminTransformers;