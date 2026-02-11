"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { employeeApi } from "@/lib/api";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";

export default function ReportModal({ isOpen, onClose, assignment, onSuccess }) {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const currentUser = useAppSelector(selectUser);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [existingReport, setExistingReport] = useState(null);

	// Extract order and orderService IDs
	const orderId = assignment?.offer?.orderService?.order?.id;
	const orderServiceId = assignment?.offer?.orderService?.id;

	// Form state
	const [formData, setFormData] = useState({
		numofHours: "",
		paid_amount: "",
		payment_method: "cash",
		notes: "",
		employee_hours: [],
		transactions: [],
	});

	// Fetch existing report when modal opens
	useEffect(() => {
		if (isOpen && orderId && orderServiceId) {
			fetchReport();
		} else if (!isOpen) {
			// Reset form when modal closes
			setFormData({
				numofHours: "",
				paid_amount: "",
				payment_method: "cash",
				notes: "",
				employee_hours: [],
				transactions: [],
			});
			setExistingReport(null);
		}
	}, [isOpen, orderId, orderServiceId]);

	const fetchReport = async () => {
		if (!orderId || !orderServiceId) return;
		
		setIsFetching(true);
		try {
			const response = await employeeApi.getReport(orderId, orderServiceId);
			// If response is null, no report exists yet (404 was handled gracefully)
			if (!response) {
				setExistingReport(null);
				return;
			}
			
			if (response?.success && response?.data?.report) {
				const report = response.data.report;
				setExistingReport(report);
				// Populate form with existing data
				setFormData({
					numofHours: report.numofHours?.toString() || "",
					paid_amount: report.paid_amount?.toString() || "",
					payment_method: report.payment_method || "cash",
					notes: report.notes || "",
					employee_hours: report.employeeHours?.map(eh => ({
						employee_id: eh.employee_id,
						hours: eh.hours?.toString() || "",
					})) || [],
					transactions: report.transactions?.map(t => ({
						payment_method: t.payment_method || "cash",
						name: t.name || "",
						amount: t.amount?.toString() || "",
						description: t.description || "",
					})) || [],
				});
			} else {
				setExistingReport(null);
			}
		} catch (error) {
			// Handle any unexpected errors
			console.error("Failed to fetch report:", error);
			setExistingReport(null);
		} finally {
			setIsFetching(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!orderId || !orderServiceId) {
			toast.error(t("employee.report.errors.missingIds") || "Missing order or service information");
			return;
		}

		// Validation
		if (!formData.numofHours || parseFloat(formData.numofHours) <= 0) {
			toast.error(t("employee.report.errors.invalidHours") || "Please enter a valid number of hours");
			return;
		}

		if (!formData.paid_amount || parseFloat(formData.paid_amount) < 0) {
			toast.error(t("employee.report.errors.invalidAmount") || "Please enter a valid paid amount");
			return;
		}

		// Validate employee hours
		const validEmployeeHours = formData.employee_hours
			.filter(eh => eh.employee_id && eh.hours && parseFloat(eh.hours) > 0)
			.map(eh => ({
				employee_id: parseInt(eh.employee_id),
				hours: parseFloat(eh.hours),
			}));

		if (validEmployeeHours.length === 0) {
			toast.error(t("employee.report.errors.noEmployeeHours") || "Please add at least one employee with hours");
			return;
		}

		// Validate transactions
		const validTransactions = formData.transactions
			.filter(t => t.name && t.amount && parseFloat(t.amount) > 0)
			.map(t => ({
				payment_method: t.payment_method || "cash",
				name: t.name,
				amount: parseFloat(t.amount),
				description: t.description || "",
			}));

		// Prepare payload
		const payload = {
			numofHours: parseFloat(formData.numofHours),
			paid_amount: parseFloat(formData.paid_amount),
			payment_method: formData.payment_method,
			notes: formData.notes || "",
			employee_hours: validEmployeeHours,
			transactions: validTransactions,
		};

		setIsLoading(true);
		try {
			let response;
			if (existingReport) {
				// Update existing report
				response = await employeeApi.updateReport(orderId, orderServiceId, payload);
			} else {
				// Create new report
				response = await employeeApi.createReport(orderId, orderServiceId, payload);
			}

			if (response?.success) {
				toast.success(
					existingReport
						? (t("employee.report.updated") || "Report updated successfully")
						: (t("employee.report.created") || "Report created successfully")
				);
				onSuccess?.();
				onClose();
			} else {
				throw new Error(response?.message || "Failed to save report");
			}
		} catch (error) {
			console.error("Failed to save report:", error);
			toast.error(
				error?.data?.message ||
				error?.message ||
				t("employee.report.errors.saveFailed") ||
				"Failed to save report"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const addEmployeeHour = () => {
		setFormData(prev => ({
			...prev,
			employee_hours: [
				...prev.employee_hours,
				{ employee_id: currentUser?.id || "", hours: "" },
			],
		}));
	};

	const updateEmployeeHour = (index, field, value) => {
		setFormData(prev => ({
			...prev,
			employee_hours: prev.employee_hours.map((eh, i) =>
				i === index ? { ...eh, [field]: value } : eh
			),
		}));
	};

	const removeEmployeeHour = (index) => {
		setFormData(prev => ({
			...prev,
			employee_hours: prev.employee_hours.filter((_, i) => i !== index),
		}));
	};

	const addTransaction = () => {
		setFormData(prev => ({
			...prev,
			transactions: [
				...prev.transactions,
				{ payment_method: "cash", name: "", amount: "", description: "" },
			],
		}));
	};

	const updateTransaction = (index, field, value) => {
		setFormData(prev => ({
			...prev,
			transactions: prev.transactions.map((t, i) =>
				i === index ? { ...t, [field]: value } : t
			),
		}));
	};

	const removeTransaction = (index) => {
		setFormData(prev => ({
			...prev,
			transactions: prev.transactions.filter((_, i) => i !== index),
		}));
	};

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4"
			onClick={handleBackdropClick}
		>
			<div 
				className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header - Fixed */}
				<div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 pb-4 border-b border-orange-200/60 flex-shrink-0">
					<h3 className="text-lg sm:text-xl font-semibold text-amber-900">
						{existingReport
							? (t("employee.report.editTitle") || "Edit Report")
							: (t("employee.report.createTitle") || "Create Report")}
					</h3>
					<button
						onClick={onClose}
						disabled={isLoading}
						className="text-amber-700/70 hover:text-amber-900 transition-colors cursor-pointer p-1 disabled:opacity-50"
					>
						<svg
							className="w-5 h-5 sm:w-6 sm:h-6"
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

				{/* Scrollable Content */}
				<div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
					{isFetching ? (
						<div className="flex items-center justify-center py-8">
							<svg className="animate-spin h-8 w-8 text-orange-600" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
							</svg>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" id="report-form">
						{/* Basic Information */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{/* Number of Hours */}
							<div>
								<label className="block text-xs sm:text-sm font-medium text-amber-900 mb-1.5 sm:mb-2">
									{t("employee.report.numofHours") || "Number of Hours"} *
								</label>
								<input
									type="number"
									step="0.5"
									min="0"
									value={formData.numofHours}
									onChange={(e) => setFormData(prev => ({ ...prev, numofHours: e.target.value }))}
									required
									className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border border-orange-200/60 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
									placeholder="8.5"
								/>
							</div>

							{/* Paid Amount */}
							<div>
								<label className="block text-xs sm:text-sm font-medium text-amber-900 mb-1.5 sm:mb-2">
									{t("employee.report.paidAmount") || "Paid Amount"} *
								</label>
								<input
									type="number"
									step="0.01"
									min="0"
									value={formData.paid_amount}
									onChange={(e) => setFormData(prev => ({ ...prev, paid_amount: e.target.value }))}
									required
									className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border border-orange-200/60 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
									placeholder="637.50"
								/>
							</div>
						</div>

						{/* Payment Method */}
						<div>
							<label className="block text-xs sm:text-sm font-medium text-amber-900 mb-1.5 sm:mb-2">
								{t("employee.report.paymentMethod") || "Payment Method"} *
							</label>
							<select
								value={formData.payment_method}
								onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
								required
								className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border border-orange-200/60 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
							>
								<option value="cash">{t("employee.report.cash") || "Cash"}</option>
								<option value="twint">{t("employee.report.twint") || "Twint"}</option>
							</select>
						</div>

						{/* Notes */}
						<div>
							<label className="block text-xs sm:text-sm font-medium text-amber-900 mb-1.5 sm:mb-2">
								{t("employee.report.notes") || "Notes"}
							</label>
							<textarea
								value={formData.notes}
								onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
								rows={3}
								className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border border-orange-200/60 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 resize-none"
								placeholder={t("employee.report.notesPlaceholder") || "Additional notes..."}
							/>
						</div>

						{/* Employee Hours */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="block text-xs sm:text-sm font-medium text-amber-900">
									{t("employee.report.employeeHours") || "Employee Hours"} *
								</label>
								<button
									type="button"
									onClick={addEmployeeHour}
									className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium"
								>
									+ {t("employee.report.addEmployee") || "Add Employee"}
								</button>
							</div>
							<div className="space-y-2">
								{formData.employee_hours.map((eh, index) => (
									<div key={index} className="flex gap-2 items-start">
										<input
											type="number"
											value={eh.employee_id}
											onChange={(e) => updateEmployeeHour(index, "employee_id", e.target.value)}
											placeholder={t("employee.report.employeeId") || "Employee ID"}
											className="flex-1 px-3 py-2 border border-orange-200/60 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
										/>
										<input
											type="number"
											step="0.5"
											min="0"
											value={eh.hours}
											onChange={(e) => updateEmployeeHour(index, "hours", e.target.value)}
											placeholder={t("employee.report.hours") || "Hours"}
											className="flex-1 px-3 py-2 border border-orange-200/60 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
										/>
										<button
											type="button"
											onClick={() => removeEmployeeHour(index)}
											className="p-2 text-red-600 hover:text-red-700"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								))}
								{formData.employee_hours.length === 0 && (
									<p className="text-xs text-amber-700/70 italic">
										{t("employee.report.noEmployees") || "No employees added. Click 'Add Employee' to add one."}
									</p>
								)}
							</div>
						</div>

						{/* Transactions */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="block text-xs sm:text-sm font-medium text-amber-900">
									{t("employee.report.transactions") || "Transactions"}
								</label>
								<button
									type="button"
									onClick={addTransaction}
									className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium"
								>
									+ {t("employee.report.addTransaction") || "Add Transaction"}
								</button>
							</div>
							<div className="space-y-2">
								{formData.transactions.map((transaction, index) => (
									<div key={index} className="border border-orange-200/60 rounded-lg p-3 space-y-2">
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
											<input
												type="text"
												value={transaction.name}
												onChange={(e) => updateTransaction(index, "name", e.target.value)}
												placeholder={t("employee.report.transactionName") || "Transaction Name"}
												className="px-3 py-2 border border-orange-200/60 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
											/>
											<input
												type="number"
												step="0.01"
												min="0"
												value={transaction.amount}
												onChange={(e) => updateTransaction(index, "amount", e.target.value)}
												placeholder={t("employee.report.amount") || "Amount"}
												className="px-3 py-2 border border-orange-200/60 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
											/>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
											<select
												value={transaction.payment_method}
												onChange={(e) => updateTransaction(index, "payment_method", e.target.value)}
												className="px-3 py-2 border border-orange-200/60 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
											>
												<option value="cash">{t("employee.report.cash") || "Cash"}</option>
												<option value="twint">{t("employee.report.twint") || "Twint"}</option>
											</select>
											<input
												type="text"
												value={transaction.description}
												onChange={(e) => updateTransaction(index, "description", e.target.value)}
												placeholder={t("employee.report.description") || "Description"}
												className="px-3 py-2 border border-orange-200/60 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
											/>
										</div>
										<button
											type="button"
											onClick={() => removeTransaction(index)}
											className="text-xs text-red-600 hover:text-red-700"
										>
											{t("employee.report.removeTransaction") || "Remove Transaction"}
										</button>
									</div>
								))}
							</div>
						</div>

						</form>
					)}
				</div>

				{/* Footer - Fixed */}
				{!isFetching && (
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 lg:p-8 pt-4 border-t border-orange-200/60 flex-shrink-0">
						<button
							type="button"
							onClick={onClose}
							disabled={isLoading}
							className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-amber-700 bg-white/80 border border-orange-200 rounded-lg sm:rounded-xl hover:bg-orange-50 transition-colors cursor-pointer disabled:opacity-50"
						>
							{t("common.buttons.cancel") || "Cancel"}
						</button>
						<button
							type="submit"
							form="report-form"
							disabled={isLoading}
							className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white bg-orange-600 rounded-lg sm:rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						>
							{isLoading ? (
								<span className="flex items-center justify-center gap-2">
									<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
									</svg>
									{t("common.labels.loading") || "Saving..."}
								</span>
							) : (
								existingReport
									? (t("employee.report.update") || "Update Report")
									: (t("employee.report.submit") || "Submit Report")
							)}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

