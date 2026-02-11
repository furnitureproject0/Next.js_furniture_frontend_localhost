"use client";

import { formatCurrency } from "@/utils/financeUtils";
import { useTranslation } from "@/hooks/useTranslation";

export default function TransactionList({ transactions, onTransactionClick }) {
	const { t } = useTranslation();
	if (transactions.length === 0) {
		return (
			<div className="text-center py-8 sm:py-12 px-4">
				<svg
					className="w-10 h-10 sm:w-12 sm:h-12 text-amber-700/50 mx-auto mb-3 sm:mb-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1}
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<p className="text-amber-700/70 text-xs sm:text-sm">
					{t("finance.transactionList.noTransactionsFound")}
				</p>
				<p className="text-amber-600/50 text-xs mt-1">
					{t("finance.transactionList.tryAdjustingFilters")}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2 sm:space-y-3">
			{transactions.map((transaction) => (
				<div
					key={transaction.id}
					onClick={() => onTransactionClick(transaction)}
					className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-orange-50/60 transition-colors border border-orange-100/30 bg-white/40 cursor-pointer"
				>
					<div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-1 min-w-0">
						<div
							className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
								transaction.type === "income"
									? "bg-green-100 text-green-600"
									: "bg-red-100 text-red-600"
							}`}
						>
							{transaction.type === "income" ? (
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5"
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
							) : (
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs sm:text-sm font-medium text-amber-900 truncate">
								{transaction.description}
							</p>
							<div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mt-1">
								{transaction.orderRef && (
									<span className="text-xs text-orange-700 bg-orange-100/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
										{transaction.orderRef}
									</span>
								)}
								{transaction.category && (
									<span className="text-xs text-blue-700 bg-blue-100/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
										{transaction.category}
									</span>
								)}
								<span
									className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
										transaction.status === "completed"
											? "text-green-700 bg-green-100/80"
											: "text-yellow-700 bg-yellow-100/80"
									}`}
								>
									{transaction.status}
								</span>
							</div>
						</div>
					</div>
					<div className="text-right flex-shrink-0">
						<p
							className={`text-xs sm:text-sm font-semibold ${
								transaction.type === "income"
									? "text-green-600"
									: "text-red-600"
							}`}
						>
							{transaction.type === "income" ? "+" : "-"}
							{formatCurrency(transaction.amount)}
						</p>
						<p className="text-xs text-amber-700/60 mt-0.5 sm:mt-1">
							{transaction.date}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}
