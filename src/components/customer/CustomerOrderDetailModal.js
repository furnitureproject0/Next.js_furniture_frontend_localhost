"use client";

import { STATUS_COLORS } from "@/constants/orderConstants";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch } from "@/store/hooks";
import { acceptOffer, rejectOffer } from "@/store/slices/ordersSlice";
import { formatCurrency } from "@/utils/financeUtils";
import { getTranslatedServiceTypes, getTranslatedStatusLabel } from "@/utils/i18nUtils";
import { formatOrderId } from "@/utils/orderUtils";
import { useState } from "react";
import EditCustomerOrderModal from "./EditCustomerOrderModal";

export default function CustomerOrderDetailModal({ isOpen, onClose, order }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { toast } = useGlobalToast();
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");
	const [selectedOfferId, setSelectedOfferId] = useState(null);

	if (!isOpen || !order) return null;
	
	// Check if order can be edited (no offers)
	const canEdit = !order.offer || order.offer === null;

	const TRANSLATED_SERVICE_TYPES = getTranslatedServiceTypes(t);
	const getServiceNames = () => {
		// Use servicesDetails if available (contains {id, name}), otherwise fallback to services array (IDs only)
		if (order.servicesDetails && Array.isArray(order.servicesDetails)) {
			return order.servicesDetails.map((service) => {
				const translatedService = TRANSLATED_SERVICE_TYPES.find((s) => s.id === service.id);
				return translatedService?.name || service.name || service.id;
			});
		}
		// Fallback to old format
		return order.services?.map((serviceId) => {
			const service = TRANSLATED_SERVICE_TYPES.find((s) => s.id === serviceId);
			return service?.name || serviceId;
		}) || [];
	};

	const formatDate = (dateString) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatDateTime = (dateString, timeString) => {
		if (!dateString) return "";
		const date = new Date(`${dateString}T${timeString || "00:00:00"}`);
		return date.toLocaleString("en-US", {
			year: "numeric",
			month: "long",
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

	const handleAcceptOffer = async (offerId) => {
		try {
			const result = await dispatch(acceptOffer({ offerId })).unwrap();
			const message = result?.message || t("notifications.offerAccepted") || "Offer accepted successfully";
			toast.success(message);
		} catch (error) {
			const errorMessage = error?.message || error?.payload?.message || t("common.errors.failedToAcceptOffer") || "Failed to accept offer";
			toast.error(errorMessage);
		}
	};

	const handleRejectOffer = (offerId) => {
		setSelectedOfferId(offerId);
		setShowRejectDialog(true);
	};

	const confirmRejectOffer = async () => {
		if (!selectedOfferId) return;
		try {
			const result = await dispatch(rejectOffer({ offerId: selectedOfferId, reason: rejectionReason })).unwrap();
			const message = result?.message || t("notifications.offerRejected") || "Offer rejected successfully";
			toast.success(message);
			setShowRejectDialog(false);
			setRejectionReason("");
			setSelectedOfferId(null);
		} catch (error) {
			const errorMessage = error?.message || error?.payload?.message || t("common.errors.failedToRejectOffer") || "Failed to reject offer";
			toast.error(errorMessage);
		}
	};

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
			<div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 border-b border-orange-100 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
					<div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
						<div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
							<span className="text-orange-600 font-bold text-sm sm:text-base lg:text-lg">
								#{order.id.toString().padStart(4, "0")}
							</span>
						</div>
						<div className="flex-1 min-w-0">
							<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 truncate">
								{t("orderDetails.title")}
							</h2>
							<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1 truncate">
								{formatOrderId(order.id)} • {formatDate(order.createdAt)}
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 sm:p-2 hover:bg-orange-100 rounded-lg transition-colors flex-shrink-0 ml-2"
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
				<div className="p-4 sm:p-5 lg:p-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)] space-y-4 sm:space-y-5 lg:space-y-6">
					{/* Status */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
						<div>
							<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1.5 sm:mb-2">
								{t("orderDetails.status")}
							</p>
							<span
								className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${STATUS_COLORS[order.status]}`}
							>
								{getTranslatedStatusLabel(order.status, t)}
							</span>
						</div>
						{order.assignedCompanyId && (
							<div className="text-left sm:text-right">
								<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1">
									{t("orderDetails.company")}
								</p>
								<p className="text-xs sm:text-sm text-amber-900 font-medium">
									{order.assignedCompanyName || t("orderDetails.assignedTo")}
								</p>
							</div>
						)}
					</div>

					{/* Services & Additions */}
					<div>
						<h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide mb-3">
							{t("orderDetails.services")}
						</h3>
						<div className="space-y-3">
							{/* Services with offers */}
							{order.orderServices && order.orderServices.length > 0 ? (
								<div className="space-y-3">
									{order.orderServices.map((orderService) => {
										const serviceId = orderService.serviceId || orderService.service_id || orderService.service?.id;
										const serviceName = orderService.serviceName || orderService.service?.name || (serviceId && TRANSLATED_SERVICE_TYPES.find(s => s.id === serviceId)?.name) || t("common.nA");
										
										// Get additions for this specific service
										let serviceAdditions = [];
										if (order.servicesWithAdditions && Array.isArray(order.servicesWithAdditions)) {
											const serviceGroup = order.servicesWithAdditions.find(sg => 
												sg.id === orderService.id || 
												sg.serviceId === serviceId || 
												sg.serviceId === orderService.service_id
											);
											if (serviceGroup && serviceGroup.additions) {
												serviceAdditions = serviceGroup.additions;
											}
										}
										
										return (
											<div key={orderService.id} className="p-3 sm:p-4 bg-orange-50/50 rounded-lg sm:rounded-xl border border-orange-200/50">
												<div className="flex items-center justify-between mb-2 sm:mb-3">
													<span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs sm:text-sm font-medium border border-orange-200/50">
														{serviceName}
													</span>
												</div>
												
												{/* Show all offers for this service */}
												{orderService.offers && orderService.offers.length > 0 ? (
													<div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-orange-200/50">
														<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1.5 sm:mb-2">
															{t("orderDetails.offers")}
														</p>
														<div className="space-y-2 sm:space-y-3">
															{orderService.offers.map((offer, idx) => (
																<div
																	key={offer.id || idx}
																	className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200/50"
																>
																	<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-0 mb-1.5 sm:mb-2">
																		<span className="text-xs font-medium text-amber-600/70">
																			{t("orderDetails.offer")} #{idx + 1}
																		</span>
																		{offer.status && (
																			<span className={`px-2 py-0.5 rounded text-xs font-medium ${
																				offer.status === "pending" 
																					? "bg-yellow-100 text-yellow-800" 
																					: offer.status === "accepted"
																					? "bg-green-100 text-green-800"
																					: offer.status === "rejected"
																					? "bg-red-100 text-red-800"
																					: offer.status === "cancelled"
																					? "bg-gray-100 text-gray-800"
																					: "bg-gray-100 text-gray-800"
																			}`}>
																				{offer.status}
																			</span>
																		)}
																	</div>
																	
																	<div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
																		<div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-1 sm:gap-0">
																			<span className="text-xs sm:text-sm text-amber-700 font-medium">
																				{t("orderDetails.price")}:
																			</span>
																			<span className="text-lg sm:text-xl font-bold text-green-600">
																				{offer.hourly_rate 
																					? `CHF ${offer.hourly_rate}/hour`
																					: formatCurrency(offer.price, offer.currency || "CHF")
																				}
																			</span>
																		</div>
																		{(offer.min_hours || offer.max_hours) && (
																			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
																				<span className="text-amber-700">
																					{t("orderDetails.estimatedHours")}:
																				</span>
																				<span className="text-amber-900 font-medium">
																					{offer.min_hours === offer.max_hours
																						? `${offer.min_hours}h`
																						: `${offer.min_hours}-${offer.max_hours}h`
																					}
																				</span>
																			</div>
																		)}
																		{offer.date && (
																			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
																				<span className="text-amber-700">
																					{t("orderDetails.scheduledDate")}:
																				</span>
																				<span className="text-amber-900 font-medium">
																					{formatDate(offer.date)}
																					{offer.time && ` ${formatTime(offer.time)}`}
																				</span>
																			</div>
																		)}
																		{offer.notes && (
																			<div className="pt-1.5 sm:pt-2 border-t border-orange-200/50">
																				<p className="text-xs text-amber-600/70 mb-0.5 sm:mb-1">
																					{t("orderDetails.offerNotes")}:
																				</p>
																				<p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
																					{offer.notes}
																				</p>
																			</div>
																		)}
																	</div>
																	
																	{/* Accept/Reject Buttons for pending offers */}
																	{offer.status === "pending" && (
																		<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-orange-200/50">
																			<button
																				onClick={() => handleRejectOffer(offer.id)}
																				className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer"
																			>
																				{t("orderDetails.rejectOffer")}
																			</button>
																			<button
																				onClick={() => handleAcceptOffer(offer.id)}
																				className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors cursor-pointer"
																			>
																				{t("orderDetails.acceptOffer")}
																			</button>
																		</div>
																	)}
																</div>
															))}
														</div>
													</div>
												) : (
													<div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-orange-200/50">
														<p className="text-xs text-amber-400/50 text-center">
															{t("orderDetails.noOffers")}
														</p>
													</div>
												)}
												
												{/* Show additions for this service */}
												{serviceAdditions.length > 0 && (
													<div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-orange-200/50">
														<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1.5 sm:mb-2">
															{t("orderSteps.selectAdditions")}
														</p>
														<div className="flex flex-wrap gap-2">
															{serviceAdditions.map((addition, idx) => (
																<div
																	key={idx}
																	className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium border border-amber-200/50 flex items-center gap-2"
																>
																	<svg
																		className="w-4 h-4"
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
																	<span>{addition.name}</span>
																	{addition.note && (
																		<span className="text-xs text-amber-600/70 italic">
																			({addition.note})
																		</span>
																	)}
																</div>
															))}
														</div>
													</div>
												)}
											</div>
										);
									})}
								</div>
							) : (
								<>
									{/* Fallback to old format */}
									<div className="flex flex-wrap gap-2">
										{getServiceNames().map((serviceName, index) => (
											<span
												key={index}
												className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200/50"
											>
												{serviceName}
											</span>
										))}
									</div>
									{/* Additions */}
									{order.additions && order.additions.length > 0 && (
										<div>
											<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2">
												{t("orderSteps.selectAdditions")}
											</p>
											<div className="flex flex-wrap gap-2">
												{order.additions.map((addition, index) => (
													<div
														key={index}
														className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium border border-amber-200/50 flex items-center gap-2"
													>
														<svg
															className="w-4 h-4"
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
														<span>{addition.name}</span>
														{addition.note && (
															<span className="text-xs text-amber-600/70 italic">
																({addition.note})
															</span>
														)}
													</div>
												))}
											</div>
										</div>
									)}
								</>
							)}
						</div>
					</div>

					{/* Schedule & Room Configuration */}
					{(order.preferred_date || order.number_of_rooms) && (
						<div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200/50">
							<h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide mb-4">
								{t("orderDetails.schedule")} & {t("orderDetails.roomConfiguration")}
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{order.preferred_date && (
									<div className="flex items-start gap-3">
										<div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
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
										</div>
										<div>
											<p className="text-xs text-amber-600/70 uppercase tracking-wide mb-1">
												{t("orderDetails.date")}
											</p>
											<p className="text-sm font-medium text-amber-900">
												{formatDate(order.preferred_date)}
												{order.preferred_time && (
													<span className="ml-2 text-amber-700">
														• {formatTime(order.preferred_time)}
													</span>
												)}
											</p>
										</div>
									</div>
								)}
								{order.number_of_rooms && (
									<div className="flex items-start gap-3">
										<div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
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
													d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
												/>
											</svg>
										</div>
										<div>
											<p className="text-xs text-amber-600/70 uppercase tracking-wide mb-1">
												{t("orderDetails.roomConfiguration")}
											</p>
											<p className="text-sm font-medium text-amber-900">
												{order.number_of_rooms} {t("common.labels.rooms")}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Addresses */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="p-4 bg-amber-50/30 rounded-xl border border-amber-200/30">
							<h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide mb-3 flex items-center gap-2">
								<svg
									className="w-4 h-4 text-orange-600"
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
								{t("orderDetails.fromAddress")}
							</h3>
							<p className="text-sm text-amber-900 leading-relaxed">
								{order.fromAddress || order.addresses?.from || "-"}
							</p>
						</div>
						{order.toAddress && (
							<div className="p-4 bg-amber-50/30 rounded-xl border border-amber-200/30">
								<h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide mb-3 flex items-center gap-2">
									<svg
										className="w-4 h-4 text-orange-600"
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
									{t("orderDetails.toAddress")}
								</h3>
								<p className="text-sm text-amber-900 leading-relaxed">
									{order.toAddress || order.addresses?.to || "-"}
								</p>
							</div>
						)}
					</div>

					{/* Notes */}
					{order.notes && (
						<div className="p-4 bg-amber-50/30 rounded-xl border border-amber-200/30">
							<h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide mb-2">
								{t("orderDetails.notes")}
							</h3>
							<p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
								{order.notes}
							</p>
						</div>
					)}


					{/* Order History Timeline */}
					{order.history && order.history.length > 0 && (
						<div className="p-4 bg-amber-50/30 rounded-xl border border-amber-200/30">
							<h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide mb-4">
								{t("orderDetails.orderTimeline")}
							</h3>
							<div className="relative">
								{/* Timeline line */}
								<div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-200 via-amber-200 to-orange-200"></div>
								<div className="space-y-4 relative">
									{order.history.map((event, index) => {
										const eventLabels = {
											order_created: t("orderDetails.orderCreated"),
											company_assigned: t("orderDetails.orderAssigned"),
											offer_sent: t("orderDetails.offerSent") || t("orders.status.offer_sent") || "Offer Sent",
											offer_modified: t("orderDetails.offerModified"),
											offer_accepted: t("orderDetails.offerAccepted") || t("orders.status.offer_accepted") || "Offer Accepted",
											offer_rejected: t("orderDetails.offerRejected"),
											status_change: event.payload?.status || t("orderDetails.status"),
											assigned: t("orders.status.assigned") || "Assigned",
											accepted_by_company: t("orders.status.accepted_by_company") || "Accepted by Company",
										};
										const eventColors = {
											order_created: "bg-green-500 border-green-600",
											company_assigned: "bg-indigo-500 border-indigo-600",
											offer_sent: "bg-blue-500 border-blue-600",
											offer_modified: "bg-purple-500 border-purple-600",
											offer_accepted: "bg-green-600 border-green-700",
											offer_rejected: "bg-red-500 border-red-600",
											status_change: "bg-amber-500 border-amber-600",
											assigned: "bg-indigo-500 border-indigo-600",
											accepted_by_company: "bg-green-500 border-green-600",
										};
										
										// Get status label
										const statusLabel = getTranslatedStatusLabel(event.status || event.type, t);
										
										// Get message from payload if available
										const displayMessage = event.payload?.message || event.message;
										
										return (
											<div key={event.id || index} className="flex items-start gap-4 relative">
												<div className={`w-3 h-3 ${eventColors[event.type] || "bg-gray-500 border-gray-600"} rounded-full border-2 border-white mt-1 z-10 flex-shrink-0`}></div>
												<div className="flex-1 pb-4">
													{/* Status Badge */}
													<div className="flex items-center gap-2 mb-1.5">
														<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
															event.status === "assigned" || event.type === "assigned"
																? "bg-indigo-100 text-indigo-800 border border-indigo-200"
																: event.status === "offer_sent" || event.type === "offer_sent"
																? "bg-blue-100 text-blue-800 border border-blue-200"
																: event.status === "offer_accepted" || event.type === "offer_accepted"
																? "bg-green-100 text-green-800 border border-green-200"
																: event.status === "offer_rejected" || event.type === "offer_rejected"
																? "bg-red-100 text-red-800 border border-red-200"
																: event.status === "accepted_by_company" || event.type === "accepted_by_company"
																? "bg-green-100 text-green-800 border border-green-200"
																: "bg-gray-100 text-gray-800 border border-gray-200"
														}`}>
															{statusLabel}
														</span>
													</div>
													{/* Message */}
													{displayMessage && (
														<p className="text-sm font-medium text-amber-900 mb-1">
															{displayMessage}
														</p>
													)}
													{/* Date */}
													<p className="text-xs text-amber-700/70 mt-1">
														{formatDate(event.at)}
													</p>
													{event.type === "offer_modified" && (
														<p className="text-xs text-purple-600 mt-2 font-medium">
															{t("orderDetails.offerModified")}
														</p>
													)}
													{event.type === "offer_rejected" && event.payload?.reason && (
														<div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
															<p className="text-red-700 font-medium mb-1">
																{t("orderDetails.rejectReason")}:
															</p>
															<p className="text-red-600">
																{event.payload.reason}
															</p>
														</div>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-5 lg:p-6 border-t border-orange-100 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
					<div className="text-xs text-amber-600/70 text-center sm:text-left">
						{t("orderDetails.lastUpdated")}: {order.updatedAt ? formatDate(order.updatedAt) : formatDate(order.createdAt)}
					</div>
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
						{canEdit && (
							<button
								onClick={() => setShowEditModal(true)}
								className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
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
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
								{t("common.buttons.edit")}
							</button>
						)}
						<button
							onClick={onClose}
							className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-amber-700 hover:text-amber-900 hover:bg-white font-medium rounded-lg transition-colors"
						>
							{t("common.buttons.close")}
						</button>
					</div>
				</div>
				
				{/* Edit Modal */}
				<EditCustomerOrderModal
					isOpen={showEditModal}
					onClose={() => {
						setShowEditModal(false);
						onClose(); // Also close detail modal when edit modal closes
					}}
					order={order}
					onOrderUpdated={(updatedOrder) => {
						setShowEditModal(false);
						onClose();
					}}
				/>
			</div>

			{/* Reject Offer Dialog */}
			{showRejectDialog && (
				<div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[10000]">
					<div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
						<h3 className="text-xl font-bold text-amber-900 mb-4">
							{t("common.buttons.rejectOffer")}
						</h3>
						<p className="text-sm text-amber-700 mb-4">
							{t("orderDetails.rejectConfirmMessageOptional")}
						</p>
						<textarea
							value={rejectionReason}
							onChange={(e) => setRejectionReason(e.target.value)}
							placeholder={t("orderDetails.rejectReasonPlaceholder")}
							className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-amber-900 placeholder-amber-400 mb-4"
							rows={4}
						/>
						<div className="flex items-center gap-3">
							<button
								onClick={() => {
									setShowRejectDialog(false);
									setRejectionReason("");
									setSelectedOfferId(null);
								}}
								className="flex-1 px-4 py-2 text-amber-700 hover:text-amber-900 font-medium transition-colors"
							>
								{t("common.buttons.cancel")}
							</button>
							<button
								onClick={confirmRejectOffer}
								className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
							>
								{t("orderDetails.confirmRejection")}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

