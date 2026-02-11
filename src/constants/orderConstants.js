// Location types (matching backend Location model)
export const LOCATION_TYPES = [
	{ id: "apartment", name: "Apartment", icon: "🏢" },
	{ id: "house", name: "House", icon: "🏠" },
	{ id: "office", name: "Office", icon: "🏢" },
	{ id: "warehouse", name: "Warehouse", icon: "🏭" },
	{ id: "building", name: "Building", icon: "🏗️" },
];

// Location types that require floor number (not number of floors)
export const LOCATION_TYPES_WITH_FLOOR = ["apartment", "office"];

// Location types that require number of floors
export const LOCATION_TYPES_WITH_BUILDING_FLOORS = ["building", "warehouse", "house"];

// Room types for room configuration
export const ROOM_TYPES = [
	{ id: "bedroom", name: "Bedroom" },
	{ id: "living_room", name: "Living Room" },
	{ id: "kitchen", name: "Kitchen" },
	{ id: "bathroom", name: "Bathroom" },
	{ id: "dining_room", name: "Dining Room" },
	{ id: "office", name: "Office" },
	{ id: "storage_room", name: "Storage Room" },
	{ id: "balcony", name: "Balcony" },
	{ id: "garage", name: "Garage" },
	{ id: "other", name: "Other" },
];

// Service types available for orders
export const SERVICE_TYPES = [
	{
		id: "furniture_moving",
		name: "Furniture Moving",
		description: "Professional furniture moving and transportation services",
		icon: "🚚",
	},
	{
		id: "cleaning_service",
		name: "Cleaning Service",
		description: "Deep cleaning and maintenance services",
		icon: "🧹",
	},
	{
		id: "painting",
		name: "Painting",
		description: "Interior and exterior painting services",
		icon: "🎨",
	},
	{
		id: "packing",
		name: "Packing Service",
		description: "Professional packing and unpacking services",
		icon: "📦",
	},
];

// Backend-compatible order statuses (from backend ENUM)
// Backend supports: pending, in_progress, partially_done, completed, cancelled
export const ORDER_STATUSES = {
	PENDING: "pending",              // Order placed by client
	IN_PROGRESS: "in_progress",      // At least one service is ongoing
	PARTIALLY_DONE: "partially_done", // Some services done, others pending
	COMPLETED: "completed",          // All services done
	CANCELLED: "cancelled",          // Order cancelled
};

// Extended UI statuses for better UX (mapped to backend statuses)
export const UI_STATUSES = {
	PENDING: "pending",
	ASSIGNED: "assigned",           // Maps to in_progress
	OFFER_SENT: "offer_sent",       // Maps to in_progress
	OFFER_ACCEPTED: "offer_accepted", // Maps to in_progress
	OFFER_REJECTED: "offer_rejected", // Maps to cancelled or pending
	SCHEDULED: "scheduled",         // Maps to in_progress
	IN_PROGRESS: "in_progress",
	PARTIALLY_DONE: "partially_done",
	COMPLETED: "completed",
	CANCELLED: "cancelled",
};

// Map UI statuses to backend statuses
export const mapToBackendStatus = (uiStatus) => {
	switch (uiStatus) {
		case UI_STATUSES.ASSIGNED:
		case UI_STATUSES.OFFER_SENT:
		case UI_STATUSES.OFFER_ACCEPTED:
		case UI_STATUSES.SCHEDULED:
		case UI_STATUSES.IN_PROGRESS:
			return ORDER_STATUSES.IN_PROGRESS;
		case UI_STATUSES.OFFER_REJECTED:
			return ORDER_STATUSES.CANCELLED;
		case UI_STATUSES.PARTIALLY_DONE:
			return ORDER_STATUSES.PARTIALLY_DONE;
		case UI_STATUSES.COMPLETED:
			return ORDER_STATUSES.COMPLETED;
		case UI_STATUSES.CANCELLED:
			return ORDER_STATUSES.CANCELLED;
		case UI_STATUSES.PENDING:
		default:
			return ORDER_STATUSES.PENDING;
	}
};

// Status labels for display
export const STATUS_LABELS = {
	[ORDER_STATUSES.PENDING]: "Pending",
	[ORDER_STATUSES.IN_PROGRESS]: "In Progress",
	[ORDER_STATUSES.PARTIALLY_DONE]: "Partially Done",
	[ORDER_STATUSES.COMPLETED]: "Completed",
	[ORDER_STATUSES.CANCELLED]: "Cancelled",
	// UI-only status labels
	[UI_STATUSES.ASSIGNED]: "Assigned to Company",
	[UI_STATUSES.OFFER_SENT]: "Offer Sent",
	[UI_STATUSES.OFFER_ACCEPTED]: "Offer Accepted",
	[UI_STATUSES.OFFER_REJECTED]: "Offer Rejected",
	[UI_STATUSES.SCHEDULED]: "Scheduled",
};

// Status colors for badges
export const STATUS_COLORS = {
	[ORDER_STATUSES.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-300",
	[ORDER_STATUSES.IN_PROGRESS]: "bg-orange-100 text-orange-800 border-orange-300",
	[ORDER_STATUSES.PARTIALLY_DONE]: "bg-blue-100 text-blue-800 border-blue-300",
	[ORDER_STATUSES.COMPLETED]: "bg-green-100 text-green-800 border-green-300",
	[ORDER_STATUSES.CANCELLED]: "bg-red-100 text-red-800 border-red-300",
	// UI-only status colors
	[UI_STATUSES.ASSIGNED]: "bg-indigo-100 text-indigo-800 border-indigo-300",
	[UI_STATUSES.OFFER_SENT]: "bg-blue-100 text-blue-800 border-blue-300",
	[UI_STATUSES.OFFER_ACCEPTED]: "bg-green-100 text-green-800 border-green-300",
	[UI_STATUSES.OFFER_REJECTED]: "bg-red-100 text-red-800 border-red-300",
	[UI_STATUSES.SCHEDULED]: "bg-purple-100 text-purple-800 border-purple-300",
};

// Currency options
export const CURRENCIES = [
	{ code: "CHF", symbol: "CHF", name: "Swiss Franc" },
	{ code: "EUR", symbol: "€", name: "Euro" },
	{ code: "USD", symbol: "$", name: "US Dollar" },
];

