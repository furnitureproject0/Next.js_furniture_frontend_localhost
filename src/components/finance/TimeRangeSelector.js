"use client";

import { useTranslation } from "@/hooks/useTranslation";

const getPeriods = (t) => [
	{ value: "7d", label: t("finance.timeRange.7days") },
	{ value: "30d", label: t("finance.timeRange.30days") },
	{ value: "90d", label: t("finance.timeRange.90days") },
	{ value: "1y", label: t("finance.timeRange.1year") },
	{ value: "custom", label: t("finance.timeRange.customRange") },
];

export default function TimeRangeSelector({
	selectedPeriod,
	onPeriodChange,
	customDateRange,
	onShowCustomModal,
}) {
	const { t } = useTranslation();
	const PERIODS = getPeriods(t);
	const handlePeriodClick = (periodValue) => {
		if (periodValue === "custom") {
			onShowCustomModal();
		} else {
			onPeriodChange(periodValue);
		}
	};

	const getDisplayLabel = (period) => {
		if (
			period.value === "custom" &&
			selectedPeriod === "custom" &&
			customDateRange.startDate &&
			customDateRange.endDate
		) {
			return `${customDateRange.startDate} - ${customDateRange.endDate}`;
		}
		return period.label;
	};

	return (
		<div className="flex items-center flex-wrap gap-1 sm:gap-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-orange-200/60 shadow-sm w-full sm:w-fit">
			{PERIODS.map((period) => (
				<button
					key={period.value}
					onClick={() => handlePeriodClick(period.value)}
					className={`flex-1 sm:flex-none px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
						selectedPeriod === period.value
							? "bg-orange-100 text-orange-700 shadow-sm"
							: "text-amber-700/70 hover:text-amber-900 hover:bg-orange-50/50"
					}`}
				>
					{getDisplayLabel(period)}
				</button>
			))}
		</div>
	);
}
