"use client";

import { Check } from "../icons/Icons";
import { useTranslation } from "@/hooks/useTranslation";

export function ProgressStepper({ currentStep, totalSteps, stepTitles }) {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col items-center space-y-2 sm:space-y-3 lg:space-y-4">
			{/* Modern Progress Bar */}
			<div className="w-full max-w-lg">
				<div className="flex items-start justify-between relative">
					{/* Background Progress Line */}
					<div className="absolute top-3 sm:top-4 left-6 sm:left-8 right-6 sm:right-8 h-0.5 bg-gray-200 rounded-full" />

					{/* Active Progress Line */}
					<div
						className="absolute top-3 sm:top-4 left-6 sm:left-8 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500 ease-out"
						style={{
							width: `calc(${
								((currentStep - 1) / (totalSteps - 1)) * 100
							}% * (100% - 3rem) / 100%)`,
						}}
					/>

					{Array.from({ length: totalSteps }, (_, i) => i + 1).map(
						(step) => (
							<div
								key={step}
								className="flex flex-col items-center flex-1"
							>
								{/* Step Circle */}
								<div
									className={`relative z-10 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
										step < currentStep
											? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg"
											: step === currentStep
											? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl ring-2 sm:ring-4 ring-orange-100"
											: "bg-white border-2 border-gray-300 text-gray-500 shadow-sm"
									}`}
								>
									{step < currentStep ? (
										<Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
									) : (
										step
									)}
								</div>

								{/* Step Title */}
								<div className="mt-2 sm:mt-2.5 lg:mt-3 text-center max-w-16 sm:max-w-20 lg:max-w-24 px-0.5">
									<div
										className={`text-[10px] sm:text-xs font-medium transition-all duration-300 leading-tight ${
											step === currentStep
												? "text-orange-700 font-semibold"
												: step < currentStep
												? "text-green-600"
												: "text-gray-400"
										}`}
									>
										{stepTitles[step - 1]}
									</div>
								</div>
							</div>
						),
					)}
				</div>
			</div>

			{/* Current Step Indicator */}
			<div className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-full border border-orange-100">
				<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse"></div>
				<span className="text-xs sm:text-sm font-medium text-orange-700 truncate max-w-[120px] sm:max-w-none">
					{stepTitles[currentStep - 1]}
				</span>
				<span className="text-[10px] sm:text-xs text-orange-500 font-medium">
					({currentStep}/{totalSteps})
				</span>
			</div>
		</div>
	);
}
