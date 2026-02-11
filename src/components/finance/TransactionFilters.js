"use client";

import { useTranslation } from "@/hooks/useTranslation";

const getFilters = (t) => [
	{
		value: "all",
		label: t("finance.filters.allTypes"),
		color: "bg-gray-100 text-gray-700",
	},
	{
		value: "income",
		label: t("finance.filters.income"),
		color: "bg-green-100 text-green-700",
	},
	{
		value: "expense",
		label: t("finance.filters.expenses"),
		color: "bg-red-100 text-red-700",
	},
];

const getStatusFilters = (t) => [
	{
		value: "all",
		label: t("finance.filters.allStatus"),
		color: "bg-gray-100 text-gray-700",
	},
	{
		value: "completed",
		label: t("finance.filters.completed"),
		color: "bg-green-100 text-green-700",
	},
	{
		value: "pending",
		label: t("finance.filters.pending"),
		color: "bg-yellow-100 text-yellow-700",
	},
];

export default function TransactionFilters({
	searchQuery,
	selectedFilter,
	selectedStatus,
	onFilterChange,
	onClearFilters,
	hasActiveFilters,
}) {
	const { t } = useTranslation();
	const FILTERS = getFilters(t);
	const STATUS_FILTERS = getStatusFilters(t);
	return (
		<div className="mt-4 sm:mt-6 p-4 sm:p-5 lg:p-6 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-100/50 shadow-sm">
			<div className="space-y-4 sm:space-y-5 lg:space-y-6">
				{/* Search Bar */}
				<div>
					<div className="relative">
						<svg
							className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-amber-600/60"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) =>
								onFilterChange("search", e.target.value)
							}
							placeholder={t("finance.filters.searchTransactions")}
							className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 border border-orange-200/60 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 placeholder-amber-600/50"
						/>
					</div>
				</div>

				{/* Filter Pills */}
				<div className="space-y-3 sm:space-y-4">
					{/* Transaction Type */}
					<div>
						<p className="text-xs sm:text-sm font-medium text-amber-900 mb-2 sm:mb-3">
							{t("finance.filters.transactionType")}
						</p>
						<div className="flex flex-wrap gap-1.5 sm:gap-2">
							{FILTERS.map((filter) => (
								<button
									key={filter.value}
									onClick={() =>
										onFilterChange("type", filter.value)
									}
									className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
										selectedFilter === filter.value
											? "bg-orange-100 text-orange-700 border-2 border-orange-300 shadow-sm"
											: "bg-white/80 text-amber-700/70 border border-orange-200/60 hover:bg-orange-50/60 hover:text-amber-900"
									}`}
								>
									{filter.label}
								</button>
							))}
						</div>
					</div>

					{/* Status */}
					<div>
						<p className="text-xs sm:text-sm font-medium text-amber-900 mb-2 sm:mb-3">
							{t("finance.filters.status")}
						</p>
						<div className="flex flex-wrap gap-1.5 sm:gap-2">
							{STATUS_FILTERS.map((filter) => (
								<button
									key={filter.value}
									onClick={() =>
										onFilterChange("status", filter.value)
									}
									className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
										selectedStatus === filter.value
											? "bg-orange-100 text-orange-700 border-2 border-orange-300 shadow-sm"
											: "bg-white/80 text-amber-700/70 border border-orange-200/60 hover:bg-orange-50/60 hover:text-amber-900"
									}`}
								>
									{filter.label}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Clear Filters */}
				{hasActiveFilters && (
					<div className="pt-3 sm:pt-4 border-t border-orange-100/50">
						<button
							onClick={onClearFilters}
							className="text-xs sm:text-sm text-amber-700/70 hover:text-amber-900 transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer"
						>
							<svg
								className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
							<span className="whitespace-nowrap">{t("finance.filters.clearAllFilters")}</span>
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
