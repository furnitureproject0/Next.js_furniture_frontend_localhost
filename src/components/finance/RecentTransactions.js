"use client";

import { useAppSelector } from "@/store/hooks";
import { selectDisplayTransactions } from "@/store/selectors";
import { useTranslation } from "@/hooks/useTranslation";
import { DEFAULT_LANGUAGE } from "@/lib/i18n/config";

// formatCurrency should accept language as parameter to avoid hydration issues
const formatCurrency = (amount, currency = "CHF", language = DEFAULT_LANGUAGE) => {
	const localeMap = {
		de: "de-CH",
		en: "en-US",
		fr: "fr-CH",
		it: "it-CH",
		ar: "ar-SA",
	};
	const locale = localeMap[language] || "en-US";
	
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};

const TransactionIcon = ({ type }) => (
	<div
		className={`w-10 h-10 flex items-center justify-center ${
			type === "income" ? "text-green-600" : "text-red-600"
		}`}
	>
		{type === "income" ? (
			<svg
				className="w-5 h-5"
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
		) : (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M18 12H6"
				/>
			</svg>
		)}
	</div>
);

const TransactionItem = ({ transaction, currentLanguage = DEFAULT_LANGUAGE }) => (
	<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-primary-50/60 transition-colors">
		<div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
			<TransactionIcon type={transaction.type} />
			<div className="flex-1 min-w-0">
				<h3 className="text-sm sm:text-base font-medium text-slate-800 truncate">
					{transaction.description}
				</h3>
				<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
					<p className="text-xs text-slate-600/70">
						{transaction.date}
					</p>
					{transaction.orderRef && (
						<>
							<span className="text-primary-300">•</span>
							<p className="text-xs text-primary-600 font-medium truncate">
								{transaction.orderRef}
							</p>
						</>
					)}
					{transaction.category && (
						<>
							<span className="text-primary-300">•</span>
							<p className="text-xs text-primary-600/60 truncate">
								{transaction.category}
							</p>
						</>
					)}
				</div>
			</div>
		</div>
		<div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1 w-full sm:w-auto">
			<p
				className={`text-sm sm:text-base font-bold ${
					transaction.type === "income"
						? "text-green-600"
						: "text-red-600"
				}`}
			>
				{transaction.type === "income" ? "+" : "-"}
				{formatCurrency(transaction.amount, "CHF", currentLanguage)}
			</p>
			<div
				className={`inline-flex px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
					transaction.status === "completed"
						? "bg-green-100/80 text-green-700"
						: "bg-yellow-100/80 text-yellow-700"
				}`}
			>
				{transaction.status}
			</div>
		</div>
	</div>
);

const EmptyTransactions = ({ t }) => (
	<div className="text-center py-8">
		<div className="text-slate-600/50 mb-2">
			<svg
				className="w-12 h-12 mx-auto"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
		</div>
		<p className="text-slate-600/70 text-sm">{t("finance.recentTransactions.noTransactionsAvailable")}</p>
		<p className="text-primary-600/50 text-xs mt-1">
			{t("finance.recentTransactions.switchToDummyData")}
		</p>
	</div>
);

export default function RecentTransactions() {
	const { t, currentLanguage } = useTranslation();
	const recentTransactions = useAppSelector(selectDisplayTransactions);

	return (
		<div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-primary-200/60 shadow-lg">
			<div className="p-4 sm:p-5 lg:p-6 border-b border-primary-100/50">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
					<h2 className="text-lg sm:text-xl font-bold text-slate-800">
						{t("finance.recentTransactions.title")}
					</h2>
					<button className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
						{t("finance.recentTransactions.viewAll")}
					</button>
				</div>
			</div>
			<div className="p-4 sm:p-5 lg:p-6">
				<div className="space-y-3 sm:space-y-4">
					{recentTransactions.length === 0 ? (
						<EmptyTransactions t={t} />
					) : (
						recentTransactions.map((transaction) => (
							<TransactionItem
								key={transaction.id}
								transaction={transaction}
								currentLanguage={currentLanguage}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
}
