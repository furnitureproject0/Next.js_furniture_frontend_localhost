"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { employeeApi } from "@/lib/api";
import { useGlobalToast } from "@/hooks/useGlobalToast";

const EmploymentCard = ({ employment, onStatusChange, onViewDetails, role = "worker" }) => {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const [isProcessing, setIsProcessing] = useState(false);

	// Use cream/orange theme to match project theme
	const themeColors = {
		primary: "orange",
		primaryText: "text-amber-900",
		primaryBg: "bg-orange-100",
		primaryBorder: "border-orange-200/40",
		primaryButton: "from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700",
		secondaryText: "text-amber-700",
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "accepted":
				return "bg-green-100 text-green-800 border-green-200";
			case "rejected":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const handleAccept = async () => {
		if (isProcessing) return;
		setIsProcessing(true);
		try {
			await employeeApi.acceptEmployment(employment.id);
			toast.success(t("employee.employments.accepted") || "Employment accepted successfully");
			onStatusChange?.();
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

	return (
		<div
			className={`bg-white border ${themeColors.primaryBorder} rounded-xl p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow cursor-pointer`}
			onClick={() => onViewDetails?.(employment)}
		>
			<div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
				<div className="flex-1 min-w-0">
					<h3 className={`text-base sm:text-lg font-semibold ${themeColors.primaryText} truncate mb-2`}>
						{t("employee.employments.employment")} #{employment.id}
					</h3>
					<span
						className={`inline-block px-2.5 sm:px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
							employment.status,
						)}`}
					>
						{employment.status?.toUpperCase() || "PENDING"}
					</span>
				</div>
			</div>

			<div className="space-y-2 mb-3 sm:mb-4">
				{employment.company && (
					<div className={`flex items-center gap-2 text-xs sm:text-sm ${themeColors.secondaryText}`}>
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
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
						<span className="truncate">
							{t("employee.employments.company")}: {employment.company?.name || employment.company || t("common.nA") || "N/A"}
						</span>
					</div>
				)}

				{employment.hourly_rate && (
					<div className={`flex items-center gap-2 text-xs sm:text-sm ${themeColors.secondaryText}`}>
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
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
						<span className="truncate">
							{t("employee.employments.hourlyRate") || "Hourly Rate"}: {employment.hourly_rate} {employment.currency || "CHF"}/hr
						</span>
					</div>
				)}

				{employment.start_date && (
					<div className={`flex items-center gap-2 text-xs sm:text-sm ${themeColors.secondaryText}`}>
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
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
						<span>
							{t("employee.employments.startDate") || "Start Date"}: {formatDate(employment.start_date)}
						</span>
					</div>
				)}

				{employment.createdAt && (
					<div className={`flex items-center gap-2 text-xs sm:text-sm ${themeColors.secondaryText}`}>
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{formatDate(employment.createdAt)}</span>
					</div>
				)}
			</div>

			{employment.status === "pending" && (
				<div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${themeColors.primaryBorder} flex gap-2 sm:gap-3`}>
					<button
						onClick={(e) => {
							e.stopPropagation();
							handleAccept();
						}}
						disabled={isProcessing}
						className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r ${themeColors.primaryButton} text-white rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
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
						onClick={(e) => {
							e.stopPropagation();
							handleReject();
						}}
						disabled={isProcessing}
						className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
				</div>
			)}

			{employment.status !== "pending" && (
				<div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${themeColors.primaryBorder} flex items-center justify-between`}>
					<p className={`text-xs sm:text-sm ${themeColors.secondaryText}`}>
						{employment.status === "accepted" 
							? (t("employee.employments.alreadyAccepted") || "Employment already accepted")
							: employment.status === "rejected"
							? (t("employee.employments.alreadyRejected") || "Employment already rejected")
							: employment.status?.toUpperCase() || ""
						}
					</p>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onViewDetails?.(employment);
						}}
						className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r ${themeColors.primaryButton} text-white rounded-lg text-xs sm:text-sm font-medium hover:from-orange-600 hover:to-amber-700 transition-all`}
					>
						{t("common.buttons.viewDetails") || "View Details"}
					</button>
				</div>
			)}
		</div>
	);
};

export default EmploymentCard;

