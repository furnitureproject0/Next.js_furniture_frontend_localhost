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

export const getStatusColor = (status) => {
	switch (status) {
		case "pending":
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		case "in_progress":
			return "bg-orange-100 text-orange-800 border-orange-200";
		case "partially_done":
			return "bg-blue-100 text-blue-800 border-blue-200";
		case "completed":
			return "bg-green-100 text-green-800 border-green-200";
		case "cancelled":
			return "bg-red-100 text-red-800 border-red-200";
		// Legacy/UI statuses
		case "priced":
			return "bg-blue-100 text-blue-800 border-blue-200";
		case "approved":
			return "bg-green-100 text-green-800 border-green-200";
		case "assigned":
		case "scheduled":
			return "bg-purple-100 text-purple-800 border-purple-200";
		case "offer_sent":
		case "offer_accepted":
			return "bg-blue-100 text-blue-800 border-blue-200";
		case "rejected":
		case "offer_rejected":
			return "bg-red-100 text-red-800 border-red-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
};

export const getPriorityColor = (priority) => {
	switch (priority) {
		case "urgent":
			return "bg-red-100 text-red-800 border-red-200";
		case "high":
			return "bg-orange-100 text-orange-800 border-orange-200";
		case "medium":
			return "bg-blue-100 text-blue-800 border-blue-200";
		case "low":
			return "bg-green-100 text-green-800 border-green-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
};

export const getStatusIcon = (status) => {
	switch (status) {
		case "pending":
			return (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			);
		case "priced":
			return (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
					/>
				</svg>
			);
		case "approved":
			return (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			);
		case "assigned":
			return (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
			);
		default:
			return null;
	}
};
