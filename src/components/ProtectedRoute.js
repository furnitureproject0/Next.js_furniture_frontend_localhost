"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useTranslation } from "@/hooks/useTranslation";

const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
	const { t } = useTranslation();
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push(redirectTo);
		}
	}, [isAuthenticated, isLoading, router, redirectTo]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<LoadingSpinner
						size="lg"
						className="text-amber-500 mx-auto mb-4"
					/>
					<p className="text-gray-600">{t("protectedRoute.loading")}</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null; // Will redirect
	}

	return children;
};

export default ProtectedRoute;
