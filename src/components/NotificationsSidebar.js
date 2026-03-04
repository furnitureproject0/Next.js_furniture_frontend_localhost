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

// ─── Notification Theme Map ─────────────────────────────────────────────────
const getNotificationTheme = (notification) => {
	const type = (notification.type || "").toLowerCase();
	const notifType = (notification.notification_type || notification.notificationType || "").toLowerCase();
	const payloadType = (notification.payload?.order_type || notification.payload?.type || "").toLowerCase();
	const status = (notification.payload?.status || notification.payload?.order_status || "").toLowerCase();
	const title = (notification.title || "").toLowerCase();
	
	const combined = `${type} ${notifType} ${payloadType} ${status} ${title}`;

	// Rejected / Error / Cancelled / Removed → RED
	if (
		combined.includes("reject") ||
		combined.includes("cancel") ||
		combined.includes("error") ||
		combined.includes("failed") ||
		combined.includes("urgent") ||
		combined.includes("remov")
	) {
		return {
			gradient: "from-red-500 to-rose-600",
			lightBg: "from-red-50/80 to-rose-50/60",
			border: "border-red-200/60",
			hoverBorder: "hover:border-red-300/80",
			dot: "bg-red-500",
			ping: "bg-red-400",
			text: "text-red-700",
			badge: "bg-red-100 text-red-700",
			actionBtn: "text-red-600 hover:text-red-700",
			icon: "rejected",
			label: "Important",
		};
	}

	// Appointment / Scheduled / Meeting → BLUE
	if (
		combined.includes("appoint") ||
		combined.includes("schedul") ||
		combined.includes("meeting") ||
		combined.includes("calendar")
	) {
		return {
			gradient: "from-blue-500 to-indigo-600",
			lightBg: "from-blue-50/80 to-indigo-50/60",
			border: "border-blue-200/60",
			hoverBorder: "hover:border-blue-300/80",
			dot: "bg-blue-500",
			ping: "bg-blue-400",
			text: "text-blue-700",
			badge: "bg-blue-100 text-blue-700",
			actionBtn: "text-blue-600 hover:text-blue-700",
			icon: "appointment",
			label: "Appointment",
		};
	}

	// Offer / Pricing / Warning → ORANGE
	if (
		combined.includes("offer") ||
		combined.includes("price") ||
		combined.includes("quote") ||
		combined.includes("pricing") ||
		combined.includes("warning")
	) {
		return {
			gradient: "from-orange-500 to-amber-600",
			lightBg: "from-orange-50/80 to-amber-50/60",
			border: "border-orange-200/60",
			hoverBorder: "hover:border-orange-300/80",
			dot: "bg-orange-500",
			ping: "bg-orange-400",
			text: "text-orange-700",
			badge: "bg-orange-100 text-orange-700",
			actionBtn: "text-orange-600 hover:text-orange-700",
			icon: "order",
			label: "Offer",
		};
	}

	// Order / Success / Accepted / Completed → GREEN
	if (
		combined.includes("order") ||
		combined.includes("new_order") ||
		combined.includes("accept") ||
		combined.includes("complet") ||
		combined.includes("success") ||
		combined.includes("finish")
	) {
		return {
			gradient: "from-emerald-500 to-teal-600",
			lightBg: "from-emerald-50/80 to-teal-50/60",
			border: "border-emerald-200/60",
			hoverBorder: "hover:border-emerald-300/80",
			dot: "bg-emerald-500",
			ping: "bg-emerald-400",
			text: "text-emerald-700",
			badge: "bg-emerald-100 text-emerald-700",
			actionBtn: "text-emerald-600 hover:text-emerald-700",
			icon: "order",
			label: combined.includes("order") ? "Order" : "Success",
		};
	}

	// Appointment / Scheduled / Meeting → BLUE
	if (
		combined.includes("appoint") ||
		combined.includes("schedul") ||
		combined.includes("meeting") ||
		combined.includes("calendar")
	) {
		return {
			gradient: "from-blue-500 to-indigo-600",
			lightBg: "from-blue-50/80 to-indigo-50/60",
			border: "border-blue-200/60",
			hoverBorder: "hover:border-blue-300/80",
			dot: "bg-blue-500",
			ping: "bg-blue-400",
			text: "text-blue-700",
			badge: "bg-blue-100 text-blue-700",
			actionBtn: "text-blue-600 hover:text-blue-700",
			icon: "appointment",
			label: "Appointment",
		};
	}

	// Default → Purple
	return {
		gradient: "from-primary-500 to-indigo-600",
		lightBg: "from-primary-50/80 to-indigo-50/60",
		border: "border-primary-200/60",
		hoverBorder: "hover:border-primary-300/80",
		dot: "bg-primary-500",
		ping: "bg-primary-400",
		text: "text-primary-700",
		badge: "bg-primary-100 text-primary-700",
		actionBtn: "text-primary-600 hover:text-primary-700",
		icon: "info",
		label: "Notification",
	};
};

