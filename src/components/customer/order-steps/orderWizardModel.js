/**
 * Shared logic and constants for the Order Wizard (Customer and Site Admin)
 */

export const INITIAL_FORM_DATA = {
	services: [],
	serviceAdditions: {}, // { serviceId: { additionId: { note: "" }, ... } }
	servicesMetadata: {}, // { serviceId: { name, internalId } } - for validation
	fromAddress: { 
		locationType: "", 
		fullAddress: "", 
		floor: 0, 
		numberOfFloors: 0,
		numberOfRooms: 0,
		area: 0,
		hasElevator: false, 
		notes: "",
		lat: null,
		lon: null,
		place_id: null
	},
	toAddress: { 
		locationType: "", 
		fullAddress: "", 
		floor: 0, 
		numberOfFloors: 0,
		numberOfRooms: 0,
		area: 0,
		hasElevator: false, 
		notes: "",
		lat: null,
		lon: null,
		place_id: null
	},
	roomDescription: "",
	images: [],
	scheduledDate: "",
	scheduledTime: "",
	notes: "",
};

export const INITIAL_OFFER_DATA = {
	hourly_rate: 75,
	currency: "CHF",
	min_hours: 8,
	max_hours: 25,
	notes: "",
	date: "",
	time: "",
};

/**
 * Validates a single step of the order wizard
 */
export const validateOrderStep = (step, formData) => {
	switch (step) {
		case 1:
			return formData.services.length > 0;
		case 2: {
			// Check if any selected service is furniture moving type
			const hasFurnitureMoving = formData.services.some(serviceId => {
				const metadata = formData.servicesMetadata?.[serviceId];
				return metadata?.internalId === "furniture_moving" || 
					metadata?.name === "Moving";
			});
			
			// Validate fromAddress (always required)
			const fromAddressValid = 
				formData.fromAddress.locationType &&
				formData.fromAddress.fullAddress?.trim();
			
			// Validate toAddress (required for furniture_moving, optional otherwise but must be valid if filled)
			const toAddressValid = !hasFurnitureMoving ? true : (
				formData.toAddress.locationType &&
				formData.toAddress.fullAddress?.trim()
			);
			
			return !!(fromAddressValid && toAddressValid);
		}
		case 3:
			return true; // Room config is optional
		case 4:
			return !!(formData.scheduledDate && formData.scheduledTime);
		default:
			return false;
	}
};

/**
 * Formats address data for API
 */
export const formatLocationForApi = (addressData) => {
	if (!addressData.fullAddress || !addressData.fullAddress.trim()) {
		return null;
	}
	
	const location = {
		address: addressData.fullAddress.trim(),
		type: addressData.locationType || null,
		floor: Number(addressData.floor) || 0,
		has_elevator: !!addressData.hasElevator,
	};
	
	if (addressData.area > 0) location.area = Number(addressData.area);
	if (addressData.numberOfFloors > 0) location.num_of_floors = Number(addressData.numberOfFloors);
	if (addressData.lat !== null) location.latitude = Number(addressData.lat);
	if (addressData.lon !== null) location.longitude = Number(addressData.lon);
	if (addressData.notes?.trim()) location.notes = addressData.notes.trim();
	
	return location;
};

/**
 * Formats the entire order form data for API submission
 */
export const formatOrderPayload = (formData) => {
	// Format preferred time
	let preferredTime = formData.scheduledTime || "09:00";
	if (preferredTime.includes("-")) {
		preferredTime = preferredTime.split("-")[0].trim();
	} else if (preferredTime === "flexible") {
		preferredTime = "09:00";
	}
	
	if (preferredTime && preferredTime.length === 5 && preferredTime.includes(":")) {
		preferredTime = `${preferredTime}:00`;
	}

	// Format services
	const services = formData.services.map(serviceId => {
		const selectedAdditions = formData.serviceAdditions?.[serviceId] || {};
		const additions = Object.entries(selectedAdditions).map(([additionId, additionData]) => ({
			addition_id: Number(additionId),
			note: additionData?.note?.trim() || "",
		}));

		return {
			service_id: serviceId,
			additions: additions,
		};
	});

	const payload = {
		preferred_date: formData.scheduledDate,
		preferred_time: preferredTime,
		number_of_rooms: formData.fromAddress.numberOfRooms || 0,
		location: formatLocationForApi(formData.fromAddress),
		services: services,
	};

	if (formData.notes?.trim()) payload.notes = formData.notes.trim();
	
	const destinationLocation = formatLocationForApi(formData.toAddress);
	if (destinationLocation) payload.destination_location = destinationLocation;

	return payload;
};

