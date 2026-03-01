"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectUser } from "@/store/selectors";
import { logoutUser } from "@/store/slices/authSlice";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DashboardIcon from "./icons/DashboardIcon";
import EmployeesIcon from "./icons/EmployeesIcon";
import FinanceIcon from "./icons/FinanceIcon";
import LogoutIcon from "./icons/LogoutIcon";
import OrdersIcon from "./icons/OrdersIcon";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Sidebar({ onClose }) {
	const dispatch = useAppDispatch();
	const user = useAppSelector(selectUser);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const activeTabParam = searchParams.get("tab");

	const handleLogout = async () => {
		try {
			await dispatch(logoutUser(true));
			router.push("/login");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const { t } = useTranslation();

	// Define navigation items based on user role
	const getNavigationItems = () => {
		const userRole = user?.role;
		if (!userRole) return [];

		// Normalize role to handle both dash and underscore formats
		const normalizedRole = userRole.replace(/_/g, "-");

		switch (normalizedRole) {
			case "super-admin":
				return [
					{
						name: t("sidebar.dashboard"),
						href: "/super-admin/dashboard",
						icon: DashboardIcon,
						current: pathname === "/super-admin/dashboard" && !activeTabParam,
					},
					{
						name: t("sidebar.orders"),
						href: "/super-admin/dashboard?tab=orders",
						icon: OrdersIcon,
						current: pathname === "/super-admin/dashboard" && activeTabParam === "orders",
					},
					{
						name: t("sidebar.users"),
						href: "/super-admin/dashboard?tab=users",
						icon: EmployeesIcon,
						current: pathname === "/super-admin/dashboard" && activeTabParam === "users",
					},
				];

			case "site-admin":
				return [
					{
						name: t("sidebar.dashboard"),
						href: "/site-admin/dashboard",
						icon: DashboardIcon,
						current: pathname === "/site-admin/dashboard",
					},
					{
						name: t("sidebar.orders"),
						href: "/site-admin/orders",
						icon: OrdersIcon,
						current: pathname.startsWith("/site-admin/orders"),
					},
					{
						name: t("sidebar.finance"),
						href: "/site-admin/finance",
						icon: FinanceIcon,
						current: pathname.startsWith("/site-admin/finance"),
						comingSoon: true,
					},
					{
						name: t("sidebar.employees"),
						href: "/site-admin/staff",
						icon: EmployeesIcon,
						current: pathname.startsWith("/site-admin/staff"),
						comingSoon: true,
					},
				];

			case "company-admin":
				return [
					{
						name: t("sidebar.dashboard"),
						href: "/company-admin/dashboard",
						icon: DashboardIcon,
						current: pathname === "/company-admin/dashboard",
					},
				{
					name: t("sidebar.users"),
					href: "/company-admin/users",
					icon: EmployeesIcon,
					current: pathname === "/company-admin/users",
				},
					{
						name: t("sidebar.settings"),
						href: "/company-admin/settings",
						icon: FinanceIcon,
						current: pathname === "/company-admin/settings",
						comingSoon: true,
					},
				];

			case "client":
				return [
					{
						name: t("sidebar.dashboard"),
						href: "/client/dashboard",
						icon: DashboardIcon,
						current: pathname === "/client/dashboard",
					},
					{
						name: t("sidebar.orders"),
						href: "/client/orders",
						icon: OrdersIcon,
						current: pathname === "/client/orders",
						comingSoon: true,
					},
					{
						name: t("sidebar.settings"),
						href: "/client/support",
						icon: EmployeesIcon,
						current: pathname === "/client/support",
						comingSoon: true,
					},
				];

			case "driver":
				return [
					{
						name: t("sidebar.assignments"),
						href: "/driver/dashboard",
						icon: OrdersIcon,
						current: pathname === "/driver/dashboard",
					},
					{
						name: t("sidebar.employments"),
						href: "/driver/employments",
						icon: EmployeesIcon,
						current: pathname === "/driver/employments",
					},
				];

			case "worker":
				return [
					{
						name: t("sidebar.assignments"),
						href: "/worker/dashboard",
						icon: OrdersIcon,
						current: pathname === "/worker/dashboard",
					},
					{
						name: t("sidebar.employments"),
						href: "/worker/employments",
						icon: EmployeesIcon,
						current: pathname === "/worker/employments",
					},
				];

			default:
				return [];
		}
	};

	const navigationItems = getNavigationItems();
	const currentLanguage = useAppSelector((state) => state.language?.currentLanguage) || "en";
	const isRTL = currentLanguage === "ar";
	
	return (
		<div className={`h-screen w-72 lg:w-full glass-effect backdrop-blur-xl shadow-2xl overflow-y-auto ${
			isRTL ? "border-l border-primary-200/40" : "border-r border-primary-200/40"
		}`}>
			{/* Header with User Info and Logout */}
			<div className="p-4 sm:p-6 border-b border-primary-100/50">
				<div className="flex items-center justify-between mb-4 sm:mb-6">
					<div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
						<div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
							<span className="text-white text-xs sm:text-sm font-semibold">
								{user?.name
									? user.name
											.split(" ")
											.map((n) => n[0])
											.join("")
											.toUpperCase()
									: "U"}
							</span>
						</div>
						<div className="min-w-0 flex-1">
							<h2 className="text-slate-800 font-semibold text-xs sm:text-sm truncate">
								{user?.name || "User"}
							</h2>
							<p className="text-slate-600/70 text-xs truncate">
								{user?.role || "User"}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
						{/* Mobile Close Button */}
						<button
							onClick={onClose}
							className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-primary-50 transition-colors"
							aria-label="Close menu"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
						<LanguageSwitcher />
						<button
							onClick={handleLogout}
							className="flex items-center curser-pointer justify-center p-2 rounded-lg transition-all duration-200 text-slate-600 hover:bg-red-50/60 hover:text-red-700 border border-primary-200/40 hover:border-red-200/60 bg-gradient-to-br from-primary-50/60 to-primary-50/60 hover:from-red-50/60 hover:to-red-50/60 shadow-sm hover:shadow-md"
							title="Logout"
						>
							<LogoutIcon className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="p-4 sm:p-6">
				<div className="mb-6 sm:mb-8">
					<h3 className="text-primary-600/60 text-xs font-medium mb-3 sm:mb-4 uppercase tracking-wider">
						{t("sidebar.navigation")}
					</h3>
					<ul className="space-y-1">
						{navigationItems.map((item) => (
							<li key={item.name}>
								{item.comingSoon ? (
									<div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl cursor-not-allowed opacity-60 text-primary-600/50">
										<div className="flex items-center gap-2 sm:gap-3 min-w-0">
											<item.icon className="text-primary-500/50 flex-shrink-0" />
											<span className="text-xs sm:text-sm truncate">
												{item.name}
											</span>
										</div>
									</div>
								) : (
									<a
										href={item.href}
										onClick={onClose}
										className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 ${
											item.current
												? "bg-gradient-to-r from-primary-50 to-primary-50 text-primary-700 border border-primary-200/60 shadow-sm hover:shadow-md"
												: "text-slate-600 hover:bg-primary-50/60 hover:text-slate-800"
										}`}
									>
										<item.icon
											className={`flex-shrink-0 ${
												item.current
													? "text-primary-600"
													: "text-primary-600"
											}`}
										/>
										<span
											className={`text-xs sm:text-sm truncate ${
												item.current
													? "font-medium"
													: ""
											}`}
										>
											{item.name}
										</span>
									</a>
								)}
							</li>
						))}
					</ul>
				</div>
			</nav>

		</div>
	);
}
