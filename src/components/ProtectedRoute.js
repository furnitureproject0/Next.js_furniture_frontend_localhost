"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useTranslation } from "@/hooks/useTranslation";

const ProtectedRoute = ({ 
	children, 
	redirectTo = "/login", 
	requiredRoles = [],
	allowedRoles = []
}) => {
	const { t } = useTranslation();
	const { isAuthenticated, isLoading } = useAuth();
	const user = useAppSelector(selectUser);
	const router = useRouter();

	// Normalize user role to handle both dash and underscore formats
	const normalizedUserRole = user?.role?.replace(/_/g, "-");

	// Check if user has required role
	const hasRequiredRole = requiredRoles.length === 0 || 
		(requiredRoles.includes(normalizedUserRole) || requiredRoles.includes(user?.role));

	// Check if user is allowed (inverse of requiredRoles)
	const isAllowed = allowedRoles.length === 0 || 
		(!allowedRoles.includes(normalizedUserRole) && !allowedRoles.includes(user?.role));

	// Determine if user has access
	const hasAccess = hasRequiredRole && isAllowed;

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push(redirectTo);
		} else if (!isLoading && isAuthenticated && !hasAccess) {
			// Redirect to appropriate dashboard based on user role
			const roleDashboardMap = {
				"super-admin": "/super-admin/dashboard",
				"site-admin": "/site-admin/dashboard", 
				"company-admin": "/company-admin/dashboard",
				"company-secretary": "/company-admin/dashboard",
				"client": "/client/dashboard",
				"driver": "/driver/dashboard",
				"worker": "/worker/dashboard"
			};
			
			const userDashboard = roleDashboardMap[normalizedUserRole] || "/login";
			router.push(userDashboard);
		}
	}, [isAuthenticated, isLoading, hasAccess, normalizedUserRole, router, redirectTo]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<LoadingSpinner
						size="lg"
						className="text-primary-500 mx-auto mb-4"
					/>
					<p className="text-gray-600">{t("protectedRoute.loading")}</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated || !hasAccess) {
		return null; // Will redirect
	}

	return children;
};

export default ProtectedRoute;
