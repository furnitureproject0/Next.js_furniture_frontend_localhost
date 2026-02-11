export const mapServiceNameToId = (serviceName) => {
	const nameMap = {
		"Moving": "furniture_moving",
		"Cleaning": "cleaning_service",
		"Painting": "painting",
		"Packing": "packing",
	};
	return nameMap[serviceName] || serviceName.toLowerCase().replace(/\s+/g, "_");
};

export const getServiceIcon = (serviceId) => {
	const iconMap = {
		furniture_moving: "🚚",
		cleaning_service: "🧹",
		painting: "🎨",
		packing: "📦",
	};
	return iconMap[serviceId] || "📋";
};

export const transformServicesFromApi = (services) => {
	return services.map((service) => ({
		id: service.id,
		internalId: mapServiceNameToId(service.name),
		name: service.name,
		description: service.description || "",
		icon: getServiceIcon(mapServiceNameToId(service.name)),
		additions: service.additions || [],
	}));
};
