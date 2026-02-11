"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useState, useCallback } from "react";

/**
 * Generic Modal for Order Wizards (Customer & Admin)
 * Handles navigation, progress bar, and common footer actions.
 */
export default function OrderWizardModal({
	isOpen,
	onClose,
	currentStep,
	setCurrentStep,
	totalSteps,
	stepTitles,
	canProceed,
	isSubmitting,
	onSubmit,
	children,
	headerExtra, // For the Internal/External toggle
	isDirty = false,
}) {
	const { t } = useTranslation();
	const [showCancelConfirm, setShowCancelConfirm] = useState(false);

	if (!isOpen) return null;

	const handleNext = () => {
		if (currentStep < totalSteps && canProceed) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleRequestClose = () => {
		if (isDirty || currentStep > 1) {
			setShowCancelConfirm(true);
		} else {
			onClose();
		}
	};

	const confirmCancel = () => {
		setShowCancelConfirm(false);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
			<div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex flex-col border-b border-orange-100">
					<div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 pb-2 sm:pb-3">
						<div className="flex-1 min-w-0 pr-2">
							<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 truncate">
								{t("orderSteps.createNewOrder")}
							</h2>
							<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1 truncate">
								{t("orderSteps.stepOf", { 
									current: currentStep, 
									total: totalSteps, 
									title: stepTitles[currentStep - 1] 
								})}
							</p>
						</div>
						<button
							onClick={handleRequestClose}
							className="p-1.5 sm:p-2 hover:bg-orange-50 rounded-lg transition-colors flex-shrink-0"
						>
							<svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					
					{/* Extra Header Content (e.g. Toggle) */}
					{headerExtra && (
						<div className="px-4 sm:px-5 lg:px-6 pb-3 sm:pb-4">
							{headerExtra}
						</div>
					)}
				</div>

				{/* Progress Bar */}
				<div className="px-4 sm:px-5 lg:px-6 pt-3 sm:pt-4">
					<div className="flex items-center justify-between mb-2 gap-1 sm:gap-2">
						{stepTitles.map((title, index) => (
							<div
								key={index}
								className={`text-[10px] sm:text-xs font-medium truncate ${
									index + 1 === currentStep
										? "text-orange-600"
										: index + 1 < currentStep
										? "text-green-600"
										: "text-gray-400"
								}`}
							>
								<span className="hidden sm:inline">{index + 1}. </span>
								<span className="sm:hidden">{index + 1}</span>
								<span className="hidden lg:inline"> {title}</span>
							</div>
						))}
					</div>
					<div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-orange-500 to-amber-600 transition-all duration-300"
							style={{ width: `${(currentStep / totalSteps) * 100}%` }}
						/>
					</div>
				</div>

				{/* Content */}
				<div className="p-4 sm:p-5 lg:p-6 overflow-y-auto flex-1">
					{children}
				</div>

				{/* Footer */}
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-5 lg:p-6 border-t border-orange-100 bg-orange-50/30">
					<button
						onClick={handleBack}
						disabled={currentStep === 1}
						className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2"
					>
						<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						{t("common.buttons.back")}
					</button>

					<div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
						<button
							onClick={handleRequestClose}
							className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors"
						>
							{t("common.buttons.cancel")}
						</button>
						
						{currentStep < totalSteps ? (
							<button
								onClick={handleNext}
								disabled={!canProceed}
								className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
							>
								<span className="hidden sm:inline">{t("common.buttons.next")}</span>
								<span className="sm:hidden">Next</span>
								<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</button>
						) : (
							<button
								onClick={onSubmit}
								disabled={!canProceed || isSubmitting}
								className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
							>
								{isSubmitting ? (
									<>
										<div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
										<span className="hidden sm:inline">{t("common.buttons.submitting") || "Submitting..."}</span>
										<span className="sm:hidden">...</span>
									</>
								) : (
									t("common.buttons.submit")
								)}
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Cancel Confirmation Dialog */}
			{showCancelConfirm && (
				<div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<h3 className="text-xl font-bold text-amber-900 mb-2">
							{t("orderWizard.cancelConfirmTitle") || "Cancel Order Creation?"}
						</h3>
						<p className="text-amber-700/70 mb-6">
							{t("orderWizard.cancelConfirmBody") || "Are you sure you want to cancel? All progress will be lost."}
						</p>
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
							<button
								onClick={() => setShowCancelConfirm(false)}
								className="px-6 py-2 border border-orange-200 text-amber-700 hover:bg-orange-50 rounded-lg transition-colors font-medium"
							>
								{t("common.buttons.keepEditing") || "Keep Editing"}
							</button>
							<button
								onClick={confirmCancel}
								className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
							>
								{t("common.buttons.yesCancel") || "Yes, Cancel"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

