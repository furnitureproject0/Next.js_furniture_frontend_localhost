"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { employeeApi } from "@/lib/api";
import { useGlobalToast } from "@/hooks/useGlobalToast";

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

export default function EmploymentDetailModal({ isOpen, onClose, employment, role = "worker", onStatusChange }) {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const [isProcessing, setIsProcessing] = useState(false);

	if (!isOpen || !employment) return null;

	const handleAccept = async () => {
		if (isProcessing) return;
		setIsProcessing(true);
		try {
			await employeeApi.acceptEmployment(employment.id);
			toast.success(t("employee.employments.accepted") || "Employment accepted successfully");
			onStatusChange?.();
			onClose();
		} catch (error) {
			console.error("Failed to accept employment:", error);
			toast.error(
				error?.data?.message || 
				error?.message || 
				t("employee.employments.acceptError") || 
				"Failed to accept employment"
			);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleReject = async () => {
		if (isProcessing) return;
		setIsProcessing(true);
		try {
			await employeeApi.rejectEmployment(employment.id);
			toast.success(t("employee.employments.rejected") || "Employment rejected successfully");
			onStatusChange?.();
			onClose();
		} catch (error) {
			console.error("Failed to reject employment:", error);
			toast.error(
				error?.data?.message || 
				error?.message || 
				t("employee.employments.rejectError") || 
				"Failed to reject employment"
			);
		} finally {
			setIsProcessing(false);
		}
	};

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
					<h2 className={`text-xl sm:text-2xl font-bold ${themeColors.primaryText}`}>
						{t("employee.employments.employment")} #{employment.id}
					</h2>
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
								employment.status,
							)}`}
						>
							{employment.status?.toUpperCase() || "PENDING"}
						</span>
					</div>

					{/* Employment Details */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
						{/* Company */}
						{employment.company && (
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
										{t("employee.employments.company")}
									</h3>
								</div>
								<p className={`text-base ${themeColors.secondaryText}`}>
									{employment.company?.name || employment.company || t("common.nA") || "N/A"}
								</p>
							</div>
						)}

						{/* Hourly Rate */}
						{employment.hourly_rate && (
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
											d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<h3 className={`text-sm font-semibold ${themeColors.primaryText}`}>
										{t("employee.employments.hourlyRate") || "Hourly Rate"}
									</h3>
								</div>
								<p className={`text-base font-semibold ${themeColors.secondaryText}`}>
									{employment.hourly_rate} {employment.currency || "CHF"}/hr
								</p>
							</div>
						)}
					</div>

					{/* Dates */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
						{/* Start Date */}
						{employment.start_date && (
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
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
									<h3 className={`text-sm font-semibold ${themeColors.primaryText}`}>
										{t("employee.employments.startDate") || "Start Date"}
									</h3>
								</div>
								<p className={`text-base ${themeColors.secondaryText}`}>
									{formatDate(employment.start_date)}
								</p>
							</div>
						)}

						{/* End Date */}
						{employment.end_date && (
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
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
									<h3 className={`text-sm font-semibold ${themeColors.primaryText}`}>
										{t("employee.employments.endDate") || "End Date"}
									</h3>
								</div>
								<p className={`text-base ${themeColors.secondaryText}`}>
									{formatDate(employment.end_date)}
								</p>
							</div>
						)}
					</div>

					{/* Employment Dates */}
					<div className="bg-gray-50 rounded-xl p-4 border border-gray-200/60">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-gray-600 mb-1">
									{t("employee.employments.createdAt") || "Created At"}:
								</p>
								<p className={`font-medium ${themeColors.secondaryText}`}>
									{employment.createdAt
										? new Date(employment.createdAt).toLocaleString()
										: t("common.nA") || "N/A"}
								</p>
							</div>
							<div>
								<p className="text-gray-600 mb-1">
									{t("employee.employments.updatedAt") || "Updated At"}:
								</p>
								<p className={`font-medium ${themeColors.secondaryText}`}>
									{employment.updatedAt
										? new Date(employment.updatedAt).toLocaleString()
										: t("common.nA") || "N/A"}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Footer with Accept/Reject buttons for pending employments */}
				<div className="sticky bottom-0 bg-white border-t border-orange-200/40 px-6 sm:px-8 py-4 rounded-b-2xl flex gap-3 justify-end">
					{employment.status === "pending" && (
						<>
							<button
								onClick={handleAccept}
								disabled={isProcessing}
								className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isProcessing ? (
									<span className="flex items-center justify-center gap-2">
										<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
										</svg>
										{t("common.labels.loading") || "Processing..."}
									</span>
								) : (
									t("employee.employments.accept") || "Accept"
								)}
							</button>
							<button
								onClick={handleReject}
								disabled={isProcessing}
								className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isProcessing ? (
									<span className="flex items-center justify-center gap-2">
										<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
										</svg>
										{t("common.labels.loading") || "Processing..."}
									</span>
								) : (
									t("employee.employments.reject") || "Reject"
								)}
							</button>
						</>
					)}
					{employment.status !== "pending" && (
						<button
							onClick={onClose}
							className={`px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-700 transition-all`}
						>
							{t("common.buttons.close") || "Close"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

