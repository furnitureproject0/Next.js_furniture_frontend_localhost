import { createSelector } from "@reduxjs/toolkit";

// Auth selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;

// Data source selectors
export const selectDataSource = (state) => state.dataSource;
export const selectUseRealData = (state) => state.dataSource?.useRealData ?? false;

// Language selectors
export const selectLanguage = (state) => state.language?.currentLanguage || "de";

// Orders selectors
export const selectOrders = (state) => state.orders;
export const selectOrdersData = (state) => state.orders.orders;
export const selectSelectedFilter = (state) => state.orders.selectedFilter;

// Combined orders selector (for backwards compatibility)
export const selectDisplayOrders = (state) => state.orders.orders;

// Site admin orders selector
export const selectSiteAdminOrders = (state) => state.orders.orders;

// Filtered orders selector (for company admin)
export const selectFilteredOrders = (state) => state.orders.orders;

// Filtered site admin orders selector
export const selectFilteredSiteAdminOrders = (state) => state.orders.orders;

// Orders stats selector (for company admin)
export const selectOrdersStats = createSelector(
	[selectDisplayOrders],
	(orders) => ({
		totalOrders: orders.length,
		pendingOrders: orders.filter((o) => o.status === "pending").length,
		activeOrders: orders.filter((o) =>
			["assigned", "offer_sent", "offer_accepted"].includes(o.status),
		).length,
		completedOrders: orders.filter((o) => o.status === "completed").length,
	}),
);

// Site admin orders stats selector
export const selectSiteAdminOrdersStats = createSelector(
	[selectSiteAdminOrders],
	(orders) => ({
		totalOrders: orders.length,
		pendingOrders: orders.filter((o) => o.status === "pending").length,
		activeOrders: orders.filter((o) =>
			["assigned", "offer_sent", "offer_accepted"].includes(o.status),
		).length,
		completedOrders: orders.filter((o) => o.status === "completed").length,
	}),
);

// Employees selectors
export const selectEmployees = (state) => state.employees;
export const selectEmployeesData = (state) => state.employees.employees;

// Employees selector
export const selectDisplayEmployees = (state) => state.employees.employees;

// Available employees selector
export const selectAvailableEmployees = createSelector(
	[selectDisplayEmployees],
	(employees) => employees.filter((emp) => emp.available),
);

// Companies selectors
export const selectCompanies = (state) => state.companies;
export const selectCompaniesData = (state) => state.companies.companies;

// Companies selector
export const selectDisplayCompanies = (state) => state.companies.companies;

// Available companies selector
export const selectAvailableCompanies = createSelector(
	[selectDisplayCompanies],
	(companies) => companies.filter((company) => company.available),
);

// Finance selectors
export const selectFinance = (state) => state.finance;
export const selectFinanceData = (state) => state.finance.financeData;
export const selectFinanceTransactions = (state) => state.finance.transactions;
export const selectFinanceStats = (state) => state.finance.financeStats;

// Finance data selector
export const selectDisplayFinanceData = (state) => state.finance.financeData;

// Transactions selector
export const selectDisplayTransactions = (state) => state.finance.transactions;

// Finance stats selector
export const selectDisplayFinanceStats = (state) => state.finance.financeStats;

// Dashboard selectors
export const selectDashboard = (state) => state.dashboard;
export const selectDashboardData = (state) => state.dashboard.dashboardData;

// Dashboard stats selector
export const selectDashboardStats = createSelector(
	[selectDashboardData],
	(dashboardData) => dashboardData?.stats || [],
);

// Dashboard finance data selector
export const selectFinanceDataFromDashboard = createSelector(
	[selectDashboardData],
	(dashboardData) => dashboardData?.financeData || null,
);

// Recent transactions from dashboard selector
export const selectRecentTransactions = createSelector(
	[selectDashboardData],
	(dashboardData) => dashboardData?.recentTransactions || [],
);

// ====== Role-based order selectors ======

// Get all orders (used by site admin to see everything)
export const selectAllOrders = (state) => state.orders.orders;

// Get orders for a specific customer
export const selectCustomerOrders = (customerId) =>
	createSelector([selectAllOrders], (orders) =>
		orders.filter((order) => order.customerId === customerId),
	);

// Get orders assigned to a specific company
export const selectCompanyOrders = (companyId) =>
	createSelector([selectAllOrders], (orders) =>
		orders.filter((order) => order.assignedCompanyId === companyId),
	);

// Get unassigned orders (for site admin)
export const selectUnassignedOrders = createSelector(
	[selectAllOrders],
	(orders) => orders.filter((order) => order.status === "pending"),
);

// Get customer order stats
export const selectCustomerOrderStats = (customerId) =>
	createSelector([selectCustomerOrders(customerId)], (orders) => ({
		totalOrders: orders.length,
		pendingOffers: orders.filter(
			(o) => o.status === "pending" || o.status === "assigned",
		).length,
		inProgress: orders.filter((o) =>
			["offer_accepted", "scheduled", "in_progress"].includes(o.status),
		).length,
		completed: orders.filter((o) => o.status === "completed").length,
	}));

// ====== Notifications selectors ======

export const selectNotifications = (state) => state.notifications;
export const selectAllNotifications = (state) => state.notifications.items;

// Get notifications for a specific role
export const selectNotificationsForRole = (role) =>
	createSelector([selectAllNotifications], (notifications) =>
		notifications.filter((n) => n.role === role),
	);

// Get unread notifications for a role
export const selectUnreadNotificationsForRole = (role) =>
	createSelector([selectNotificationsForRole(role)], (notifications) =>
		notifications.filter((n) => !n.read),
	);

// Get unread count for a role
export const selectUnreadCountForRole = (role) =>
	createSelector(
		[selectUnreadNotificationsForRole(role)],
		(notifications) => notifications.length,
	);

// Get notifications for a specific client (by userId)
export const selectNotificationsForCustomer = (customerId) =>
	createSelector([selectNotificationsForRole("client")], (notifications) =>
		notifications.filter(
			(n) => n.userId === null || n.userId === customerId,
		),
	);

// Get notifications for a specific company
export const selectNotificationsForCompany = (companyId) =>
	createSelector(
		[selectNotificationsForRole("company_admin")],
		(notifications) =>
			notifications.filter(
				(n) => n.companyId === null || n.companyId === companyId,
			),
	);

// Get notifications for a specific driver (by userId)
export const selectNotificationsForDriver = (driverId) =>
	createSelector([selectNotificationsForRole("driver")], (notifications) =>
		notifications.filter(
			(n) => n.userId === null || n.userId === driverId,
		),
	);

// Get notifications for a specific worker (by userId)
export const selectNotificationsForWorker = (workerId) =>
	createSelector([selectNotificationsForRole("worker")], (notifications) =>
		notifications.filter(
			(n) => n.userId === null || n.userId === workerId,
		),
	);

// ====== Users selectors ======

export const selectUsers = (state) => state.users;
export const selectUsersData = (state) => state.users.users;

// Users selector
export const selectDisplayUsers = (state) => state.users.users;

// All users selector (for super admin)
export const selectAllUsers = createSelector(
	[selectDisplayUsers],
	(users) => users,
);
