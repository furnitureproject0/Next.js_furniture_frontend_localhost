"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { ApiError, servicesApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { useServiceSelection } from "@/hooks/useServiceSelection";
import ServiceCard from "./ServiceCard";

// Service name to ID mapping
const mapServiceNameToId = (serviceName) => {
	const nameMap = {
		"Moving": "furniture_moving",
		"Cleaning": "cleaning_service",
		"Painting": "painting",
		"Packing": "packing",
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

/**
 * Site Admin Service Selection Step
 * Displays services with pricing inputs for internal companies
 * Refactored into smaller components for better maintainability
 */
export default function SiteAdminServiceStep({ formData, setFormData, companyScope }) {
	const { t } = useTranslation();
	const [services, setServices] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Use custom hook for service selection logic
	const {
		handleServiceToggle,
		handlePricingChange,
		handleAdditionToggle,
		handleAdditionPricingChange,
		calculateServiceTotal,
		calculateGrandTotal,
	} = useServiceSelection(formData, setFormData);

	// Fetch services on mount
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
				setError(
					err instanceof ApiError
						? err.message
						: "Failed to load services"
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchServices();
	}, []); // Only fetch once on mount

	// Show pricing for internal companies
	const showPricing = companyScope === "internal";

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
				<p className="text-sm text-red-800">{error}</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{/* Services List */}
			<div className="grid gap-2">
				{services.map((service) => {
					const isSelected = formData.services.includes(service.id);
					const selectedAdditions = formData.serviceAdditions?.[service.id] || {};
					const pricing = formData.servicePricing?.[service.id] || {};

					return (
						<ServiceCard
							key={service.id}
							service={service}
							isSelected={isSelected}
							selectedAdditions={selectedAdditions}
							pricing={pricing}
							showPricing={showPricing}
							onServiceToggle={handleServiceToggle}
							onAdditionToggle={handleAdditionToggle}
							onPricingChange={handlePricingChange}
							onAdditionPricingChange={handleAdditionPricingChange}
							calculateServiceTotal={calculateServiceTotal}
						/>
					);
				})}
			</div>

			{/* Summary */}
			{formData.services.length > 0 && (
				<div className="p-2 bg-green-50 border border-green-200 rounded-md">
					<p className="text-[11px] font-medium text-green-700">
						{t("orderSteps.servicesSelected", { count: formData.services.length })}
					</p>
				</div>

					{showPricing && (
				<div className="p-2 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-between">
					<span className="text-xs font-medium text-gray-600">
						{t("siteAdmin.pricing.grandTotal") || "Grand Total"}
					</span>
					<span className="text-xs font-bold text-gray-900">
						${calculateGrandTotal().toFixed(2)}
					</span>
				</div>
			)}
	)
}</div >
	);
}
