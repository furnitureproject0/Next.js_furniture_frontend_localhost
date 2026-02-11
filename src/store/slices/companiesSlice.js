import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	companies: [],
	isLoading: false,
	error: null,
};

const companiesSlice = createSlice({
	name: "companies",
	initialState,
	reducers: {
		addCompany: (state, action) => {
			state.companies.push(action.payload);
		},
		updateCompany: (state, action) => {
			const { id, updates } = action.payload;
			const companyIndex = state.companies.findIndex(
				(company) => company.id === id,
			);
			if (companyIndex !== -1) {
				state.companies[companyIndex] = {
					...state.companies[companyIndex],
					...updates,
				};
			}
		},
		removeCompany: (state, action) => {
			state.companies = state.companies.filter(
				(company) => company.id !== action.payload,
			);
		},
		setCompanies: (state, action) => {
			state.companies = action.payload;
		},
		toggleCompanyAvailability: (state, action) => {
			const companyIndex = state.companies.findIndex(
				(company) => company.id === action.payload,
			);
			if (companyIndex !== -1) {
				state.companies[companyIndex].available =
					!state.companies[companyIndex].available;
			}
		},
	},
});

export const {
	addCompany,
	updateCompany,
	removeCompany,
	setCompanies,
	toggleCompanyAvailability,
} = companiesSlice.actions;

export default companiesSlice.reducer;
