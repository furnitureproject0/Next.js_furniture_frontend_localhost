"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDashboardPath } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

function LoadingFallback() {
	const { t } = useTranslation();
	return <div>{t("common.labels.loading")}</div>;
}

function LoginPageContent() {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<LoginForm />
		</Suspense>
	);
}

function LoginForm() {
	const { t } = useTranslation();
	const { login, isLoading, error, clearError } = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get("redirect") || "/";

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error when user starts typing
		if (error) {
			clearError();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.email || !formData.password) {
			return;
		}

		try {
			const data = await login({
				email: formData.email,
				password: formData.password,
			});


			// Check if login was successful and user data exists
			if (data.success && data.data?.user) {
				// Determine redirect destination based on user role or original redirect
				const userRole = data.data.user.role;
				const dashboardPath = getDashboardPath(userRole);

				// If there's a specific redirect parameter and it's not just "/", use it
				// Otherwise, redirect to role-based dashboard
				const finalRedirectPath =
					redirectTo && redirectTo !== "/"
						? redirectTo
						: dashboardPath;

				router.push(finalRedirectPath);
			}
		} catch (error) {
			console.error("Login error:", error);
		}
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
			style={{ background: "#FFF8F3" }}
		>
			{/* Main container */}
			<div className="w-full max-w-md">
				{/* Login card */}
				<div className="bg-white/90 backdrop-blur-sm rounded-lg border border-orange-200/60 p-6 sm:p-8 shadow-xl">
					{/* Logo/Brand area */}
					<div className="text-center mb-6 sm:mb-8">
						<h1 className="text-xl sm:text-2xl font-semibold text-amber-900 mb-2">
							{t("login.title")}
						</h1>
						<p className="text-amber-700 text-xs sm:text-sm">
							{t("login.signInToAccount")}
						</p>
					</div>

					{/* Error message */}
					{error && (
						<div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-600 text-xs sm:text-sm">{error}</p>
						</div>
					)}

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
						<div className="space-y-1.5 sm:space-y-2">
							<label className="text-xs sm:text-sm font-medium text-amber-800 block">
								{t("login.emailAddress")}
							</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleInputChange}
								className="w-full px-3 py-2 text-sm sm:text-base bg-white/80 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors placeholder-amber-400"
								placeholder={t("login.enterEmail")}
								disabled={isLoading}
								required
							/>
						</div>

						<div className="space-y-1.5 sm:space-y-2">
							<label className="text-xs sm:text-sm font-medium text-amber-800 block">
								{t("common.labels.password")}
							</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleInputChange}
								className="w-full px-3 py-2 text-sm sm:text-base bg-white/80 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors placeholder-amber-400"
								placeholder={t("login.enterPassword")}
								disabled={isLoading}
								required
							/>
						</div>

						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
							<label className="flex items-center">
								<input
									type="checkbox"
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
								/>
								<span className="ml-2 text-gray-600">
									{t("login.rememberMe")}
								</span>
							</label>
							<a
								href="#"
								className="text-orange-600 hover:text-orange-700 font-medium"
							>
								{t("login.forgotPassword")}
							</a>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full cursor-pointer btn-primary py-2.5 sm:py-2 px-4 rounded-md text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
						>
							{isLoading && (
								<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							)}
							<span>
								{isLoading ? t("common.labels.signingIn") : t("common.labels.signIn")}
							</span>
						</button>
					</form>

					{/* Footer */}
					<div className="mt-6 sm:mt-8 text-center">
						<p className="text-amber-700 text-xs sm:text-sm">
							{t("login.dontHaveAccount")}{" "}
							<a
								href="#"
								className="text-orange-600 hover:text-orange-700 font-medium"
							>
								{t("login.contactAdministrator")}
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return <LoginPageContent />;
}
