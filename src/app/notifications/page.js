"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectAllNotifications, selectUser } from "@/store/selectors";
import {
	markAsRead,
	markAllAsRead,
	hideNotification,
	hideAllNotifications,
} from "@/store/slices/notificationsSlice";
import { notificationsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationsPage() {
	const { isAuthenticated } = useAuth();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { t } = useTranslation();
	const currentUser = useAppSelector(selectUser);
	const allNotifications = useAppSelector(selectAllNotifications);
	const [isLoading, setIsLoading] = useState(false);
	const currentLanguage = useAppSelector((state) => state.language?.currentLanguage) || "en";
	const isRTL = currentLanguage === "ar";

	// Filter notifications
	const displayNotifications = allNotifications.filter((notification) => {
		if (notification.show === false) return false;
		if (notification.user_id || notification.userId) {
			const notificationUserId = notification.user_id || notification.userId;
			return currentUser?.id && notificationUserId === currentUser.id;
		}
		return false;
	});

	const unreadCount = displayNotifications.filter((n) => !n.is_read && !n.read).length;

	// Format time
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

	// Get notification icon
	const getNotificationIcon = (type) => {
		const iconClass = "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0";
		switch (type) {
			case "urgent":
				return (
					<div className={`${iconClass} bg-red-500`}>
						<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
					</div>
				);
			case "warning":
				return (
					<div className={`${iconClass} bg-yellow-500`}>
						<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				);
			case "success":
				return (
					<div className={`${iconClass} bg-green-500`}>
						<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
				);
			case "offer":
				return (
					<div className={`${iconClass} bg-blue-500`}>
						<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
				);
			case "order":
				return (
					<div className={`${iconClass} bg-purple-500`}>
						<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
						</svg>
					</div>
				);
			default:
				return (
					<div className={`${iconClass} bg-gray-500`}>
						<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				);
		}
	};

	const handleMarkAsRead = async (notificationId) => {
		try {
			dispatch(markAsRead(notificationId));
			await notificationsApi.markNotificationAsRead(notificationId);
		} catch (error) {
			console.error('Failed to mark notification as read:', error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			setIsLoading(true);
			dispatch(markAllAsRead());
			await notificationsApi.markAllNotificationsAsRead();
		} catch (error) {
			console.error('Failed to mark all notifications as read:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleHideNotification = async (notificationId) => {
		try {
			dispatch(hideNotification(notificationId));
			await notificationsApi.hideNotification(notificationId);
		} catch (error) {
			console.error('Failed to hide notification:', error);
		}
	};

	const handleHideAll = async () => {
		try {
			setIsLoading(true);
			dispatch(hideAllNotifications());
			await notificationsApi.hideAllNotifications();
		} catch (error) {
			console.error('Failed to hide all notifications:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleOpenOrder = (notification) => {
		// Mark as read when clicked
		if (!notification.is_read && !notification.read) {
			handleMarkAsRead(notification.id);
		}
		
		// Get order_id from payload
		const orderId = notification.payload?.order_id || notification.payload?.orderId;
		if (orderId) {
			// Navigate to dashboard with query parameter to open order modal
			router.push(`/client/dashboard?openOrder=${orderId}`);
		} else if (notification.payload?.link) {
			// Fallback to link if order_id not available
			const link = notification.payload.link.startsWith('/') 
				? notification.payload.link 
				: `/${notification.payload.link}`;
			router.push(link);
		}
	};

	if (!isAuthenticated) {
		router.push('/login');
		return null;
	}

	return (
		<div className={`min-h-screen bg-gradient-to-br from-orange-50/30 via-amber-50/20 to-orange-50/30 p-4 sm:p-6 lg:p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-200/60 p-6 mb-6">
					<div className={`flex items-center justify-between flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
						<div>
							<h1 className={`text-2xl sm:text-3xl font-bold text-amber-900 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
								{t("notifications.title")}
							</h1>
							<p className={`text-sm text-amber-700/70 ${isRTL ? 'text-right' : 'text-left'}`}>
								{unreadCount > 0
									? unreadCount === 1
										? t("notifications.unreadMessages", { count: unreadCount })
										: t("notifications.unreadMessagesPlural", { count: unreadCount })
									: t("notifications.allCaughtUp")}
							</p>
						</div>
						<div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
							{unreadCount > 0 && (
								<button
									onClick={handleMarkAllAsRead}
									disabled={isLoading}
									className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
								>
									{t("notifications.markAllRead")}
								</button>
							)}
							{displayNotifications.length > 0 && (
								<button
									onClick={handleHideAll}
									disabled={isLoading}
									className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
								>
									{t("notifications.hideAll")}
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Notifications List */}
				{displayNotifications.length === 0 ? (
					<div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-200/60 p-12 text-center">
						<div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-amber-900 mb-2">
							{t("notifications.allCaughtUpTitle")}
						</h3>
						<p className="text-amber-700/70">
							{t("notifications.allCaughtUpMessage")}
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{displayNotifications.map((notification, index) => {
							const isUnread = !notification.is_read && !notification.read;
							const hasOrderId = notification.payload?.order_id || notification.payload?.orderId;
							return (
								<div
									key={notification.id}
									className={`bg-white/80 backdrop-blur-sm rounded-xl border transition-all duration-300 hover:shadow-lg group cursor-pointer ${
										isUnread
											? "bg-orange-50/80 border-orange-300/60 shadow-md"
											: "border-orange-100/40"
									}`}
									style={{
										animationDelay: `${index * 50}ms`,
									}}
									onClick={() => hasOrderId && handleOpenOrder(notification)}
								>
									<div className="p-4 sm:p-6">
										<div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
											{getNotificationIcon(notification.type || "info")}
											<div className="flex-1 min-w-0">
												<div className={`flex items-start justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
													<div className="flex-1">
														<h3 className={`text-base sm:text-lg font-semibold text-amber-900 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
															{notification.title || t("notifications.title")}
														</h3>
														<p className={`text-sm text-amber-800/80 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
															{notification.message || ""}
														</p>
													</div>
													<div className={`flex items-center gap-2 flex-shrink-0 ${isRTL ? 'ml-0 mr-2' : 'ml-2'}`}>
														{isUnread && (
															<div className="relative">
																<div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
																<div className="absolute inset-0 w-3 h-3 bg-orange-400 rounded-full animate-ping opacity-75"></div>
															</div>
														)}
														<button
															onClick={(e) => {
																e.stopPropagation();
																handleHideNotification(notification.id);
															}}
															className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-orange-100 rounded-lg"
															title={t("notifications.hide")}
														>
															<svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
															</svg>
														</button>
													</div>
												</div>
												<div className={`flex items-center justify-between mt-3 pt-3 border-t border-orange-100/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
													<div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
														<span className="text-xs text-amber-600/60">
															{formatTime(notification.createdAt || notification.timestamp)}
														</span>
														{notification.type && (
															<span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
																{notification.type}
															</span>
														)}
													</div>
													<div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
														{hasOrderId && (
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	handleOpenOrder(notification);
																}}
																className="text-xs px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
															>
																{t("notifications.viewOrder") || "View Order"}
															</button>
														)}
														{notification.payload?.link && !hasOrderId && (
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	const link = notification.payload.link.startsWith('/') 
																		? notification.payload.link 
																		: `/${notification.payload.link}`;
																	router.push(link);
																}}
																className="text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
															>
																{t("notifications.goToLink")}
															</button>
														)}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

