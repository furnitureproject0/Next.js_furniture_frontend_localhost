"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils/financeUtils";
import { useTranslation } from "@/hooks/useTranslation";

export default function FinanceChart({
	chartData,
	selectedPeriod,
	customDateRange,
	periods,
}) {
	const { t } = useTranslation();
	const [chartToggles, setChartToggles] = useState({
		revenue: true,
		expenses: true,
		profit: true,
	});

	const getChartTitle = () => {
		if (
			selectedPeriod === "custom" &&
			customDateRange.startDate &&
			customDateRange.endDate
		) {
			return `${customDateRange.startDate} - ${customDateRange.endDate}`;
		}
		return periods.find((p) => p.value === selectedPeriod)?.label;
	};

	const toggleChartLine = (lineType) => {
		setChartToggles((prev) => ({
			...prev,
			[lineType]: !prev[lineType],
		}));
	};

	return (
		<div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/60 shadow-lg p-4 sm:p-5 lg:p-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-5 lg:mb-6">
				<h3 className="text-base sm:text-lg font-semibold text-amber-900 truncate">
					{t("finance.chart.financialOverview")} - {getChartTitle()}
				</h3>
				<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
					<button
						onClick={() => toggleChartLine("revenue")}
						className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
							chartToggles.revenue
								? "bg-green-100 text-green-700 border border-green-300"
								: "bg-gray-100 text-gray-500 border border-gray-300"
						}`}
					>
						{t("finance.chart.revenue")}
					</button>
					<button
						onClick={() => toggleChartLine("expenses")}
						className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
							chartToggles.expenses
								? "bg-red-100 text-red-700 border border-red-300"
								: "bg-gray-100 text-gray-500 border border-gray-300"
						}`}
					>
						{t("finance.chart.expenses")}
					</button>
					<button
						onClick={() => toggleChartLine("profit")}
						className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
							chartToggles.profit
								? "bg-blue-100 text-blue-700 border border-blue-300"
								: "bg-gray-100 text-gray-500 border border-gray-300"
						}`}
					>
						{t("finance.chart.profit")}
					</button>
				</div>
			</div>
			<div className="h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-orange-50/50 to-amber-50/30 rounded-lg sm:rounded-xl border border-orange-100/50 p-3 sm:p-4">
				{/* Simple Chart Visualization */}
				<div className="h-full flex items-end justify-between space-x-1">
					{chartData.slice(-20).map((point, index) => {
						const maxValue = Math.max(
							...chartData.map((d) =>
								Math.max(
									d.revenue,
									d.expenses,
									Math.abs(d.profit),
								),
							),
						);
						const revenueHeight = (point.revenue / maxValue) * 100;
						const expensesHeight =
							(point.expenses / maxValue) * 100;
						const profitHeight =
							Math.abs(point.profit / maxValue) * 100;

						return (
							<div
								key={index}
								className="flex-1 flex flex-col items-center space-y-1"
							>
								<div className="flex items-end space-x-0.5 h-40">
									{chartToggles.revenue && (
										<div
											className="w-2 bg-green-500 rounded-t opacity-80"
											style={{
												height: `${revenueHeight}%`,
											}}
											title={`${t("finance.chart.revenue")}: ${formatCurrency(
												point.revenue,
											)}`}
										/>
									)}
									{chartToggles.expenses && (
										<div
											className="w-2 bg-red-500 rounded-t opacity-80"
											style={{
												height: `${expensesHeight}%`,
											}}
											title={`${t("finance.chart.expenses")}: ${formatCurrency(
												point.expenses,
											)}`}
										/>
									)}
									{chartToggles.profit && (
										<div
											className={`w-2 rounded-t opacity-80 ${
												point.profit >= 0
													? "bg-blue-500"
													: "bg-orange-500"
											}`}
											style={{
												height: `${profitHeight}%`,
											}}
											title={`${t("finance.chart.profit")}: ${formatCurrency(
												point.profit,
											)}`}
										/>
									)}
								</div>
								<div className="text-xs text-amber-700/60 transform rotate-45 origin-left">
									{new Date(point.date).getDate()}
								</div>
							</div>
						);
					})}
				</div>
				{chartData.length === 0 && (
					<div className="h-full flex items-center justify-center">
						<div className="text-center">
							<svg
								className="w-12 h-12 text-orange-300 mx-auto mb-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1}
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
							<p className="text-amber-700/70 text-sm">
								{t("finance.chart.noDataForPeriod")}
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
