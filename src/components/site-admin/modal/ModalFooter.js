export default function ModalFooter({ 
	currentStep, 
	totalSteps, 
	canProceed,
	isSubmitting,
	onBack, 
	onNext, 
	onSubmit, 
	onCancel, 
	t 
}) {
	return (
		<div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 p-4 sm:p-5 lg:p-6 border-t border-orange-100 bg-orange-50/30">
			<button
				onClick={onBack}
				disabled={currentStep === 1}
				className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
			>
				<svg
					className="w-4 h-4 sm:w-5 sm:h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				{t("common.buttons.back")}
			</button>

			<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
				<button
					onClick={onCancel}
					className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors cursor-pointer"
				>
					{t("common.buttons.cancel")}
				</button>
				{currentStep < totalSteps ? (
					<button
						onClick={onNext}
						disabled={!canProceed}
						className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
					>
						{t("common.buttons.next")}
						<svg
							className="w-4 h-4 sm:w-5 sm:h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				) : (
					<button
						type="button"
						onClick={onSubmit}
						disabled={!canProceed || isSubmitting}
						className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
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
	);
}
