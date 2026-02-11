import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectAuth,
	selectUser,
	selectIsAuthenticated,
	selectAuthLoading,
} from "@/store/selectors";
import {
	loginUser,
	registerUser,
	logoutUser,
	clearError,
} from "@/store/slices/authSlice";

export const useAuth = () => {
	const dispatch = useAppDispatch();
	const auth = useAppSelector(selectAuth);
	const user = useAppSelector(selectUser);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const isLoading = useAppSelector(selectAuthLoading);

	const login = async (credentials) => {
		try {
			const result = await dispatch(loginUser(credentials));
			if (loginUser.fulfilled.match(result)) {
				return { success: true, data: { user: result.payload } };
			} else {
				throw new Error(result.payload || "Login failed");
			}
		} catch (error) {
			throw error;
		}
	};

	const register = async (userData) => {
		try {
			const result = await dispatch(registerUser(userData));
			if (registerUser.fulfilled.match(result)) {
				return { success: true, data: { user: result.payload } };
			} else {
				throw new Error(result.payload || "Registration failed");
			}
		} catch (error) {
			throw error;
		}
	};

	const logout = async (forceRefresh = true) => {
		try {
			await dispatch(logoutUser(forceRefresh));
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const clearAuthError = () => {
		dispatch(clearError());
	};

	return {
		user,
		isLoading,
		isAuthenticated,
		error: auth.error,
		login,
		register,
		logout,
		clearError: clearAuthError,
	};
};
