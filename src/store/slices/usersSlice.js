import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	users: [],
	isLoading: false,
	error: null,
};

const usersSlice = createSlice({
	name: "users",
	initialState,
	reducers: {
		addUser: (state, action) => {
			state.users.push(action.payload);
		},
		updateUser: (state, action) => {
			const { id, updates } = action.payload;
			const userIndex = state.users.findIndex((user) => user.id === id);
			if (userIndex !== -1) {
				state.users[userIndex] = {
					...state.users[userIndex],
					...updates,
				};
			}
		},
		deleteUser: (state, action) => {
			state.users = state.users.filter(
				(user) => user.id !== action.payload,
			);
		},
		setUsers: (state, action) => {
			state.users = action.payload;
		},
	},
});

export const { addUser, updateUser, deleteUser, setUsers } = usersSlice.actions;

export default usersSlice.reducer;

