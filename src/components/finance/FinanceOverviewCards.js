"use client";

import { useAppSelector } from "@/store/hooks";
import { selectDisplayFinanceData } from "@/store/selectors";
import { useTranslation } from "@/hooks/useTranslation";
import { DEFAULT_LANGUAGE } from "@/lib/i18n/config";

// formatCurrency should be inside component to access currentLanguage from hook
// But we'll make it accept language as parameter to avoid hydration issues
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

const calculatePercentageChange = (current, previous) => {
	const change = ((current - previous) / previous) * 100;
	return {
		value: Math.abs(change).toFixed(1),
		isPositive: change >= 0,
	};
};

const FinanceCard = ({ title, icon, data, isExpense = false, currentLanguage = DEFAULT_LANGUAGE }) => {
	const change = calculatePercentageChange(data.current, data.previous);
	const changeIsGood = isExpense ? !change.isPositive : change.isPositive;

	return (
		<div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-lg p-4 sm:p-5 lg:p-6 hover:shadow-xl transition-all duration-300">
			<div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
				<div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
					{icon}
				</div>
				<div className="text-right">
					<div
						className={`flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-medium ${
							changeIsGood ? "text-green-600" : "text-red-600"
						}`}
					>
						<svg
							className={`w-3 h-3 sm:w-4 sm:h-4 ${
								changeIsGood ? "rotate-0" : "rotate-180"
							}`}
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
						{change.value}%
					</div>
				</div>
			</div>
			<div>
				<h3 className="text-amber-700/70 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
					{title}
				</h3>
				<p className="text-2xl sm:text-3xl font-bold text-amber-900">
					{formatCurrency(data.current, data.currency, currentLanguage)}
				</p>
			</div>
		</div>
	);
};

export default function FinanceOverviewCards() {
	const { t, currentLanguage } = useTranslation();
	const financeData = useAppSelector(selectDisplayFinanceData);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
			{/* Revenue Card */}
			<FinanceCard
				title={t("finance.overviewCards.monthlyRevenue")}
				data={financeData.revenue}
				currentLanguage={currentLanguage}
				icon={
					<svg
						className="w-6 h-6 sm:w-8 sm:h-8 text-green-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
						/>
					</svg>
				}
			/>

			{/* Expenses Card */}
			<FinanceCard
				title={t("finance.overviewCards.monthlyExpenses")}
				data={financeData.expenses}
				isExpense={true}
				currentLanguage={currentLanguage}
				icon={
					<svg
						className="w-6 h-6 sm:w-8 sm:h-8 text-red-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
				}
			/>

			{/* Profit Card */}
			<FinanceCard
				title={t("finance.overviewCards.netProfit")}
				data={financeData.profit}
				currentLanguage={currentLanguage}
				icon={
					<svg
						className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
				}
			/>
		</div>
	);
}
