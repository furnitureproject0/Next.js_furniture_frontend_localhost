"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { companyAdminApi, ApiError } from "@/lib/api";

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }) {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const user = useAppSelector(selectUser);
	
	const [step, setStep] = useState("choice"); // "choice", "create", "invite"
	const [formData, setFormData] = useState({
		// Create new user fields
		name: "",
		email: "",
		birthdate: "",
		phone: "",
		role: "worker",
		hourlyRate: "",
		currency: "CHF",
		startDate: "",
		// Invite existing user fields
		inviteEmail: "",
		inviteHourlyRate: "",
		inviteCurrency: "CHF",
		inviteStartDate: "",
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!isOpen) return null;

	// Reset modal state
	const handleClose = () => {
		setStep("choice");
		setFormData({
			name: "",
			email: "",
			birthdate: "",
			phone: "",
			role: "worker",
			hourlyRate: "",
			currency: "CHF",
			startDate: "",
			inviteEmail: "",
			inviteHourlyRate: "",
			inviteCurrency: "CHF",
			inviteStartDate: "",
		});
		setErrors({});
		setIsSubmitting(false);
		onClose();
	};

	// Validate create form
	const validateCreateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = t("users.nameRequired") || "Name is required";
		}

		if (!formData.email.trim()) {
			newErrors.email = t("users.emailRequired") || "Email is required";
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				newErrors.email = t("users.invalidEmail") || "Invalid email format";
			}
		}

		if (!formData.birthdate) {
			newErrors.birthdate = t("users.birthdateRequired") || "Birthdate is required";
		}

		if (!formData.phone.trim()) {
			newErrors.phone = t("users.phoneRequired") || "Phone is required";
		}

		// Validate hourly rate for workers and drivers
		if (formData.role === "worker" || formData.role === "driver") {
			if (!formData.hourlyRate) {
				newErrors.hourlyRate = t("users.hourlyRateRequired") || "Hourly rate is required for workers and drivers";
			} else if (parseFloat(formData.hourlyRate) <= 0) {
				newErrors.hourlyRate = t("users.hourlyRatePositive") || "Hourly rate must be positive";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Validate invite form
	const validateInviteForm = () => {
		const newErrors = {};

		if (!formData.inviteEmail.trim()) {
			newErrors.inviteEmail = t("users.emailRequired") || "Email is required";
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.inviteEmail)) {
				newErrors.inviteEmail = t("users.invalidEmail") || "Invalid email format";
			}
		}

		if (!formData.inviteHourlyRate) {
			newErrors.inviteHourlyRate = t("users.hourlyRateRequired") || "Hourly rate is required";
		} else if (parseFloat(formData.inviteHourlyRate) <= 0) {
			newErrors.inviteHourlyRate = t("users.hourlyRatePositive") || "Hourly rate must be positive";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle create new user submission
	const handleCreateSubmit = async (e) => {
		e.preventDefault();

		if (!validateCreateForm()) {
			return;
		}

		const companyId = user?.company_id;
		if (!companyId) {
			toast.error(t("users.companyIdMissing") || "Company ID not found");
			return;
		}

		setIsSubmitting(true);
		setErrors({});

		try {
			// Prepare payload according to backend schema
			const payload = {
				name: formData.name.trim(),
				email: formData.email.trim().toLowerCase(),
				birthdate: formData.birthdate,
				phones: [formData.phone.trim()],
				role: formData.role,
			};

			// Add hourly rate fields for workers and drivers
			if (formData.role === "worker" || formData.role === "driver") {
				payload.hourly_rate = parseFloat(formData.hourlyRate);
				payload.currency = formData.currency;
				if (formData.startDate) {
					payload.start_date = formData.startDate;
				}
			}

			const response = await companyAdminApi.addCompanyEmployee(companyId, payload);

			if (response?.success) {
				toast.success(response.message || t("users.employeeCreated") || "Employee created successfully");
				onSuccess();
				handleClose();
			} else {
				toast.error(response?.message || t("users.createFailed") || "Failed to create employee");
			}
		} catch (error) {
			console.error("Error creating employee:", error);
			
			if (error instanceof ApiError) {
				// Handle field-specific errors
				if (error.data?.errors) {
					const fieldErrors = {};
					Object.keys(error.data.errors).forEach(field => {
						const messages = error.data.errors[field];
						if (Array.isArray(messages) && messages.length > 0) {
							fieldErrors[field] = messages[0];
						} else if (typeof messages === "string") {
							fieldErrors[field] = messages;
						}
					});
					
					if (Object.keys(fieldErrors).length > 0) {
						setErrors(fieldErrors);
					} else {
						toast.error(error.message || t("users.createFailed") || "Failed to create employee");
					}
				} else {
					toast.error(error.message || t("users.createFailed") || "Failed to create employee");
				}
			} else {
				toast.error(t("users.createFailed") || "Failed to create employee");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle invite existing user submission
	const handleInviteSubmit = async (e) => {
		e.preventDefault();

		if (!validateInviteForm()) {
			return;
		}

		const companyId = user?.company_id;
		if (!companyId) {
			toast.error(t("users.companyIdMissing") || "Company ID not found");
			return;
		}

		setIsSubmitting(true);
		setErrors({});

		try {
			// Prepare payload according to backend schema
			const payload = {
				email: formData.inviteEmail.trim().toLowerCase(),
				hourly_rate: parseFloat(formData.inviteHourlyRate),
				currency: formData.inviteCurrency,
			};

			if (formData.inviteStartDate) {
				payload.start_date = formData.inviteStartDate;
			}

			const response = await companyAdminApi.inviteExistingEmployee(companyId, payload);

			if (response?.success) {
				toast.success(response.message || t("users.inviteSent") || "Employment invitation sent successfully");
				onSuccess();
				handleClose();
			} else {
				toast.error(response?.message || t("users.inviteFailed") || "Failed to invite employee");
			}
		} catch (error) {
			console.error("Error inviting employee:", error);
			
			if (error instanceof ApiError) {
				// Handle field-specific errors
				if (error.data?.errors) {
					const fieldErrors = {};
					Object.keys(error.data.errors).forEach(field => {
						const messages = error.data.errors[field];
						if (Array.isArray(messages) && messages.length > 0) {
							fieldErrors[field] = messages[0];
						} else if (typeof messages === "string") {
							fieldErrors[field] = messages;
						}
					});
					
					if (Object.keys(fieldErrors).length > 0) {
						// Map invite fields
						const mappedErrors = {};
						Object.keys(fieldErrors).forEach(key => {
							mappedErrors[`invite${key.charAt(0).toUpperCase()}${key.slice(1)}`] = fieldErrors[key];
						});
						setErrors(mappedErrors);
					} else {
						toast.error(error.message || t("users.inviteFailed") || "Failed to invite employee");
					}
				} else {
					toast.error(error.message || t("users.inviteFailed") || "Failed to invite employee");
				}
			} else {
				toast.error(t("users.inviteFailed") || "Failed to invite employee");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	// Render choice screen
	const renderChoiceScreen = () => (
		<div className="p-6 sm:p-8 space-y-6">
			<div className="text-center mb-6">
				<h3 className="text-lg font-semibold text-amber-900 mb-2">
					{t("users.chooseOption") || "Choose an option"}
				</h3>
				<p className="text-sm text-amber-700/70">
					{t("users.chooseDescription") || "Would you like to create a new user or invite an existing one?"}
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{/* Create New User */}
				<button
					onClick={() => setStep("create")}
					className="p-6 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all duration-200 bg-white group"
				>
					<div className="flex flex-col items-center text-center space-y-3">
						<div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
							</svg>
						</div>
						<div>
							<h4 className="font-semibold text-amber-900 mb-1">
								{t("users.createNewUser") || "Create New User"}
							</h4>
							<p className="text-xs text-amber-700/70">
								{t("users.createNewDescription") || "Create a brand new employee account"}
							</p>
						</div>
					</div>
				</button>

				{/* Invite Existing User */}
				<button
					onClick={() => setStep("invite")}
					className="p-6 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all duration-200 bg-white group"
				>
					<div className="flex flex-col items-center text-center space-y-3">
						<div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
						</div>
						<div>
							<h4 className="font-semibold text-amber-900 mb-1">
								{t("users.inviteExisting") || "Invite Existing User"}
							</h4>
							<p className="text-xs text-amber-700/70">
								{t("users.inviteExistingDescription") || "Send an employment offer to an existing worker or driver"}
							</p>
						</div>
					</div>
				</button>
			</div>
		</div>
	);

	// Render create form
	const renderCreateForm = () => (
		<form onSubmit={handleCreateSubmit} className="p-4 sm:p-6 space-y-4">
			{/* Name */}
			<div>
				<label className="block text-sm font-medium text-amber-800 mb-2">
					{t("users.name") || "Name"} <span className="text-red-500">*</span>
				</label>
				<input
					type="text"
					value={formData.name}
					onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
					className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ${
						errors.name ? "border-red-300" : "border-orange-200"
					}`}
					placeholder={t("users.namePlaceholder") || "John Doe"}
				/>
				{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
			</div>

			{/* Email */}
			<div>
				<label className="block text-sm font-medium text-amber-800 mb-2">
					{t("users.email") || "Email"} <span className="text-red-500">*</span>
				</label>
				<input
					type="email"
					value={formData.email}
					onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
					className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ${
						errors.email ? "border-red-300" : "border-orange-200"
					}`}
					placeholder="john@example.com"
				/>
				{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
			</div>

			{/* Birthdate */}
			<div>
				<label className="block text-sm font-medium text-amber-800 mb-2">
					{t("users.birthdate") || "Birthdate"} <span className="text-red-500">*</span>
				</label>
				<input
					type="date"
					value={formData.birthdate}
					onChange={(e) => setFormData(prev => ({ ...prev, birthdate: e.target.value }))}
					className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ${
						errors.birthdate ? "border-red-300" : "border-orange-200"
					}`}
				/>
				{errors.birthdate && <p className="mt-1 text-sm text-red-600">{errors.birthdate}</p>}
			</div>

			{/* Phone */}
			<div>
				<label className="block text-sm font-medium text-amber-800 mb-2">
					{t("users.phone") || "Phone"} <span className="text-red-500">*</span>
				</label>
				<input
					type="tel"
					value={formData.phone}
					onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
					className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ${
						errors.phone ? "border-red-300" : "border-orange-200"
					}`}
					placeholder="+41 XX XXX XX XX"
				/>
				{errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
			</div>

			{/* Role */}
			<div>
				<label className="block text-sm font-medium text-amber-800 mb-2">
					{t("users.role") || "Role"} <span className="text-red-500">*</span>
				</label>
				<select
					value={formData.role}
					onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
					className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
				>
					<option value="worker">{t("users.worker") || "Worker"}</option>
					<option value="driver">{t("users.driver") || "Driver"}</option>
					<option value="company_secretary">{t("users.secretary") || "Secretary"}</option>
				</select>
			</div>

			{/* Conditional fields for workers and drivers */}
			{(formData.role === "worker" || formData.role === "driver") && (
				<>
					{/* Hourly Rate */}
					<div>
						<label className="block text-sm font-medium text-amber-800 mb-2">
							{t("users.hourlyRate") || "Hourly Rate"} <span className="text-red-500">*</span>
						</label>
						<div className="flex gap-2">
							<input
								type="number"
								step="0.01"
								min="0"
								value={formData.hourlyRate}
								onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
								className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ${
									errors.hourlyRate ? "border-red-300" : "border-orange-200"
								}`}
								placeholder="25.50"
							/>
							<select
								value={formData.currency}
								onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
								className="px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
							>
								<option value="CHF">CHF</option>
								<option value="EUR">EUR</option>
								<option value="USD">USD</option>
							</select>
						</div>
						{errors.hourlyRate && <p className="mt-1 text-sm text-red-600">{errors.hourlyRate}</p>}
					</div>

					{/* Start Date */}
					<div>
						<label className="block text-sm font-medium text-amber-800 mb-2">
							{t("users.startDate") || "Start Date"} <span className="text-gray-500 text-xs">(Optional)</span>
						</label>
						<input
							type="date"
							value={formData.startDate}
							onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
							className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
						/>
					</div>
				</>
			)}

			{/* Actions */}
			<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-orange-100">
				<button
					type="button"
					onClick={() => setStep("choice")}
					className="flex-1 px-4 py-2 text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors"
				>
					{t("common.buttons.back") || "Back"}
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					className="flex-1 px-4 py-2 text-sm btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
				>
					{isSubmitting ? (t("common.labels.loading") || "Creating...") : (t("users.createButton") || "Create Employee")}
				</button>
			</div>
		</form>
	);

	// Render invite form
	const renderInviteForm = () => (
		<form onSubmit={handleInviteSubmit} className="p-4 sm:p-6 space-y-4">
			{/* Info Note */}
			<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
				<div className="flex gap-3">
					<svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div className="text-sm text-blue-800">
						<p className="font-medium mb-1">{t("users.inviteNote") || "Important Note"}</p>
						<p>{t("users.inviteNoteDescription") || "The user must already exist in the system as a worker or driver. They will receive a pending employment offer that they can accept or reject."}</p>
					</div>
				</div>
			</div>

			{/* Email */}
			<div>
				<label className="block text-sm font-medium text-amber-800 mb-2">
					{t("users.email") || "Email"} <span className="text-red-500">*</span>
				</label>
				<input
					type="email"
					value={formData.inviteEmail}
					onChange={(e) => setFormData(prev => ({ ...prev, inviteEmail: e.target.value }))}
					className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ${
						errors.inviteEmail ? "border-red-300" : "border-orange-200"
					}`}
					placeholder="existing-user@example.com"
				/>
				{errors.inviteEmail && <p className="mt-1 text-sm text-red-600">{errors.inviteEmail}</p>}
			</div>

			{/* Hourly Rate */}
			<div>
				<label className="block text-sm font-medium text-amber-800 mb-2">
					{t("users.hourlyRate") || "Hourly Rate"} <span className="text-red-500">*</span>
				</label>
				<div className="flex gap-2">
					<input
						type="number"
						step="0.01"
						min="0"
						value={formData.inviteHourlyRate}
						onChange={(e) => setFormData(prev => ({ ...prev, inviteHourlyRate: e.target.value }))}
						className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ${
							errors.inviteHourlyRate ? "border-red-300" : "border-orange-200"
						}`}
						placeholder="25.50"
					/>
					<select
						value={formData.inviteCurrency}
						onChange={(e) => setFormData(prev => ({ ...prev, inviteCurrency: e.target.value }))}
						className="px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
					>
						<option value="CHF">CHF</option>
						<option value="EUR">EUR</option>
						<option value="USD">USD</option>
					</select>
				</div>
				{errors.inviteHourlyRate && <p className="mt-1 text-sm text-red-600">{errors.inviteHourlyRate}</p>}
			</div>

			{/* Start Date */}
			<div>
				<label className="block text-sm font-medium text-amber-800 mb-2">
					{t("users.startDate") || "Start Date"} <span className="text-gray-500 text-xs">(Optional)</span>
				</label>
				<input
					type="date"
					value={formData.inviteStartDate}
					onChange={(e) => setFormData(prev => ({ ...prev, inviteStartDate: e.target.value }))}
					className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
				/>
			</div>

			{/* Actions */}
			<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-orange-100">
				<button
					type="button"
					onClick={() => setStep("choice")}
					className="flex-1 px-4 py-2 text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors"
				>
					{t("common.buttons.back") || "Back"}
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					className="flex-1 px-4 py-2 text-sm btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
				>
					{isSubmitting ? (t("common.labels.loading") || "Sending...") : (t("users.inviteButton") || "Send Invitation")}
				</button>
			</div>
		</form>
	);

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
			<div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 border-b border-orange-100">
					<div className="flex-1 min-w-0 pr-2">
						<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 truncate">
							{step === "choice" && (t("users.addEmployee") || "Add Employee")}
							{step === "create" && (t("users.createNewUser") || "Create New User")}
							{step === "invite" && (t("users.inviteExisting") || "Invite Existing User")}
						</h2>
						<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1 truncate">
							{step === "choice" && (t("users.addEmployeeSubtitle") || "Add a new employee to your company")}
							{step === "create" && (t("users.createNewSubtitle") || "Create a brand new employee account")}
							{step === "invite" && (t("users.inviteExistingSubtitle") || "Send an employment offer to an existing user")}
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

				{/* Content */}
				{step === "choice" && renderChoiceScreen()}
				{step === "create" && renderCreateForm()}
				{step === "invite" && renderInviteForm()}
			</div>
		</div>
	);
}
