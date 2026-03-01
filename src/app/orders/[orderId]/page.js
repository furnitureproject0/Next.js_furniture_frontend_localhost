"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectAllOrders } from "@/store/selectors";
import { updateOrder } from "@/store/slices/ordersSlice";
import { useTranslation } from "@/hooks/useTranslation";
import { siteAdminApi } from "@/lib/api";
import { useGlobalToast } from "@/hooks/useGlobalToast";

export default function OrderReportPage() {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const params = useParams();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const allOrders = useAppSelector(selectAllOrders);
	const userRole = useAppSelector((state) => state.auth.user?.role);

	// Order IDs are now numeric
	const orderId = parseInt(params.orderId, 10);
	const order = allOrders.find((o) => o.id === orderId);

	const [isConverting, setIsConverting] = useState(false);

	const orderType = order?.order_type || order?.orderType || "order";
	const isOfferOrAppointment = orderType === "offer" || orderType === "appointment";
	const isSiteAdmin = userRole === "site_admin";

	const [showConvertModal, setShowConvertModal] = useState(false);

	const handleConvertToOrder = async () => {
		setShowConvertModal(false);

		const typeLabel = orderType === "offer" ? "Offer" : "Appointment";
		setIsConverting(true);
		try {
			const response = await siteAdminApi.convertToOrder(orderId);
			if (response && response.success) {
				dispatch(updateOrder({
					id: orderId,
					updates: {
						order_type: "order",
						status: "pending"
					}
				}));
				toast.success(`${typeLabel} converted to Order successfully!`);
			} else {
				throw new Error(response?.message || "Failed to convert");
			}
		} catch (err) {
			console.error("Convert error:", err);
			toast.error(err.message || "Failed to convert to order");
		} finally {
			setIsConverting(false);
		}
	};

	const [reportData, setReportData] = useState({
		clientPaid: 0,
		paymentMethod: "cash",
		workerHours: order?.teamMembers?.map((member) => ({
			name: member.name,
			role: member.role,
			hours: 0,
			basePay: 0,
		})) || [],
		additionalExpenses: [],
		notes: "",
	});

	const handleAddExpense = () => {
		setReportData((prev) => ({
			...prev,
			additionalExpenses: [
				...prev.additionalExpenses,
				{ description: "", amount: 0 },
			],
		}));
	};

	const handleRemoveExpense = (index) => {
		setReportData((prev) => ({
			...prev,
			additionalExpenses: prev.additionalExpenses.filter(
				(_, i) => i !== index,
			),
		}));
	};

	const handleExpenseChange = (index, field, value) => {
		setReportData((prev) => ({
			...prev,
			additionalExpenses: prev.additionalExpenses.map((exp, i) =>
				i === index ? { ...exp, [field]: value } : exp,
			),
		}));
	};

	const handleWorkerHoursChange = (index, hours) => {
		setReportData((prev) => ({
			...prev,
			workerHours: prev.workerHours.map((worker, i) =>
				i === index
					? {
							...worker,
							hours: parseFloat(hours) || 0,
							basePay: worker.basePay || 0,
					  }
					: worker,
			),
		}));
	};

	const calculateTotalWorkerPay = () => {
		return reportData.workerHours.reduce((total, worker) => {
			return total + (worker.hours * worker.basePay * 1.431); // 43.1% markup
		}, 0);
	};

	const calculateTotalExpenses = () => {
		return reportData.additionalExpenses.reduce(
			(total, exp) => total + (parseFloat(exp.amount) || 0),
			0,
		);
	};

	const handleSubmitReport = () => {
		// Calculate totals
		const totalHours = reportData.workerHours.reduce(
			(sum, wh) => sum + parseFloat(wh.hours || 0),
			0
		);

		// Update order status to completed and save report data
		// In backend, this would POST to /order-services/:orderServiceId/reports
		dispatch(
			updateOrder({
				id: orderId,
				updates: {
					status: "completed", // Backend will determine: completed | partially_done
					report: {
						submittedAt: new Date().toISOString(),
						submittedBy: order.teamLeader?.name || "Team Leader",
						driver_id: order.teamLeader?.id,
						numofHours: totalHours,
						expected_amount: order.offer?.price || 0,
						paid_amount: reportData.clientPaid,
						payment_method: reportData.paymentMethod,
						workerHours: reportData.workerHours,
						totalWorkerPay: calculateTotalWorkerPay(),
						additionalExpenses: reportData.additionalExpenses,
						totalExpenses: calculateTotalExpenses(),
						notes: reportData.notes,
					},
				},
			}),
		);

		// Show success message and redirect
		alert(t("orderReport.actions.submitSuccess"));
		router.back();
	};

	if (!order) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p>{t("orderReport.orderNotFound")}</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen" style={{ background: "#FFFFFF" }}>
			<div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
				{/* Back Button */}
				<button
					onClick={() => router.back()}
					className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 sm:mb-6 text-sm sm:text-base font-medium"
				>
					<svg
						className="w-4 h-4 sm:w-5 sm:h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					<span className="whitespace-nowrap">{t("orderReport.backToDashboard")}</span>
				</button>

				{/* Header */}
				<div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
							{t("orderReport.title")}
						</h1>
						<p className="text-sm sm:text-base text-slate-600/70">
							{t("orderReport.subtitle", { orderId: order.id })}
						</p>
					</div>

					{/* Convert to Order Button - only for offers/appointments and site admins */}
					{isOfferOrAppointment && isSiteAdmin && (
						<button
							onClick={() => setShowConvertModal(true)}
							disabled={isConverting}
							className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
						>
							{isConverting ? (
								<>
									<svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									<span>Converting...</span>
								</>
							) : (
								<>
									<span className="px-2 py-0.5 bg-white/20 rounded-md text-xs font-bold uppercase">
										{orderType}
									</span>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
									</svg>
									<span>Convert to Order</span>
								</>
							)}
						</button>
					)}
				</div>

				{/* Order Info */}
				<div className="bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-200/60 mb-4 sm:mb-6">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
						<div>
							<p className="text-sm text-blue-600 mb-1">
								{t("orderReport.order")}:
							</p>
							<p className="font-semibold text-blue-900">
								#{order.id}
							</p>
						</div>
						<div>
							<p className="text-sm text-blue-600 mb-1">
								{t("orderReport.client")}:
							</p>
							<p className="font-semibold text-blue-900">
								{order.customer || "N/A"}
							</p>
						</div>
						<div>
							<p className="text-sm text-blue-600 mb-1">
								{t("orderReport.address")}:
							</p>
							<p className="font-semibold text-blue-900">
								{order.address || "N/A"}
							</p>
						</div>
					</div>
				</div>

				{/* Client Payment */}
				<div className="bg-white rounded-xl border border-primary-200/60 p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
					<div className="flex items-center gap-2 mb-3 sm:mb-4">
						<span className="text-xl sm:text-2xl">💰</span>
						<h2 className="text-lg sm:text-xl font-semibold text-slate-800">
							{t("orderReport.clientPayment.title")}
						</h2>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								{t("orderReport.clientPayment.amountPaid")}
							</label>
							<input
								type="number"
								value={reportData.clientPaid}
								onChange={(e) =>
									setReportData((prev) => ({
										...prev,
										clientPaid:
											parseFloat(e.target.value) || 0,
									}))
								}
								className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
								placeholder="0.00"
								step="0.01"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								{t("orderReport.clientPayment.expectedAmount")}
							</label>
							<input
								type="text"
								value={`CHF ${order.price || 0}`}
								disabled
								className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
							/>
						</div>
					</div>
				</div>

				{/* Worker Hours */}
				<div className="bg-white rounded-xl border border-primary-200/60 p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
					<div className="flex items-center gap-2 mb-3 sm:mb-4">
						<span className="text-xl sm:text-2xl">⏱️</span>
						<h2 className="text-lg sm:text-xl font-semibold text-slate-800">
							{t("orderReport.workerHours.title")}
						</h2>
					</div>
					<div className="overflow-x-auto -mx-4 sm:mx-0">
						<table className="w-full min-w-[600px] sm:min-w-0">
							<thead>
								<tr className="border-b border-primary-100">
									<th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">
										{t("orderReport.workerHours.worker")}
									</th>
									<th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">
										{t("orderReport.workerHours.hoursWorked")}
									</th>
									<th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">
										{t("orderReport.workerHours.basePay")}
									</th>
									<th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">
										{t("orderReport.workerHours.totalPay")}
									</th>
								</tr>
							</thead>
							<tbody>
								{reportData.workerHours.map(
									(worker, index) => (
										<tr
											key={index}
											className="border-b border-primary-50"
										>
											<td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-800">
												<div>
													<p className="font-medium">
														{worker.name}
													</p>
													<p className="text-xs text-primary-600">
														{worker.role}
													</p>
												</div>
											</td>
											<td className="py-2 sm:py-3 px-2 sm:px-4">
												<input
													type="number"
													value={worker.hours}
													onChange={(e) =>
														handleWorkerHoursChange(
															index,
															e.target.value,
														)
													}
													className="w-20 sm:w-24 px-2 sm:px-3 py-1 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
													placeholder="0.0"
													step="0.5"
												/>
											</td>
											<td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-800">
												CHF {worker.basePay.toFixed(2)}
											</td>
											<td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-green-700">
												CHF{" "}
												{(
													worker.hours *
													worker.basePay *
													1.431
												).toFixed(2)}
											</td>
										</tr>
									),
								)}
							</tbody>
						</table>
					</div>
					<div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primary-100 flex justify-end px-4 sm:px-0">
						<div className="text-right">
							<p className="text-xs sm:text-sm text-primary-600 mb-1">
								{t("orderReport.workerHours.totalWorkerPay")}:
							</p>
							<p className="text-lg sm:text-xl font-bold text-green-700">
								CHF {calculateTotalWorkerPay().toFixed(2)}
							</p>
						</div>
					</div>
				</div>

				{/* Payment Method */}
				<div className="bg-white rounded-xl border border-primary-200/60 p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
					<div className="flex items-center gap-2 mb-3 sm:mb-4">
						<span className="text-xl sm:text-2xl">💳</span>
						<h2 className="text-lg sm:text-xl font-semibold text-slate-800">
							{t("orderReport.paymentMethod.title")}
						</h2>
					</div>
					<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
						<label className="flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all flex-1">
							<input
								type="radio"
								name="paymentMethod"
								value="cash"
								checked={
									reportData.paymentMethod === "cash"
								}
								onChange={(e) =>
									setReportData((prev) => ({
										...prev,
										paymentMethod: e.target.value,
									}))
								}
								className="w-5 h-5 text-primary-600"
							/>
							<div className="flex items-center gap-2">
								<span className="text-xl">💵</span>
								<span className="font-medium text-slate-800">
									{t("orderReport.paymentMethod.cash")}
								</span>
							</div>
						</label>
						<label className="flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all flex-1">
							<input
								type="radio"
								name="paymentMethod"
								value="twint"
								checked={
									reportData.paymentMethod === "twint"
								}
								onChange={(e) =>
									setReportData((prev) => ({
										...prev,
										paymentMethod: e.target.value,
									}))
								}
								className="w-5 h-5 text-primary-600"
							/>
							<div className="flex items-center gap-2">
								<span className="text-xl">📱</span>
								<span className="font-medium text-slate-800">
									{t("orderReport.paymentMethod.twint")}
								</span>
							</div>
						</label>
					</div>
				</div>

				{/* Additional Expenses */}
				<div className="bg-white rounded-xl border border-primary-200/60 p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
						<div className="flex items-center gap-2">
							<span className="text-xl sm:text-2xl">💰</span>
							<h2 className="text-lg sm:text-xl font-semibold text-slate-800">
								{t("orderReport.additionalExpenses.title")}
							</h2>
						</div>
						<button
							onClick={handleAddExpense}
							className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-primary-300 text-primary-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-50 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
						>
							<svg
								className="w-3.5 h-3.5 sm:w-4 sm:h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4v16m8-8H4"
								/>
							</svg>
							<span className="whitespace-nowrap">{t("orderReport.additionalExpenses.addExpense")}</span>
						</button>
					</div>

					{reportData.additionalExpenses.length === 0 ? (
						<div className="text-center py-12">
							<svg
								className="w-16 h-16 text-gray-300 mx-auto mb-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							<p className="text-gray-500 text-sm">
								{t("orderReport.additionalExpenses.noExpenses")}
							</p>
							<p className="text-gray-400 text-xs mt-1">
								{t("orderReport.additionalExpenses.noExpensesHint")}
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{reportData.additionalExpenses.map((exp, index) => (
								<div
									key={index}
									className="flex gap-3 items-start"
								>
									<input
										type="text"
										value={exp.description}
										onChange={(e) =>
											handleExpenseChange(
												index,
												"description",
												e.target.value,
											)
										}
										className="flex-1 px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
										placeholder={t("orderReport.additionalExpenses.description")}
									/>
									<input
										type="number"
										value={exp.amount}
										onChange={(e) =>
											handleExpenseChange(
												index,
												"amount",
												e.target.value,
											)
										}
										className="w-32 px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
										placeholder="0.00"
										step="0.01"
									/>
									<button
										onClick={() =>
											handleRemoveExpense(index)
										}
										className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
									>
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Additional Notes */}
				<div className="bg-white rounded-xl border border-primary-200/60 p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
					<div className="flex items-center gap-2 mb-3 sm:mb-4">
						<span className="text-xl sm:text-2xl">📝</span>
						<h2 className="text-lg sm:text-xl font-semibold text-slate-800">
							{t("orderReport.additionalNotes.title")}
						</h2>
					</div>
					<p className="text-xs sm:text-sm text-primary-600 mb-2 sm:mb-3">
						{t("orderReport.additionalNotes.hint")}
					</p>
					<textarea
						value={reportData.notes}
						onChange={(e) =>
							setReportData((prev) => ({
								...prev,
								notes: e.target.value,
							}))
						}
						className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
						rows="4"
						placeholder={t("orderReport.additionalNotes.placeholder")}
					/>
				</div>

				{/* Report Summary */}
				<div className="bg-white rounded-xl border border-primary-200/60 p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
					<div className="flex items-center gap-2 mb-3 sm:mb-4">
						<span className="text-xl sm:text-2xl">📊</span>
						<h2 className="text-lg sm:text-xl font-semibold text-slate-800">
							{t("orderReport.reportSummary.title")}
						</h2>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
						<div className="bg-green-50 rounded-lg p-4 border border-green-200">
							<p className="text-sm text-green-600 mb-1">
								{t("orderReport.reportSummary.clientPayment")}
							</p>
							<p className="text-2xl font-bold text-green-700">
								CHF {reportData.clientPaid.toFixed(2)}
							</p>
							<p className="text-xs text-green-600 mt-1">
								{reportData.paymentMethod === "cash"
									? t("orderReport.paymentMethod.cashLabel")
									: t("orderReport.paymentMethod.twintLabel")}
							</p>
						</div>
						<div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
							<p className="text-sm text-blue-600 mb-1">
								{t("orderReport.reportSummary.totalWorkerPay")}
							</p>
							<p className="text-2xl font-bold text-blue-700">
								CHF {calculateTotalWorkerPay().toFixed(2)}
							</p>
							<p className="text-xs text-blue-600 mt-1">
								{reportData.workerHours.length} {t("orderReport.reportSummary.workers")}
							</p>
						</div>
						<div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
							<p className="text-sm text-primary-600 mb-1">
								{t("orderReport.reportSummary.totalExpenses")}
							</p>
							<p className="text-2xl font-bold text-primary-700">
								CHF {calculateTotalExpenses().toFixed(2)}
							</p>
							<p className="text-xs text-primary-600 mt-1">
								{reportData.additionalExpenses.length} {t("orderReport.reportSummary.items")}
							</p>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
					<button
						onClick={() => router.back()}
						className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-white border border-primary-200 text-slate-800 rounded-xl text-sm sm:text-base font-medium hover:bg-primary-50 transition-colors"
					>
						{t("orderReport.actions.cancel")}
					</button>
					<button
						onClick={handleSubmitReport}
						className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm sm:text-base font-medium shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
					>
						<svg
							className="w-4 h-4 sm:w-5 sm:h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<span className="whitespace-nowrap">{t("orderReport.actions.submitReport")}</span>
					</button>
				</div>
			</div>

			{/* Convert to Order Confirmation Modal */}
			{showConvertModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/40 backdrop-blur-sm"
						onClick={() => setShowConvertModal(false)}
					/>

					{/* Modal */}
					<div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
						{/* Icon */}
						<div className="mx-auto w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-4">
							<svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						</div>

						{/* Title */}
						<h3 className="text-lg font-bold text-slate-800 text-center mb-2">
							Convert to Order
						</h3>

						{/* Description */}
						<p className="text-sm text-slate-500 text-center mb-2">
							You are about to convert this{" "}
							<span className="font-semibold text-slate-700 capitalize">{orderType}</span>{" "}
							into a standard <span className="font-semibold text-emerald-600">Order</span>.
						</p>
						<p className="text-xs text-slate-400 text-center mb-6">
							The status will be set to &quot;Pending&quot; and it will appear in the Orders column. This action cannot be undone.
						</p>

						{/* Buttons */}
						<div className="flex gap-3">
							<button
								onClick={() => setShowConvertModal(false)}
								className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleConvertToOrder}
								className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								Yes, Convert
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