// ─── Notification Icon SVG ───────────────────────────────────────────────────
const NotifIcon = ({ iconType, className = "w-4 h-4 text-white" }) => {
	switch (iconType) {
		case "rejected":
			return (
				<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
				</svg>
			);
		case "order":
			return (
				<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			);
		case "offer":
			return (
				<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
				</svg>
			);
		case "appointment":
			return (
				<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			);
		default:
			return (
				<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			);
	}
};

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

	// Helper function to translate notification labels
	const getTranslatedLabel = (label) => {
		const labelMap = {
			"Order": t("orderTypes.order") || "Order",
			"Success": t("orderTypes.order") || "Success",
			"Offer": t("orderTypes.offerRequest") || "Offer",
			"Appointment": t("orderTypes.appointment") || "Appointment",
			"Important": "Important",
			"Notification": t("notifications.title") || "Notification",
		};
		return labelMap[label] || label;
	};

	const allNotifications = useAppSelector(selectAllNotifications);
	const currentUser = useAppSelector(selectUser);

	const displayNotifications = allNotifications.filter((notification) => {
		// Filter out hidden notifications
		if (notification.show === false) return false;

		// If user_id is explicitly set, check matching
		const nUserId = notification.user_id || notification.userId;
		const currentUserId = currentUser?.id;
		
		if (nUserId && currentUserId) {
			// Compare using loose equality for type differences (string vs number)
			// eslint-disable-next-line eqeqeq
			return nUserId == currentUserId;
		}

		// Most API notifications for this user don't have user_id on the object itself
		// but are fetched specifically for them. We include them by default.
		return true;
	});

	const unreadCount = displayNotifications.filter((n) => !n.is_read && !n.read).length;

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;
		const checkScrollable = () => setShowScrollIndicator(container.scrollHeight > container.clientHeight);
		const handleScroll = () => setShowScrollTop(container.scrollTop > 100);
		checkScrollable();
		container.addEventListener("scroll", handleScroll);
		window.addEventListener("resize", checkScrollable);
		return () => {
			container.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", checkScrollable);
		};
	}, []);

	if (!isAuthenticated || pathname === "/login") return null;

	const scrollToTop = () => scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });

	const handleMarkAsRead = async (notificationId) => {
		try {
			dispatch(markAsRead(notificationId));
			await notificationsApi.markNotificationAsRead(notificationId);
		} catch (error) {
			console.error("Failed to mark as read:", error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			dispatch(markAllAsRead());
			await notificationsApi.markAllNotificationsAsRead();
		} catch (error) {
			console.error("Failed to mark all as read:", error);
		}
	};

	const handleHideNotification = async (notificationId) => {
		try {
			dispatch(hideNotification(notificationId));
			await notificationsApi.hideNotification(notificationId);
		} catch (error) {
			console.error("Failed to hide notification:", error);
		}
	};

	const handleHideAll = async () => {
		try {
			dispatch(hideAllNotifications());
			await notificationsApi.hideAllNotifications();
		} catch (error) {
			console.error("Failed to hide all:", error);
		}
	};

	// Navigate for site_admin → /site-admin/orders/:id, others → their dashboard
	const getOrderUrl = (notification) => {
		const orderId = notification.payload?.order_id || notification.payload?.orderId;
		if (!orderId) return null;
		const role = currentUser?.role;
		if (role === "site_admin") return `/site-admin/orders/${orderId}`;
		if (role === "company_admin") return `/company-admin/orders/${orderId}`;
		if (role === "super_admin") return `/super-admin/orders/${orderId}`;
		return `/client/dashboard?openOrder=${orderId}`;
	};

	const handleNotificationClick = (notification) => {
		if (!notification.is_read && !notification.read) {
			handleMarkAsRead(notification.id);
		}
		const url = getOrderUrl(notification);
		if (url) {
			router.push(url);
		} else if (notification.payload?.link && typeof notification.payload.link === 'string') {
			let link = notification.payload.link;
			link = link.startsWith("/") ? link : `/${link}`;
			router.push(link);
		}
	};

	const formatTime = (timestamp) => {
		if (!timestamp) return "";
		const date = new Date(timestamp);
		const now = new Date();
		const diffInSeconds = Math.floor((now - date) / 1000);
		if (diffInSeconds < 60) return t("notifications.justNow");
		if (diffInSeconds < 3600) return t("notifications.minutesAgo", { count: Math.floor(diffInSeconds / 60) });
		if (diffInSeconds < 86400) return t("notifications.hoursAgo", { count: Math.floor(diffInSeconds / 3600) });
		return t("notifications.daysAgo", { count: Math.floor(diffInSeconds / 86400) });
	};

	const EmptyNotifications = () => (
		<div className="flex-1 flex items-center justify-center p-6">
			<div className="text-center max-w-sm">
				<div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
					<svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
					</svg>
				</div>
				<h4 className="text-slate-800 font-bold text-base mb-2">{t("notifications.allCaughtUpTitle")}</h4>
				<p className="text-slate-500 text-sm leading-relaxed">{t("notifications.allCaughtUpMessage")}</p>
			</div>
		</div>
	);

	return (
		<div className={`h-screen glass-effect backdrop-blur-xl shadow-2xl flex flex-col ${isRTL ? "border-r border-primary-200/40" : "border-l border-primary-200/40"}`}>
			{/* Header */}
			<div className="flex-shrink-0 p-5 border-b border-primary-100/50 bg-white/50">
				<div className="flex items-center justify-between mb-1">
					<div className="flex items-center gap-2.5">
						<div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
							<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
							</svg>
						</div>
						<div>
							<h3 className="font-bold text-slate-800 text-base leading-tight">{t("notifications.title")}</h3>
							<p className="text-xs text-slate-500">
								{unreadCount > 0
									? unreadCount === 1
										? t("notifications.unreadMessages", { count: unreadCount })
										: t("notifications.unreadMessagesPlural", { count: unreadCount })
									: t("notifications.allCaughtUp")}
							</p>
						</div>
					</div>
					{unreadCount > 0 && (
						<div className="min-w-[22px] h-[22px] bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
							<span className="text-white text-[10px] font-bold px-1">{unreadCount > 99 ? "99+" : unreadCount}</span>
						</div>
					)}
				</div>
			</div>

			{/* Notifications List */}
			{displayNotifications.length === 0 ? (
				<EmptyNotifications />
			) : (
				<div className="flex-1 overflow-hidden relative">
					<div
						ref={scrollContainerRef}
						className="h-full overflow-y-auto scrollbar-thin smooth-scroll"
					>
						<div className="p-3 space-y-2.5">
							{displayNotifications.map((notification, index) => {
								const isUnread = !notification.is_read && !notification.read;
								const theme = getNotificationTheme(notification);
								const orderUrl = getOrderUrl(notification);

								return (
									<div
										key={notification.id}
										onClick={() => handleNotificationClick(notification)}
										className={`
											relative rounded-2xl border transition-all duration-300 cursor-pointer
											hover:shadow-xl hover:scale-[1.02] transform group overflow-hidden
											${isUnread
												? `bg-gradient-to-br ${theme.lightBg} ${theme.border} ${theme.hoverBorder}`
												: `bg-white/70 border-slate-100/80 hover:border-slate-200`
											}
										`}
										style={{
											animationDelay: `${index * 80}ms`,
										}}
									>
										{/* Left accent bar for unread */}
										{isUnread && (
											<div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${theme.gradient} rounded-l-2xl`} />
										)}

										<div className="p-3.5 ps-4">
											<div className="flex items-start gap-3">
												{/* Gradient Icon */}
												<div className={`relative flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg`}>
													<NotifIcon iconType={theme.icon} className="w-5 h-5 text-white" />
													{isUnread && (
														<span className="absolute -top-1 -right-1 flex">
															<span className={`animate-ping absolute inline-flex h-3 w-3 rounded-full ${theme.ping} opacity-75`}></span>
															<span className={`relative inline-flex rounded-full h-3 w-3 ${theme.dot} border-2 border-white`}></span>
														</span>
													)}
												</div>

												{/* Content */}
												<div className="flex-1 min-w-0">
													<div className="flex items-start justify-between gap-1 mb-0.5">
														<h4 className="text-sm font-bold text-slate-800 truncate leading-tight">
															{notification.title || t("notifications.title")}
														</h4>
														<button
															onClick={(e) => {
																e.stopPropagation();
																handleHideNotification(notification.id);
															}}
															className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 hover:bg-slate-100 rounded-lg"
															title={t("common.buttons.close")}
														>
															<svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
															</svg>
														</button>
													</div>

													{/* Type badge */}
													<span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5 ${theme.badge}`}>
													{getTranslatedLabel(theme.label)}
												</span>
												<p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
													{notification.message || notification.body || ""}
												</p>
												<div className="flex items-center justify-between mt-1.5">
													<p className="text-[10px] text-slate-400 flex items-center gap-1">
														<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
														</svg>
														{notification.createdAt
															? formatTime(notification.createdAt)
															: notification.timestamp
															? formatTime(notification.timestamp)
															: ""}
													</p>

													{(orderUrl || (notification.payload?.link && typeof notification.payload.link === 'string')) && (
														<button
															onClick={(e) => {
																e.stopPropagation();
																handleNotificationClick(notification);
															}}
															className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${theme.actionBtn}`}
														>
															{theme.label === "Offer" 
															? t("notifications.viewOffer")
															: theme.label === "Order" 
																? t("notifications.viewOrder")
																: t("notifications.viewNotification")}
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
															</svg>
														</button>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							);
						})}
						<div className="h-4" />
					</div>
				</div>

				{/* Bottom gradient fade */}
					{showScrollIndicator && (
						<div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/95 to-transparent pointer-events-none" />
					)}

					{/* Scroll to top button */}
					{showScrollTop && (
						<button
							onClick={scrollToTop}
							className="absolute bottom-4 right-4 w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center hover:scale-110"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
							</svg>
						</button>
					)}
				</div>
			)}

			{/* Footer */}
			{displayNotifications.length > 0 && (
				<div className="flex-shrink-0 p-4 border-t border-primary-100/50 bg-white/50">
					<div className="flex gap-2 mb-2">
						<button
							onClick={handleMarkAllAsRead}
							disabled={unreadCount === 0}
							className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 py-2 px-3 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
						>
							<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
							{t("notifications.markAllRead")}
						</button>
						<button
							onClick={handleHideAll}
							className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 py-2 px-3 rounded-xl hover:bg-slate-100 transition-all"
						>
							<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
							</svg>
							{t("notifications.hideAll")}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
