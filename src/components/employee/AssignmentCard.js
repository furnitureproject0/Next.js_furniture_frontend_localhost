"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { employeeApi } from "@/lib/api";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import ReportModal from "./ReportModal";

const AssignmentCard = ({ assignment, onStatusChange, onViewDetails, role = "worker" }) => {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const [isProcessing, setIsProcessing] = useState(false);
	const [isReportModalOpen, setIsReportModalOpen] = useState(false);

	// Use cream/orange theme for both worker and driver to match project theme
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

	const formatTime = (timeString) => {
		if (!timeString) return "";
		const [hours, minutes] = timeString.split(":");
		const hour = parseInt(hours, 10);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	const handleAccept = async () => {
		if (isProcessing) return;
		setIsProcessing(true);
		try {
			await employeeApi.acceptOffer(assignment.offer.id);
			toast.success(t("employee.assignments.accepted") || "Assignment accepted successfully");
			onStatusChange?.();
		} catch (error) {
			console.error("Failed to accept assignment:", error);
			toast.error(
				error?.data?.message || 
				error?.message || 
				t("employee.assignments.acceptError") || 
				"Failed to accept assignment"
			);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleReject = async () => {
		if (isProcessing) return;
		setIsProcessing(true);
		try {
			await employeeApi.rejectOffer(assignment.offer.id);
			toast.success(t("employee.assignments.rejected") || "Assignment rejected successfully");
			onStatusChange?.();
		} catch (error) {
			console.error("Failed to reject assignment:", error);
			toast.error(
				error?.data?.message || 
				error?.message || 
				t("employee.assignments.rejectError") || 
				"Failed to reject assignment"
			);
		} finally {
			setIsProcessing(false);
		}
	};

	const offer = assignment.offer;
	const company = offer?.company;
	const service = offer?.orderService?.service;
	const order = offer?.orderService?.order;

	return (
		<div
			className={`bg-white border ${themeColors.primaryBorder} rounded-xl p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow cursor-pointer`}
			onClick={() => onViewDetails?.(assignment)}
		>
			<div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-2">
						<h3 className={`text-base sm:text-lg font-semibold ${themeColors.primaryText} truncate`}>
							{t("employee.assignments.assignment")} #{assignment.id}
						</h3>
						{assignment.is_leader && (
							<span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
								{t("employee.assignments.leader") || "Leader"}
							</span>
						)}
					</div>
					<span
						className={`inline-block px-2.5 sm:px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
							assignment.status,
						)}`}
					>
						{assignment.status.toUpperCase()}
					</span>
				</div>
			</div>

			<div className="space-y-2 mb-3 sm:mb-4">
				{company && (
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
							{t("employee.assignments.company")}: {company.name}
						</span>
					</div>
				)}

				{service && (
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
								d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
						<span className="truncate">
							{t("employee.assignments.service")}: {service.name}
						</span>
					</div>
				)}

				{offer?.date && (
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
							{formatDate(offer.date)} {offer.time && `at ${formatTime(offer.time)}`}
						</span>
					</div>
				)}

				{offer?.hourly_rate && (
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
						<span>
							{offer.hourly_rate} {offer.currency || "CHF"}/hr
							{offer.min_hours && offer.max_hours && 
								` (${offer.min_hours}-${offer.max_hours} hrs)`
							}
						</span>
					</div>
				)}

				{offer?.notes && (
					<div className={`flex items-start gap-2 text-xs sm:text-sm ${themeColors.secondaryText} mt-2`}>
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5"
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
						<span className="truncate">{offer.notes}</span>
					</div>
				)}
			</div>

			{assignment.status === "pending" && (
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
							t("employee.assignments.accept") || "Accept"
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
							t("employee.assignments.reject") || "Reject"
						)}
					</button>
				</div>
			)}

			{assignment.status !== "pending" && (
				<div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${themeColors.primaryBorder} flex items-center justify-between gap-2`}>
					<p className={`text-xs sm:text-sm ${themeColors.secondaryText}`}>
						{assignment.status === "accepted" 
							? (t("employee.assignments.alreadyAccepted") || "Assignment already accepted")
							: assignment.status === "rejected"
							? (t("employee.assignments.alreadyRejected") || "Assignment already rejected")
							: assignment.status.toUpperCase()
						}
					</p>
					<div className="flex gap-2">
						{assignment.is_leader && assignment.status === "accepted" && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									setIsReportModalOpen(true);
								}}
								className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all`}
							>
								{t("employee.assignments.report") || "Report"}
							</button>
						)}
						<button
							onClick={(e) => {
								e.stopPropagation();
								onViewDetails?.(assignment);
							}}
							className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r ${themeColors.primaryButton} text-white rounded-lg text-xs sm:text-sm font-medium hover:from-orange-600 hover:to-amber-700 transition-all`}
						>
							{t("common.buttons.viewDetails") || "View Details"}
						</button>
					</div>
				</div>
			)}

			{/* Report Modal */}
			<ReportModal
				isOpen={isReportModalOpen}
				onClose={() => setIsReportModalOpen(false)}
				assignment={assignment}
				onSuccess={() => {
					onStatusChange?.();
				}}
			/>
		</div>
	);
};

export default AssignmentCard;

