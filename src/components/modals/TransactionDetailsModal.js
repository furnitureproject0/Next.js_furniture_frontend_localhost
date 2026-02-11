"use client";

import { formatCurrency } from "@/utils/financeUtils";
import { useTranslation } from "@/hooks/useTranslation";

export default function TransactionDetailsModal({
	isOpen,
	onClose,
	transaction,
}) {
	const { t } = useTranslation();
	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	if (!isOpen || !transaction) return null;

	return (
		<div
			className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4"
			onClick={handleBackdropClick}
		>
			<div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-lg">
				<div className="flex items-center justify-between mb-4 sm:mb-6">
					<h3 className="text-lg sm:text-xl font-semibold text-amber-900">
						{t("modals.transactionDetails.title")}
					</h3>
					<button
						onClick={onClose}
						className="text-amber-700/70 hover:text-amber-900 transition-colors cursor-pointer p-1"
					>
						<svg
							className="w-5 h-5 sm:w-6 sm:h-6"
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
					</button>
				</div>

				<div className="space-y-4 sm:space-y-5 lg:space-y-6">
					{/* Transaction Type Badge */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
						<span className="text-xs sm:text-sm font-medium text-amber-900">
							{t("modals.transactionDetails.type")}
						</span>
						<span
							className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
								transaction.type === "income"
									? "bg-green-100 text-green-700"
									: "bg-red-100 text-red-700"
							}`}
						>
							{transaction.type === "income"
								? t("modals.transactionDetails.income")
								: t("modals.transactionDetails.expense")}
						</span>
					</div>

					{/* Amount */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
						<span className="text-xs sm:text-sm font-medium text-amber-900">
							{t("modals.transactionDetails.amount")}
						</span>
						<span
							className={`text-base sm:text-lg font-bold ${
								transaction.type === "income"
									? "text-green-600"
									: "text-red-600"
							}`}
						>
							{transaction.type === "income" ? "+" : "-"}
							{formatCurrency(transaction.amount)}
						</span>
					</div>

					{/* Description */}
					<div>
						<span className="text-xs sm:text-sm font-medium text-amber-900 block mb-1.5 sm:mb-2">
							{t("modals.transactionDetails.description")}
						</span>
						<p className="text-xs sm:text-sm text-amber-800 bg-orange-50/50 p-2.5 sm:p-3 rounded-lg">
							{transaction.description}
						</p>
					</div>

					{/* Date */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
						<span className="text-xs sm:text-sm font-medium text-amber-900">
							{t("modals.transactionDetails.date")}
						</span>
						<span className="text-xs sm:text-sm text-amber-800">
							{new Date(transaction.date).toLocaleDateString(
								"en-US",
								{
									year: "numeric",
									month: "long",
									day: "numeric",
								},
							)}
						</span>
					</div>

					{/* Status */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
						<span className="text-xs sm:text-sm font-medium text-amber-900">
							{t("modals.transactionDetails.status")}
						</span>
						<span
							className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium ${
								transaction.status === "completed"
									? "text-green-700 bg-green-100/80"
									: "text-yellow-700 bg-yellow-100/80"
							}`}
						>
							{transaction.status}
						</span>
					</div>

					{/* Order Reference */}
					{transaction.orderRef && (
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
							<span className="text-xs sm:text-sm font-medium text-amber-900">
								{t("modals.transactionDetails.orderReference")}
							</span>
							<span className="text-xs sm:text-sm text-orange-700 bg-orange-100/80 px-2 py-1 rounded-full">
								{transaction.orderRef}
							</span>
						</div>
					)}

					{/* Category */}
					{transaction.category && (
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
							<span className="text-xs sm:text-sm font-medium text-amber-900">
								{t("modals.transactionDetails.category")}
							</span>
							<span className="text-xs sm:text-sm text-blue-700 bg-blue-100/80 px-2 py-1 rounded-full">
								{transaction.category}
							</span>
						</div>
					)}

					{/* Transaction ID */}
					<div className="pt-3 sm:pt-4 border-t border-orange-100/50">
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
							<span className="text-xs font-medium text-amber-700/70">
								{t("modals.transactionDetails.transactionId")}
							</span>
							<span className="text-xs text-amber-600/60 font-mono break-all sm:break-normal">
								{transaction.id}
							</span>
						</div>
					</div>
				</div>

				<div className="flex justify-end mt-6 sm:mt-8">
					<button
						onClick={onClose}
						className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white bg-orange-600 rounded-lg sm:rounded-xl hover:bg-orange-700 transition-colors cursor-pointer"
					>
						{t("common.buttons.close")}
					</button>
				</div>
			</div>
		</div>
	);
}
