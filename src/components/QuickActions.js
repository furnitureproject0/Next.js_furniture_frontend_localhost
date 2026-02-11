"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function QuickActions() {
	const { t } = useTranslation();
	const actions = [
		{
			title: t("quickActions.priceOrders"),
			description: t("quickActions.priceOrdersDesc"),
			icon: (
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
						d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
					/>
				</svg>
			),
			primary: true,
		},
		{
			title: t("quickActions.assignTeams"),
			description: t("quickActions.assignTeamsDesc"),
			icon: (
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
						d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
			),
			primary: false,
		},
		{
			title: t("quickActions.manageStaff"),
			description: t("quickActions.manageStaffDesc"),
			icon: (
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
						d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
					/>
				</svg>
			),
			primary: false,
		},
	];

	const recentTasks = [
		{
			task: "Price 8 pending furniture orders",
			priority: "high",
			dueTime: "2:00 PM",
		},
		{
			task: "Assign team for Zürich mission",
			priority: "high",
			dueTime: "3:30 PM",
		},
		{
			task: "Review driver reports",
			priority: "medium",
			dueTime: "Tomorrow",
		},
		{
			task: "Update staff schedules",
			priority: "medium",
			dueTime: "Friday",
		},
	];

	const getPriorityColor = (priority) => {
		switch (priority) {
			case "high":
				return "bg-red-100 text-red-700";
			case "medium":
				return "bg-yellow-100 text-yellow-700";
			case "low":
				return "bg-green-100 text-green-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Quick Actions */}
			<div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-lg">
				<div className="p-4 sm:p-5 lg:p-6 border-b border-orange-100/50">
					<h2 className="text-base sm:text-lg font-semibold text-amber-900">
						{t("quickActions.title")}
					</h2>
				</div>
				<div className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
					{actions.map((action, index) => (
						<button
							key={index}
							className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 text-left group ${
								action.primary
									? "bg-orange-50/60 border-orange-200/60 hover:bg-orange-100/60"
									: "bg-orange-50/40 border-orange-200/40 hover:bg-orange-100/40"
							}`}
						>
							<div className="flex items-center gap-3 sm:gap-4">
								<div
									className={`p-2 sm:p-3 rounded-lg shadow-sm transition-shadow flex-shrink-0 ${
										action.primary
											? "bg-orange-500 text-white"
											: "bg-amber-600 text-white"
									}`}
								>
									{action.icon}
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="text-sm sm:text-base font-medium text-amber-900">
										{action.title}
									</h3>
									<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5">
										{action.description}
									</p>
								</div>
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Tasks */}
			<div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-lg">
				<div className="p-4 sm:p-5 lg:p-6 border-b border-orange-100/50">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
						<h2 className="text-base sm:text-lg font-semibold text-amber-900">
							{t("quickActions.todaysTasks")}
						</h2>
						<span className="text-xs sm:text-sm text-amber-700/70">
							{recentTasks.length} {t("quickActions.tasks")}
						</span>
					</div>
				</div>
				<div className="p-4 sm:p-5 lg:p-6">
					<div className="space-y-2 sm:space-y-3">
						{recentTasks.map((task, index) => (
							<div
								key={index}
								className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-orange-50/60 transition-colors"
							>
								<input
									type="checkbox"
									className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 rounded border-orange-300 focus:ring-orange-500 flex-shrink-0"
								/>
								<div className="flex-1 min-w-0">
									<p className="text-xs sm:text-sm text-amber-900">
										{task.task}
									</p>
									<p className="text-[10px] sm:text-xs text-amber-700/70">
										{task.dueTime}
									</p>
								</div>
								<span
									className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${getPriorityColor(
										task.priority,
									)}`}
								>
									{task.priority}
								</span>
							</div>
						))}
					</div>
					<button className="w-full mt-3 sm:mt-4 p-2 text-orange-600 hover:text-orange-700 text-xs sm:text-sm font-medium transition-colors">
						+ {t("quickActions.addNewTask")}
					</button>
				</div>
			</div>
		</div>
	);
}
