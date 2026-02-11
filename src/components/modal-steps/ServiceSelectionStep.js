"use client";

import { Check } from "../icons/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedServiceTypes } from "@/utils/i18nUtils";

const getServiceTypes = (t) => {
	const translatedServices = getTranslatedServiceTypes(t);
	return [
		{
			id: "furniture_moving",
			name: translatedServices.find(s => s.id === "furniture_moving")?.name || "Furniture Moving",
			description: t("modalSteps.serviceSelection.furnitureMovingDesc"),
		},
		{
			id: "cleaning_service",
			name: translatedServices.find(s => s.id === "cleaning_service")?.name || "Cleaning Service",
			description: t("modalSteps.serviceSelection.cleaningServiceDesc"),
		},
		{
			id: "painting",
			name: translatedServices.find(s => s.id === "painting")?.name || "Painting",
			description: t("modalSteps.serviceSelection.paintingDesc"),
		},
	];
};

export function ServiceSelectionStep({ formData, setFormData }) {
	const { t } = useTranslation();
	const SERVICE_TYPES = getServiceTypes(t);
	const handleServiceToggle = (serviceId) => {
		setFormData((prev) => ({
			...prev,
			services: prev.services.includes(serviceId)
				? prev.services.filter((id) => id !== serviceId)
				: [...prev.services, serviceId],
		}));
	};

	return (
		<div className="space-y-4 sm:space-y-5 lg:space-y-6">
			<div className="grid gap-2.5 sm:gap-3">
				{SERVICE_TYPES.map((service) => {
					const isSelected = formData.services.includes(service.id);

					return (
						<div
							key={service.id}
							className={`cursor-pointer transition-all duration-200 border-2 rounded-lg p-3 sm:p-4 ${
								isSelected
									? "ring-2 ring-orange-500 bg-orange-50 border-orange-200"
									: "hover:bg-gray-50 border-gray-200"
							}`}
							onClick={() => handleServiceToggle(service.id)}
						>
							<div className="flex items-center justify-between gap-2 sm:gap-3">
								<div className="flex-1 min-w-0">
									<h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
										{service.name}
									</h4>
									<p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">
										{service.description}
									</p>
								</div>
								{isSelected && (
									<div className="ml-2 sm:ml-4 p-1 sm:p-1.5 bg-orange-500 rounded-full flex-shrink-0">
										<Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{formData.services.length > 0 && (
				<div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
					<h4 className="text-sm sm:text-base font-medium text-orange-900 mb-1.5 sm:mb-2">
						{t("modalSteps.serviceSelection.selectedServices")}:
					</h4>
					<div className="flex flex-wrap gap-1.5 sm:gap-2">
						{formData.services.map((serviceId) => {
							const service = SERVICE_TYPES.find(
								(s) => s.id === serviceId,
							);
							return (
								<span
									key={serviceId}
									className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-orange-100 text-orange-800 rounded-full text-xs sm:text-sm font-medium"
								>
									{service?.name}
								</span>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
