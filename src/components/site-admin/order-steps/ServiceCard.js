"use client";

import { useTranslation } from "@/hooks/useTranslation";
import ServicePricingInputs from "./ServicePricingInputs";
import ServiceAdditionsList from "./ServiceAdditionsList";

export default function ServiceCard({
	service,
	isSelected,
	selectedAdditions,
	pricing,
	showPricing,
	onServiceToggle,
	onAdditionToggle,
	onPricingChange,
	onAdditionPricingChange,
	calculateServiceTotal
}) {
	const { t } = useTranslation();

	return (
		<div className="space-y-1.5">
			{/* Service Row */}
			<div
				className={`cursor-pointer transition-colors border rounded-md px-3 py-2 flex items-center justify-between gap-2 ${isSelected
						? "bg-gray-50 border-gray-400"
						: "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
					}`}
				onClick={() => onServiceToggle(service)}
			>
				<div className="flex items-center gap-2 flex-1 min-w-0">
					<span className="text-base flex-shrink-0">{service.icon}</span>
					<div className="flex-1 min-w-0">
						<span className="text-xs font-medium text-gray-800 block truncate">{service.name}</span>
						<span className="text-[10px] text-gray-400 block truncate">{service.description}</span>
					</div>
				</div>
				{isSelected && (
					<svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
					</svg>
				)}
			</div>

			{/* Pricing */}
			{isSelected && showPricing && (
				<ServicePricingInputs
					serviceId={service.id}
					pricing={pricing}
					onPricingChange={onPricingChange}
					estimatedTotal={calculateServiceTotal(service.id)}
				/>
			)}

			{/* Additions */}
			{isSelected && service.additions && service.additions.length > 0 && (
				<ServiceAdditionsList
					serviceId={service.id}
					additions={service.additions}
					selectedAdditions={selectedAdditions}
					pricing={pricing}
					showPricing={showPricing}
					onAdditionToggle={onAdditionToggle}
					onAdditionPricingChange={onAdditionPricingChange}
				/>
			)}
		</div>
	);
}
