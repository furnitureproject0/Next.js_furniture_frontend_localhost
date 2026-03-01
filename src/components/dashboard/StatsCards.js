"use client";

import { useAppSelector } from "@/store/hooks";
import { selectOrdersStats } from "@/store/selectors";
import { useTranslation } from "@/hooks/useTranslation";

const StatCard = ({ title, value, icon }) => (
	<div className="bg-white/80 backdrop-blur-sm rounded-xl border border-primary-200/60 shadow-lg p-4 sm:p-5 lg:p-6 hover:shadow-xl transition-all duration-300">
		<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
			<div className="flex-1 mb-3 sm:mb-0">
				<h3 className="text-xs sm:text-sm font-semibold text-primary-600/70 mb-2">
					{title}
				</h3>
				<p className="text-2xl sm:text-3xl font-bold text-slate-800">
					{value}
				</p>
			</div>
			<div className="flex-shrink-0">
				<div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
					{icon}
				</div>
			</div>
		</div>
	</div>
);

export default function StatsCards() {
	const { t } = useTranslation();
	const stats = useAppSelector(selectOrdersStats);

	const statsConfig = [
		{
			title: t("stats.totalOrders"),
			value: stats.totalOrders,
			icon: (
				<svg
					className="w-7 h-7"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M7 2a1 1 0 000 2h1v1H7a3 3 0 00-3 3v1H2a1 1 0 000 2h2v6H2a1 1 0 000 2h2v1a3 3 0 003 3h1v1a1 1 0 002 0v-1h1v1a1 1 0 002 0v-1h1v1a1 1 0 002 0v-1h1a3 3 0 003-3v-1h2a1 1 0 000-2h-2v-6h2a1 1 0 000-2h-2V8a3 3 0 00-3-3h-1V4h1a1 1 0 000-2h-1V2a1 1 0 000 2H7V2zM4 8a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V8z"/>
				</svg>
			),
		},
		{
			title: t("stats.pendingOrders"),
			value: stats.pendingOrders,
			icon: (
				<svg
					className="w-7 h-7"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
				</svg>
			),
		},
		{
			title: t("stats.activeOrders"),
			value: stats.activeOrders,
			icon: (
				<svg
					className="w-7 h-7"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M19 12a7 7 0 11-14 0 7 7 0 0114 0zm2 0a9 9 0 11-18 0 9 9 0 0118 0zm-9-1h2v3h-2v-3zm0 5h2v2h-2v-2zm0-8h2v2h-2V8z"/>
				</svg>
			),
		},
		{
			title: t("stats.completed"),
			value: stats.completedOrders,
			icon: (
				<svg
					className="w-7 h-7"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
				</svg>
			),
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
			<StatCard title={t("stats.totalOrders")} value={stats.totalOrders} />
			<StatCard title={t("stats.pendingOrders")} value={stats.pendingOrders} />
			<StatCard title={t("stats.activeOrders")} value={stats.activeOrders} />
			<StatCard title={t("stats.completed")} value={stats.completedOrders} />
		</div>
	);
}
