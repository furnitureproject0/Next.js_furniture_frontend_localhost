"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function PeriodSummary({ stats }) {
	const { t } = useTranslation();
	return (
		<div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/60 shadow-lg p-4 sm:p-5 lg:p-6">
			<h3 className="text-base sm:text-lg font-semibold text-amber-900 mb-4 sm:mb-5 lg:mb-6">
				{t("finance.periodSummary.title")}
			</h3>
			<div className="space-y-3 sm:space-y-4 lg:space-y-5">
				{stats.map((stat, index) => (
					<div
						key={index}
						className="flex items-center justify-between gap-3"
					>
						<div className="flex-1 min-w-0">
							<p className="text-xs sm:text-sm font-medium text-amber-900 truncate">
								{stat.label}
							</p>
							<p className="text-xs text-amber-700/60 mt-0.5 sm:mt-1">
								{stat.value}
							</p>
						</div>
						<div className="text-xs font-medium px-2 py-1 rounded-full text-green-700 bg-green-100/80 whitespace-nowrap flex-shrink-0">
							{stat.trend}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
