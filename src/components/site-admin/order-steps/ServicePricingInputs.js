"use client";

import { useTranslation } from "@/hooks/useTranslation";

/**
 * Reusable component for service pricing inputs (min/max hours, price per hour)
 * Separated for better maintainability and reusability
 */
export default function ServicePricingInputs({ serviceId, pricing, onPricingChange, estimatedTotal }) {
	const { t } = useTranslation();

	const handleInputChange = (field, value) => {
		onPricingChange(serviceId, field, value);
	};

	return (
		<div className="ml-4 pl-4 border-l-2 border-orange-200 space-y-3">
			<div className="grid grid-cols-3 gap-2">
				<div>
					<label className="block text-xs font-medium text-amber-900 mb-1">
						{t("siteAdmin.pricing.minHours")}
					</label>
					<input
						type="number"
						min="0"
						step="0.5"
						value={pricing.minHours || 0}
						onChange={(e) => {
							e.stopPropagation();
							handleInputChange('minHours', e.target.value);
						}}
						onClick={(e) => e.stopPropagation()}
						className="w-full px-2 py-1.5 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
					/>
				</div>
				<div>
					<label className="block text-xs font-medium text-amber-900 mb-1">
						{t("siteAdmin.pricing.maxHours")}
					</label>
					<input
						type="number"
						min="0"
						step="0.5"
						value={pricing.maxHours || 0}
						onChange={(e) => {
							e.stopPropagation();
							handleInputChange('maxHours', e.target.value);
						}}
						onClick={(e) => e.stopPropagation()}
						className="w-full px-2 py-1.5 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
					/>
				</div>
				<div>
					<label className="block text-xs font-medium text-amber-900 mb-1">
						{t("siteAdmin.pricing.pricePerHour")}
					</label>
					<input
						type="number"
						min="0"
						step="1"
						value={pricing.pricePerHour || 0}
						onChange={(e) => {
							e.stopPropagation();
							handleInputChange('pricePerHour', e.target.value);
						}}
						onClick={(e) => e.stopPropagation()}
						className="w-full px-2 py-1.5 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
					/>
				</div>
			</div>
			<div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
				<span className="text-xs font-medium text-green-800">
					{t("siteAdmin.pricing.estimatedTotal")}
				</span>
				<span className="text-sm font-bold text-green-900">
					${estimatedTotal.toFixed(2)}
				</span>
			</div>
			
			{/* Notes field */}
			<div>
				<label className="block text-xs font-medium text-amber-900 mb-1">
					{t("siteAdmin.pricing.notes") || "Offer Notes"}
				</label>
				<textarea
					rows={2}
					value={pricing.notes || ""}
					onChange={(e) => {
						e.stopPropagation();
						handleInputChange('notes', e.target.value);
					}}
					onClick={(e) => e.stopPropagation()}
					placeholder={t("siteAdmin.pricing.notesPlaceholder") || "Add notes about this offer..."}
					className="w-full px-2 py-1.5 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
				/>
			</div>
		</div>
	);
}
