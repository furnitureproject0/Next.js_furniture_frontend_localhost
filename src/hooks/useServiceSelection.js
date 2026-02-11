"use client";

import { useCallback } from "react";

/**
 * Custom hook to handle service selection logic
 * Separates business logic from UI components
 * Single responsibility: manage service and addition selection state
 */
export function useServiceSelection(formData, setFormData) {
	
	const handleServiceToggle = useCallback((service) => {
		setFormData((prev) => {
			const isSelected = prev.services.includes(service.id);
			const newServices = isSelected
				? prev.services.filter((id) => id !== service.id)
				: [...prev.services, service.id];

			const newAdditions = { ...prev.serviceAdditions };
			const newPricing = { ...prev.servicePricing };
			
			if (isSelected) {
				delete newAdditions[service.id];
				delete newPricing[service.id];
			} else {
				// Initialize pricing for new service
				newPricing[service.id] = {
					minHours: 1,
					maxHours: 2,
					pricePerHour: 50,
					additions: {},
				};
			}

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
				servicePricing: newPricing,
				servicesMetadata: newServicesMetadata,
			};
		});
	}, [setFormData]);

	const handlePricingChange = useCallback((serviceId, field, value) => {
		setFormData((prev) => ({
			...prev,
			servicePricing: {
				...prev.servicePricing,
				[serviceId]: {
					...prev.servicePricing[serviceId],
					[field]: field === 'notes' ? value : (Number(value) || 0),
				},
			},
		}));
	}, [setFormData]);

	const handleAdditionToggle = useCallback((serviceId, additionId) => {
		setFormData((prev) => {
			const serviceAdditions = prev.serviceAdditions || {};
			const currentServiceAdditions = serviceAdditions[serviceId] || {};
			const isSelected = currentServiceAdditions.hasOwnProperty(additionId);

			const updatedServiceAdditions = { ...currentServiceAdditions };
			const servicePricing = { ...prev.servicePricing };
			const additionsPricing = { ...servicePricing[serviceId]?.additions || {} };

			if (isSelected) {
				delete updatedServiceAdditions[additionId];
				delete additionsPricing[additionId];
			} else {
				updatedServiceAdditions[additionId] = { note: "" };
				additionsPricing[additionId] = { price: 0, amount: 1 };
			}

			servicePricing[serviceId] = {
				...servicePricing[serviceId],
				additions: additionsPricing,
			};

			return {
				...prev,
				serviceAdditions: {
					...serviceAdditions,
					[serviceId]: updatedServiceAdditions,
				},
				servicePricing,
			};
		});
	}, [setFormData]);

	const handleAdditionPricingChange = useCallback((serviceId, additionId, field, value) => {
		setFormData((prev) => ({
			...prev,
			servicePricing: {
				...prev.servicePricing,
				[serviceId]: {
					...prev.servicePricing[serviceId],
					additions: {
						...prev.servicePricing[serviceId]?.additions,
						[additionId]: {
							...prev.servicePricing[serviceId]?.additions?.[additionId],
							[field]: Number(value) || 0,
						},
					},
				},
			},
		}));
	}, [setFormData]);

	const calculateServiceTotal = useCallback((serviceId) => {
		const pricing = formData.servicePricing?.[serviceId];
		if (!pricing) return 0;
		
		const avgHours = (pricing.minHours + pricing.maxHours) / 2;
		const serviceTotal = avgHours * pricing.pricePerHour;
		
		let additionsTotal = 0;
		if (pricing.additions) {
			Object.values(pricing.additions).forEach(addition => {
				additionsTotal += (addition.price || 0) * (addition.amount || 0);
			});
		}
		
		return serviceTotal + additionsTotal;
	}, [formData.servicePricing]);

	const calculateGrandTotal = useCallback(() => {
		return formData.services.reduce((total, serviceId) => {
			return total + calculateServiceTotal(serviceId);
		}, 0);
	}, [formData.services, calculateServiceTotal]);

	return {
		handleServiceToggle,
		handlePricingChange,
		handleAdditionToggle,
		handleAdditionPricingChange,
		calculateServiceTotal,
		calculateGrandTotal,
	};
}
