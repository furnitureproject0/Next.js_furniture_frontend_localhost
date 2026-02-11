"use client";

import { STATUS_COLORS } from "@/constants/orderConstants";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch } from "@/store/hooks";
import { formatCurrency } from "@/utils/financeUtils";
import { getTranslatedServiceTypes, getTranslatedStatusLabel } from "@/utils/i18nUtils";
import { formatOrderId, formatOrderIdShort } from "@/utils/orderUtils";
import { useState, useEffect } from "react";
import CustomerOrderDetailModal from "./CustomerOrderDetailModal";
import EditCustomerOrderModal from "./EditCustomerOrderModal";

export default function CustomerOrderCard({ order, openOrderId = null, onOrderModalClose }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	
	// Check if order can be edited (no offers)
	const canEdit = !order.offer || order.offer === null;

	// Open modal if openOrderId matches this order
	useEffect(() => {
		if (openOrderId === order.id) {
			setShowDetailModal(true);
		} else if (openOrderId !== null && openOrderId !== order.id) {
			// Close modal if openOrderId changed to a different order
			setShowDetailModal(false);
		}
	}, [openOrderId, order.id]);

	// Handle modal close
	const handleModalClose = () => {
		setShowDetailModal(false);
		if (onOrderModalClose) {
			onOrderModalClose();
		}
	};

	const TRANSLATED_SERVICE_TYPES = getTranslatedServiceTypes(t);
	const getServiceNames = () => {
		return order.services
			.map((serviceId) => {
				const service = TRANSLATED_SERVICE_TYPES.find((s) => s.id === serviceId);
				return service?.name || serviceId;
			})
			.join(", ");
	};

	const formatDate = (dateString) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatDateTime = (dateString, timeString) => {
		if (!dateString) return "";
		const date = new Date(`${dateString}T${timeString || "00:00:00"}`);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			...(timeString && {
				hour: "2-digit",
				minute: "2-digit",
			}),
		});
	};

	const formatTime = (timeString) => {
		if (!timeString) return "";
		const [hours, minutes] = timeString.split(":");
		return `${hours}:${minutes}`;
	};


	return (
		<>
			<div className="group border border-orange-200/60 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:border-orange-300/60 transition-all duration-200 bg-white/60 backdrop-blur-sm">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
					<div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
						<div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
							<span className="text-orange-600 font-bold text-xs sm:text-sm">
								{formatOrderIdShort(order.id)}
							</span>
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="font-semibold text-amber-900 text-base sm:text-lg truncate">
								{formatOrderId(order.id)}
							</h3>
							<div className="flex items-center gap-2 mt-1">
								<span className="text-xs sm:text-sm text-amber-700/70">
									{t("orderDetails.created")}: {formatDate(order.createdAt)}
								</span>
							</div>
						</div>
					</div>
					<div
						className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border flex-shrink-0 ${STATUS_COLORS[order.status]}`}
					>
						{getTranslatedStatusLabel(order.status, t)}
					</div>
				</div>

				{/* Details */}
				<div className="space-y-3 sm:space-y-4 mb-4">
					{/* Services & Additions */}
					<div>
						<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1.5 sm:mb-2">
							{t("orderDetails.services")}
						</p>
						<div className="space-y-2">
							{/* Services with offers count */}
							{order.orderServices && order.orderServices.length > 0 ? (
								<div className="space-y-2">
									{order.orderServices.map((orderService) => {
										const serviceId = orderService.serviceId || orderService.service_id || orderService.service?.id;
										const serviceName = orderService.serviceName || orderService.service?.name || (serviceId && TRANSLATED_SERVICE_TYPES.find(s => s.id === serviceId)?.name) || t("common.nA");
										const offersCount = orderService.offers?.length || 0;
										
										return (
											<div key={orderService.id || serviceId} className="p-2 bg-orange-50/30 rounded-lg border border-orange-200/50 flex items-center justify-between">
												<span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium border border-orange-200/50">
													{serviceName}
												</span>
												{offersCount > 0 ? (
													<span className="text-xs text-amber-600/70 font-medium">
														{offersCount === 1 
															? t("orderDetails.offersCount", { count: offersCount })
															: t("orderDetails.offersCountPlural", { count: offersCount })
														}
													</span>
												) : (
													<span className="text-xs text-amber-400/50">
														{t("orderDetails.noOffers")}
													</span>
												)}
											</div>
										);
									})}
								</div>
							) : (
								<div className="flex flex-wrap gap-2">
									{order.servicesDetails && Array.isArray(order.servicesDetails) && order.servicesDetails.length > 0
										? order.servicesDetails.map((service, idx) => {
												// Ensure service is an object with id and name
												if (!service || typeof service !== 'object') return null;
												const serviceId = typeof service.id !== 'undefined' ? service.id : service;
												const serviceName = service.name || '';
												// Try to get translated name first, then use service name from API
												const translatedService = TRANSLATED_SERVICE_TYPES.find((s) => s.id === serviceId);
												const displayName = translatedService?.name || serviceName || String(serviceId);
												return (
													<span
														key={idx}
														className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium border border-orange-200/50"
													>
														{displayName}
													</span>
												);
										  }).filter(Boolean)
										: (Array.isArray(order.services) ? order.services : []).map((serviceItem, idx) => {
												// Handle both ID (number/string) and object formats
												const serviceId = typeof serviceItem === 'object' && serviceItem !== null 
													? (serviceItem.id || serviceItem.service_id)
													: serviceItem;
												const service = TRANSLATED_SERVICE_TYPES.find((s) => s.id === serviceId);
												const displayName = service?.name || 
													(typeof serviceItem === 'object' && serviceItem?.name) || 
													String(serviceId);
												return (
													<span
														key={idx}
														className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium border border-orange-200/50"
													>
														{displayName}
													</span>
												);
										  })}
								</div>
							)}
							{/* Additions */}
							{order.additions && order.additions.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{order.additions.map((addition, idx) => {
										if (!addition || typeof addition !== 'object') return null;
										const additionName = addition.name || addition.note || 'Unknown Addition';
										return (
											<span
												key={idx}
												className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium border border-amber-200/50 flex items-center gap-1"
											>
												<svg
													className="w-3 h-3"
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
												{String(additionName)}
											</span>
										);
									}).filter(Boolean)}
								</div>
							)}
						</div>
					</div>

					{/* Schedule & Room Info */}
					{(order.preferred_date || order.number_of_rooms) && (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-2.5 sm:p-3 bg-amber-50/50 rounded-lg">
							{order.preferred_date && (
								<div className="flex items-start gap-2">
									<svg
										className="w-4 h-4 text-amber-600/70 mt-0.5 flex-shrink-0"
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
									<div>
										<p className="text-xs text-amber-600/70 uppercase tracking-wide">
											{t("orderDetails.schedule")}
										</p>
										<p className="text-sm text-amber-900 font-medium">
											{formatDate(order.preferred_date)}
											{order.preferred_time && ` at ${formatTime(order.preferred_time)}`}
										</p>
									</div>
								</div>
							)}
							{order.number_of_rooms && (
								<div className="flex items-start gap-2">
									<svg
										className="w-4 h-4 text-amber-600/70 mt-0.5 flex-shrink-0"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
										/>
									</svg>
									<div>
										<p className="text-xs text-amber-600/70 uppercase tracking-wide">
											{t("orderDetails.roomConfiguration")}
										</p>
										<p className="text-sm text-amber-900 font-medium">
											{order.number_of_rooms} {t("common.labels.rooms")}
										</p>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Addresses */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2">
								{t("orderDetails.fromAddress")}
							</p>
							<div className="flex items-start gap-2">
								<svg
									className="w-4 h-4 text-amber-600/60 mt-0.5 flex-shrink-0"
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
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								<p className="text-sm text-amber-900 font-medium leading-relaxed">
									{order.fromAddress || order.addresses?.from || "-"}
								</p>
							</div>
						</div>
						{order.toAddress && (
							<div>
								<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2">
									{t("orderDetails.toAddress")}
								</p>
								<div className="flex items-start gap-2">
									<svg
										className="w-4 h-4 text-amber-600/60 mt-0.5 flex-shrink-0"
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
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
									<p className="text-sm text-amber-900 font-medium leading-relaxed">
										{order.toAddress || order.addresses?.to || "-"}
									</p>
								</div>
							</div>
						)}
					</div>
				</div>


				{/* Actions */}
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-3 border-t border-orange-100/50">
					<div className="flex items-center gap-2 flex-wrap">
						<button
							onClick={() => setShowDetailModal(true)}
							className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-amber-700 hover:text-amber-900 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
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
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
							<span className="whitespace-nowrap">{t("common.buttons.viewDetails")}</span>
						</button>
						
						{canEdit && (
							<button
								onClick={() => setShowEditModal(true)}
								className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
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
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
								<span className="whitespace-nowrap">{t("common.buttons.edit")}</span>
							</button>
						)}
					</div>

				</div>
			</div>

			{/* Detail Modal */}
			<CustomerOrderDetailModal
				isOpen={showDetailModal}
				onClose={handleModalClose}
				order={order}
			/>
			
			{/* Edit Modal */}
			<EditCustomerOrderModal
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
				order={order}
				onOrderUpdated={(updatedOrder) => {
					setShowEditModal(false);
					// Optionally refresh the order list
				}}
			/>

		</>
	);
}

