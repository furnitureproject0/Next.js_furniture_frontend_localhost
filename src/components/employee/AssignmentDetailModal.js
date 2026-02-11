"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { employeeApi } from "@/lib/api";
import ReportModal from "./ReportModal";

const getStatusColor = (status) => {
	switch (status) {
		case "pending":
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		case "accepted":
			return "bg-green-100 text-green-800 border-green-200";
		case "rejected":
			return "bg-red-100 text-red-800 border-red-200";
		case "completed":
			return "bg-blue-100 text-blue-800 border-blue-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
};

const formatDate = (dateString) => {
	if (!dateString) return "";
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

const formatTime = (timeString) => {
	if (!timeString) return "";
	const [hours, minutes] = timeString.split(":");
	const hour = parseInt(hours, 10);
	const ampm = hour >= 12 ? "PM" : "AM";
	const displayHour = hour % 12 || 12;
	return `${displayHour}:${minutes} ${ampm}`;
};

export default function AssignmentDetailModal({ isOpen, onClose, assignment, role = "worker", onStatusChange }) {
	const { t } = useTranslation();
	const [isReportModalOpen, setIsReportModalOpen] = useState(false);
	const [report, setReport] = useState(null);
	const [isLoadingReport, setIsLoadingReport] = useState(false);

	const offer = assignment.offer;
	const company = offer?.company;
	const service = offer?.orderService?.service;
	const order = offer?.orderService?.order;
	const orderId = order?.id;
	const orderServiceId = offer?.orderService?.id;

	// Fetch report if leader and accepted
	useEffect(() => {
		if (isOpen && assignment?.is_leader && assignment?.status === "accepted" && orderId && orderServiceId) {
			fetchReport();
		} else {
			setReport(null);
		}
	}, [isOpen, assignment?.is_leader, assignment?.status, orderId, orderServiceId]);

	const fetchReport = async () => {
		if (!orderId || !orderServiceId) return;
		
		setIsLoadingReport(true);
		try {
			const response = await employeeApi.getReport(orderId, orderServiceId);
			if (response?.success && response?.data?.report) {
				setReport(response.data.report);
			} else {
				setReport(null);
			}
		} catch (error) {
			console.error("Failed to fetch report:", error);
			setReport(null);
		} finally {
			setIsLoadingReport(false);
		}
	};

	if (!isOpen || !assignment) return null;

	const themeColors = {
		primaryText: "text-amber-900",
		primaryBorder: "border-orange-200/40",
		secondaryText: "text-amber-700",
		hoverBg: "hover:bg-orange-50",
	};

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
			<div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="sticky top-0 bg-white border-b border-orange-200/40 px-6 sm:px-8 py-4 sm:py-6 rounded-t-2xl flex items-center justify-between">
					<div className="flex items-center gap-3">
						<h2 className={`text-xl sm:text-2xl font-bold ${themeColors.primaryText}`}>
							{t("employee.assignments.assignment")} #{assignment.id}
						</h2>
						{assignment.is_leader && (
							<span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
								{t("employee.assignments.leader") || "Leader"}
							</span>
						)}
					</div>
					<button
						onClick={onClose}
						className={`p-2 ${themeColors.hoverBg} rounded-lg transition-colors`}
					>
						<svg
							className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700"
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
				<div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
					{/* Status */}
					<div className="flex items-center gap-2">
						<span
							className={`px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusColor(
								assignment.status,
							)}`}
						>
							{assignment.status.toUpperCase()}
						</span>
					</div>

					{/* Assignment Details */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
						{/* Company */}
						{company && (
							<div className="bg-orange-50 rounded-xl p-4 border border-orange-200/60">
								<div className="flex items-center gap-2 mb-2">
									<svg
										className="w-5 h-5 text-orange-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
										/>
									</svg>
									<h3 className={`text-sm font-semibold ${themeColors.primaryText}`}>
										{t("employee.assignments.company")}
									</h3>
								</div>
								<p className={`text-base ${themeColors.secondaryText}`}>{company.name}</p>
							</div>
						)}

						{/* Service */}
						{service && (
							<div className="bg-orange-50 rounded-xl p-4 border border-orange-200/60">
								<div className="flex items-center gap-2 mb-2">
									<svg
										className="w-5 h-5 text-orange-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
									<h3 className={`text-sm font-semibold ${themeColors.primaryText}`}>
										{t("employee.assignments.service")}
									</h3>
								</div>
								<p className={`text-base ${themeColors.secondaryText}`}>{service.name}</p>
								{service.description && (
									<p className={`text-sm mt-1 ${themeColors.secondaryText}/70`}>
										{service.description}
									</p>
								)}
							</div>
						)}
					</div>

					{/* Schedule */}
					{offer?.date && (
						<div className="bg-orange-50 rounded-xl p-4 border border-orange-200/60">
							<div className="flex items-center gap-2 mb-3">
								<svg
									className="w-5 h-5 text-orange-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
								<h3 className={`text-sm font-semibold ${themeColors.primaryText}`}>
									{t("common.labels.date")} & {t("common.labels.time")}
								</h3>
							</div>
							<div className="space-y-1">
								<p className={`text-base font-medium ${themeColors.secondaryText}`}>
									{formatDate(offer.date)}
								</p>
								{offer.time && (
									<p className={`text-base ${themeColors.secondaryText}`}>
										{formatTime(offer.time)}
									</p>
								)}
							</div>
						</div>
					)}

					{/* Payment Details */}
					{offer?.hourly_rate && (
						<div className="bg-orange-50 rounded-xl p-4 border border-orange-200/60">
							<div className="flex items-center gap-2 mb-3">
								<svg
									className="w-5 h-5 text-orange-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<h3 className={`text-sm font-semibold ${themeColors.primaryText}`}>
									{t("employee.assignments.paymentDetails") || "Payment Details"}
								</h3>
							</div>
							<div className="space-y-2">
								<p className={`text-lg font-semibold ${themeColors.primaryText}`}>
									{offer.hourly_rate} {offer.currency || "CHF"}/hr
								</p>
								{offer.min_hours && offer.max_hours && (
									<p className={`text-sm ${themeColors.secondaryText}`}>
										{t("employee.assignments.hoursRange") || "Hours"}: {offer.min_hours} - {offer.max_hours} {t("common.labels.hours") || "hours"}
									</p>
								)}
								{offer.min_hours && offer.max_hours && offer.hourly_rate && (
									<p className={`text-sm ${themeColors.secondaryText}/70`}>
										{t("employee.assignments.estimatedEarnings") || "Estimated Earnings"}:{" "}
										{offer.min_hours * parseFloat(offer.hourly_rate)} - {offer.max_hours * parseFloat(offer.hourly_rate)} {offer.currency || "CHF"}
									</p>
								)}
							</div>
						</div>
					)}

					{/* Notes */}
					{offer?.notes && (
						<div className="bg-orange-50 rounded-xl p-4 border border-orange-200/60">
							<div className="flex items-center gap-2 mb-2">
								<svg
									className="w-5 h-5 text-orange-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
									/>
								</svg>
								<h3 className={`text-sm font-semibold ${themeColors.primaryText}`}>
									{t("common.labels.notes")}
								</h3>
							</div>
							<p className={`text-sm ${themeColors.secondaryText} whitespace-pre-wrap`}>
								{offer.notes}
							</p>
						</div>
					)}

					{/* Order Information */}
					{order && (
						<div className="bg-orange-50 rounded-xl p-4 border border-orange-200/60">
							<div className="flex items-center gap-2 mb-3">
								<svg
									className="w-5 h-5 text-orange-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
								<h3 className={`text-sm font-semibold ${themeColors.primaryText}`}>
									{t("employee.assignments.orderInfo") || "Order Information"}
								</h3>
							</div>
							<div className="space-y-2">
								<p className={`text-sm ${themeColors.secondaryText}`}>
									<span className="font-medium">{t("employee.assignments.orderId") || "Order ID"}:</span> #{order.id}
								</p>
								{order.preferred_date && (
									<p className={`text-sm ${themeColors.secondaryText}`}>
										<span className="font-medium">{t("employee.assignments.preferredDate") || "Preferred Date"}:</span> {formatDate(order.preferred_date)}
									</p>
								)}
								{order.number_of_rooms && (
									<p className={`text-sm ${themeColors.secondaryText}`}>
										<span className="font-medium">{t("employee.assignments.numberOfRooms") || "Number of Rooms"}:</span> {order.number_of_rooms}
									</p>
								)}
							</div>
						</div>
					)}

					{/* Report Information - Show if leader and accepted */}
					{assignment.is_leader && assignment.status === "accepted" && (
						<div className="bg-blue-50 rounded-xl p-4 border border-blue-200/60">
							<div className="flex items-center gap-2 mb-3">
								<svg
									className="w-5 h-5 text-blue-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
								<h3 className={`text-sm font-semibold ${themeColors.primaryText}`}>
									{t("employee.assignments.report") || "Report"}
								</h3>
							</div>
							{isLoadingReport ? (
								<div className="flex items-center justify-center py-4">
									<svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
									</svg>
								</div>
							) : report ? (
								<div className="space-y-3">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<div>
											<p className="text-xs text-amber-700/70 mb-1">
												{t("employee.report.numofHours") || "Number of Hours"}:
											</p>
											<p className={`text-sm font-medium ${themeColors.secondaryText}`}>
												{report.numofHours || t("common.nA") || "N/A"}
											</p>
										</div>
										<div>
											<p className="text-xs text-amber-700/70 mb-1">
												{t("employee.report.paidAmount") || "Paid Amount"}:
											</p>
											<p className={`text-sm font-medium ${themeColors.secondaryText}`}>
												{report.paid_amount ? `${report.paid_amount} ${offer?.currency || "CHF"}` : t("common.nA") || "N/A"}
											</p>
										</div>
										<div>
											<p className="text-xs text-amber-700/70 mb-1">
												{t("employee.report.paymentMethod") || "Payment Method"}:
											</p>
											<p className={`text-sm font-medium ${themeColors.secondaryText}`}>
												{report.payment_method ? (
													report.payment_method === "cash" 
														? (t("employee.report.cash") || "Cash")
														: (t("employee.report.twint") || "Twint")
												) : t("common.nA") || "N/A"}
											</p>
										</div>
										{report.expected_amount && (
											<div>
												<p className="text-xs text-amber-700/70 mb-1">
													{t("employee.report.expectedAmount") || "Expected Amount"}:
												</p>
												<p className={`text-sm font-medium ${themeColors.secondaryText}`}>
													{report.expected_amount} {offer?.currency || "CHF"}
												</p>
											</div>
										)}
									</div>
									{report.notes && (
										<div>
											<p className="text-xs text-amber-700/70 mb-1">
												{t("employee.report.notes") || "Notes"}:
											</p>
											<p className={`text-sm ${themeColors.secondaryText} whitespace-pre-wrap`}>
												{report.notes}
											</p>
										</div>
									)}
									{report.employeeHours && report.employeeHours.length > 0 && (
										<div>
											<p className="text-xs text-amber-700/70 mb-2">
												{t("employee.report.employeeHours") || "Employee Hours"}:
											</p>
											<div className="space-y-1">
												{report.employeeHours.map((eh, index) => (
													<div key={index} className="flex items-center justify-between text-xs bg-white rounded p-2">
														<span className={themeColors.secondaryText}>
															{eh.employee?.name || `Employee #${eh.employee_id}`}
														</span>
														<span className={`font-medium ${themeColors.primaryText}`}>
															{eh.hours} {t("common.labels.hours") || "hours"}
														</span>
													</div>
												))}
											</div>
										</div>
									)}
									{report.transactions && report.transactions.length > 0 && (
										<div>
											<p className="text-xs text-amber-700/70 mb-2">
												{t("employee.report.transactions") || "Transactions"}:
											</p>
											<div className="space-y-1">
												{report.transactions.map((transaction, index) => (
													<div key={index} className="bg-white rounded p-2 text-xs">
														<div className="flex items-center justify-between mb-1">
															<span className={`font-medium ${themeColors.primaryText}`}>
																{transaction.name}
															</span>
															<span className={themeColors.secondaryText}>
																{transaction.amount} {offer?.currency || "CHF"}
															</span>
														</div>
														{transaction.description && (
															<p className={`text-xs ${themeColors.secondaryText}/70`}>
																{transaction.description}
															</p>
														)}
													</div>
												))}
											</div>
										</div>
									)}
									{report.createdAt && (
										<div className="pt-2 border-t border-blue-200/60">
											<p className="text-xs text-amber-700/70">
												{t("employee.assignments.createdAt") || "Created At"}: {new Date(report.createdAt).toLocaleString()}
											</p>
										</div>
									)}
								</div>
							) : (
								<p className={`text-sm ${themeColors.secondaryText} italic`}>
									{t("employee.report.noReport") || "No report submitted yet."}
								</p>
							)}
						</div>
					)}

					{/* Assignment Dates */}
					<div className="bg-gray-50 rounded-xl p-4 border border-gray-200/60">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-gray-600 mb-1">
									{t("employee.assignments.createdAt") || "Created At"}:
								</p>
								<p className={`font-medium ${themeColors.secondaryText}`}>
									{assignment.createdAt
										? new Date(assignment.createdAt).toLocaleString()
										: t("common.nA") || "N/A"}
								</p>
							</div>
							<div>
								<p className="text-gray-600 mb-1">
									{t("employee.assignments.updatedAt") || "Updated At"}:
								</p>
								<p className={`font-medium ${themeColors.secondaryText}`}>
									{assignment.updatedAt
										? new Date(assignment.updatedAt).toLocaleString()
										: t("common.nA") || "N/A"}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="sticky bottom-0 bg-white border-t border-orange-200/40 px-6 sm:px-8 py-4 rounded-b-2xl flex justify-end gap-3">
					{assignment.is_leader && assignment.status === "accepted" && (
						<button
							onClick={() => setIsReportModalOpen(true)}
							className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all`}
						>
							{t("employee.assignments.report") || "Report"}
						</button>
					)}
					<button
						onClick={onClose}
						className={`px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-700 transition-all`}
					>
						{t("common.buttons.close") || "Close"}
					</button>
				</div>
			</div>

			{/* Report Modal */}
			<ReportModal
				isOpen={isReportModalOpen}
				onClose={() => setIsReportModalOpen(false)}
				assignment={assignment}
				onSuccess={() => {
					fetchReport(); // Refresh report after submission
					onStatusChange?.();
				}}
			/>
		</div>
	);
}

