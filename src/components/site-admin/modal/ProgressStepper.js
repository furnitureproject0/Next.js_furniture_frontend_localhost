export default function ProgressStepper({ 
	currentStep, 
	totalSteps, 
	stepTitles, 
	onStepClick,
	isStepValid 
}) {
	return (
		<div className="w-full px-4 sm:px-6 py-4">
			<div className="relative flex items-center justify-between w-full">
				{/* Background Line */}
				<div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-0" />
				
				{/* Active Progress Line */}
				<div 
					className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-orange-500 rounded-full transition-all duration-500 -z-0"
					style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
				/>

				{stepTitles.map((title, index) => {
					const stepNum = index + 1;
					const isValid = isStepValid ? isStepValid(stepNum) : false;
					const isActive = stepNum === currentStep;
					const isPast = stepNum < currentStep;
					
					// Determine state: completed/valid, active, or pending
					// We show check if valid (even if current) or if it's a past step that was valid? 
					// User logic: "validated steps heads". 
					// Usually we show Check if valid. If active and invalid, show number. 
					// If active and valid, maybe show Check? Or keep Number to show "work in progress"?
					// Let's show Check if Valid.
					
					const showCheck = isValid;

					return (
						<button
							key={index}
							onClick={() => onStepClick(stepNum)}
							type="button"
							className={`group relative flex flex-col items-center justify-center focus:outline-none z-10 cursor-pointer`}
						>
							{/* Circle Indicator */}
							<div 
								className={`
									w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
									${showCheck 
										? "bg-green-500 border-green-500 text-white scale-110" 
										: isActive 
											? "bg-orange-500 border-orange-500 text-white scale-110 shadow-lg ring-4 ring-orange-100" 
											: "bg-white border-gray-300 text-gray-400 group-hover:border-orange-300 group-hover:text-orange-300"
									}
								`}
							>
								{showCheck ? (
									<svg 
										className="w-5 h-5 sm:w-6 sm:h-6" 
										fill="none" 
										viewBox="0 0 24 24" 
										stroke="currentColor" 
										strokeWidth="3"
									>
										<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								) : (
									<span className="text-xs sm:text-sm font-bold">{stepNum}</span>
								)}
							</div>

							{/* Label */}
							<div 
								className={`
									absolute top-10 sm:top-12 w-32 text-center transition-all duration-300
									${isActive 
										? "opacity-100 transform translate-y-0" 
										: "opacity-0 sm:opacity-100 text-gray-400 sm:scale-90"
									}
								`}
							>
								<span className={`
									text-[10px] sm:text-xs font-semibold
									${isActive ? "text-orange-600" : isValid ? "text-green-600" : "text-gray-500"}
								`}>
									{title}
								</span>
							</div>
						</button>
					);
				})}
			</div>
			{/* Spacer for labels */}
			<div className="h-6 sm:h-8" />
		</div>
	);
}
