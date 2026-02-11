"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function CustomerStatsCards({ orders = [] }) {
	const { t } = useTranslation();
	// Calculate stats from actual orders
	const totalOrders = orders.length;
	const pendingOffers = orders.filter(o => o.status === "offer_sent").length;
	const inProgress = orders.filter(o => o.status === "in_progress").length;
	const completed = orders.filter(o => o.status === "completed").length;

	const stats = [
		{
			title: t("stats.totalOrders"),
			value: totalOrders.toString(),
			icon: (
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
					/>
				</svg>
			),
			color: "from-orange-500 to-amber-600",
			bgColor: "bg-orange-50",
		},
		{
			title: t("stats.pendingOffers"),
			value: pendingOffers.toString(),
			icon: (
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
			color: "from-blue-500 to-cyan-600",
			bgColor: "bg-blue-50",
		},
		{
			title: t("stats.inProgress"),
			value: inProgress.toString(),
			icon: (
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
			),
			color: "from-purple-500 to-pink-600",
			bgColor: "bg-purple-50",
		},
		{
			title: t("stats.completed"),
			value: completed.toString(),
			icon: (
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
			color: "from-green-500 to-emerald-600",
			bgColor: "bg-green-50",
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
			{stats.map((stat, index) => (
				<div
					key={index}
					className="bg-white/60 backdrop-blur-sm border border-orange-200/60 rounded-xl p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all duration-200"
				>
					<div className="flex items-center justify-between gap-3">
						<div className="flex-1 min-w-0">
							<p className="text-xs sm:text-sm font-medium text-amber-600/70 uppercase tracking-wide mb-1.5 sm:mb-2">
								{stat.title}
							</p>
							<p className="text-2xl sm:text-3xl font-bold text-amber-900">
								{stat.value}
							</p>
						</div>
						<div
							className={`w-12 h-12 sm:w-14 sm:h-14 ${stat.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}
						>
							<div
								className={`text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`}
							>
								{stat.icon}
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

