"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

/**
 * Custom hook to handle role-based redirects
 * @param {string|string[]} allowedRoles - Single role or array of roles allowed to access the page
 * @param {string} redirectTo - Optional custom redirect path for unauthorized users
 * @returns {object} - { isLoading, isAuthorized, user }
 */
export const useRoleRedirect = (
	allowedRoles,
	redirectTo = "/login",
	forceRefresh = true,
) => {
	const { user, isLoading, isAuthenticated } = useAuth();
	const router = useRouter();

	// Normalize allowedRoles to array
	const rolesArray = Array.isArray(allowedRoles)
		? allowedRoles
		: [allowedRoles];

	// Check if user role matches any allowed role (handle both formats: dash and underscore)
	const isAuthorized =
		user?.role &&
		rolesArray.some((role) => {
			const userRole = user.role;
			const normalizedRole = role.replace(/-/g, "_");
			const normalizedUserRole = userRole.replace(/-/g, "_");
			return userRole === role || normalizedUserRole === normalizedRole;
		});

	const handleRedirect = useCallback(
		(path) => {
			if (forceRefresh && typeof window !== "undefined") {
				window.location.href = path;
			} else {
				router.push(path);
			}
		},
		[forceRefresh, router],
	);

	useEffect(() => {
		if (!isLoading) {
			if (!isAuthenticated) {
				handleRedirect("/login");
			} else if (!isAuthorized) {
				// Redirect to appropriate dashboard based on user's actual role
				const userRole = user?.role;

				switch (userRole) {
					case "super-admin":
					case "super_admin":
						handleRedirect("/super-admin/dashboard");
						break;
					case "site-admin":
					case "site_admin":
						handleRedirect("/site-admin/dashboard");
						break;
					case "company-admin":
					case "company_admin":
						handleRedirect("/company-admin/dashboard");
						break;
					case "client":
					case "customer":
						handleRedirect("/client/dashboard");
						break;
					case "driver":
						handleRedirect("/driver/dashboard");
						break;
					case "worker":
						handleRedirect("/worker/dashboard");
						break;
					default:
						handleRedirect(redirectTo);
				}
			}
		}
	}, [
		user,
		isLoading,
		isAuthenticated,
		isAuthorized,
		handleRedirect,
		redirectTo,
	]);

	return {
		isLoading,
		isAuthorized: isAuthenticated && isAuthorized,
		user,
	};
};

/**
 * Hook specifically for the main page redirect logic
 */
export const useMainPageRedirect = (forceRefresh = true) => {
	const { user, isLoading, isAuthenticated } = useAuth();
	const router = useRouter();

	const handleRedirect = useCallback(
		(path) => {
			if (forceRefresh && typeof window !== "undefined") {
				window.location.href = path;
			} else {
				router.push(path);
			}
		},
		[forceRefresh, router],
	);

	useEffect(() => {
		if (!isLoading) {
			if (!isAuthenticated) {
				handleRedirect("/login");
			} else if (user?.role) {
				// User is authenticated, redirect based on role
				switch (user.role) {
					case "super-admin":
					case "super_admin":
						handleRedirect("/super-admin/dashboard");
						break;
					case "site-admin":
					case "site_admin":
						handleRedirect("/site-admin/dashboard");
						break;
					case "company-admin":
					case "company_admin":
						handleRedirect("/company-admin/dashboard");
						break;
					case "client":
					case "customer":
						handleRedirect("/client/dashboard");
						break;
					case "driver":
						handleRedirect("/driver/dashboard");
						break;
					case "worker":
						handleRedirect("/worker/dashboard");
						break;
					default:
						handleRedirect("/login");
				}
			}
		}
	}, [user, isLoading, isAuthenticated, handleRedirect]);

	return { isLoading };
};
