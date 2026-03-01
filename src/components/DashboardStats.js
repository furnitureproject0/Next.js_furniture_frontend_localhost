import { useAppSelector } from "@/store/hooks";
import { selectDashboardStats } from "@/store/selectors";
import { getIconByType } from "@/utils/iconUtils";

export default function DashboardStats() {
	const dashboardStats = useAppSelector(selectDashboardStats);
	const stats = dashboardStats || [];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
			{stats.map((stat, index) => (
				<div
					key={index}
					className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-6 sm:p-7 border border-primary-200/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
				>
					<h3 className="text-sm sm:text-base font-semibold text-primary-600/80 mb-3">
						{stat.title}
					</h3>
					<p className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
						{stat.value}
					</p>
					<div className="mt-3 sm:mt-4">
						<div
							className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
								stat.changeType === "positive"
									? "bg-green-100/80 text-green-700"
									: stat.changeType === "neutral"
									? "bg-primary-100/60 text-slate-600"
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
