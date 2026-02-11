import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	financeData: null,
	financeStats: [],
	transactions: [],
	isLoading: false,
	error: null,
};

const financeSlice = createSlice({
	name: "finance",
	initialState,
	reducers: {
		setFinanceData: (state, action) => {
			state.financeData = action.payload;
		},
		setFinanceStats: (state, action) => {
			state.financeStats = action.payload;
		},
		updateFinanceStats: (state, action) => {
			state.financeStats = action.payload;
		},
		addTransaction: (state, action) => {
			state.transactions.unshift(action.payload);
		},
		updateTransaction: (state, action) => {
			const { id, updates } = action.payload;
			const transactionIndex = state.transactions.findIndex(
				(t) => t.id === id,
			);
			if (transactionIndex !== -1) {
				state.transactions[transactionIndex] = {
					...state.transactions[transactionIndex],
					...updates,
				};
			}
		},
		removeTransaction: (state, action) => {
			state.transactions = state.transactions.filter(
				(t) => t.id !== action.payload,
			);
		},
		setTransactions: (state, action) => {
			state.transactions = action.payload;
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
	setFinanceData,
	setFinanceStats,
	updateFinanceStats,
	addTransaction,
	updateTransaction,
	removeTransaction,
	setTransactions,
	setLoading,
	setError,
} = financeSlice.actions;

export default financeSlice.reducer;
