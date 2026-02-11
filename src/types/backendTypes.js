// Backend data type definitions to match the schema

/**
 * @typedef {Object} BackendOrder
 * @property {number} id - Auto-incrementing order ID
 * @property {number} client_id - Reference to User (client)
 * @property {number} location_id - Reference to Location (pickup)
 * @property {number|null} destination_location_id - Reference to Location (destination)
 * @property {string} preferred_date - DATEONLY format (YYYY-MM-DD)
 * @property {string} preferred_time - TIME format (HH:MM:SS)
 * @property {number} number_of_rooms - Float representing number of rooms
 * @property {string|null} notes - Order notes
 * @property {Array<string>} images - Array of image URLs
 * @property {'pending'|'in_progress'|'partially_done'|'completed'|'cancelled'} status
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * @typedef {Object} BackendLocation
 * @property {number} id
 * @property {string} address
 * @property {number|null} floor
 * @property {boolean} has_elevator
 * @property {string|null} notes
 */

/**
 * @typedef {Object} BackendOrderService
 * @property {number} id
 * @property {number} order_id
 * @property {number} service_id
 * @property {number} company_id
 * @property {string|null} status
 * @property {number|null} price
 */

/**
 * @typedef {Object} BackendOrderServiceAddition
 * @property {number} order_service_id
 * @property {number} addition_id
 * @property {number} quantity
 */

/**
 * @typedef {Object} BackendOffer
 * @property {number} id
 * @property {number} order_service_id
 * @property {number} company_id
 * @property {number|null} price
 * @property {string|null} notes
 * @property {string|null} status - e.g., 'pending', 'accepted', 'rejected'
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} BackendOfferEmployee
 * @property {number} offer_id
 * @property {number} employee_id
 * @property {string|null} role - 'driver', 'worker', etc.
 */

/**
 * @typedef {Object} BackendReport
 * @property {number} id
 * @property {number} order_service_id
 * @property {number} numofHours - Total hours for the job
 * @property {number} expected_amount - Expected payment
 * @property {number|null} paid_amount - Actual paid amount
 * @property {'cash'|'twint'|null} payment_method
 * @property {string|null} notes
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} BackendReportEmployee
 * @property {number} report_id
 * @property {number} employee_id
 * @property {number} hours - Hours worked by this employee
 */

/**
 * @typedef {Object} BackendReportExpense
 * @property {number} id
 * @property {number} report_id
 * @property {string} type - 'cash' or 'twint' (for report expenses must be cash)
 * @property {string} name - Expense name
 * @property {number} amount
 * @property {string|null} description
 */

/**
 * @typedef {Object} BackendUser
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string|null} birthdate - DATEONLY format
 * @property {'super_admin'|'site_admin'|'company_admin'|'company_secretary'|'driver'|'worker'|'client'} role
 * @property {number|null} company_id
 * @property {boolean} is_verified
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} BackendCompany
 * @property {number} id
 * @property {string} name
 * @property {string|null} email
 * @property {string|null} description
 * @property {boolean} is_active
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Helper: Convert frontend order to backend order format
 */
export const convertToBackendOrder = (frontendOrder) => {
	return {
		client_id: frontendOrder.customerId || frontendOrder.client_id,
		location_id: frontendOrder.location_id,
		destination_location_id: frontendOrder.destination_location_id,
		preferred_date: frontendOrder.schedule?.date || frontendOrder.preferred_date,
		preferred_time: frontendOrder.schedule?.time || frontendOrder.preferred_time || "09:00:00",
		number_of_rooms: parseFloat(frontendOrder.roomDetails) || frontendOrder.number_of_rooms || 0,
		notes: frontendOrder.notes || null,
		images: frontendOrder.images || [],
		status: frontendOrder.status || "pending",
	};
};

/**
 * Helper: Convert backend order to frontend order format
 */
export const convertFromBackendOrder = (backendOrder) => {
	return {
		id: backendOrder.id,
		customerId: backendOrder.client_id,
		customerName: backendOrder.client?.name || "Unknown",
		assignedCompanyId: null, // Will come from OrderService
		assignedCompanyName: null,
		status: backendOrder.status,
		offer: null, // Will come from Offer
		services: [], // Will come from OrderService
		addresses: {
			from: backendOrder.location?.address || "",
			to: backendOrder.destinationLocation?.address || "",
		},
		schedule: {
			date: backendOrder.preferred_date,
			time: backendOrder.preferred_time,
		},
		roomDetails: backendOrder.number_of_rooms.toString(),
		images: backendOrder.images || [],
		notes: backendOrder.notes || "",
		createdAt: backendOrder.createdAt,
		updatedAt: backendOrder.updatedAt,
		history: backendOrder.timeline || [],
	};
};

/**
 * Helper: Convert frontend report to backend report format
 */
export const convertToBackendReport = (frontendReport, orderServiceId, driverId) => {
	return {
		order_service_id: orderServiceId,
		numofHours: frontendReport.workerHours.reduce((sum, wh) => sum + parseFloat(wh.hours || 0), 0),
		expected_amount: frontendReport.expectedAmount || 0,
		paid_amount: frontendReport.clientPaid || null,
		payment_method: frontendReport.paymentMethod || null,
		notes: frontendReport.notes || null,
		driver_id: driverId,
		employeeHours: frontendReport.workerHours.map((wh) => ({
			employee_id: wh.employeeId || wh.id,
			hours: parseFloat(wh.hours || 0),
		})),
		expenses: (frontendReport.additionalExpenses || []).map((exp) => ({
			type: "cash", // Report expenses must be cash per schema
			name: exp.description || exp.name || "Expense",
			amount: parseFloat(exp.amount || 0),
			description: exp.description || null,
		})),
	};
};

const backendTypes = {
	convertToBackendOrder,
	convertFromBackendOrder,
	convertToBackendReport,
};

export default backendTypes;


