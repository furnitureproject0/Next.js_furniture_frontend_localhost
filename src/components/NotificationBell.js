"use client";

import { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
	selectNotificationsForRole,
	selectUnreadCountForRole,
	selectNotificationsForCustomer,
	selectNotificationsForCompany,
	selectNotificationsForDriver,
	selectNotificationsForWorker,
	selectUser,
} from "@/store/selectors";
import {
	markAsRead,
	markAllAsReadForRole,
	hideNotification,
} from "@/store/slices/notificationsSlice";
import { notificationsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { getDashboardPath } from "@/lib/navigation";

export default function NotificationBell({ role }) {
	const { t } = useTranslation();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const user = useAppSelector(selectUser);
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	// Get all possible notifications at the top level (hooks must be called unconditionally)
	const roleNotifications = useAppSelector((state) =>
		selectNotificationsForRole(role)(state),
	);
	const customerNotifications = useAppSelector((state) =>
		user?.id ? selectNotificationsForCustomer(user.id)(state) : [],
	);
	const companyNotifications = useAppSelector((state) =>
		user?.company_id ? selectNotificationsForCompany(user.company_id)(state) : [],
	);
	const driverNotifications = useAppSelector((state) =>
		user?.id ? selectNotificationsForDriver(user.id)(state) : [],
	);
	const workerNotifications = useAppSelector((state) =>
		user?.id ? selectNotificationsForWorker(user.id)(state) : [],
	);

	// Select the appropriate notifications based on role
	let notifications = roleNotifications;
	if ((role === "client" || role === "customer") && user?.id) {
		notifications = customerNotifications;
	} else if (role === "company_admin" && user?.company_id) {
		notifications = companyNotifications;
	} else if (role === "driver" && user?.id) {
		notifications = driverNotifications;
	} else if (role === "worker" && user?.id) {
		notifications = workerNotifications;
	}

	// Filter by show field (only show visible notifications) and user_id
	const visibleNotifications = notifications.filter((n) => {
		// Only show notifications that are visible
		if (n.show === false) return false;
		// Filter by user_id - notifications from API are already filtered, but double-check
		if (n.user_id || n.userId) {
			const notificationUserId = n.user_id || n.userId;
			return user?.id && notificationUserId === user.id;
		}
		return false;
	});
	
	const unreadCount = visibleNotifications.filter((n) => !n.is_read && !n.read).length;

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

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
			dispatch(markAllAsReadForRole(role));
			await notificationsApi.markAllNotificationsAsRead();
		} catch (error) {
			console.error('Failed to mark all notifications as read:', error);
		}
	};

	const handleHideNotification = async (notificationId, e) => {
		if (e) e.stopPropagation();
		try {
			dispatch(hideNotification(notificationId));
			await notificationsApi.hideNotification(notificationId);
		} catch (error) {
			console.error('Failed to hide notification:', error);
		}
	};

	const handleOpenOrder = (notification, e) => {
		if (e) e.stopPropagation();
		setIsOpen(false);
		
		// Mark as read when clicked
		if (!notification.is_read && !notification.read) {
			handleMarkAsRead(notification.id);
		}
		
		// Get order_id from payload
		const orderId = notification.payload?.order_id || notification.payload?.orderId;
		if (orderId) {
			// Get user role to determine correct dashboard
			const userRole = user?.role;
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
		}
	};

	const formatTime = (timestamp) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return t("notifications.justNow");
		if (diffMins < 60) return t("notifications.minutesAgo", { count: diffMins });
		if (diffHours < 24) return t("notifications.hoursAgo", { count: diffHours });
		if (diffDays < 7) return t("notifications.daysAgo", { count: diffDays });
		return date.toLocaleDateString();
	};

	const getNotificationIcon = (type) => {
		switch (type) {
			case "new_order":
				return (
					<div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center">
						<svg
							className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-blue-600"
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
					</div>
				);
			case "order_assigned":
				return (
					<div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-indigo-100 rounded-full flex items-center justify-center">
						<svg
							className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-indigo-600"
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
					</div>
				);
			case "offer_sent":
			case "offer_modified":
				return (
					<div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-purple-100 rounded-full flex items-center justify-center">
						<svg
							className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-purple-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
				);
			case "offer_accepted":
				return (
					<div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-green-100 rounded-full flex items-center justify-center">
						<svg
							className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-green-600"
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
					</div>
				);
			case "offer_rejected":
				return (
					<div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-red-100 rounded-full flex items-center justify-center">
						<svg
							className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-red-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
				);
			default:
				return (
					<div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gray-100 rounded-full flex items-center justify-center">
						<svg
							className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-gray-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
							/>
						</svg>
					</div>
				);
		}
	};

	return (
		<div className="relative" ref={dropdownRef}>
			{/* Bell Icon Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-1.5 sm:p-2 text-amber-700 hover:text-amber-900 hover:bg-orange-50 rounded-lg transition-colors"
			>
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
						d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
					/>
				</svg>
				{unreadCount > 0 && (
					<span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			{/* Dropdown */}
			{isOpen && (
				<div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 lg:w-96 bg-white rounded-lg sm:rounded-xl shadow-2xl border border-orange-200/60 z-50 max-h-[32rem] flex flex-col">
					{/* Header */}
					<div className="flex items-center justify-between p-3 sm:p-4 border-b border-orange-100">
						<h3 className="text-base sm:text-lg font-bold text-amber-900">
							{t("notifications.bell.title")}
						</h3>
						{unreadCount > 0 && (
							<button
								onClick={handleMarkAllAsRead}
								className="text-[10px] sm:text-xs text-orange-600 hover:text-orange-700 font-medium"
							>
								{t("notifications.bell.markAllAsRead")}
							</button>
						)}
					</div>

					{/* Notifications List */}
					<div className="flex-1 overflow-y-auto">
						{visibleNotifications.length === 0 ? (
							<div className="p-6 sm:p-8 text-center">
								<div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
									<svg
										className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
										/>
									</svg>
								</div>
								<p className="text-amber-700/70 text-xs sm:text-sm">
									{t("notifications.bell.noNotificationsYet")}
								</p>
							</div>
						) : (
							<div className="divide-y divide-orange-100">
								{visibleNotifications.map((notification) => {
									const isUnread = !notification.read && !notification.is_read;
									return (
									<div
										key={notification.id}
										className={`p-3 sm:p-4 hover:bg-orange-50/50 transition-colors group ${
											isUnread ? "bg-blue-50/30" : ""
										}`}
									>
										<div className="flex items-start gap-2 sm:gap-3">
											<div className="flex-shrink-0">
												{getNotificationIcon(
													notification.type,
												)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between mb-1">
													<p
														onClick={() => handleOpenOrder(notification)}
														className={`text-xs sm:text-sm text-amber-900 cursor-pointer hover:text-orange-600 ${
															isUnread ? "font-semibold" : ""
														}`}
													>
														{notification.title || notification.message}
													</p>
													<button
														onClick={(e) => handleHideNotification(notification.id, e)}
														className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-orange-100 rounded flex-shrink-0"
														title={t("notifications.hide")}
													>
														<svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
														</svg>
													</button>
												</div>
												{notification.title && (
													<p className="text-xs text-amber-800/70 mb-1 line-clamp-2">
														{notification.message}
													</p>
												)}
												<div className="flex items-center justify-between mt-1">
													<p className="text-[10px] sm:text-xs text-amber-700/70">
														{formatTime(notification.createdAt)}
													</p>
													<div className="flex items-center gap-1">
														{(notification.payload?.order_id || notification.payload?.orderId) && (
															<button
																onClick={(e) => handleOpenOrder(notification, e)}
																className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded text-xs"
															>
																{t("notifications.viewOrder")}
															</button>
														)}
														{notification.payload?.link && !(notification.payload?.order_id || notification.payload?.orderId) && (
															<button
																onClick={(e) => handleNavigateToLink(notification.payload.link, e)}
																className="text-[10px] px-2 py-0.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
															>
																{t("notifications.goToLink")}
															</button>
														)}
													</div>
												</div>
											</div>
											{isUnread && (
												<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
											)}
										</div>
									</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

