import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { companiesApi } from "@/lib/api";
import { transformCompany, transformCompanies, extractArrayData } from "@/lib/services/superAdminTransformers";

export const fetchAllCompanies = createAsyncThunk(
	"companies/fetchAllCompanies",
	async (filters = {}, { rejectWithValue }) => {
		try {
			const response = await companiesApi.getCompanies(filters);
			
			if (response?.success || Array.isArray(response)) {
				const companiesData = extractArrayData(response, 'data');
				return transformCompanies(companiesData);
			}
			
			return [];
		} catch (error) {
			console.error("Error fetching companies:", error);
			return rejectWithValue(error?.message || "Failed to fetch companies");
		}
	}
);

export const createCompanyThunk = createAsyncThunk(
	"companies/createCompany",
	async (companyData, { rejectWithValue }) => {
		try {
			const response = await companiesApi.createCompany(companyData);
			
			if (response?.success && response?.data) {
				return transformCompany(response.data);
			}
			throw new Error(response?.message || "Failed to create company");
		} catch (error) {
			console.error("Error creating company:", error);
			return rejectWithValue(error?.message || "Failed to create company");
		}
	}
);

export const updateCompanyThunk = createAsyncThunk(
	"companies/updateCompany",
	async ({ id, updates }, { rejectWithValue }) => {
		try {
			const response = await companiesApi.updateCompany(id, updates);
			if (response?.success && response?.data) {
				const updatedCompany = transformCompany(response.data);
				return { id, company: updatedCompany };
			}
			throw new Error(response?.message || "Failed to update company");
		} catch (error) {
			console.error("Error updating company:", error);
			return rejectWithValue(error?.message || "Failed to update company");
		}
	}
);

export const activateCompanyThunk = createAsyncThunk(
	"companies/activateCompany",
	async (id, { rejectWithValue }) => {
		try {
			const response = await companiesApi.activateCompany(id);
			if (response?.success && response?.data) {
				return transformCompany(response.data);
			}
			throw new Error(response?.message || "Failed to activate company");
		} catch (error) {
			console.error("Error activating company:", error);
			return rejectWithValue(error?.message || "Failed to activate company");
		}
	}
);

export const suspendCompanyThunk = createAsyncThunk(
	"companies/suspendCompany",
	async (id, { rejectWithValue }) => {
		try {
			const response = await companiesApi.suspendCompany(id);
			if (response?.success && response?.data) {
				return transformCompany(response.data);
			}
			throw new Error(response?.message || "Failed to suspend company");
		} catch (error) {
			console.error("Error suspending company:", error);
			return rejectWithValue(error?.message || "Failed to suspend company");
		}
	}
);

const initialState = {
	companies: [],
	isLoading: false,
	error: null,
};

const companiesSlice = createSlice({
	name: "companies",
	initialState,
	reducers: {
		setCompanies: (state, action) => {
			state.companies = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAllCompanies.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchAllCompanies.fulfilled, (state, action) => {
				state.isLoading = false;
				state.companies = action.payload;
				state.error = null;
			})
			.addCase(fetchAllCompanies.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload || "Failed to fetch companies";
			})
			.addCase(createCompanyThunk.fulfilled, (state, action) => {
				state.isLoading = false;
				state.companies.unshift(action.payload);
				state.error = null;
			})
			.addCase(createCompanyThunk.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			})
			.addCase(updateCompanyThunk.fulfilled, (state, action) => {
				state.isLoading = false;
				const { id, company } = action.payload;
				const index = state.companies.findIndex(c => c.id === id);
				if (index !== -1) {
					state.companies[index] = company;
				}
				state.error = null;
			})
			.addCase(updateCompanyThunk.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			})
			.addCase(activateCompanyThunk.fulfilled, (state, action) => {
				state.isLoading = false;
				const activatedCompany = action.payload;
				const index = state.companies.findIndex(c => c.id === activatedCompany.id);
				if (index !== -1) {
					state.companies[index] = activatedCompany;
				}
				state.error = null;
			})
			.addCase(activateCompanyThunk.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			})
			.addCase(suspendCompanyThunk.fulfilled, (state, action) => {
				state.isLoading = false;
				const suspendedCompany = action.payload;
				const index = state.companies.findIndex(c => c.id === suspendedCompany.id);
				if (index !== -1) {
					state.companies[index] = suspendedCompany;
				}
				state.error = null;
			})
			.addCase(suspendCompanyThunk.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			});
	},
});

export const { setCompanies } = companiesSlice.actions;
export default companiesSlice.reducer;
