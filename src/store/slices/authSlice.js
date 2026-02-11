import { authApi } from "@/lib/api";
import {
	setAuthCookie,
} from "@/lib/auth-utils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Async thunks
export const checkAuth = createAsyncThunk(
	"auth/checkAuth",
	async (_, { rejectWithValue }) => {
		try {
			// Always check with API - no localStorage storage
			const response = await authApi.getMe();
			
			// If response is null, user is not authenticated (401) - this is normal, not an error
			if (response === null || !response) {
				setAuthCookie(false);
				return { user: null, isAuthenticated: false };
			}
			
			// Check if response has success and user data
			if (response.success && response.data?.user) {
				setAuthCookie(true);
				return { user: response.data.user, fromStorage: false };
			}
			
			// No user found - treat as not authenticated, not an error
			setAuthCookie(false);
			return { user: null, isAuthenticated: false };
		} catch (error) {
			// Only treat actual errors (network errors, etc.) as errors
			// 401 is handled by returning null from api.js, so it won't reach here
			setAuthCookie(false);
			// For actual errors, reject but don't show error message to user
			// This should rarely happen since 401 is handled above
			return rejectWithValue(error.message);
		}
	},
);

export const loginUser = createAsyncThunk(
	"auth/login",
	async (credentials, { rejectWithValue }) => {
		try {
			const response = await authApi.login(credentials);
			if (response.success && response.data?.user) {
				setAuthCookie(true);
				return response.data.user;
			}
			throw new Error("Login failed");
		} catch (error) {
			return rejectWithValue(error.message);
		}
	},
);

export const registerUser = createAsyncThunk(
	"auth/register",
	async (userData, { rejectWithValue }) => {
		try {
			const response = await authApi.register(userData);
			if (response.success && response.data?.user) {
				setAuthCookie(true);
				return response.data.user;
			}
			throw new Error("Registration failed");
		} catch (error) {
			return rejectWithValue(error.message);
		}
	},
);

export const logoutUser = createAsyncThunk(
	"auth/logout",
	async (forceRefresh = true, { rejectWithValue }) => {
		try {
			await authApi.logout();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setAuthCookie(false);

			if (forceRefresh && typeof window !== "undefined") {
				window.location.href = "/login";
			}
		}
	},
);

const initialState = {
	user: null,
	isLoading: true,
	isAuthenticated: false,
	error: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		setUser: (state, action) => {
			state.user = action.payload;
			state.isAuthenticated = !!action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			// Check Auth
			.addCase(checkAuth.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(checkAuth.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload.user;
				// Handle both authenticated and unauthenticated states
				state.isAuthenticated = !!action.payload.user && action.payload.user !== null;
				state.error = null;
			})
			.addCase(checkAuth.rejected, (state, action) => {
				state.isLoading = false;
				state.user = null;
				state.isAuthenticated = false;
				// Don't set error for checkAuth - 401 is normal when not logged in
				state.error = null;
			})
			// Login
			.addCase(loginUser.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload;
				state.isAuthenticated = true;
				state.error = null;
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			})
			// Register
			.addCase(registerUser.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(registerUser.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload;
				state.isAuthenticated = true;
				state.error = null;
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			})
			// Logout
			.addCase(logoutUser.fulfilled, (state) => {
				state.user = null;
				state.isAuthenticated = false;
				state.isLoading = false;
				state.error = null;
			});
	},
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
