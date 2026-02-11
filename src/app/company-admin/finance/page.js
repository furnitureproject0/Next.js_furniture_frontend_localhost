"use client";

import { useState, useMemo } from "react";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useTransactionFilters } from "@/hooks/useTransactionFilters";
import { exportToExcel, calculatePeriodStats } from "@/utils/financeUtils";
import { useTranslation } from "@/hooks/useTranslation";

// Components
import TimeRangeSelector from "@/components/finance/TimeRangeSelector";
import FinanceStatsGrid from "@/components/finance/FinanceStatsGrid";
import FinanceChart from "@/components/finance/FinanceChart";
import PeriodSummary from "@/components/finance/PeriodSummary";
import TransactionFilters from "@/components/finance/TransactionFilters";
import TransactionList from "@/components/finance/TransactionList";
import Pagination from "@/components/finance/Pagination";

// Modals
import AddExpenseModal from "@/components/modals/AddExpenseModal";
import CustomDateModal from "@/components/modals/CustomDateModal";
import TransactionDetailsModal from "@/components/modals/TransactionDetailsModal";

const PERIODS = [
	{ value: "7d", label: "7 days" },
	{ value: "30d", label: "30 days" },
	{ value: "90d", label: "90 days" },
	{ value: "1y", label: "1 year" },
	{ value: "custom", label: "Custom Range" },
];

export default function FinancePage() {
	const { t } = useTranslation();
	// Modal states
	const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
	const [showCustomDateModal, setShowCustomDateModal] = useState(false);
	const [showTransactionModal, setShowTransactionModal] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState(null);

	// Custom hooks
	const {
		selectedPeriod,
		setSelectedPeriod,
		customDateRange,
		setCustomDateRange,
		periodFilteredTransactions,
		chartData,
	} = useFinanceData();

	const {
		selectedFilter,
		selectedStatus,
		searchQuery,
		showFilters,
		setShowFilters,
		currentPage,
		setCurrentPage,
		totalPages,
		filteredTransactions,
		paginatedTransactions,
		handleFilterChange,
		clearAllFilters,
	} = useTransactionFilters(periodFilteredTransactions);

	// Computed values
	const periodStats = useMemo(
		() => calculatePeriodStats(periodFilteredTransactions),
		[periodFilteredTransactions],
	);

	const hasActiveFilters =
		searchQuery || selectedFilter !== "all" || selectedStatus !== "all";

	// Event handlers
	const handlePeriodChange = (period) => {
		setSelectedPeriod(period);
		setCurrentPage(1);
	};

	const handleCustomDateRange = () => {
		if (customDateRange.startDate && customDateRange.endDate) {
			setSelectedPeriod("custom");
			setShowCustomDateModal(false);
			setCurrentPage(1);
		}
	};

	const handleAddExpense = (expenseData) => {
		// Here you would dispatch to Redux to add the expense
		setShowAddExpenseModal(false);
	};

	const handleTransactionClick = (transaction) => {
		setSelectedTransaction(transaction);
		setShowTransactionModal(true);
	};

	const handleExportExcel = () => {
		exportToExcel(filteredTransactions, selectedPeriod);
	};

	return (
		<div className="min-h-screen" style={{ background: "#FFF8F3" }}>
			<div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
				{/* Page Header */}
				<div className="mb-4 sm:mb-6 lg:mb-8">
					<h1 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">
						{t("companyAdmin.finance.title")}
					</h1>
					<p className="text-sm sm:text-base text-amber-700/70">
						{t("companyAdmin.finance.subtitle")}
					</p>
				</div>

				{/* Time Range Selector */}
				<TimeRangeSelector
					selectedPeriod={selectedPeriod}
					onPeriodChange={handlePeriodChange}
					customDateRange={customDateRange}
					onShowCustomModal={() => setShowCustomDateModal(true)}
				/>

				{/* Stats Grid */}
				<FinanceStatsGrid stats={periodStats} />

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
					<FinanceChart
						chartData={chartData}
						selectedPeriod={selectedPeriod}
						customDateRange={customDateRange}
						periods={PERIODS}
					/>
					<PeriodSummary stats={periodStats} />
				</div>

				{/* Transactions Section */}
				<div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/60 shadow-lg">
					<div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-orange-100/50">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
							<h3 className="text-base sm:text-lg font-semibold text-amber-900">
								{t("companyAdmin.finance.transactions")} ({filteredTransactions.length})
							</h3>
							<div className="flex items-center flex-wrap gap-2 sm:gap-3">
								<button
									onClick={() => setShowAddExpenseModal(true)}
									className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm cursor-pointer"
								>
									<svg
										className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 6v6m0 0v6m0-6h6m-6 0H6"
										/>
									</svg>
									<span className="whitespace-nowrap">{t("companyAdmin.finance.addExpense")}</span>
								</button>
								<button
									onClick={handleExportExcel}
									className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors shadow-sm cursor-pointer"
								>
									<svg
										className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									<span className="whitespace-nowrap">{t("companyAdmin.finance.exportExcel")}</span>
								</button>
								<button
									onClick={() => setShowFilters(!showFilters)}
									className={`inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
										showFilters
											? "border-orange-300 bg-orange-100 text-orange-700"
											: "border-orange-200 bg-white/50 text-amber-700 hover:bg-orange-50"
									}`}
								>
									<svg
										className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
										/>
									</svg>
									<span className="whitespace-nowrap">{showFilters
										? t("companyAdmin.finance.hideFilters")
										: t("companyAdmin.finance.showFilters")}</span>
								</button>
							</div>
						</div>

						{/* Filters */}
						{showFilters && (
							<TransactionFilters
								searchQuery={searchQuery}
								selectedFilter={selectedFilter}
								selectedStatus={selectedStatus}
								onFilterChange={handleFilterChange}
								onClearFilters={clearAllFilters}
								hasActiveFilters={hasActiveFilters}
							/>
						)}
					</div>

					{/* Transactions List */}
					<div className="p-4 sm:p-6">
						<TransactionList
							transactions={paginatedTransactions}
							onTransactionClick={handleTransactionClick}
						/>
					</div>

					{/* Pagination */}
					{filteredTransactions.length > 0 && (
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							totalItems={filteredTransactions.length}
							itemsPerPage={10}
							onPageChange={setCurrentPage}
						/>
					)}
				</div>
			</div>

			{/* Modals */}
			<AddExpenseModal
				isOpen={showAddExpenseModal}
				onClose={() => setShowAddExpenseModal(false)}
				onSubmit={handleAddExpense}
			/>

			<CustomDateModal
				isOpen={showCustomDateModal}
				onClose={() => setShowCustomDateModal(false)}
				dateRange={customDateRange}
				onDateRangeChange={setCustomDateRange}
				onApply={handleCustomDateRange}
			/>

			<TransactionDetailsModal
				isOpen={showTransactionModal}
				onClose={() => setShowTransactionModal(false)}
				transaction={selectedTransaction}
			/>
		</div>
	);
}
