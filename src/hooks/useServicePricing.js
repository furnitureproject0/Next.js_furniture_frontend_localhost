import { useCallback } from 'react';

export function useServicePricing(formData) {
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

	return { calculateServiceTotal, calculateGrandTotal };
}
