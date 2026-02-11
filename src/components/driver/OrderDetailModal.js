"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedStatusLabel } from "@/utils/i18nUtils";

const getStatusColor = (status) => {
	switch (status) {
		case "pending":
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		case "assigned":
		case "scheduled":
			return "bg-blue-100 text-blue-800 border-blue-200";
		case "offer_accepted":
		case "accepted":
			return "bg-green-100 text-green-800 border-green-200";
		case "in-progress":
			return "bg-orange-100 text-orange-800 border-orange-200";
		case "completed":
			return "bg-green-100 text-green-800 border-green-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
};

export default function OrderDetailModal({ order, onClose, user }) {
	const { t } = useTranslation();
	const router = useRouter();

	// Check if current user is the team leader
	const isTeamLeader = order.teamLeader?.name === user?.name;

	const handleSubmitReport = () => {
		// Navigate to report page
		if (!order?.id) {
			console.error("Order ID is missing");
			return;
		}
		// Navigate to report page (order ID is now numeric, no encoding needed)
		router.push(`/order-report/${order.id}`);
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
			<div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="sticky top-0 bg-white border-b border-orange-200/40 px-8 py-6 rounded-t-2xl flex items-center justify-between">
					<h2 className="text-2xl font-bold text-amber-900">
						{t("driver.orderDetail.orderNumber", { id: order.id })}
					</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
					>
						<svg
							className="w-6 h-6 text-amber-700"
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
				<div className="p-8 space-y-6">
					{/* Status */}
					<div className="flex items-center gap-2">
						<svg
							className="w-5 h-5 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span
							className={`px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusColor(
								order.status,
							)}`}
						>
							{getTranslatedStatusLabel(order.status, t)}
						</span>
					</div>

					{/* Schedule & Location */}
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-200/60">
							<div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0"
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
								<h3 className="text-sm sm:text-base font-semibold text-blue-900">
									{t("driver.orderDetail.schedule")}
								</h3>
							</div>
							<p className="text-xs sm:text-sm text-blue-800">
								{order.date || t("driver.orderDetail.invalidDate")} {t("driver.orderDetail.at")} {" "}
								{order.time || t("driver.orderDetail.invalidDate")}
							</p>
						</div>

						<div className="bg-orange-50 rounded-xl p-3 sm:p-4 border border-orange-200/60">
							<div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
								</svg>
								<h3 className="text-sm sm:text-base font-semibold text-orange-900">
									{t("driver.orderDetail.locationDetails")}
								</h3>
							</div>
							<p className="text-xs sm:text-sm text-orange-800">
								{t("driver.orderDetail.floor")} {order.floor || "1"}
							</p>
							<p className="text-xs sm:text-sm text-orange-800">
								{order.hasElevator
									? t("driver.orderDetail.elevatorAvailable")
									: t("driver.orderDetail.noElevator")}
							</p>
						</div>
					</div>

					{/* Address with Map */}
					<div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
						<div className="flex items-start gap-1.5 sm:gap-2 mb-2 sm:mb-3">
							<svg
								className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-0.5 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
							</svg>
							<div className="flex-1 min-w-0">
								<h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-0.5 sm:mb-1">
									{t("driver.orderDetail.address")}
								</h3>
								<p className="text-xs sm:text-sm text-gray-700">
									{order.address || t("driver.orderDetail.addressNotAvailable")}
								</p>
							</div>
						</div>

						{/* Map Placeholder */}
						<div className="bg-gray-200 rounded-lg h-32 sm:h-40 lg:h-48 flex items-center justify-center relative overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-br from-green-100/30 to-blue-100/30"></div>
							<svg
								className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400 relative z-10"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
								/>
							</svg>
						</div>

						<div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-3">
							<button className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 sm:gap-2">
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
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
									/>
								</svg>
								<span className="truncate">{t("driver.orderDetail.openInMaps")}</span>
							</button>
							<button className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 sm:gap-2">
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
										d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
									/>
								</svg>
								<span className="truncate">{t("driver.orderDetail.directions")}</span>
							</button>
						</div>
					</div>

					{/* Client Information */}
					<div className="bg-purple-50 rounded-xl p-3 sm:p-4 border border-purple-200/60">
						<div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
							<svg
								className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
							<h3 className="text-sm sm:text-base font-semibold text-purple-900">
								{t("driver.orderDetail.clientInformation")}
							</h3>
						</div>
						<p className="text-sm sm:text-base font-medium text-purple-900 mb-1">
							{order.customer || "Marco Rossi"}
						</p>
						<div className="space-y-1">
							<p className="text-xs sm:text-sm text-purple-700 flex items-center gap-1.5 sm:gap-2">
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
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								<span className="truncate">{order.customerEmail || "marco.rossi@email.com"}</span>
							</p>
							<p className="text-xs sm:text-sm text-purple-700 flex items-center gap-1.5 sm:gap-2">
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
										d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
									/>
								</svg>
								<span className="truncate">+41-79-123-4567</span>
							</p>
						</div>
					</div>

					{/* Assigned Workers */}
					{order.teamMembers && order.teamMembers.length > 0 && (
						<div className="bg-amber-50 rounded-xl p-3 sm:p-4 border border-amber-200/60">
							<div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
								<h3 className="text-sm sm:text-base font-semibold text-amber-900">
									{t("driver.orderDetail.assignedWorkers", { count: order.teamMembers.length })}
								</h3>
							</div>
							<div className="space-y-1.5 sm:space-y-2">
								{order.teamMembers.map((member, idx) => (
									<div
										key={idx}
										className="flex items-center gap-2 sm:gap-3 bg-white rounded-lg p-2 sm:p-3"
									>
										<div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
											<span className="text-white text-xs sm:text-sm font-semibold">
												{member.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</span>
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm sm:text-base font-medium text-amber-900 truncate">
												{member.name}
											</p>
											<p className="text-xs sm:text-sm text-amber-700 truncate">
												{member.phone ||
													"+41-79-345-6789"}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Services */}
					<div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-200/60">
						<h3 className="text-sm sm:text-base font-semibold text-green-900 mb-1.5 sm:mb-2">
							{t("driver.orderDetail.services")}
						</h3>
						<div className="flex flex-wrap gap-1.5 sm:gap-2">
							<span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white text-green-800 rounded-full text-xs sm:text-sm border border-green-200">
								{order.service || "furniture_moving"}
							</span>
						</div>
					</div>
				</div>

				{/* Footer - Submit Report Button (only for team leader) */}
				{isTeamLeader && (
					<div className="sticky bottom-0 bg-white border-t border-orange-200/40 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 rounded-b-xl sm:rounded-b-2xl">
						<button
							onClick={handleSubmitReport}
							className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
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
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							{t("driver.orderDetail.submitReport")}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

