import { useAppSelector } from "@/store/hooks";
import { selectDisplayFinanceStats } from "@/store/selectors";
import { getIconByType } from "@/utils/iconUtils";

export default function FinanceDashboardStats() {
	const financeStats = useAppSelector(selectDisplayFinanceStats);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
			{financeStats.map((stat, index) => (
				<div
					key={index}
					className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-200/60 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
				>
					<div className="flex items-center space-x-2 sm:space-x-3">
						<div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600 flex-shrink-0">
							{getIconByType(
								stat.iconType || "revenue",
								"w-5 h-5 sm:w-6 sm:h-6",
							)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xl sm:text-2xl font-bold text-amber-900">
								{stat.value}
							</p>
							<h3 className="text-amber-700/70 text-xs font-medium truncate">
								{stat.title}
							</h3>
						</div>
					</div>
					<div className="mt-2 sm:mt-3">
						<div
							className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
								stat.changeType === "positive"
									? "bg-green-100/80 text-green-700"
									: stat.changeType === "neutral"
									? "bg-orange-100/60 text-amber-700"
									: "bg-red-100/80 text-red-700"
							}`}
						>
							{stat.change}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
