import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { companyAdminApi } from "@/lib/api";

export const fetchEmployees = createAsyncThunk(
	"employees/fetchEmployees",
	async ({ company_id, page = 1, limit = 100 }, { rejectWithValue }) => {
		try {
			const response = await companyAdminApi.getCompanyEmployees(company_id, {
				page,
				limit,
			});
			
			// Handle different response structures
			if (response?.success && response?.data) {
				return response.data.employees || response.data;
			} else if (response?.data) {
				return response.data;
			} else if (Array.isArray(response)) {
				return response;
			}
			
			return response || [];
		} catch (error) {
			return rejectWithValue(error?.message || "Failed to fetch employees");
		}
	}
);

const initialState = {
	employees: [],
	isLoading: false,
	error: null,
};

const employeesSlice = createSlice({
	name: "employees",
	initialState,
	reducers: {
		addEmployee: (state, action) => {
			state.employees.push(action.payload);
		},
		updateEmployee: (state, action) => {
			const { id, updates } = action.payload;
			const employeeIndex = state.employees.findIndex(
				(emp) => emp.id === id,
			);
			if (employeeIndex !== -1) {
				state.employees[employeeIndex] = {
					...state.employees[employeeIndex],
					...updates,
				};
			}
		},
		removeEmployee: (state, action) => {
			state.employees = state.employees.filter(
				(emp) => emp.id !== action.payload,
			);
		},
		setEmployees: (state, action) => {
			state.employees = action.payload;
		},
		toggleEmployeeAvailability: (state, action) => {
			const employeeIndex = state.employees.findIndex(
				(emp) => emp.id === action.payload,
			);
			if (employeeIndex !== -1) {
				state.employees[employeeIndex].available =
					!state.employees[employeeIndex].available;
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchEmployees.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchEmployees.fulfilled, (state, action) => {
				state.isLoading = false;
				state.employees = Array.isArray(action.payload)
					? action.payload
					: action.payload?.employees || [];
				state.error = null;
			})
			.addCase(fetchEmployees.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload || "Failed to fetch employees";
			});
	},
});

export const {
	addEmployee,
	updateEmployee,
	removeEmployee,
	setEmployees,
	toggleEmployeeAvailability,
} = employeesSlice.actions;

export default employeesSlice.reducer;
