// Utility functions for i18n
import { useTranslation } from "@/hooks/useTranslation";

// Get translated status label
export const getTranslatedStatus = (status) => {
	// This will be used in components that can't use hooks
	// For hook-based components, use useTranslation directly
	return `orders.status.${status}`;
};

// Create a function to get translated SERVICE_TYPES
export const getTranslatedServiceTypes = (t) => {
	return [
		{
			id: "furniture_moving",
			name: t("services.furnitureMoving"),
			description: t("services.furnitureMovingDesc"),
			icon: "🚚",
		},
		{
			id: "cleaning_service",
			name: t("services.cleaningService"),
			description: t("services.cleaningServiceDesc"),
			icon: "🧹",
		},
		{
			id: "painting",
			name: t("services.painting"),
			description: t("services.paintingDesc"),
			icon: "🎨",
		},
		{
			id: "packing",
			name: t("services.packingService"),
			description: t("services.packingServiceDesc"),
			icon: "📦",
		},
	];
};

// Create a function to get translated LOCATION_TYPES
export const getTranslatedLocationTypes = (t) => {
	return [
		{ id: "apartment", name: t("locationTypes.apartment"), icon: "🏢" },
		{ id: "house", name: t("locationTypes.house"), icon: "🏠" },
		{ id: "office", name: t("locationTypes.office"), icon: "🏢" },
		{ id: "warehouse", name: t("locationTypes.warehouse"), icon: "🏭" },
		{ id: "building", name: t("locationTypes.building"), icon: "🏗️" },
	];
};

// Create a function to get translated ROOM_TYPES
export const getTranslatedRoomTypes = (t) => {
	return [
		{ id: "bedroom", name: t("roomTypes.bedroom") || "Bedroom" },
		{ id: "living_room", name: t("roomTypes.livingRoom") || "Living Room" },
		{ id: "kitchen", name: t("roomTypes.kitchen") || "Kitchen" },
		{ id: "bathroom", name: t("roomTypes.bathroom") || "Bathroom" },
		{ id: "dining_room", name: t("roomTypes.diningRoom") || "Dining Room" },
		{ id: "office", name: t("roomTypes.office") || "Office" },
		{ id: "storage_room", name: t("roomTypes.storageRoom") || "Storage Room" },
		{ id: "balcony", name: t("roomTypes.balcony") || "Balcony" },
		{ id: "garage", name: t("roomTypes.garage") || "Garage" },
		{ id: "other", name: t("roomTypes.other") || "Other" },
	];
};

// Get translated location type name
export const getTranslatedLocationType = (locationType, t) => {
	if (!locationType) return "";
	const locationTypes = getTranslatedLocationTypes(t);
	const found = locationTypes.find(lt => lt.id === locationType);
	return found?.name || locationType;
};

// Create a function to get translated STATUS_LABELS
// Hide "offer_sent" status - show as "pending" instead
export const getTranslatedStatusLabel = (status, t) => {
	if (!status) return t("common.nA") || "N/A";

	// Map "offer_sent" to "pending" to hide it from all roles
	const normalizedStatus = status === "offer_sent" ? "pending" : status;
	
	const statusKeyMap = {
		"pending": "pending",
		"in_progress": "inProgress",
		"inProgress": "inProgress",
		"partially_done": "partiallyDone",
		"partiallyDone": "partiallyDone",
		"completed": "completed",
		"cancelled": "cancelled",
		"assigned": "assigned",
		"offer_sent": "pending", // Hide offer_sent, show as pending
		"offer_accepted": "offerAccepted",
		"offerAccepted": "offerAccepted",
		"offer_rejected": "offerRejected",
		"offerRejected": "offerRejected",
		"scheduled": "scheduled",
		"accepted_by_company": "accepted_by_company",
		"appointment": "pending"
	};
	
	const key = statusKeyMap[normalizedStatus] || normalizedStatus;
	const translation = t(`orders.status.${key}`);
	
	// If translation fails (returns the key itself or starts with orders.status.), return normalized version
	if (!translation || translation === `orders.status.${key}` || translation.includes("orders.status.")) {
		return normalizedStatus.replace(/_/g, " ").charAt(0).toUpperCase() + normalizedStatus.replace(/_/g, " ").slice(1);
	}
	
	return translation;
};

