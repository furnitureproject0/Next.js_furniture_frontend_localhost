"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { companyAdminApi } from "@/lib/api";
import { ApiError } from "@/lib/api";

export default function CustomerEmailStep({ formData, setFormData, onEmailValid, onCreateUserClick }) {
	const { t } = useTranslation();
	const [email, setEmail] = useState(formData.customerEmail || "");
	const [emailError, setEmailError] = useState("");
	const [isChecking, setIsChecking] = useState(false);
	const [clientInfo, setClientInfo] = useState(formData.clientInfo || null);
	const [isEmailNotFound, setIsEmailNotFound] = useState(false);

	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleEmailChange = (e) => {
		const value = e.target.value;
		setEmail(value);
		setEmailError("");
		setClientInfo(null);
		setIsEmailNotFound(false);
		setFormData((prev) => ({
			...prev,
			customerEmail: value,
			clientInfo: null,
			customerId: null,
			customerName: "",
		}));
	};

	const handleCheckEmail = async () => {
		if (!email.trim()) {
			setEmailError(t("orderSteps.emailRequired") || "Email is required");
			return;
		}

		if (!validateEmail(email)) {
			setEmailError(t("orderSteps.invalidEmail") || "Invalid email format");
			return;
		}

		setIsChecking(true);
		setEmailError("");
		setIsEmailNotFound(false);
		
		try {
			const response = await companyAdminApi.checkClientEmail(email);
			
			if (response?.success && response?.data?.isRegistered) {
				const client = response.data.client;
				const clientData = {
					id: client.id,
					email: client.email,
					name: client.name,
					is_verified: client.is_verified,
				};
				
				setClientInfo(clientData);
				setEmailError("");
				setIsEmailNotFound(false);
				setFormData((prev) => ({
					...prev,
					customerEmail: email,
					customerId: client.id,
					customerName: client.name,
					clientInfo: clientData,
				}));
				
				// Clear any errors on success
				if (onEmailValid) {
					onEmailValid(clientData);
				}
			} else {
				setEmailError(t("orderSteps.emailNotFound") || "Email not found");
				setIsEmailNotFound(true);
				setClientInfo(null);
			}
		} catch (error) {
			console.error("Error checking email:", error);
			setIsEmailNotFound(false);
			if (error instanceof ApiError) {
				const errorMessage = error.data?.message || error.message || "Failed to check email";
				setEmailError(errorMessage);
				// If email already exists error, don't show the "not found" section
				if (errorMessage.toLowerCase().includes("already exists") || 
				    errorMessage.toLowerCase().includes("email already")) {
					setIsEmailNotFound(false);
				}
			} else {
				setEmailError("Failed to check email. Please try again.");
			}
			setClientInfo(null);
		} finally {
			setIsChecking(false);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleCheckEmail();
		}
	};

	return (
		<div className="space-y-4 sm:space-y-5 lg:space-y-6">
			<div>
				<h3 className="text-base sm:text-lg font-semibold text-amber-900 mb-1.5 sm:mb-2">
					{t("orderSteps.enterCustomerEmail")}
				</h3>
				<p className="text-xs sm:text-sm text-amber-700/70">
					{t("orderSteps.enterCustomerEmailDescription")}
				</p>
			</div>

			<div className="space-y-3 sm:space-y-4">
				<div>
					<label className="block text-xs sm:text-sm font-medium text-amber-800 mb-1.5 sm:mb-2">
						{t("orderSteps.customerEmail")} <span className="text-red-500">*</span>
					</label>
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
						<input
							type="email"
							value={email}
							onChange={handleEmailChange}
							onKeyPress={handleKeyPress}
							placeholder={t("orderSteps.emailPlaceholder") || "customer@example.com"}
							className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
							disabled={isChecking || !!clientInfo}
						/>
						{!clientInfo && (
							<button
								type="button"
								onClick={handleCheckEmail}
								disabled={isChecking || !email.trim()}
								className="px-4 sm:px-6 py-2 sm:py-3 btn-primary text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto"
							>
								{isChecking ? (t("common.labels.loading") || "Loading...") : (t("orderSteps.checkEmail") || "Check Email")}
							</button>
						)}
					</div>
					{emailError && (
						<p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600">{emailError}</p>
					)}
				</div>

				{clientInfo && (
					<div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
						<div className="flex items-center gap-2 sm:gap-3">
							<svg
								className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div className="flex-1 min-w-0">
								<p className="text-xs sm:text-sm font-medium text-green-800">
									{t("orderSteps.customerFound") || "Customer Found"}
								</p>
								<p className="text-xs sm:text-sm text-green-700 truncate">
									{clientInfo.name} ({clientInfo.email})
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2 text-xs sm:text-sm text-green-700">
							<span className="font-medium">Email:</span>
							<span>{clientInfo.email}</span>
						</div>
						<div className="flex items-center gap-2 text-xs sm:text-sm text-green-700">
							<span className="font-medium">Name:</span>
							<span>{clientInfo.name}</span>
						</div>
						<div className="flex items-center gap-2 text-xs sm:text-sm text-green-700">
							<span className="font-medium">Verified:</span>
							<span className={`px-2 py-0.5 rounded ${clientInfo.is_verified ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
								{clientInfo.is_verified ? "Yes" : "No"}
							</span>
						</div>
					</div>
				)}

				{isEmailNotFound && (
					<div className="p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
						<p className="text-xs sm:text-sm font-medium text-orange-800 mb-2 sm:mb-3">
							{t("orderSteps.emailNotFoundMessage")}
						</p>
						<button
							type="button"
							onClick={onCreateUserClick}
							className="px-4 sm:px-6 py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
						>
							{t("orderSteps.createUser")}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}


