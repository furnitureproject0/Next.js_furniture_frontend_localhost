"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { ApiError, servicesApi } from "@/lib/api";
import { useEffect, useState } from "react";

// Map API service names to internal service IDs
const mapServiceNameToId = (serviceName) => {
	const nameMap = {
		"Moving": "furniture_moving",
		"Cleaning": "cleaning_service",
		"Painting": "painting",
		"Packing": "packing",
	};
	return nameMap[serviceName] || serviceName.toLowerCase().replace(/\s+/g, "_");
};

// Get icon for service based on ID
const getServiceIcon = (serviceId) => {
	const iconMap = {
		furniture_moving: "🚚",
		cleaning_service: "🧹",
		painting: "🎨",
		packing: "📦",
	};
	return iconMap[serviceId] || "📋";
};

export default function CustomerServiceStep({ formData, setFormData, validationErrors = {} }) {
	const { t } = useTranslation();
	const [services, setServices] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchServices = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const response = await servicesApi.getServices();
				if (response?.success && response?.data?.services) {
					// Transform API services to internal format
					const transformedServices = response.data.services.map((service) => ({
						id: service.id, // Use API ID for backend compatibility
						internalId: mapServiceNameToId(service.name), // Map for internal use
						name: service.name,
						description: service.description || "",
						icon: getServiceIcon(mapServiceNameToId(service.name)),
						additions: service.additions || [],
					}));
					setServices(transformedServices);
				}
			} catch (err) {
				console.error("Error fetching services:", err);
				setError(
					err instanceof ApiError 
						? err.message 
						: t("orderSteps.failedToLoadServices") || "Failed to load services"
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchServices();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only fetch once on mount

	const handleServiceToggle = (service) => {
		setFormData((prev) => {
			const isSelected = prev.services.includes(service.id);
			const newServices = isSelected
				? prev.services.filter((id) => id !== service.id)
				: [...prev.services, service.id];

			// If service is deselected, remove its additions
			const newAdditions = { ...prev.serviceAdditions };
			if (isSelected && newAdditions[service.id]) {
				delete newAdditions[service.id];
			}

			// Store service metadata for validation (to check if it's moving type)
			const newServicesMetadata = { ...prev.servicesMetadata || {} };
			if (isSelected) {
				delete newServicesMetadata[service.id];
			} else {
				newServicesMetadata[service.id] = {
					name: service.name,
					internalId: service.internalId,
				};
			}

			return {
				...prev,
				services: newServices,
				serviceAdditions: newAdditions,
				servicesMetadata: newServicesMetadata,
			};
		});
	};

	const handleAdditionToggle = (serviceId, additionId) => {
		setFormData((prev) => {
			const serviceAdditions = prev.serviceAdditions || {};
			const currentServiceAdditions = serviceAdditions[serviceId] || {};
			const isSelected = currentServiceAdditions.hasOwnProperty(additionId);

			const updatedServiceAdditions = { ...currentServiceAdditions };
			if (isSelected) {
				delete updatedServiceAdditions[additionId];
			} else {
				updatedServiceAdditions[additionId] = { note: "" };
			}

			return {
				...prev,
				serviceAdditions: {
					...serviceAdditions,
					[serviceId]: updatedServiceAdditions,
				},
			};
		});
	};

	const handleAdditionNoteChange = (serviceId, additionId, note) => {
		setFormData((prev) => {
			const serviceAdditions = prev.serviceAdditions || {};
			const currentServiceAdditions = serviceAdditions[serviceId] || {};

			return {
				...prev,
				serviceAdditions: {
					...serviceAdditions,
					[serviceId]: {
						...currentServiceAdditions,
						[additionId]: {
							...currentServiceAdditions[additionId],
							note: note,
						},
					},
				},
			};
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-sm text-red-800">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-5 lg:space-y-6">
			<div>
				<h3 className="text-base sm:text-lg font-semibold text-amber-900 mb-1.5 sm:mb-2">
					{t("orderSteps.selectServicesYouNeed")}
				</h3>
				<p className="text-xs sm:text-sm text-amber-700/70">
					{t("orderSteps.selectOneOrMore")}
				</p>
			</div>

			<div className="grid gap-2.5 sm:gap-3">
				{services.map((service) => {
					const isSelected = formData.services.includes(service.id);
					const selectedAdditions = formData.serviceAdditions?.[service.id] || {};

					return (
						<div key={service.id} className="space-y-2 sm:space-y-3">
							<div
								className={`cursor-pointer transition-all duration-200 border-2 rounded-lg p-3 sm:p-4 lg:p-5 ${
									isSelected
										? "ring-2 ring-orange-500 bg-orange-50 border-orange-300"
										: "hover:bg-gray-50 border-gray-200 hover:border-orange-200"
								}`}
								onClick={() => handleServiceToggle(service)}
							>
								<div className="flex items-center justify-between gap-2 sm:gap-3">
									<div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
										<div className="text-2xl sm:text-3xl flex-shrink-0">{service.icon}</div>
										<div className="flex-1 min-w-0">
											<h4 className="text-sm sm:text-base font-semibold text-gray-900">
												{service.name}
											</h4>
											<p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">
												{service.description}
											</p>
										</div>
									</div>
									{isSelected && (
										<div className="ml-2 sm:ml-4 p-1.5 sm:p-2 bg-orange-500 rounded-full flex-shrink-0">
											<svg
												className="w-4 h-4 sm:w-5 sm:h-5 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={3}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
									)}
								</div>
							</div>

							{/* Service Additions */}
							{isSelected && service.additions && service.additions.length > 0 && (
								<div className="ml-2 sm:ml-4 pl-2 sm:pl-4 border-l-2 border-orange-200 space-y-2 sm:space-y-3">
									<p className="text-xs sm:text-sm font-medium text-amber-900">
										{t("orderSteps.selectAdditions")}
									</p>
									<div className="space-y-2 sm:space-y-3">
										{service.additions.map((addition) => {
											const isAdditionSelected = selectedAdditions.hasOwnProperty(addition.id);
											const additionData = selectedAdditions[addition.id] || { note: "" };
											
											return (
												<div key={addition.id} className="space-y-1.5 sm:space-y-2">
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															handleAdditionToggle(service.id, addition.id);
														}}
														className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-all text-left ${
															isAdditionSelected
																? "bg-orange-500 text-white"
																: "bg-gray-100 text-gray-700 hover:bg-orange-100"
														}`}
													>
														{addition.name}
													</button>
													
													{/* Note input for selected addition */}
													{isAdditionSelected && (
														<div className="pl-1 sm:pl-2">
															<label className="block text-[10px] sm:text-xs text-amber-700 mb-0.5 sm:mb-1">
																{t("orderSteps.additionNote") || "Note (optional)"}
															</label>
															<input
																type="text"
																value={additionData.note || ""}
																onChange={(e) => {
																	e.stopPropagation();
																	handleAdditionNoteChange(service.id, addition.id, e.target.value);
																}}
																onClick={(e) => e.stopPropagation()}
																placeholder={t("orderSteps.additionNotePlaceholder") || "Add a note for this addition..."}
																className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
															/>
														</div>
													)}
												</div>
											);
										})}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{formData.services.length > 0 && (
				<div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
					<p className="text-xs sm:text-sm font-medium text-green-800">
						{t("orderSteps.servicesSelected", { count: formData.services.length })}
					</p>
				</div>
			)}

			{/* Validation Error */}
			{validationErrors.services && (
				<div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-xs sm:text-sm text-red-600">{validationErrors.services}</p>
				</div>
			)}
		</div>
	);
}

