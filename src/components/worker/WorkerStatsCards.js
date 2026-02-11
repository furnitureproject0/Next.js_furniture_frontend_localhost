"use client";

import { useTranslation } from "@/hooks/useTranslation";

const StatCard = ({ title, value, icon, bgColor }) => (
	<div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/60 shadow-lg p-4 sm:p-5 lg:p-6">
		<div className="flex items-center justify-between gap-3">
			<div className="flex-1 min-w-0">
				<p className="text-xs sm:text-sm font-medium text-orange-600/70 mb-1">
					{title}
				</p>
				<p className="text-2xl sm:text-3xl font-bold text-amber-900">{value}</p>
			</div>
			<div
				className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 ${bgColor} rounded-full flex items-center justify-center shadow-md flex-shrink-0`}
			>
				{icon}
			</div>
		</div>
	</div>
);

export default function WorkerStatsCards({ assignments = [] }) {
	const { t } = useTranslation();
	const stats = {
		totalAssignments: assignments.length,
		pending: assignments.filter((a) => a.status === "pending").length,
		accepted: assignments.filter((a) => a.status === "accepted").length,
		completed: assignments.filter((a) => a.status === "completed").length,
	};

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
			<StatCard
				title={t("worker.stats.totalAssignments") || "Total Assignments"}
				value={stats.totalAssignments}
				bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
				icon={
					<svg
						className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				}
			/>
			<StatCard
				title={t("worker.stats.pending") || "Pending"}
				value={stats.pending}
				bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
				icon={
					<svg
						className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-yellow-600"
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
				}
			/>
			<StatCard
				title={t("worker.stats.accepted") || "Accepted"}
				value={stats.accepted}
				bgColor="bg-gradient-to-br from-green-50 to-green-100"
				icon={
					<svg
						className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600"
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
				}
			/>
			<StatCard
				title={t("worker.stats.completed") || "Completed"}
				value={stats.completed}
				bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
				icon={
					<svg
						className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				}
			/>
		</div>
	);
}

