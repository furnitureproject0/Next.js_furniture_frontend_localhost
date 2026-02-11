/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
	if (!dateString) return "";
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * Format a time string (HH:MM:SS) to HH:MM
 * @param {string} timeString - Time string in HH:MM:SS format
 * @returns {string} Formatted time
 */
export function formatTime(timeString) {
	if (!timeString) return "";
	const [hours, minutes] = timeString.split(":");
	return `${hours}:${minutes}`;
}
