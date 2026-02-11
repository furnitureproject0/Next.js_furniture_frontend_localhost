// Helper functions to transform data between frontend and backend formats

/**
 * Transform order from frontend format to backend API payload
 * @param {Object} frontendOrder - Order in frontend format
 * @returns {Object} Order payload for backend API
 */
export const transformOrderForBackend = (frontendOrder) => {
	return {
		client_id: frontendOrder.customerId || frontendOrder.client_id,
		location_id: frontendOrder.location_id,
		destination_location_id: frontendOrder.destination_location_id || null,
		preferred_date: frontendOrder.schedule?.date || frontendOrder.preferred_date || new Date().toISOString().split("T")[0],
		preferred_time: frontendOrder.schedule?.time || frontendOrder.preferred_time || "09:00:00",
		number_of_rooms: parseFloat(frontendOrder.roomDetails || frontendOrder.number_of_rooms || 0),
		notes: frontendOrder.notes || null,
		images: frontendOrder.images || [],
		status: frontendOrder.status || "pending",
	};
};

/**
 * Transform order from backend format to frontend format
 * @param {Object} backendOrder - Order from backend API
 * @returns {Object} Order in frontend format
 */
export const transformOrderFromBackend = (backendOrder) => {
	return {
		id: backendOrder.id,
		customerId: backendOrder.client_id,
		client_id: backendOrder.client_id,
		customerName: backendOrder.client?.name || "Unknown",
		
		// Location fields
		location_id: backendOrder.location_id,
		destination_location_id: backendOrder.destination_location_id,
		
		// Preferred schedule
		preferred_date: backendOrder.preferred_date,
		preferred_time: backendOrder.preferred_time,
		number_of_rooms: backendOrder.number_of_rooms,
		
		// UI helper fields
		addresses: {
			from: backendOrder.location?.address || "",
			to: backendOrder.destinationLocation?.address || "",
		},
		schedule: {
			date: backendOrder.preferred_date,
			time: backendOrder.preferred_time,
		},
		roomDetails: backendOrder.number_of_rooms?.toString() || "0",
		
		notes: backendOrder.notes || "",
		images: backendOrder.images || [],
		status: backendOrder.status,
		
		// Will be populated from OrderService
		assignedCompanyId: backendOrder.orderServices?.[0]?.company_id || null,
		assignedCompanyName: backendOrder.orderServices?.[0]?.company?.name || null,
		services: backendOrder.orderServices?.map((os) => ({
			id: os.service_id,
			name: os.service?.name || "Unknown",
			company_id: os.company_id,
			price: os.price,
		})) || [],
		
		// Will be populated from Offer
		offer: backendOrder.orderServices?.[0]?.offers?.[0] || null,
		
		// Team info (from OfferEmployee)
		driver: null, // Will be populated separately
		workers: [], // Will be populated separately
		teamMembers: [], // Will be populated separately
		teamLeader: null,
		
		// Timeline
		history: backendOrder.timeline?.map((t) => ({
			id: t.id,
			type: t.type,
			byRole: t.byRole,
			byUserId: t.byUserId,
			at: t.createdAt,
			payload: t.payload,
		})) || [],
		
		createdAt: backendOrder.createdAt,
		updatedAt: backendOrder.updatedAt,
	};
};

/**
 * Transform team assignment data for OfferEmployee API
 * @param {Object} teamData - Team data from assignment modal
 * @returns {Array} Array of employee assignments for backend
 */
export const transformTeamForBackend = (teamData) => {
	const { employees, teamLeader } = teamData;
	
	return employees.map((emp) => ({
		employee_id: emp.id,
		role: emp.role.toLowerCase(), // 'driver' or 'worker'
		is_leader: teamLeader?.id === emp.id,
	}));
};

/**
 * Transform report data for backend API
 * @param {Object} reportData - Report from frontend form
 * @param {number} orderServiceId - ID of the order service
 * @param {number} driverId - ID of the driver/team leader
 * @returns {Object} Report payload for backend API
 */
