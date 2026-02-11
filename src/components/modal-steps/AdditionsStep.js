"use client";

import { Check } from "../icons/Icons";
import { useTranslation } from "@/hooks/useTranslation";

export function AdditionsStep({ formData, setFormData }) {
	const { t } = useTranslation();
	const handleFurnitureCraneToggle = () => {
		setFormData((prev) => ({
			...prev,
			furnitureCrane: !prev.furnitureCrane,
		}));
	};

	return (
		<div className="space-y-4 sm:space-y-5 lg:space-y-6">
			<div className="text-center">
				<h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
					{t("modalSteps.additions.additionalServices")}
				</h4>
				<p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5 lg:mb-6">
					{t("modalSteps.additions.selectAdditionalServices")}
				</p>
			</div>

			<div className="space-y-3 sm:space-y-4">
				{/* Furniture Crane Option */}
				<div
					className={`cursor-pointer transition-all duration-200 border-2 rounded-lg p-3 sm:p-4 ${
						formData.furnitureCrane
							? "ring-2 ring-orange-500 bg-orange-50 border-orange-200"
							: "hover:bg-gray-50 border-gray-200"
					}`}
					onClick={handleFurnitureCraneToggle}
				>
					<div className="flex items-center justify-between gap-2 sm:gap-3">
						<div className="flex-1 min-w-0">
							<h5 className="text-sm sm:text-base font-semibold text-gray-900">
								{t("modalSteps.additions.furnitureCrane")}
							</h5>
							<p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
								{t("modalSteps.additions.furnitureCraneDesc")}
							</p>
							<div className="mt-1.5 sm:mt-2">
								<span className="text-[10px] sm:text-xs bg-orange-100 text-orange-800 px-2 py-0.5 sm:py-1 rounded-full">
									{t("modalSteps.additions.furnitureCraneTags")}
								</span>
							</div>
						</div>
						{formData.furnitureCrane && (
							<div className="ml-2 sm:ml-4 p-1 sm:p-1.5 bg-orange-500 rounded-full flex-shrink-0">
								<Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
							</div>
						)}
					</div>
				</div>

				{/* Future Additional Services Placeholder */}
				<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-5 lg:p-6 text-center">
					<p className="text-xs sm:text-sm text-gray-500">
						{t("modalSteps.additions.moreServicesComingSoon")}
					</p>
				</div>
			</div>

			{/* Selected Additions Summary */}
			{formData.furnitureCrane && (
				<div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
					<h4 className="text-sm sm:text-base font-medium text-orange-900 mb-1.5 sm:mb-2">
						{t("modalSteps.additions.selectedAdditions")}:
					</h4>
					<div className="flex flex-wrap gap-1.5 sm:gap-2">
						<span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-orange-100 text-orange-800 rounded-full text-xs sm:text-sm font-medium">
							{t("modalSteps.additions.furnitureCrane")}
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
