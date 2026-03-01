"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { ApiError, servicesApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { useServiceSelection } from "@/hooks/useServiceSelection";
import ServicePricingInputs from "./ServicePricingInputs";
import ServiceAdditionsList from "./ServiceAdditionsList";
import TimePicker24 from "@/components/TimePicker24";

// Service name to ID mapping
const mapServiceNameToId = (serviceName) => {
	const nameMap = {
		Moving: "furniture_moving",
		Cleaning: "cleaning_service",
		Painting: "painting",
		Packing: "packing",
	};
	return nameMap[serviceName] || serviceName.toLowerCase().replace(/\s+/g, "_");
};

// Service icon mapping
const getServiceIcon = (serviceId) => {
	const iconMap = {
		furniture_moving: "🚚",
		cleaning_service: "🧹",
		painting: "🎨",
		packing: "📦",
	};
	return iconMap[serviceId] || "📋";
};

export default function SiteAdminServiceStep({ 
	formData, 
	setFormData, 
	companyScope,
	availableCompanies = [],
	isLoadingCompanies = false,
	companiesError = null,
	globalCompanyId = null
}) {
	const { t } = useTranslation();
	const [services, setServices] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const {
		handleServiceToggle,
		handlePricingChange,
		handleAdditionToggle,
		handleAdditionPricingChange,
		calculateServiceTotal,
		calculateGrandTotal,
	} = useServiceSelection(formData, setFormData);

	useEffect(() => {
		const fetchServices = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const response = await servicesApi.getServices();

				if (response?.success && response?.data?.services) {
					const transformedServices = response.data.services.map((service) => ({
						id: service.id,
						internalId: mapServiceNameToId(service.name),
						name: service.name,
						description: service.description || "",
						icon: getServiceIcon(mapServiceNameToId(service.name)),
						additions: service.additions || [],
					}));
					setServices(transformedServices);
				}
			} catch (err) {
				console.error("Error fetching services:", err);
				// Don't set error if we want to show fallbacks
				// setError(err instanceof ApiError ? err.message : "Failed to load services");
			} finally {
				setIsLoading(false);
			}
		};

		fetchServices();
	}, []);

	// Fallback services if API returns nothing or is loading
	const fallbackServices = [
		{ id: 1, internalId: 'furniture_moving', name: 'Moving', icon: '🚚', description: 'Furniture Moving', additions: [] },
		{ id: 2, internalId: 'cleaning_service', name: 'Cleaning', icon: '🧹', description: 'Cleaning Service', additions: [] },
		{ id: 3, internalId: 'painting', name: 'Painting', icon: '🎨', description: 'Painting Service', additions: [] }
	];

	const displayServices = services.length > 0 ? services : fallbackServices;

	const showPricing = companyScope === "internal";

	const handleServiceCompanyChange = (serviceId, companyId) => {
		setFormData(prev => ({
			...prev,
			servicePricing: {
				...prev.servicePricing,
				[serviceId]: {
					...prev.servicePricing[serviceId],
					assignedCompanyId: companyId ? Number(companyId) : null
				}
			}
		}));
	};

	const handleServiceDateChange = (serviceId, date) => {
		setFormData(prev => ({
			...prev,
			servicePricing: {
				...prev.servicePricing,
				[serviceId]: {
					...prev.servicePricing[serviceId],
					scheduledDate: date
				}
			}
		}));
	};

	const handleServiceTimeChange = (serviceId, time) => {
		setFormData(prev => ({
			...prev,
			servicePricing: {
				...prev.servicePricing,
				[serviceId]: {
					...prev.servicePricing[serviceId],
					scheduledTime: time
				}
			}
		}));
	};

	const getMinDate = () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow.toISOString().split("T")[0];
	};

	return (
		<div className="space-y-4">
			{/* Horizontal Service Selection Row */}
			<div className="grid grid-cols-3 gap-2">
				{displayServices.map((service) => {
					const isSelected = formData.services.includes(service.id);
					return (
						<button
							key={service.id}
							type="button"
							onClick={() => handleServiceToggle(service)}
							className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${
								isSelected
									? "bg-primary-50 border-primary-400 ring-1 ring-primary-400 shadow-sm"
									: "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
							}`}
						>
							<span className={`text-[11px] font-bold leading-tight ${isSelected ? "text-primary-700" : "text-gray-600"}`}>
								{service.name}
							</span>
							{isSelected && (
								<div className="absolute top-1 right-1">
									<svg className="w-3.5 h-3.5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
								</div>
							)}
						</button>
					);
				})}
			</div>

			{/* Service Details (Pricing & Additions) for Selected Services */}
			<div className="space-y-4">
				{displayServices
					.filter((s) => formData.services.includes(s.id))
					.map((service) => {
						const selectedAdditions = formData.serviceAdditions?.[service.id] || {};
						const pricing = formData.servicePricing?.[service.id] || {};

						return (
							<div key={service.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm space-y-4">
								<div className="flex items-start justify-between border-b border-gray-100 pb-3">
									<div className="flex-1 space-y-3">
										<div className="flex items-center gap-2">
											<span className="text-sm font-bold text-gray-900">{service.name}</span>
										</div>
										
										{/* Service Specific Company Selection */}
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div>
												<label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-1">
													{t("siteAdmin.assignCompanyForService") || "Assign Company for this Service"}
												</label>
												{isLoadingCompanies ? (
													<div className="h-8 w-full bg-gray-50 animate-pulse rounded-md" />
												) : (
												<select
														value={pricing.assignedCompanyId || ""}
														onChange={(e) => handleServiceCompanyChange(service.id, e.target.value)}
														className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400 bg-white font-medium"
													>
														<option value="">
															{(() => {
																const globalCompany = availableCompanies.find(c => c.id === globalCompanyId);
																const defaultLabel = t("common.globalDefault") || "Default";
																return globalCompany ? `${globalCompany.name} (${defaultLabel})` : defaultLabel;
															})()}
														</option>
														{availableCompanies.map(c => (
															<option key={c.id} value={c.id}>
																{c.name} {c.id === globalCompanyId ? `(${t("common.globalDefault") || "Default"})` : ""}
															</option>
														))}
													</select>
												)}
												{companiesError && <p className="text-[10px] text-red-500 mt-0.5">{companiesError}</p>}
											</div>

											{/* Service Specific Date & Time */}
											<div className="grid grid-cols-2 gap-2">
												<div>
													<label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-1">
														{t("orderSteps.preferredDate") || "Preferred Date"}
													</label>
													<input
														type="date"
														value={pricing.scheduledDate || ""}
														onChange={(e) => handleServiceDateChange(service.id, e.target.value)}
														min={getMinDate()}
														className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400 bg-white"
													/>
												</div>
												<div>
													<label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-1">
														{t("orderSteps.preferredTime") || "Time"}
													</label>
													<TimePicker24
														value={pricing.scheduledTime || ""}
														onChange={(time) => handleServiceTimeChange(service.id, time)}
													/>
												</div>
											</div>
										</div>
									</div>
									<button
										type="button"
										onClick={() => handleServiceToggle(service)}
										className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
									>
										Remove
									</button>
								</div>

								{showPricing && (
									<ServicePricingInputs
										serviceId={service.id}
										pricing={pricing}
										onPricingChange={handlePricingChange}
										estimatedTotal={calculateServiceTotal(service.id)}
									/>
								)}

								{service.additions && service.additions.length > 0 && (
									<ServiceAdditionsList
										serviceId={service.id}
										additions={service.additions}
										selectedAdditions={selectedAdditions}
										pricing={pricing}
										showPricing={showPricing}
										onAdditionToggle={handleAdditionToggle}
										onAdditionPricingChange={handleAdditionPricingChange}
									/>
								)}
							</div>
						);
					})}
			</div>

			{/* Summary Row */}
			{formData.services.length > 0 && (
				<div className="pt-2">
					{showPricing && (
						<div className="p-3 bg-gray-900 rounded-lg flex items-center justify-between text-white shadow-md">
							<div className="flex items-center gap-2">
								<svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span className="text-xs font-semibold">
									{t("siteAdmin.pricing.grandTotal") || "Grand Total"}
								</span>
							</div>
							<span className="text-base font-bold text-primary-400">
								CHF {calculateGrandTotal().min.toFixed(2)}
								{calculateGrandTotal().min !== calculateGrandTotal().max && ` - ${calculateGrandTotal().max.toFixed(2)}`}
							</span>
						</div>
					)}
				</div>
			)}
		</div>
	);

}
