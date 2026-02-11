export default function ModalHeader({
	currentStep,
	totalSteps,
	stepTitles,
	onClose,
	t
}) {
	return (
		<div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 border-b border-orange-100">
			<div className="flex items-center justify-between gap-3">
				<div className="flex-1 min-w-0">
					<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 truncate">
						{t("siteAdmin.orderWizard.createOrder") || "Create New Order"}
					</h2>
					<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1">
						{t("orderSteps.stepOf", {
							current: currentStep,
							total: totalSteps,
							title: stepTitles[currentStep - 1]
						})}
					</p>
				</div>
				<button
					onClick={onClose}
					className="p-1.5 sm:p-2 hover:bg-orange-50 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
				>
					<svg
						className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
}
