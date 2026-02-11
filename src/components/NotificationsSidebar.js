"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
	selectAllNotifications,
	selectUser,
} from "@/store/selectors";
import {
	markAsRead,
	markAllAsRead,
	hideNotification,
	hideAllNotifications,
} from "@/store/slices/notificationsSlice";
import { notificationsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { getDashboardPath } from "@/lib/navigation";

export default function NotificationsSidebar() {
	const { isAuthenticated } = useAuth();
	const pathname = usePathname();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { t } = useTranslation();
	const currentLanguage = useAppSelector((state) => state.language?.currentLanguage) || "en";
	const isRTL = currentLanguage === "ar";

	const [showScrollIndicator, setShowScrollIndicator] = useState(false);
	const [showScrollTop, setShowScrollTop] = useState(false);
	const scrollContainerRef = useRef(null);

	// Get notifications from Redux store
	const allNotifications = useAppSelector(selectAllNotifications);
	const currentUser = useAppSelector(selectUser);

	// Filter notifications based on user_id and show field
	// New API structure: notifications are filtered by user_id on the backend
	const displayNotifications = allNotifications.filter((notification) => {
		// Only show notifications that are visible (show !== false, default to true)
		if (notification.show === false) {
			return false;
		}
		
		// Filter by user_id - notifications from API are already filtered by user_id
		// But we double-check here for safety
		if (notification.user_id || notification.userId) {
			const notificationUserId = notification.user_id || notification.userId;
			const matches = currentUser?.id && notificationUserId === currentUser.id;
			return matches;
		}
		
		// If no user_id, don't show (safer default)
		return false;
	});


	const unreadCount = displayNotifications.filter((n) => !n.is_read && !n.read).length;

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const checkScrollable = () => {
			const hasScroll = container.scrollHeight > container.clientHeight;
			setShowScrollIndicator(hasScroll);
		};

		const handleScroll = () => {
			setShowScrollTop(container.scrollTop > 100);
		};

		checkScrollable();
		container.addEventListener("scroll", handleScroll);
		window.addEventListener("resize", checkScrollable);

		return () => {
			container.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", checkScrollable);
		};
	}, []);

	// Don't show notifications sidebar on login page or if not authenticated
	if (!isAuthenticated || pathname === "/login") {
		return null;
	}

	const scrollToTop = () => {
		scrollContainerRef.current?.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	const handleMarkAsRead = async (notificationId) => {
		try {
			// Optimistically update UI
			dispatch(markAsRead(notificationId));
			
			// Call API to mark as read
			await notificationsApi.markNotificationAsRead(notificationId);
		} catch (error) {
			// Revert on error (optional - you might want to keep optimistic update)
			console.error('Failed to mark notification as read:', error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			// Optimistically update UI
			dispatch(markAllAsRead());
			
			// Call API to mark all as read
			await notificationsApi.markAllNotificationsAsRead();
		} catch (error) {
			console.error('Failed to mark all notifications as read:', error);
		}
	};

	const handleHideNotification = async (notificationId) => {
		try {
			// Optimistically update UI
			dispatch(hideNotification(notificationId));
			
			// Call API to hide notification
			await notificationsApi.hideNotification(notificationId);
		} catch (error) {
			console.error('Failed to hide notification:', error);
		}
	};

	const handleHideAll = async () => {
		try {
			// Optimistically update UI
			dispatch(hideAllNotifications());
			
			// Call API to hide all notifications
			await notificationsApi.hideAllNotifications();
		} catch (error) {
			console.error('Failed to hide all notifications:', error);
		}
	};

	const handleNotificationClick = (notification) => {
		// Mark as read when clicked
		if (!notification.is_read && !notification.read) {
			handleMarkAsRead(notification.id);
		}
		
		// Get order_id from payload
		const orderId = notification.payload?.order_id || notification.payload?.orderId;
		if (orderId) {
			// Get user role to determine correct dashboard
			const userRole = currentUser?.role;
			if (userRole) {
				// Navigate to appropriate dashboard with query parameter to open order modal
				const dashboardPath = getDashboardPath(userRole);
				router.push(`${dashboardPath}?openOrder=${orderId}`);
			} else {
				// Fallback to client dashboard if role not available
				router.push(`/client/dashboard?openOrder=${orderId}`);
			}
		} else if (notification.payload?.link) {
			// Fallback to link if order_id not available
			const link = notification.payload.link.startsWith('/') 
				? notification.payload.link 
				: `/${notification.payload.link}`;
			router.push(link);
		} else {
			// Navigate to notifications page if no order_id or link
			router.push('/notifications');
		}
	};

	// Format time for display
	const formatTime = (timestamp) => {
		if (!timestamp) return "";
		const date = new Date(timestamp);
		const now = new Date();
		const diffInSeconds = Math.floor((now - date) / 1000);

		if (diffInSeconds < 60) return t("notifications.justNow");
		if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			return t("notifications.minutesAgo", { count: minutes });
		}
		if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			return t("notifications.hoursAgo", { count: hours });
		}
		const days = Math.floor(diffInSeconds / 86400);
		return t("notifications.daysAgo", { count: days });
	};

	const getNotificationIcon = (type) => {
		switch (type) {
			case "urgent":
				return (
					<div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
						<svg
							className="w-4 h-4 text-white"
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
					<div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
						<svg
							className="w-4 h-4 text-white"
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
					<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
						<svg
							className="w-4 h-4 text-white"
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
					<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
						<svg
							className="w-4 h-4 text-white"
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

	// Empty state component
	const EmptyNotifications = () => (
		<div className="flex-1 flex items-center justify-center p-6">
			<div className="text-center max-w-sm">
				<div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg
						className="w-8 h-8 text-orange-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h4 className="text-amber-900 font-medium mb-2">
					{t("notifications.allCaughtUpTitle")}
				</h4>
				<p className="text-amber-700/70 text-sm leading-relaxed">
					{t("notifications.allCaughtUpMessage")}
				</p>
			</div>
		</div>
	);

	return (
		<div className={`h-screen glass-effect backdrop-blur-xl shadow-2xl flex flex-col ${
			isRTL ? "border-r border-orange-200/40" : "border-l border-orange-200/40"
		}`}>
			{/* Header */}
			<div className="flex-shrink-0 p-6 border-b border-orange-100/50">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="font-semibold text-amber-900 text-lg">
							{t("notifications.title")}
						</h3>
						<p className="text-sm text-amber-700/70 mt-1">
							{unreadCount > 0
								? unreadCount === 1
									? t("notifications.unreadMessages", { count: unreadCount })
									: t("notifications.unreadMessagesPlural", { count: unreadCount })
								: t("notifications.allCaughtUp")}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<button className="text-amber-600/60 hover:text-amber-700 transition-colors p-2 rounded-lg hover:bg-orange-50/50">
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Notifications List - Scrollable Area or Empty State */}
			{displayNotifications.length === 0 ? (
				<EmptyNotifications />
			) : (
				<div className="flex-1 overflow-hidden relative">
					{showScrollIndicator && (
						<div className="absolute top-0 right-2 w-1 h-8 bg-gradient-to-b from-orange-200/60 to-transparent rounded-full z-10 pointer-events-none"></div>
					)}
					<div
						ref={scrollContainerRef}
						className="h-full overflow-y-auto scrollbar-thin smooth-scroll"
					>
						<div className="p-4 space-y-3">
							{displayNotifications.map((notification, index) => {
								const isUnread = !notification.is_read && !notification.read;
								return (
								<div
									key={notification.id}
									onClick={() => handleNotificationClick(notification)}
									className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] transform animate-slide-in-right group ${isUnread
										? "bg-orange-50/60 border-orange-200/60 hover:bg-orange-100/60"
										: "bg-white/60 border-orange-100/40 hover:bg-orange-50/40"
										}`}
									style={{
										animationDelay: `${index * 100}ms`,
										animationDuration: "0.4s",
										animationFillMode: "both",
									}}
								>
									<div className="flex items-start gap-3">
										{getNotificationIcon(notification.type || "info")}
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between mb-1">
												<h4 className="text-sm font-medium text-amber-900 truncate pr-2">
													{notification.title || t("notifications.title")}
												</h4>
												<div className="flex items-center gap-2 flex-shrink-0">
													{isUnread && (
														<div className="relative mt-1">
															<div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
															<div className="absolute inset-0 w-2 h-2 bg-orange-400 rounded-full animate-ping opacity-75"></div>
														</div>
													)}
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleHideNotification(notification.id);
														}}
														className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-orange-100 rounded"
														title={t("common.buttons.close")}
													>
														<svg
															className="w-3 h-3 text-amber-600"
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
											<p className="text-xs text-amber-800/80 mb-2 line-clamp-2 leading-relaxed">
												{notification.message || notification.body || ""}
											</p>
											<div className="flex items-center justify-between">
												<p className="text-xs text-amber-600/60">
													{notification.createdAt
														? formatTime(notification.createdAt)
														: notification.timestamp
														? formatTime(notification.timestamp)
														: ""}
												</p>
												{(notification.payload?.order_id || notification.payload?.orderId || notification.payload?.link) && (
													<button
														onClick={(e) => {
															e.stopPropagation();
															const orderId = notification.payload?.order_id || notification.payload?.orderId;
															if (orderId) {
																// Get user role to determine correct dashboard
																const userRole = currentUser?.role;
																if (userRole) {
																	// Navigate to appropriate dashboard with query parameter to open order modal
																	const dashboardPath = getDashboardPath(userRole);
																	router.push(`${dashboardPath}?openOrder=${orderId}`);
																} else {
																	// Fallback to client dashboard if role not available
																	router.push(`/client/dashboard?openOrder=${orderId}`);
																}
															} else if (notification.payload?.link) {
																const link = notification.payload.link.startsWith('/') 
																	? notification.payload.link 
																	: `/${notification.payload.link}`;
																router.push(link);
															}
														}}
														className="text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors"
													>
														{notification.payload?.order_id || notification.payload?.orderId 
															? t("notifications.viewOrder") 
															: t("notifications.goToLink")} →
													</button>
												)}
											</div>
										</div>
									</div>
								</div>
								);
							})}
							{/* Scroll padding at bottom */}
							<div className="h-4"></div>
						</div>
					</div>
					{showScrollIndicator && (
						<div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-orange-50/95 to-transparent pointer-events-none"></div>
					)}
					{showScrollTop && (
						<button
							onClick={scrollToTop}
							className="absolute bottom-4 right-4 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center transform hover:scale-110"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 10l7-7m0 0l7 7m-7-7v18"
								/>
							</svg>
						</button>
					)}
				</div>
			)}

			{/* Footer - Show when there are notifications */}
			{displayNotifications.length > 0 && (
				<div className="flex-shrink-0 p-4 border-t border-orange-100/50 bg-orange-50/30">
					<div className="flex flex-col gap-2">
						<div className="flex gap-2">
							<button
								onClick={handleMarkAllAsRead}
								disabled={unreadCount === 0}
								className="flex-1 text-center text-sm text-amber-700 hover:text-amber-900 transition-all duration-200 py-2 px-3 rounded-lg hover:bg-white/60 hover:shadow-sm transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
							>
								{t("notifications.markAllRead")}
							</button>
							<button
								onClick={handleHideAll}
								className="flex-1 text-center text-sm text-gray-700 hover:text-gray-900 transition-all duration-200 py-2 px-3 rounded-lg hover:bg-white/60 hover:shadow-sm transform hover:scale-105"
							>
								{t("notifications.hideAll")}
							</button>
						</div>
						<button
							onClick={() => router.push('/notifications')}
							className="w-full text-center text-sm text-orange-600 hover:text-orange-700 transition-all duration-200 py-2 px-3 rounded-lg hover:bg-orange-100/60 hover:shadow-sm transform hover:scale-105"
						>
							{t("notificationsCard.viewAll")}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
