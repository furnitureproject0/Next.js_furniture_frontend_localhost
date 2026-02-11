"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { companyAdminApi, ApiError } from "@/lib/api";
import { addRateHistory, getRateHistory } from "@/lib/rateHistory";

export default function EditEmployeeModal({ isOpen, onClose, onSuccess, employment }) {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const user = useAppSelector(selectUser);
	
	const [formData, setFormData] = useState({
		hourlyRate: "",
		currency: "CHF",
		startDate: "",
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [rateHistory, setRateHistory] = useState([]);

	// Load employment data when modal opens
	useEffect(() => {
		if (isOpen && employment) {
			setFormData({
				hourlyRate: employment.hourly_rate || "",
				currency: employment.currency || "CHF",
				startDate: employment.start_date ? new Date(employment.start_date).toISOString().split('T')[0] : "",
			});
			// Load rate history
			setRateHistory(getRateHistory(employment.id));
		}
	}, [isOpen, employment]);

	if (!isOpen || !employment) return null;

	const handleClose = () => {
		setFormData({
			hourlyRate: "",
			currency: "CHF",
			startDate: "",
		});
		setErrors({});
		setShowHistory(false);
		onClose();
	};

	const validateForm = () => {
		const newErrors = {};

		if (formData.hourlyRate && isNaN(parseFloat(formData.hourlyRate))) {
			newErrors.hourlyRate = t("users.edit.errors.invalidRate");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!validateForm()) return;

		setIsSubmitting(true);
		setErrors({});

		try {
			const payload = {};
			
			// Only include changed fields
			if (formData.hourlyRate !== (employment.hourly_rate || "")) {
				payload.hourly_rate = parseFloat(formData.hourlyRate) || null;
				
				// Save rate history if rate changed
				if (employment.hourly_rate !== payload.hourly_rate) {
					addRateHistory(employment.id, {
						old_rate: employment.hourly_rate,
						new_rate: payload.hourly_rate,
						currency: formData.currency,
						changed_by: user?.name || user?.email,
						changed_at: new Date().toISOString(),
					});
				}
			}
			
			if (formData.currency !== (employment.currency || "CHF")) {
				payload.currency = formData.currency;
			}
			
			if (formData.startDate) {
				const newStartDate = new Date(formData.startDate).toISOString();
				const employmentStartDate = employment.start_date ? new Date(employment.start_date).toISOString() : null;
				if (newStartDate !== employmentStartDate) {
					payload.start_date = newStartDate;
				}
			}

			// Only make API call if there are changes
			if (Object.keys(payload).length === 0) {
				toast.info(t("users.edit.noChanges"));
				handleClose();
				return;
			}

			await companyAdminApi.updateEmployment(
				user.company_id,
				employment.id,
				payload
			);

			toast.success(t("users.edit.success"));
			onSuccess();
			handleClose();
		} catch (error) {
			console.error("Error updating employment:", error);
			
			if (error instanceof ApiError) {
				if (error.data?.errors) {
					// Handle field-specific errors
					const fieldErrors = {};
					error.data.errors.forEach((err) => {
						const field = err.path;
						fieldErrors[field] = err.msg;
					});
					setErrors(fieldErrors);
				} else {
					toast.error(error.message || t("users.edit.errorGeneric"));
				}
			} else {
				toast.error(t("users.edit.errorGeneric"));
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const isPending = employment.status === "pending";
	const isActive = employment.status === "active";

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
				<div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
					<h2 className="text-xl font-semibold text-gray-900">
						{t("users.edit.title")}
					</h2>
					<button
						onClick={handleClose}
						className="text-gray-400 hover:text-gray-500"
					>
						<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="p-6">
					{/* Employee Info */}
					<div className="mb-6 p-4 bg-gray-50 rounded-lg">
						<h3 className="text-sm font-medium text-gray-700 mb-2">
							{t("users.edit.employeeInfo")}
						</h3>
						<div className="space-y-1 text-sm">
							<p><span className="font-medium">{t("users.name")}:</span> {employment.employee?.name}</p>
							<p><span className="font-medium">{t("users.email")}:</span> {employment.employee?.email}</p>
							<p><span className="font-medium">{t("users.role")}:</span> {employment.employee?.role}</p>
							<p>
								<span className="font-medium">{t("users.status")}:</span>{" "}
								<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
									employment.status === "active" ? "bg-green-100 text-green-800" :
									employment.status === "pending" ? "bg-yellow-100 text-yellow-800" :
									"bg-gray-100 text-gray-800"
								}`}>
									{employment.status}
								</span>
							</p>
						</div>
					</div>

					{!isPending && (
						<div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
							<p className="text-sm text-yellow-800">
								{t("users.edit.warningActiveEdit")}
							</p>
						</div>
					)}

					{/* Edit Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								{t("users.hourlyRate")}
							</label>
							<input
								type="number"
								step="0.01"
								value={formData.hourlyRate}
								onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.hourlyRate ? "border-red-500" : "border-gray-300"
								}`}
								placeholder="25.00"
								disabled={!isPending}
							/>
							{errors.hourlyRate && (
								<p className="mt-1 text-sm text-red-600">{errors.hourlyRate}</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								{t("users.currency")}
							</label>
							<select
								value={formData.currency}
								onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								disabled={!isPending}
							>
								<option value="CHF">CHF</option>
								<option value="EUR">EUR</option>
								<option value="USD">USD</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								{t("users.startDate")}
							</label>
							<input
								type="date"
								value={formData.startDate}
								onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								disabled={!isPending}
							/>
						</div>

						{/* Rate History Section */}
						{rateHistory.length > 0 && (
							<div className="pt-4 border-t">
								<button
									type="button"
									onClick={() => setShowHistory(!showHistory)}
									className="flex items-center justify-between w-full text-left"
								>
									<span className="text-sm font-medium text-gray-700">
										{t("users.edit.rateHistory")} ({rateHistory.length})
									</span>
									<svg
										className={`w-5 h-5 text-gray-400 transition-transform ${
											showHistory ? "rotate-180" : ""
										}`}
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								</button>

								{showHistory && (
									<div className="mt-3 space-y-2">
										{rateHistory.map((entry) => (
											<div
												key={entry.id}
												className="p-3 bg-gray-50 rounded-lg text-sm"
											>
												<div className="flex justify-between items-start">
													<div>
														<p className="font-medium text-gray-900">
															{entry.old_rate ? `${entry.old_rate} ${entry.currency}` : t("users.edit.noRate")} 
															{" → "}
															{entry.new_rate ? `${entry.new_rate} ${entry.currency}` : t("users.edit.noRate")}
														</p>
														<p className="text-gray-600 mt-1">
															{t("users.edit.changedBy")}: {entry.changed_by}
														</p>
													</div>
													<time className="text-gray-500 text-xs">
														{new Date(entry.changed_at).toLocaleDateString()}
													</time>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}

						{/* Action Buttons */}
						<div className="flex justify-end gap-3 pt-4 border-t">
							<button
								type="button"
								onClick={handleClose}
								className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
								disabled={isSubmitting}
							>
								{t("users.edit.cancel")}
							</button>
							<button
								type="submit"
								disabled={isSubmitting || !isPending}
								className={`px-4 py-2 rounded-lg text-white ${
									isSubmitting || !isPending
										? "bg-gray-400 cursor-not-allowed"
										: "bg-blue-600 hover:bg-blue-700"
								}`}
							>
								{isSubmitting ? t("users.edit.saving") : t("users.edit.save")}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
