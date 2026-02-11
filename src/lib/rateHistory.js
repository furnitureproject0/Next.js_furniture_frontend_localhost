// Local storage utility for managing employee rate history
// This is a temporary solution until backend endpoints are implemented

const STORAGE_KEY = 'employee_rate_history';

/**
 * Get all rate history for a specific employment
 * @param {number} employmentId 
 * @returns {Array} Array of rate history entries
 */
export const getRateHistory = (employmentId) => {
	try {
		if (typeof window === 'undefined') return [];
		
		const data = localStorage.getItem(STORAGE_KEY);
		if (!data) return [];
		
		const allHistory = JSON.parse(data);
		return allHistory[employmentId] || [];
	} catch (error) {
		console.error('Error reading rate history:', error);
		return [];
	}
};

/**
 * Add a new rate change to history
 * @param {number} employmentId 
 * @param {Object} rateChange - { old_rate, new_rate, currency, changed_by, changed_at }
 */
export const addRateHistory = (employmentId, rateChange) => {
	try {
		if (typeof window === 'undefined') return;
		
		const data = localStorage.getItem(STORAGE_KEY);
		const allHistory = data ? JSON.parse(data) : {};
		
		if (!allHistory[employmentId]) {
			allHistory[employmentId] = [];
		}
		
		// Add timestamp if not provided
		const historyEntry = {
			...rateChange,
			changed_at: rateChange.changed_at || new Date().toISOString(),
			id: Date.now(), // Simple unique ID for local storage
		};
		
		allHistory[employmentId].unshift(historyEntry); // Add to beginning
		
		localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));
	} catch (error) {
		console.error('Error saving rate history:', error);
	}
};

/**
 * Clear all rate history (useful for debugging/testing)
 */
export const clearRateHistory = () => {
	try {
		if (typeof window === 'undefined') return;
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.error('Error clearing rate history:', error);
	}
};

/**
 * Get the latest rate for an employment
 * @param {number} employmentId 
 * @returns {Object|null} Latest rate entry or null
 */
export const getLatestRate = (employmentId) => {
	const history = getRateHistory(employmentId);
	return history.length > 0 ? history[0] : null;
};
