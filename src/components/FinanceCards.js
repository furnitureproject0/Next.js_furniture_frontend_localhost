import { useTranslation } from "@/hooks/useTranslation";
import { useAppSelector } from "@/store/hooks";
import {
	selectDisplayFinanceData,
	selectDisplayTransactions,
} from "@/store/selectors";
import { DEFAULT_LANGUAGE } from "@/lib/i18n/config";

export default function FinanceCards() {
	const { t, currentLanguage } = useTranslation();
	const financeData = useAppSelector(selectDisplayFinanceData);
	const recentTransactions = useAppSelector(selectDisplayTransactions);

	const formatCurrency = (amount, currency = "CHF") => {
		// Use currentLanguage from Redux store instead of localStorage to avoid hydration mismatch
		const savedLanguage = currentLanguage || DEFAULT_LANGUAGE;
		const localeMap = {
			de: "de-CH",
			en: "en-US",
			fr: "fr-CH",
			it: "it-CH",
			ar: "ar-SA",
		};
		const locale = localeMap[savedLanguage] || "en-US";
		
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

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Finance Overview Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
				{/* Revenue Card */}
				<div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-lg p-4 sm:p-5 lg:p-6 hover:shadow-xl transition-all duration-300">
					<div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
						<svg
							className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600"
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
						<div className="text-right">
							{(() => {
								const change = calculatePercentageChange(
									financeData.revenue.current,
									financeData.revenue.previous,
								);
								return (
									<div
										className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${
											change.isPositive
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										<svg
											className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
												change.isPositive
													? "rotate-0"
													: "rotate-180"
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
								);
							})()}
						</div>
					</div>
					<div>
						<h3 className="text-amber-700/70 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
							{t("finance.cards.monthlyRevenue")}
						</h3>
						<p className="text-2xl sm:text-3xl font-bold text-amber-900">
							{formatCurrency(
								financeData.revenue.current,
								financeData.revenue.currency,
							)}
						</p>
					</div>
				</div>

				{/* Expenses Card */}
				<div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-lg p-4 sm:p-5 lg:p-6 hover:shadow-xl transition-all duration-300">
					<div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
						<svg
							className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-red-600"
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
						<div className="text-right">
							{(() => {
								const change = calculatePercentageChange(
									financeData.expenses.current,
									financeData.expenses.previous,
								);
								return (
									<div
										className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${
											!change.isPositive
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										<svg
											className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
												!change.isPositive
													? "rotate-180"
													: "rotate-0"
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
								);
							})()}
						</div>
					</div>
					<div>
						<h3 className="text-amber-700/70 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
							{t("finance.cards.monthlyExpenses")}
						</h3>
						<p className="text-2xl sm:text-3xl font-bold text-amber-900">
							{formatCurrency(
								financeData.expenses.current,
								financeData.expenses.currency,
							)}
						</p>
					</div>
				</div>

				{/* Profit Card */}
				<div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-lg p-4 sm:p-5 lg:p-6 hover:shadow-xl transition-all duration-300">
					<div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
						<svg
							className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600"
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
						<div className="text-right">
							{(() => {
								const change = calculatePercentageChange(
									financeData.profit.current,
									financeData.profit.previous,
								);
								return (
									<div
										className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${
											change.isPositive
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										<svg
											className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
												change.isPositive
													? "rotate-0"
													: "rotate-180"
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
								);
							})()}
						</div>
					</div>
					<div>
						<h3 className="text-amber-700/70 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
							{t("finance.cards.netProfit")}
						</h3>
						<p className="text-2xl sm:text-3xl font-bold text-amber-900">
							{formatCurrency(
								financeData.profit.current,
								financeData.profit.currency,
							)}
						</p>
					</div>
				</div>
			</div>

			{/* Recent Transactions */}
			<div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-lg">
				<div className="p-4 sm:p-5 lg:p-6 border-b border-orange-100/50">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
						<h2 className="text-lg sm:text-xl font-bold text-amber-900">
							{t("finance.cards.recentTransactions")}
						</h2>
						<button className="text-orange-600 hover:text-orange-700 text-xs sm:text-sm font-medium transition-colors">
							{t("finance.cards.viewAll")}
						</button>
					</div>
				</div>
				<div className="p-4 sm:p-5 lg:p-6">
					<div className="space-y-3 sm:space-y-4">
						{recentTransactions.length === 0 ? (
							<div className="text-center py-8">
								<div className="text-amber-700/50 mb-2">
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
								<p className="text-amber-700/70 text-sm">
									{t("finance.cards.noTransactionsAvailable")}
								</p>
								<p className="text-amber-600/50 text-xs mt-1">
									{t("finance.cards.switchToDummyData")}
								</p>
							</div>
						) : (
							recentTransactions.map((transaction) => (
								<div
									key={transaction.id}
									className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-orange-50/60 transition-colors gap-3 sm:gap-0"
								>
									<div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
										<div
											className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 ${
												transaction.type === "income"
													? "text-green-600"
													: "text-red-600"
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
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
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
														d="M18 12H6"
													/>
												</svg>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="text-sm sm:text-base font-medium text-amber-900 truncate">
												{transaction.description}
											</h3>
											<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
												<p className="text-xs text-amber-700/70">
													{transaction.date}
												</p>
												{transaction.orderRef && (
													<>
														<span className="text-orange-300">
															•
														</span>
														<p className="text-xs text-orange-600 font-medium">
															{
																transaction.orderRef
															}
														</p>
													</>
												)}
												{transaction.category && (
													<>
														<span className="text-orange-300">
															•
														</span>
														<p className="text-xs text-amber-600/60">
															{
																transaction.category
															}
														</p>
													</>
												)}
											</div>
										</div>
									</div>
									<div className="text-left sm:text-right w-full sm:w-auto flex items-center justify-between sm:block">
										<p
											className={`text-sm sm:text-base font-bold ${
												transaction.type === "income"
													? "text-green-600"
													: "text-red-600"
											}`}
										>
											{transaction.type === "income"
												? "+"
												: "-"}
											{formatCurrency(transaction.amount)}
										</p>
										<div
											className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
												transaction.status ===
												"completed"
													? "bg-green-100/80 text-green-700"
													: "bg-yellow-100/80 text-yellow-700"
											}`}
										>
											{transaction.status}
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
