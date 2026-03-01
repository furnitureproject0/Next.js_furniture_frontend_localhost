import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usersV2Api } from "@/lib/api";
import { transformUser, transformUsers, extractArrayData } from "@/lib/services/superAdminTransformers";

export const fetchAllUsers = createAsyncThunk(
	"users/fetchAllUsers",
	async (filters = {}, { rejectWithValue }) => {
		try {
			const response = await usersV2Api.getUsers(filters);
			
			if (response?.success) {
				const usersData = extractArrayData(response, 'data');
				return transformUsers(usersData);
			}
			
			return [];
		} catch (error) {
			console.error("Error fetching users:", error);
			return rejectWithValue(error?.message || "Failed to fetch users");
		}
	}
);

export const createUserThunk = createAsyncThunk(
	"users/createUser",
	async (userData, { rejectWithValue }) => {
		try {
			const response = await usersV2Api.createUser(userData);
			
			if (response?.success && response?.data) {
				return transformUser(response.data);
			}
			throw new Error(response?.message || "Failed to create user");
		} catch (error) {
			console.error("Error creating user:", error);
			return rejectWithValue(error?.message || "Failed to create user");
		}
	}
);

export const updateUserThunk = createAsyncThunk(
	"users/updateUser",
	async ({ id, updates }, { rejectWithValue }) => {
		try {
			const response = await usersV2Api.updateUser(id, updates);
			if (response?.success && response?.data) {
				const updatedUser = transformUser(response.data);
				return { id, user: updatedUser };
			}
			throw new Error(response?.message || "Failed to update user");
		} catch (error) {
			console.error("Error updating user:", error);
			return rejectWithValue(error?.message || "Failed to update user");
		}
	}
);

export const deleteUserThunk = createAsyncThunk(
	"users/deleteUser",
	async (id, { rejectWithValue }) => {
		try {
			const response = await usersV2Api.deleteUser(id);
			if (response?.success) {
				return id;
			}
			throw new Error(response?.message || "Failed to delete user");
		} catch (error) {
			console.error("Error deleting user:", error);
			return rejectWithValue(error?.message || "Failed to delete user");
		}
	}
);

const initialState = {
	users: [],
	isLoading: false,
	error: null,
};

const usersSlice = createSlice({
	name: "users",
	initialState,
	reducers: {
		setUsers: (state, action) => {
			state.users = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAllUsers.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchAllUsers.fulfilled, (state, action) => {
				state.isLoading = false;
				state.users = action.payload;
				state.error = null;
			})
			.addCase(fetchAllUsers.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload || "Failed to fetch users";
			})
			.addCase(createUserThunk.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(createUserThunk.fulfilled, (state, action) => {
				state.isLoading = false;
				state.users.unshift(action.payload);
			})
			.addCase(createUserThunk.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			})
			.addCase(updateUserThunk.fulfilled, (state, action) => {
				const { id, user } = action.payload;
				const index = state.users.findIndex(u => u.id === id);
				if (index !== -1) {
					state.users[index] = user;
				}
			})
			.addCase(deleteUserThunk.fulfilled, (state, action) => {
				state.users = state.users.filter(u => u.id !== action.payload);
			});
	},
});

export const { setUsers } = usersSlice.actions;
export default usersSlice.reducer;

