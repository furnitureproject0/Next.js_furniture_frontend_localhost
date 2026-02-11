"use client";

import { useTranslation } from "@/hooks/useTranslation";
import ServicePricingInputs from "./ServicePricingInputs";
import ServiceAdditionsList from "./ServiceAdditionsList";

/**
 * Service card component - displays a single service with its details
 * Handles service selection and displays pricing/additions when selected
 */
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
		<div className="space-y-2">
			{/* Service Selection Card */}
			<div
				className={`cursor-pointer transition-all duration-200 border-2 rounded-lg p-3 sm:p-4 ${
					isSelected
						? "ring-2 ring-orange-500 bg-orange-50 border-orange-300"
						: "hover:bg-gray-50 border-gray-200 hover:border-orange-200"
				}`}
				onClick={() => onServiceToggle(service)}
			>
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 flex-1 min-w-0">
						<div className="text-2xl sm:text-3xl flex-shrink-0">{service.icon}</div>
						<div className="flex-1 min-w-0">
							<h4 className="text-sm sm:text-base font-semibold text-gray-900">
								{service.name}
							</h4>
							<p className="text-xs sm:text-sm text-gray-600 mt-0.5 line-clamp-2">
								{service.description}
							</p>
						</div>
					</div>
					{isSelected && (
						<div className="p-1.5 bg-orange-500 rounded-full flex-shrink-0">
							<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
							</svg>
						</div>
					)}
				</div>
			</div>

			{/* Pricing Section (for internal companies) */}
			{isSelected && showPricing && (
				<ServicePricingInputs
					serviceId={service.id}
					pricing={pricing}
					onPricingChange={onPricingChange}
					estimatedTotal={calculateServiceTotal(service.id)}
				/>
			)}

			{/* Service Additions */}
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
