"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function PerformanceMetrics() {
	const { t } = useTranslation();
	const metrics = [
		{
			title: t("performance.onTimeDelivery"),
			value: "94.2%",
			target: "95%",
			trend: "up",
			change: "+2.1%",
		},
		{
			title: t("performance.customerSatisfaction"),
			value: "4.7/5",
			target: "4.5/5",
			trend: "up",
			change: "+0.2",
		},
		{
			title: t("performance.averageDeliveryTime"),
			value: "2.4 hrs",
			target: "2.5 hrs",
			trend: "down",
			change: "-0.3 hrs",
		},
		{
			title: t("performance.fuelEfficiency"),
			value: "8.2 L/100km",
			target: "8.5 L/100km",
			trend: "down",
			change: "-0.4 L",
		},
	];

	const getTrendIcon = (trend) => {
		if (trend === "up") {
			return (
				<svg
					className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0"
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
			);
		}
		return (
			<svg
				className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 flex-shrink-0"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M17 7l-9.2 9.2M7 7v10h10"
				/>
			</svg>
		);
	};

	const getProgressColor = (value, target, trend) => {
		// Simple logic to determine if we're meeting targets
		const numValue = parseFloat(value);
		const numTarget = parseFloat(target);

		if (trend === "up" && numValue >= numTarget) return "bg-green-500";
		if (trend === "down" && numValue <= numTarget) return "bg-green-500";
		return "bg-blue-500";
	};

	const getProgressWidth = (value, target) => {
		const numValue = parseFloat(value);
		const numTarget = parseFloat(target);
		const percentage = Math.min((numValue / numTarget) * 100, 100);
		return `${percentage}%`;
	};

	return (
		<div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-lg">
			<div className="p-4 sm:p-5 lg:p-6 border-b border-orange-100/50">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
					<h2 className="text-base sm:text-lg font-semibold text-amber-900">
						{t("performance.title")}
					</h2>
					<button className="text-orange-600 hover:text-orange-700 text-xs sm:text-sm font-medium transition-colors">
						{t("performance.viewDetails")}
					</button>
				</div>
			</div>

			<div className="p-4 sm:p-5 lg:p-6">
				<div className="space-y-4 sm:space-y-5 lg:space-y-6">
					{metrics.map((metric, index) => (
						<div key={index} className="space-y-2 sm:space-y-3">
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
								<div className="flex-1 min-w-0">
									<h3 className="text-sm sm:text-base font-medium text-amber-900">
										{metric.title}
									</h3>
									<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5">
										{t("performance.target")}: {metric.target}
									</p>
								</div>
								<div className="text-left sm:text-right">
									<div className="flex items-center gap-1.5 sm:gap-2">
										<span className="text-base sm:text-lg font-bold text-amber-900">
											{metric.value}
										</span>
										{getTrendIcon(metric.trend)}
									</div>
									<p
										className={`text-[10px] sm:text-xs font-medium ${
											metric.trend === "up"
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										{metric.change}
									</p>
								</div>
							</div>

							<div className="w-full bg-orange-200/60 rounded-full h-1.5 sm:h-2">
								<div
									className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${getProgressColor(
										metric.value,
										metric.target,
										metric.trend,
									)}`}
									style={{
										width: getProgressWidth(
											metric.value,
											metric.target,
										),
									}}
								></div>
							</div>
						</div>
					))}
				</div>

				<div className="mt-4 sm:mt-5 lg:mt-6 p-3 sm:p-4 bg-orange-50/60 rounded-lg">
					<div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
						<svg
							className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<h4 className="text-sm sm:text-base font-medium text-amber-900">
							{t("performance.performanceInsight")}
						</h4>
					</div>
					<p className="text-xs sm:text-sm text-amber-800">
						{t("performance.insightMessage")}
					</p>
				</div>
			</div>
		</div>
	);
}
