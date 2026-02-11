import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	useRealData: false, // Default to dummy data
};

const dataSourceSlice = createSlice({
	name: "dataSource",
	initialState,
	reducers: {
		setUseRealData: (state, action) => {
			state.useRealData = action.payload;
		},
		toggleDataSource: (state) => {
			state.useRealData = !state.useRealData;
		},
	},
});

export const { setUseRealData, toggleDataSource } = dataSourceSlice.actions;
export default dataSourceSlice.reducer;

