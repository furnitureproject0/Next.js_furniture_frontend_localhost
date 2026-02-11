"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function NotificationsCard() {
	const { t } = useTranslation();
	const notifications = [
		{
			id: 1,
			type: "urgent",
			title: "New Order Pending",
			message: "Piano transport request from Zürich needs pricing",
			time: "2 min ago",
			unread: true,
		},
		{
			id: 2,
			type: "info",
			title: "Mission Completed",
			message: "Marco completed delivery #FT-2024-005",
			time: "15 min ago",
			unread: true,
		},
		{
			id: 3,
			type: "warning",
			title: "Driver Unavailable",
			message: "Klaus reported sick for tomorrow's missions",
			time: "1 hour ago",
			unread: false,
		},
		{
			id: 4,
			type: "success",
			title: "Payment Received",
			message: "CHF 1,200 payment confirmed for order #FT-2024-003",
			time: "2 hours ago",
			unread: false,
		},
		{
			id: 5,
			type: "info",
			title: "New Staff Member",
			message: "Stefan Weber joined as worker",
			time: "3 hours ago",
			unread: false,
		},
	];

	const getNotificationIcon = (type) => {
		switch (type) {
			case "urgent":
				return (
					<div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center">
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
					</div>
				);
			case "warning":
				return (
					<div className="w-7 h-7 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center">
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
				);
			case "success":
				return (
					<div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
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
					</div>
				);
			default:
				return (
					<div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-500 rounded-full flex items-center justify-center">
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
				);
		}
	};

	return (
		<div className="fixed right-2 sm:right-4 lg:right-6 top-2 sm:top-4 lg:top-6 bottom-2 sm:bottom-4 lg:bottom-6 w-[calc(100vw-1rem)] sm:w-72 lg:w-80 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-orange-200/60 z-20 flex flex-col">
			{/* Header */}
			<div className="p-3 sm:p-4 border-b border-orange-100/50 flex-shrink-0">
				<div className="flex items-center justify-between">
					<h3 className="text-sm sm:text-base font-semibold text-amber-900">
						{t("notificationsCard.title")}
					</h3>
					<div className="flex items-center gap-1.5 sm:gap-2">
						<span className="bg-orange-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
							{notifications.filter((n) => n.unread).length}
						</span>
						<button className="text-amber-600/60 hover:text-amber-700 transition-colors p-1">
							<svg
								className="w-3.5 h-3.5 sm:w-4 sm:h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Notifications List */}
			<div className="flex-1 overflow-y-auto">
				{notifications.map((notification) => (
					<div
						key={notification.id}
						className={`p-3 sm:p-4 border-b border-orange-50/60 hover:bg-orange-50/60 transition-colors cursor-pointer ${
							notification.unread ? "bg-orange-50/40" : ""
						}`}
					>
						<div className="flex items-start gap-2 sm:gap-3">
							<div className="flex-shrink-0">
								{getNotificationIcon(notification.type)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
									<h4 className="text-xs sm:text-sm font-medium text-amber-900 truncate">
										{notification.title}
									</h4>
									{notification.unread && (
										<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
									)}
								</div>
								<p className="text-[10px] sm:text-xs text-amber-800/80 mb-0.5 sm:mb-1">
									{notification.message}
								</p>
								<p className="text-[10px] sm:text-xs text-amber-600/60">
									{notification.time}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Footer */}
			<div className="p-3 sm:p-4 border-t border-orange-100/50 flex-shrink-0">
				<button className="w-full text-center text-xs sm:text-sm text-orange-600 hover:text-orange-700 transition-colors">
					{t("notificationsCard.viewAll")}
				</button>
			</div>
		</div>
	);
}
