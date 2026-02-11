"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import { useOrderForm } from "../hooks/useOrderForm";
import { useAppSelector } from "../store/hooks";
import { selectUser } from "../store/selectors";
import { ArrowLeft, ArrowRight, X } from "./icons/Icons";
import { AdditionsStep } from "./modal-steps/AdditionsStep";
import { ProgressStepper } from "./modal-steps/ProgressStepper";
import { PropertyDetailsStep } from "./modal-steps/PropertyDetailsStep";
import { ScheduleDetailsStep } from "./modal-steps/ScheduleDetailsStep";
import { ServiceSelectionStep } from "./modal-steps/ServiceSelectionStep";

const TOTAL_STEPS = 4;

export function NewOrderModal({ isOpen, onClose, onOrderCreated }) {
	const { t } = useTranslation();
	const [currentStep, setCurrentStep] = useState(1);
	const { formData, setFormData, resetForm, validateStep } = useOrderForm();
	const user = useAppSelector(selectUser);

	const STEP_TITLES = [
		t("newOrderModal.steps.selectServices"),
		t("newOrderModal.steps.propertyDetails"),
		t("newOrderModal.steps.additions"),
		t("newOrderModal.steps.scheduleDetails"),
	];

	const handleNext = () => {
		if (currentStep < TOTAL_STEPS) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleSubmit = () => {
		// Generate order ID and create order data
		const orderData = {
			id: `#FT-${new Date().getFullYear()}-${String(Date.now()).slice(
				-3,
			)}`,
			client: user?.name || "New Client",
			furniture: formData.description || "Various items",
			floor: formData.floorNumber,
			cleaning: formData.services.includes("cleaning_service"),
			status: "pending",
			date: formData.date
				? new Date(formData.date).toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0],
			location: formData.address,
			priority: "medium",
		};


		// Reset form and close modal
		resetForm();
		setCurrentStep(1);

		if (onOrderCreated) {
			onOrderCreated(orderData);
		}

		onClose();
	};

	const canProceed = () => validateStep(currentStep);

	const renderStepContent = () => {
		const stepProps = {
			formData,
			setFormData,
		};

		switch (currentStep) {
			case 1:
				return <ServiceSelectionStep {...stepProps} />;
			case 2:
				return <PropertyDetailsStep {...stepProps} />;
			case 3:
				return <AdditionsStep {...stepProps} />;
			case 4:
				return <ScheduleDetailsStep {...stepProps} />;
			default:
				return null;
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
				{/* Header */}
				<div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 border-b border-orange-100/50">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent truncate">
							{t("newOrderModal.title")}
						</h2>
						<button
							onClick={onClose}
							className="p-1.5 sm:p-2 text-amber-600/60 hover:text-amber-700 hover:bg-orange-50/60 rounded-lg transition-colors flex-shrink-0"
						>
							<X className="w-4 h-4 sm:w-5 sm:h-5" />
						</button>
					</div>
				</div>

				{/* Progress Stepper */}
				<div className="flex-shrink-0 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 border-b border-orange-100/50">
					<ProgressStepper
						currentStep={currentStep}
						totalSteps={TOTAL_STEPS}
						stepTitles={STEP_TITLES}
					/>
				</div>

				{/* Content */}
				<div className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto">
					{renderStepContent()}
				</div>

				{/* Sticky Footer */}
				<div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 border-t border-orange-100/50 bg-gradient-to-r from-orange-50/50 to-amber-50/50 backdrop-blur-sm">
					<div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0">
						<button
							onClick={onClose}
							className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
						>
							{t("newOrderModal.cancel")}
						</button>

						<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
							<button
								onClick={handleBack}
								disabled={currentStep === 1}
								className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 disabled:text-amber-400 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-white/60 cursor-pointer"
							>
								<ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
								{t("newOrderModal.back")}
							</button>

							{currentStep < TOTAL_STEPS ? (
								<button
									onClick={handleNext}
									disabled={!canProceed()}
									className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-2 text-xs sm:text-sm btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg cursor-pointer"
								>
									{t("newOrderModal.next")}
									<ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
								</button>
							) : (
								<button
									onClick={handleSubmit}
									disabled={!canProceed()}
									className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg cursor-pointer"
								>
									{t("newOrderModal.createOrder")}
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
