import { configureStore } from "@reduxjs/toolkit";
import { toastMiddleware } from "./middleware/toastMiddleware";
import { persistenceMiddleware } from "./persistence";
import authReducer from "./slices/authSlice";
import companiesReducer from "./slices/companiesSlice";
import dashboardReducer from "./slices/dashboardSlice";
import dataSourceReducer from "./slices/dataSourceSlice";
import employeesReducer from "./slices/employeesSlice";
import financeReducer from "./slices/financeSlice";
import languageReducer from "./slices/languageSlice";
import notificationsReducer from "./slices/notificationsSlice";
import ordersReducer from "./slices/ordersSlice";
import usersReducer from "./slices/usersSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		orders: ordersReducer,
		employees: employeesReducer,
		dashboard: dashboardReducer,
		companies: companiesReducer,
		finance: financeReducer,
		notifications: notificationsReducer,
		users: usersReducer,
		language: languageReducer,
		dataSource: dataSourceReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ["persist/PERSIST"],
			},
		}).concat(persistenceMiddleware, toastMiddleware),
});

// Export types for TypeScript (if needed later)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
