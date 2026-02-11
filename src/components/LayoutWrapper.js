"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectAuthLoading } from "@/store/selectors";
import { checkAuth } from "@/store/slices/authSlice";
import Sidebar from "@/components/Sidebar";
import NotificationsSidebar from "@/components/NotificationsSidebar";
import { useNotifications } from "@/hooks/useNotifications";

export default function LayoutWrapper({ children }) {
	const dispatch = useAppDispatch();
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const isLoading = useAppSelector(selectAuthLoading);
	const pathname = usePathname();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);
	const prevIsAuthenticatedRef = useRef(isAuthenticated);
	const prevPathnameRef = useRef(pathname);
	const currentLanguage = useAppSelector((state) => state.language?.currentLanguage) || "en";
	const isRTL = currentLanguage === "ar";
	
	// Initialize notifications hook (Socket.IO connection and API fetching)
	useNotifications();

	// Track window size for responsive behavior
	useEffect(() => {
		const checkIsDesktop = () => {
			setIsDesktop(window.innerWidth >= 1024);
		};
		
		checkIsDesktop();
		window.addEventListener("resize", checkIsDesktop);
		return () => window.removeEventListener("resize", checkIsDesktop);
	}, []);

	useEffect(() => {
		dispatch(checkAuth());
	}, [dispatch]);

	// Preserve authentication state during re-renders (e.g., language changes)
	useEffect(() => {
		if (isAuthenticated) {
			prevIsAuthenticatedRef.current = isAuthenticated;
		}
	}, [isAuthenticated]);

	// Close sidebars when route changes on mobile (but preserve state during language changes)
	useEffect(() => {
		// Only close if pathname actually changed (not just a re-render)
		if (prevPathnameRef.current !== pathname) {
			setSidebarOpen(false);
			setNotificationsOpen(false);
			prevPathnameRef.current = pathname;
		}
	}, [pathname]);

	// Show loading state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 border-b-2 border-orange-500"></div>
			</div>
		);
	}

	// Show simple layout for login page, order details page, or when not authenticated
	// Use ref to prevent flickering/disappearing during language changes
	const isOrderDetailsPage = pathname?.match(/^\/client\/order\/\d+$/);
	const shouldShowSidebars = (isAuthenticated || prevIsAuthenticatedRef.current) && pathname !== "/login" && !isOrderDetailsPage;
	
	if (!shouldShowSidebars) {
		return <div className="min-h-screen">{children}</div>;
	}

	// Show grid layout with sidebars for authenticated users
	// Grid columns are the same for both RTL and LTR, but order is handled by CSS
	const gridCols = "lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[320px_1fr_320px]";
	
	return (
		<div className={`min-h-screen flex flex-col lg:grid ${gridCols} gap-0`} dir={isRTL ? "rtl" : "ltr"}>
			{/* Mobile Header */}
			<header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-orange-200/40 shadow-sm">
				<div className="flex items-center justify-between p-4">
					<button
						onClick={() => setSidebarOpen(true)}
						className="p-2 rounded-lg text-amber-700 hover:bg-orange-50 transition-colors"
						aria-label="Open menu"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
					<h1 className="text-lg font-semibold text-amber-900">Dashboard</h1>
					<button
						onClick={() => setNotificationsOpen(true)}
						className="p-2 rounded-lg text-amber-700 hover:bg-orange-50 transition-colors relative"
						aria-label="Open notifications"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
					</button>
				</div>
			</header>

			{/* Sidebar - Desktop: always visible, Mobile: overlay drawer */}
			<div 
				style={{
					transform: isDesktop 
						? "translateX(0)" 
						: (isRTL 
							? (sidebarOpen ? "translateX(0)" : "translateX(100%)")
							: (sidebarOpen ? "translateX(0)" : "translateX(-100%)"))
				}}
				className={`lg:block fixed lg:sticky top-0 h-screen z-50 lg:z-auto transition-transform duration-300 ease-in-out ${
					isRTL ? "right-0" : "left-0"
				}`}
			>
				<Sidebar onClose={() => setSidebarOpen(false)} />
			</div>

			{/* Mobile Sidebar Overlay */}
			{sidebarOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-black/50 z-40"
					onClick={() => setSidebarOpen(false)}
					aria-hidden="true"
				/>
			)}

			{/* Main Content */}
			<main className="flex-1 min-h-screen overflow-auto lg:min-h-0">{children}</main>

			{/* Notifications Sidebar - Desktop: always visible, Mobile: overlay drawer */}
			<div 
				style={{
					transform: isDesktop 
						? "translateX(0)" 
						: (isRTL
							? (notificationsOpen ? "translateX(0)" : "translateX(-100%)")
							: (notificationsOpen ? "translateX(0)" : "translateX(100%)"))
				}}
				className={`lg:block fixed lg:sticky top-0 h-screen z-50 lg:z-auto transition-transform duration-300 ease-in-out ${
					isRTL ? "left-0" : "right-0"
				}`}
			>
				<NotificationsSidebar onClose={() => setNotificationsOpen(false)} />
			</div>

			{/* Mobile Notifications Overlay */}
			{notificationsOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-black/50 z-40"
					onClick={() => setNotificationsOpen(false)}
					aria-hidden="true"
				/>
			)}
		</div>
	);
}
