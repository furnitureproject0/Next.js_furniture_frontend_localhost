import { getIconByType } from "@/utils/iconUtils";

export default function FinanceStatsGrid({ stats }) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
			{stats.map((stat, index) => (
				<div
					key={index}
					className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/60 shadow-lg p-4 sm:p-5 lg:p-6 hover:shadow-xl transition-all duration-300"
				>
					<div className="flex items-center justify-between mb-3 sm:mb-4">
						<div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg text-orange-600">
							{getIconByType(
								stat.iconType || "revenue",
								"w-5 h-5 sm:w-6 sm:h-6",
							)}
						</div>
						<div className="flex items-center text-xs sm:text-sm font-medium text-green-600">
							<svg
								className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 17l9.2-9.2M17 17V7H7"
								/>
							</svg>
							<span className="whitespace-nowrap">{stat.trend}</span>
						</div>
					</div>
					<div>
						<p className="text-xl sm:text-2xl font-bold text-amber-900">
							{stat.value}
						</p>
						<p className="text-amber-700/70 text-xs sm:text-sm font-medium mt-0.5 sm:mt-1">
							{stat.label}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}
