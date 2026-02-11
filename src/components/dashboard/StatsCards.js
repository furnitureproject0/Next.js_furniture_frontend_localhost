"use client";

import { useAppSelector } from "@/store/hooks";
import { selectOrdersStats } from "@/store/selectors";
import { useTranslation } from "@/hooks/useTranslation";

const StatCard = ({ title, value, icon }) => (
	<div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/60 shadow-lg p-4 sm:p-5 lg:p-6">
		<div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
			<div className="flex-shrink-0">
				<div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg flex items-center justify-center text-orange-600">
					{icon}
				</div>
			</div>
			<div className="flex-1 min-w-0">
				<dl>
					<dt className="text-xs sm:text-sm font-medium text-amber-600/70 truncate">
						{title}
					</dt>
					<dd className="text-xl sm:text-2xl font-bold text-amber-900">
						{value}
					</dd>
				</dl>
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
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.2}
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			),
		},
		{
			title: t("stats.pendingOrders"),
			value: stats.pendingOrders,
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
						strokeWidth={1.2}
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
			),
		},
		{
			title: t("stats.activeOrders"),
			value: stats.activeOrders,
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
						strokeWidth={1.2}
						d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"
					/>
				</svg>
			),
		},
		{
			title: t("stats.completed"),
			value: stats.completedOrders,
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
						strokeWidth={1.2}
						d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
					/>
				</svg>
			),
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
			{statsConfig.map((stat, index) => (
				<StatCard key={index} {...stat} />
			))}
		</div>
	);
}
