"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import { companyAdminApi } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { useState } from "react";

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
	const { t } = useTranslation();
	const user = useAppSelector(selectUser);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiError, setApiError] = useState("");

	if (!isOpen) return null;

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = t("createUser.nameRequired");
		}

		if (!formData.email.trim()) {
			newErrors.email = t("createUser.emailRequired");
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				newErrors.email = t("createUser.invalidEmail");
			}
		}

		/* if (!formData.phone.trim()) {
			newErrors.phone = t("createUser.phoneRequired");
		} */

		/* if (!formData.birthdate) {
			newErrors.birthdate = t("createUser.birthdateRequired");
		} */

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		// Get company ID from user
		// const companyId = user?.company_id || user?.companyId;
		// if (!companyId) {
		// 	setApiError("Company ID not found. Please contact support.");
		// 	return;
		// }

		setIsSubmitting(true);
		setApiError("");
		setErrors({});

		try {
			// Prepare client data according to API format
			const clientData = {
				name: formData.name.trim(),
				email: formData.email.trim().toLowerCase(),
				phones: formData.phone.trim() ? [formData.phone.trim()] : [],
			};

			const response = await companyAdminApi.createClient(1, clientData);

			if (response?.success && response?.data) {
				const createdClient = response.data;
				
				// Format user data for callback
				const newUser = {
					id: createdClient.id,
					name: createdClient.name,
					email: createdClient.email,
					phone: createdClient.phones?.[0]?.phone || formData.phone.trim(),
					role: createdClient.role || "client",
					birthdate: createdClient.birthdate,
					is_verified: createdClient.is_verified,
				};

				// Clear any errors on success
				setApiError("");
				setErrors({});

				if (onUserCreated) {
					onUserCreated(newUser);
				}

				// Reset form
				setFormData({
					name: "",
					email: "",
					phone: "",
				});
				setIsSubmitting(false);
				onClose();
			} else {
				setApiError(response?.message || "Failed to create client. Please try again.");
				setIsSubmitting(false);
			}
		} catch (error) {
			console.error("Error creating client:", error);
			setIsSubmitting(false);
			
			if (error instanceof ApiError) {
				// Extract field-specific errors from API response
				const apiErrors = error.data?.errors || {};
				const fieldErrors = {};
				
				// Map API error fields to form fields
				Object.keys(apiErrors).forEach(field => {
					const errorMessages = apiErrors[field];
					if (Array.isArray(errorMessages) && errorMessages.length > 0) {
						// Use the first error message for each field
						fieldErrors[field] = errorMessages[0];
					} else if (typeof errorMessages === 'string') {
						fieldErrors[field] = errorMessages;
					}
				});
				
				// Set field-specific errors
				if (Object.keys(fieldErrors).length > 0) {
					setErrors(fieldErrors);
					// Clear generic API error if we have field-specific errors
					setApiError("");
				} else {
					// Fallback to generic error message if no field-specific errors
					const errorMessage = error.data?.message || error.message || "Failed to create client. Please try again.";
					setApiError(errorMessage);
					
					// If email already exists, show specific error
					if (errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("exist")) {
						setErrors({ email: errorMessage });
					}
				}
			} else {
				setApiError("Failed to create client. Please try again.");
			}
		}
	};

	const handleClose = () => {
		setFormData({
			name: "",
			email: "",
			phone: "",
		});
		setErrors({});
		onClose();
	};

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
			<div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 border-b border-orange-100">
					<div className="flex-1 min-w-0 pr-2">
						<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 truncate">
							{t("createUser.title")}
						</h2>
						<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1 truncate">
							{t("createUser.subtitle")}
						</p>
					</div>
					<button
						onClick={handleClose}
						className="p-1.5 sm:p-2 hover:bg-orange-50 rounded-lg transition-colors flex-shrink-0"
					>
						<svg
							className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
					{/* API Error - Only show if no field-specific errors */}
					{apiError && Object.keys(errors).length === 0 && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-sm text-red-600">{apiError}</p>
						</div>
					)}
					{/* Name */}
					<div>
						<label className="block text-sm font-medium text-amber-800 mb-2">
							{t("createUser.name")} <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={formData.name}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
							placeholder={t("createUser.namePlaceholder")}
							className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ${
								errors.name ? "border-red-300" : "border-orange-200"
							}`}
						/>
						{errors.name && (
							<p className="mt-1 text-sm text-red-600">{errors.name}</p>
						)}
					</div>

					{/* Email */}
					<div>
						<label className="block text-sm font-medium text-amber-800 mb-2">
							{t("createUser.email")} <span className="text-red-500">*</span>
						</label>
						<input
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, email: e.target.value }))
							}
							placeholder={t("createUser.emailPlaceholder")}
							className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ${
								errors.email ? "border-red-300" : "border-orange-200"
							}`}
						/>
						{errors.email && (
							<p className="mt-1 text-sm text-red-600">{errors.email}</p>
						)}
					</div>

					{/* Phone */}
					<div>
						<label className="block text-sm font-medium text-amber-800 mb-2">
							{t("createUser.phone")}
						</label>
						<input
							type="tel"
							value={formData.phone}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, phone: e.target.value }))
							}
							placeholder={t("createUser.phonePlaceholder")}
							className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ${
								errors.phone ? "border-red-300" : "border-orange-200"
							}`}
						/>
						{errors.phone && (
							<p className="mt-1 text-sm text-red-600">{errors.phone}</p>
						)}
					</div>



					{/* Footer */}
					<div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-orange-100">
						<button
							type="button"
							onClick={handleClose}
							className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors"
						>
							{t("common.buttons.cancel")}
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						>
							{isSubmitting
								? t("common.labels.loading")
								: t("createUser.createButton")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

