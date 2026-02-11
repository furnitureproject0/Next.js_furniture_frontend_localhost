import { createSlice } from "@reduxjs/toolkit";

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
});

export const {
	addEmployee,
	updateEmployee,
	removeEmployee,
	setEmployees,
	toggleEmployeeAvailability,
} = employeesSlice.actions;

export default employeesSlice.reducer;