export const transformReportForBackend = (reportData, orderServiceId, driverId) => {
	// Calculate total hours
	const totalHours = reportData.workerHours?.reduce(
		(sum, wh) => sum + parseFloat(wh.hours || 0),
		0
	) || 0;
	
	return {
		order_service_id: orderServiceId,
		numofHours: totalHours,
		expected_amount: reportData.expectedAmount || 0,
		paid_amount: reportData.clientPaid || null,
		payment_method: reportData.paymentMethod || null, // 'cash' | 'twint'
		notes: reportData.notes || null,
		driver_id: driverId,
		
		// Employee hours (for ReportEmployee table)
		employeeHours: (reportData.workerHours || []).map((wh) => ({
			employee_id: wh.employeeId || wh.id,
			hours: parseFloat(wh.hours || 0),
		})),
		
		// Expenses (for ReportExpense table)
		expenses: (reportData.additionalExpenses || []).map((exp) => ({
			type: "cash", // Per schema: report expenses must be cash
			name: exp.name || exp.description || "Expense",
			amount: parseFloat(exp.amount || 0),
			description: exp.description || null,
		})),
	};
};

/**
 * Transform user from backend format to frontend format
 * @param {Object} backendUser - User from backend API
 * @returns {Object} User in frontend format
 */
export const transformUserFromBackend = (backendUser) => {
	return {
		id: backendUser.id,
		name: backendUser.name,
		email: backendUser.email,
		birthdate: backendUser.birthdate,
		role: backendUser.role,
		companyId: backendUser.company_id,
		isVerified: backendUser.is_verified,
		createdAt: backendUser.createdAt,
		updatedAt: backendUser.updatedAt,
	};
};

/**
 * Transform company from backend format to frontend format
 * @param {Object} backendCompany - Company from backend API
 * @returns {Object} Company in frontend format
 */
export const transformCompanyFromBackend = (backendCompany) => {
	return {
		id: backendCompany.id,
		name: backendCompany.name,
		email: backendCompany.email,
		description: backendCompany.description,
		isActive: backendCompany.is_active,
		available: backendCompany.is_active,
		services: backendCompany.services?.map((s) => s.name).join(", ") || "",
		specialties: backendCompany.services?.map((s) => s.name) || [],
		createdAt: backendCompany.createdAt,
		updatedAt: backendCompany.updatedAt,
		joined: backendCompany.createdAt,
		lastActivity: backendCompany.updatedAt,
	};
};

/**
 * Get display-friendly order ID
 * @param {number} orderId - Numeric order ID from backend
 * @returns {string} Formatted order ID for display
 */
export const formatOrderId = (orderId) => {
	if (!orderId) return "#000000";
	return `#${orderId.toString().padStart(6, "0")}`;
};

/**
 * Get short order ID for display in badges
 * @param {number} orderId - Numeric order ID from backend
 * @returns {string} Short order ID (last 4 digits)
 */
export const formatOrderIdShort = (orderId) => {
	if (!orderId) return "0000";
	const idStr = orderId.toString();
	return idStr.length > 4 ? idStr.slice(-4) : idStr.padStart(4, "0");
};

/**
 * Parse display order ID back to numeric ID
 * @param {string} displayId - Formatted order ID (e.g., "#000123")
 * @returns {number} Numeric order ID
 */
export const parseOrderId = (displayId) => {
	if (typeof displayId === "number") return displayId;
	return parseInt(displayId.toString().replace("#", ""), 10);
};

/**
 * Map UI status to backend status
 * @param {string} uiStatus - Status from UI
 * @returns {string} Backend-compatible status
 */
export const mapStatusToBackend = (uiStatus) => {
	const statusMap = {
		pending: "pending",
		assigned: "in_progress",
		offer_sent: "in_progress",
		offer_accepted: "in_progress",
		scheduled: "in_progress",
		in_progress: "in_progress",
		partially_done: "partially_done",
		completed: "completed",
		cancelled: "cancelled",
		offer_rejected: "cancelled",
	};
	
	return statusMap[uiStatus] || "pending";
};

const dataTransformers = {
	transformOrderForBackend,
	transformOrderFromBackend,
	transformTeamForBackend,
	transformReportForBackend,
	transformUserFromBackend,
	transformCompanyFromBackend,
	formatOrderId,
	parseOrderId,
	mapStatusToBackend,
};

export default dataTransformers;

