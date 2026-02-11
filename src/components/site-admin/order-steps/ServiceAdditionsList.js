"use client";

import { useTranslation } from "@/hooks/useTranslation";
import AdditionPricingInputs from "./AdditionPricingInputs";

/**
 * Displays the list of additions for a service
 * Handles addition selection and pricing inputs
 */
export default function ServiceAdditionsList({ 
	serviceId,
	additions,
	selectedAdditions,
	pricing,
	showPricing,
	onAdditionToggle,
	onAdditionPricingChange
}) {
	const { t } = useTranslation();

	return (
		<div className="ml-4 pl-4 border-l-2 border-orange-200 space-y-2">
			<p className="text-xs sm:text-sm font-medium text-amber-900">
				{t("orderSteps.selectAdditions")}
			</p>
			<div className="space-y-2">
				{additions.map((addition) => {
					const isAdditionSelected = selectedAdditions.hasOwnProperty(addition.id);
					const additionPricing = pricing.additions?.[addition.id] || {};
					
					return (
						<div key={addition.id} className="space-y-2">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onAdditionToggle(serviceId, addition.id);
								}}
								className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg transition-all text-left ${
									isAdditionSelected
										? "bg-orange-500 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-orange-100"
								}`}
							>
								{addition.name}
							</button>
							
							{/* Addition Pricing (for internal companies) */}
							{isAdditionSelected && showPricing && (
								<AdditionPricingInputs
									serviceId={serviceId}
									additionId={addition.id}
									pricing={additionPricing}
									onPricingChange={onAdditionPricingChange}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
