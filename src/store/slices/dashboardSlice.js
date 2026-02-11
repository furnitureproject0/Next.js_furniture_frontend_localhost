import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	dashboardData: null,
	isLoading: false,
	error: null,
};

const dashboardSlice = createSlice({
	name: "dashboard",
	initialState,
	reducers: {
		setDashboardData: (state, action) => {
			state.dashboardData = action.payload;
		},
		updateStats: (state, action) => {
			if (!state.dashboardData) {
				state.dashboardData = { stats: [] };
			}
			state.dashboardData.stats = action.payload;
		},
		updateFinanceData: (state, action) => {
			if (!state.dashboardData) {
				state.dashboardData = { financeData: null };
			}
			state.dashboardData.financeData = action.payload;
		},
		addTransaction: (state, action) => {
			if (!state.dashboardData) {
				state.dashboardData = { recentTransactions: [] };
			}
			if (!state.dashboardData.recentTransactions) {
				state.dashboardData.recentTransactions = [];
			}
			state.dashboardData.recentTransactions.unshift(action.payload);
		},
		setLoading: (state, action) => {
			state.isLoading = action.payload;
		},
		setError: (state, action) => {
			state.error = action.payload;
		},
	},
});

export const {
	setDashboardData,
	updateStats,
	updateFinanceData,
	addTransaction,
	setLoading,
	setError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
