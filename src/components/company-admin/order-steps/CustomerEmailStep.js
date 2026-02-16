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

	const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	const handleEmailChange = (e) => {
		const value = e.target.value;
		setEmail(value);
		setEmailError("");
		setClientInfo(null);
		setIsEmailNotFound(false);
		setFormData((prev) => ({ ...prev, customerEmail: value, clientInfo: null, customerId: null, customerName: "" }));
	};

	const handleCheckEmail = async () => {
		if (!email.trim()) { setEmailError(t("orderSteps.emailRequired") || "Email is required"); return; }
		if (!validateEmail(email)) { setEmailError(t("orderSteps.invalidEmail") || "Invalid email format"); return; }

		setIsChecking(true);
		setEmailError("");
		setIsEmailNotFound(false);

		try {
			const response = await companyAdminApi.checkClientEmail(email);
			if (response?.success && response?.data?.isRegistered) {
				const client = response.data.client;
				const clientData = { id: client.id, email: client.email, name: client.name, is_verified: client.is_verified };
				setClientInfo(clientData);
				setEmailError("");
				setIsEmailNotFound(false);
				setFormData((prev) => ({ ...prev, customerEmail: email, customerId: client.id, customerName: client.name, clientInfo: clientData }));
				if (onEmailValid) onEmailValid(clientData);
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
				if (errorMessage.toLowerCase().includes("already exists") || errorMessage.toLowerCase().includes("email already")) setIsEmailNotFound(false);
			} else {
				setEmailError("Failed to check email. Please try again.");
			}
			setClientInfo(null);
		} finally {
			setIsChecking(false);
		}
	};

	return (
		<div className="space-y-3">
			{/* Email Input */}
			<div>
				<label className="block text-xs font-medium text-gray-600 mb-1">
					{t("orderSteps.customerEmail") || "Customer Email"} <span className="text-red-500">*</span>
				</label>
				<div className="flex gap-2">
					<input
						type="email"
						value={email}
						onChange={handleEmailChange}
						onKeyPress={(e) => e.key === "Enter" && handleCheckEmail()}
						placeholder="customer@example.com"
						className="flex-1 px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 placeholder-gray-400"
						disabled={isChecking || !!clientInfo}
					/>
					{!clientInfo && (
						<button
							type="button"
							onClick={handleCheckEmail}
							disabled={isChecking || !email.trim()}
							className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
						>
							{isChecking ? "Checking…" : "Check"}
						</button>
					)}
				</div>
				{emailError && <p className="mt-1 text-[11px] text-red-600">{emailError}</p>}
			</div>

			{/* Found Customer — simple table row */}
			{clientInfo && (
				<table className="w-full text-xs border border-gray-200 rounded-md overflow-hidden">
					<tbody>
						<tr className="bg-green-50">
							<td className="px-2.5 py-1.5 text-gray-500 font-medium w-20 border-r border-gray-200">Name</td>
							<td className="px-2.5 py-1.5 text-gray-800">{clientInfo.name}</td>
						</tr>
						<tr className="border-t border-gray-200">
							<td className="px-2.5 py-1.5 text-gray-500 font-medium border-r border-gray-200">Email</td>
							<td className="px-2.5 py-1.5 text-gray-800">{clientInfo.email}</td>
						</tr>
						<tr className="border-t border-gray-200">
							<td className="px-2.5 py-1.5 text-gray-500 font-medium border-r border-gray-200">Verified</td>
							<td className="px-2.5 py-1.5">
								<span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${clientInfo.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
									{clientInfo.is_verified ? "Yes" : "No"}
								</span>
							</td>
						</tr>
					</tbody>
				</table>
			)}

			{/* Not found — create */}
			{isEmailNotFound && (
				<div className="flex items-center gap-2">
					<span className="text-xs text-gray-500">{t("orderSteps.emailNotFoundMessage") || "Not found."}</span>
					<button type="button" onClick={onCreateUserClick} className="text-xs font-medium text-gray-800 underline hover:text-gray-600">
						{t("orderSteps.createUser") || "Create customer"}
					</button>
				</div>
			)}
		</div>
	);
}
