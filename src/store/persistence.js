// localStorage persistence utilities for orders

const ORDERS_STORAGE_KEY = "furniture_orders";

// Save orders to localStorage
export const saveOrdersToStorage = (orders) => {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
	} catch (error) {
		console.error("Failed to save orders to localStorage:", error);
	}
};

// Load orders from localStorage
export const loadOrdersFromStorage = () => {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch (error) {
		console.error("Failed to load orders from localStorage:", error);
		return [];
	}
};

// Clear all persisted data
export const clearPersistedData = () => {
	if (typeof window === "undefined") return;
	try {
		localStorage.removeItem(ORDERS_STORAGE_KEY);
	} catch (error) {
		console.error("Failed to clear persisted data:", error);
	}
};

// Create a Redux middleware that persists orders and notifications
export const persistenceMiddleware = (store) => (next) => (action) => {
	const result = next(action);

	// After every action, save orders and notifications to localStorage
	if (typeof window !== "undefined") {
		const state = store.getState();

		// Save orders whenever they change
		if (action.type?.startsWith("orders/")) {
			saveOrdersToStorage(state.orders.orders);
		}
	}

	return result;
};

// Initialize store with persisted data (call this on app start)
export const initializePersistedData = (dispatch) => {
	if (typeof window === "undefined") return;

	const orders = loadOrdersFromStorage();


	if (orders.length > 0) {
		dispatch({ type: "orders/hydrateOrders", payload: orders });
	}
};

