"use client";

import { useTranslation } from "@/hooks/useTranslation";

/**
 * Reusable component for addition pricing inputs (price and amount)
 * Calculates and displays the total for the addition
 */
export default function AdditionPricingInputs({ 
	serviceId, 
	additionId, 
	pricing, 
	onPricingChange 
}) {
	const { t } = useTranslation();

	const handleInputChange = (field, value) => {
		onPricingChange(serviceId, additionId, field, value);
	};

	const total = (pricing.price || 0) * (pricing.amount || 0);

	return (
		<div className="pl-2 grid grid-cols-2 gap-2">
			<div>
				<label className="block text-xs text-amber-700 mb-1">
					{t("siteAdmin.pricing.price")}
				</label>
				<input
					type="number"
					min="0"
					step="1"
					value={pricing.price || 0}
					onChange={(e) => {
						e.stopPropagation();
						handleInputChange('price', e.target.value);
					}}
					onClick={(e) => e.stopPropagation()}
					className="w-full px-2 py-1.5 text-xs border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
				/>
			</div>
			<div>
				<label className="block text-xs text-amber-700 mb-1">
					{t("siteAdmin.pricing.amount")}
				</label>
				<input
					type="number"
					min="1"
					step="1"
					value={pricing.amount || 1}
					onChange={(e) => {
						e.stopPropagation();
						handleInputChange('amount', e.target.value);
					}}
					onClick={(e) => e.stopPropagation()}
					className="w-full px-2 py-1.5 text-xs border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
				/>
			</div>
			<div className="col-span-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
				Total: ${total.toFixed(2)}
			</div>
		</div>
	);
}
