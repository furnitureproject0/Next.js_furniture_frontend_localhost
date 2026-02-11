"use client";

import AssignEmployeesModal from "@/components/modals/AssignEmployeesModal";
import { STATUS_COLORS } from "@/constants/orderConstants";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { useTranslation } from "@/hooks/useTranslation";
import { companyAdminApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import { acceptOrderService, cancelOffer, rejectOrderService } from "@/store/slices/ordersSlice";
import { formatCurrency } from "@/utils/financeUtils";
import { getTranslatedServiceTypes, getTranslatedStatusLabel } from "@/utils/i18nUtils";
import { formatOrderId, formatOrderIdShort } from "@/utils/orderUtils";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const OrderDetailModal = ({ isOpen, onClose, order, t, onSetPrice, onAssignEmployees }) => {
	const dispatch = useAppDispatch();
	const { toast } = useGlobalToast();
	const [assignmentsByOffer, setAssignmentsByOffer] = useState({});
	const [loadingAssignments, setLoadingAssignments] = useState({});
	
	// Fetch assignments for all offers when modal opens
	useEffect(() => {
		if (!isOpen || !order?.orderServices || typeof window === 'undefined') return;
		
		const fetchAllAssignments = async () => {
			const offersToFetch = [];
			order.orderServices.forEach((orderService) => {
				if (orderService.offers && Array.isArray(orderService.offers)) {
					orderService.offers.forEach((offer) => {
						if (offer.id) {
							offersToFetch.push(offer.id);
						}
					});
				}
			});
			
			if (offersToFetch.length === 0) return;
			
			setLoadingAssignments({});
			const assignmentsMap = {};
			const loadingMap = {};
			
			// Set all as loading
			offersToFetch.forEach((offerId) => {
				loadingMap[offerId] = true;
			});
			setLoadingAssignments(loadingMap);
			
			// Fetch assignments for each offer
			const fetchPromises = offersToFetch.map(async (offerId) => {
				try {
					const response = await companyAdminApi.getOfferAssignments(offerId);
					const assignmentsData = response?.data?.assignments || response?.data || response || [];
					assignmentsMap[offerId] = Array.isArray(assignmentsData) ? assignmentsData : [];
				} catch (error) {
					console.error(`Failed to fetch assignments for offer ${offerId}:`, error);
					assignmentsMap[offerId] = [];
				} finally {
					loadingMap[offerId] = false;
				}
			});
			
			await Promise.all(fetchPromises);
			setAssignmentsByOffer(assignmentsMap);
			setLoadingAssignments(loadingMap);
		};
		
		fetchAllAssignments();
	}, [isOpen, order?.orderServices]);
	
	const handleAcceptOrderService = async (orderServiceId) => {
		try {
			const result = await dispatch(acceptOrderService({ orderId: order.id, orderServiceId })).unwrap();
			const message = result?.message || t("notifications.orderServiceAccepted") || "Order service accepted successfully";
			toast.success(message);
		} catch (error) {
			const errorMessage = error?.message || error?.payload?.message || t("common.errors.failedToAccept") || "Failed to accept order service";
			toast.error(errorMessage);
		}
	};
	
	const handleRejectOrderService = async (orderServiceId) => {
		try {
			const result = await dispatch(rejectOrderService({ orderId: order.id, orderServiceId })).unwrap();
			const message = result?.message || t("notifications.orderServiceRejected") || "Order service rejected successfully";
			toast.success(message);
		} catch (error) {
			const errorMessage = error?.message || error?.payload?.message || t("common.errors.failedToReject") || "Failed to reject order service";
			toast.error(errorMessage);
		}
	};
	
	const handleCancelOffer = async (offerId, orderServiceId) => {
		try {
			const result = await dispatch(cancelOffer({ offerId, orderId: order.id, orderServiceId })).unwrap();
			const message = result?.message || t("notifications.offerCancelled") || "Offer cancelled successfully";
			toast.success(message);
		} catch (error) {
			const errorMessage = error?.message || error?.payload?.message || t("common.errors.failedToCancelOffer") || "Failed to cancel offer";
			toast.error(errorMessage);
		}
	};

	if (!isOpen || !order || typeof window === 'undefined') return null;
	
	const TRANSLATED_SERVICE_TYPES = getTranslatedServiceTypes(t);
	
	const formatDate = (dateString) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatTime = (timeString) => {
		if (!timeString) return "";
		const [hours, minutes] = timeString.split(":");
		return `${hours}:${minutes}`;
	};

	const getServiceName = (serviceId) => {
		const service = TRANSLATED_SERVICE_TYPES.find((s) => s.id === serviceId);
		return service?.name || `Service ${serviceId}`;
	};

	const getServiceNames = () => {
		if (order.servicesDetails && Array.isArray(order.servicesDetails) && order.servicesDetails.length > 0) {
			return order.servicesDetails.map((service) => {
				const serviceId = typeof service.id !== 'undefined' ? service.id : service;
				const serviceName = service.name || '';
				const translatedService = TRANSLATED_SERVICE_TYPES.find((s) => s.id === serviceId);
				return translatedService?.name || serviceName || String(serviceId);
			});
		}
		if (order.orderServices && order.orderServices.length > 0) {
			return order.orderServices.map((os) => {
				return os.serviceName || os.service?.name || (os.serviceId && getServiceName(os.serviceId)) || (os.service_id && getServiceName(os.service_id)) || t("common.nA");
			});
		}
		return order.services?.map((serviceId) => {
			const service = TRANSLATED_SERVICE_TYPES.find((s) => s.id === serviceId);
			return service?.name || serviceId;
		}) || [];
	};

	const modalContent = (
		<>
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4" style={{ zIndex: 9999 }}>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
				style={{ zIndex: 9998 }}
			/>
			
			{/* Modal */}
			<div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden" style={{ zIndex: 9999 }}>
				{/* Header */}
				<div className="flex items-center justify-between p-4 sm:p-6 border-b border-orange-100">
					<div className="flex-1 min-w-0 pr-2">
						<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 truncate">
							{t("orderDetails.title")}
						</h2>
						<p className="text-xs sm:text-sm text-amber-700/70 mt-1 truncate">
							{formatOrderId(order.id)} • {formatDate(order.createdAt)}
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 sm:p-2 hover:bg-orange-100 rounded-lg transition-colors flex-shrink-0"
						aria-label="Close"
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
				<div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)] space-y-4 sm:space-y-6">
					{/* Status */}
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2">
								{t("orderDetails.status")}
							</p>
							<span
								className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${STATUS_COLORS[order.status]}`}
							>
								{getTranslatedStatusLabel(order.status, t)}
							</span>
						</div>
						{order.customerName && (
							<div className="text-right">
								<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1">
									{t("orderDetails.customer")}
								</p>
								<p className="text-sm text-amber-900 font-medium">
									{order.customerName}
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
							{/* Services with Status */}
							{order.orderServices && order.orderServices.length > 0 ? (
								<div className="space-y-3">
									{order.orderServices.map((orderService) => {
										const serviceId = orderService.serviceId || orderService.service_id || orderService.service?.id;
										const serviceName = orderService.serviceName || orderService.service?.name || (serviceId && getServiceName(serviceId)) || t("common.nA");
										
										const getStatusColor = (status) => {
											switch (status) {
												case "assigned":
													return "bg-green-100 text-green-800 border-green-200";
												case "accepted_by_company":
												case "accepted":
													return "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200";
												case "in_progress":
													return "bg-blue-100 text-blue-800 border-blue-200";
												case "completed":
													return "bg-purple-100 text-purple-800 border-purple-200";
												default:
													return "bg-gray-100 text-gray-800 border-gray-200";
											}
										};
										
										const getStatusLabel = (status) => {
											// Use getTranslatedStatusLabel to hide "offer_sent" and get proper translations
											return getTranslatedStatusLabel(status || "pending", t);
										};

										// Get additions for this specific service from servicesWithAdditions
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
											<div key={orderService.id} className="p-4 bg-orange-50/50 rounded-xl border border-orange-200/50">
												<div className="flex items-center justify-between mb-3">
													<span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200/50">
														{serviceName}
													</span>
													<span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(orderService.status || "pending")}`}>
														{getStatusLabel(orderService.status || "pending")}
													</span>
												</div>
												{/* Actions for orderService */}
												{orderService.status === "assigned" && (
													<div className="flex items-center gap-2 mt-3 pt-3 border-t border-orange-200/50">
														<button
															onClick={() => handleAcceptOrderService(orderService.id)}
															className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
														>
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
															</svg>
															{t("common.buttons.accept")}
														</button>
														<button
															onClick={() => handleRejectOrderService(orderService.id)}
															className="flex-1 px-4 py-2 text-amber-700 hover:text-amber-900 border border-orange-200/60 hover:bg-orange-50 text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
														>
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
															</svg>
															{t("common.buttons.reject")}
														</button>
													</div>
												)}
												{orderService.status === "accepted_by_company" && (
													<div className="flex items-center gap-2 mt-3 pt-3 border-t border-orange-200/50">
														{onSetPrice && (
															<button
																onClick={() => onSetPrice(order, orderService.id)}
																className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
															>
																<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
																</svg>
																{t("common.buttons.sendOffer")}
															</button>
														)}
														<button
															onClick={() => handleRejectOrderService(orderService.id)}
															className="flex-1 px-4 py-2 text-amber-700 hover:text-amber-900 border border-orange-200/60 hover:bg-orange-50 text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
														>
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
															</svg>
															{t("common.buttons.rejectOffer")}
														</button>
													</div>
												)}
												{(orderService.status === "accepted" || orderService.status === "in_progress") && (
													<div className="flex items-center gap-2 mt-3 pt-3 border-t border-orange-200/50">
														{onSetPrice && !orderService.offer && (
															<button
																onClick={() => onSetPrice(order, orderService.id)}
																className="flex-1 px-4 py-2 btn-primary text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
															>
																<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
																</svg>
																{t("common.buttons.sendOffer")}
															</button>
														)}
													</div>
												)}
												{/* Show all offers for this service (only if there are offers) */}
												{orderService.offers && orderService.offers.length > 0 && (
													<div className="mt-3 pt-3 border-t border-orange-200/50">
														<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2">
															{t("orderDetails.offers") || "Offers"}
														</p>
														<div className="space-y-2">
															{orderService.offers.map((offer, idx) => (
																<div
																	key={offer.id || idx}
																	className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200/50"
																>
																	<div className="flex items-center justify-between mb-1">
																		<span className="text-xs font-medium text-amber-600/70">
																			{t("orderDetails.offer")} #{idx + 1}
																		</span>
																		{offer.status && (
																			<span className={`px-2 py-0.5 rounded text-xs font-medium ${
																				offer.status === "pending" 
																					? "bg-yellow-100 text-yellow-800" 
																					: offer.status === "accepted"
																					? "bg-green-100 text-green-800"
																					: offer.status === "cancelled"
																					? "bg-red-100 text-red-800"
																					: "bg-gray-100 text-gray-800"
																			}`}>
																				{offer.status}
																			</span>
																		)}
																	</div>
																	<div className="flex items-center gap-2 flex-wrap">
																		<span className="text-sm font-bold text-green-600">
																			{offer.hourly_rate 
																				? `CHF ${offer.hourly_rate}/hour`
																				: formatCurrency(offer.price, offer.currency || "CHF")
																			}
																		</span>
																		{(offer.min_hours || offer.max_hours) && (
																			<span className="text-xs text-amber-600/70">
																				({offer.min_hours === offer.max_hours
																					? `${offer.min_hours}h`
																					: `${offer.min_hours}-${offer.max_hours}h`
																				})
																			</span>
																		)}
																		{offer.date && (
																			<span className="text-xs text-amber-600/70">
																				• {formatDate(offer.date)}
																				{offer.time && ` ${formatTime(offer.time)}`}
																			</span>
																		)}
																	</div>
																	{offer.notes && (
																		<p className="text-xs text-amber-700/70 mt-1 italic">
																			{offer.notes}
																		</p>
																	)}
																	{/* Show assignments for this offer */}
																	{offer.id && assignmentsByOffer[offer.id] && assignmentsByOffer[offer.id].length > 0 && (
																		<div className="mt-3 pt-3 border-t border-orange-200/30">
																			<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2">
																				{t("orderDetails.assignments") || "Assignments"}
																			</p>
																			<div className="space-y-1.5">
																				{assignmentsByOffer[offer.id]
																					.filter((assignment) => assignment.status !== "cancelled")
																					.map((assignment) => {
																						const employee = assignment.employee || {};
																						const employeeName = employee.name || "Unknown Employee";
																						const employeeRole = employee.role || "worker";
																						const isDriver = employeeRole === "driver" || employeeRole === "Driver";
																						const isLeader = assignment.is_leader === true;
																						
																						return (
																							<div
																								key={assignment.id}
																								className="flex items-center justify-between p-2 bg-white/60 rounded-lg border border-orange-200/40"
																							>
																								<div className="flex items-center gap-2 flex-1 min-w-0">
																									<div className="w-6 h-6 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
																										<span className="text-orange-600 font-bold text-xs">
																											{employeeName
																												.split(" ")
																												.map((n) => n[0])
																												.join("") || "?"}
																										</span>
																									</div>
																									<div className="flex-1 min-w-0">
																										<div className="flex items-center gap-1.5 flex-wrap">
																											<span className="text-xs font-medium text-amber-900 truncate">
																												{employeeName}
																											</span>
																											{isLeader && (
																												<span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
																													{t("modals.teamAssignment.teamLeader") || "Team Leader"}
																												</span>
																											)}
																											<span
																												className={`px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
																													isDriver
																														? "bg-blue-100 text-blue-800"
																														: "bg-green-100 text-green-800"
																												}`}
																											>
																												{isDriver
																													? t("modals.teamAssignment.driver") || "Driver"
																													: t("modals.teamAssignment.mover") || "Worker"}
																											</span>
																											{assignment.status && assignment.status !== "pending" && (
																												<span className={`px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
																													assignment.status === "cancelled"
																														? "bg-red-100 text-red-800"
																														: "bg-gray-100 text-gray-800"
																												}`}>
																													{assignment.status}
																												</span>
																											)}
																										</div>
																									</div>
																								</div>
																							</div>
																						);
																					})}
																			</div>
																		</div>
																	)}
																	{/* Show cancel button for pending offers or non-cancelled offers */}
																	{(offer.status === "pending" || (offer.status !== "cancelled" && offer.status !== "accepted")) && (
																		<button
																			onClick={() => handleCancelOffer(offer.id, orderService.id)}
																			className="mt-2 px-3 py-1 text-amber-700 hover:text-amber-900 border border-orange-200/60 hover:bg-orange-50 text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1"
																		>
																			<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
																			</svg>
																			{t("common.buttons.cancelOffer")}
																		</button>
																	)}
																	{/* Show Assign Employees button for accepted offers */}
																	{offer.status === "accepted" && onAssignEmployees && (
																		<button
																			onClick={() => onAssignEmployees(offer)}
																			className="mt-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
																		>
																			<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
																			</svg>
																			{t("common.buttons.assignEmployees") || "Assign Employees"}
																		</button>
																	)}
																</div>
															))}
														</div>
													</div>
												)}
												{/* Show additions for this service */}
												{serviceAdditions.length > 0 && (
													<div className="mt-2 pt-3 border-t border-orange-200/50">
														<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2">
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
									{/* Fallback to old format if orderServices not available */}
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
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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



					{/* Assigned Team */}
					{(order.driver || order.workers) && (
						<div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
							<h3 className="text-lg font-bold text-amber-900 mb-4">
								{t("orderDetails.assignedTeam")}
							</h3>
							<div className="space-y-3">
								{order.driver && (
									<div className="flex items-center gap-2">
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
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											/>
										</svg>
										<span className="text-sm text-amber-900">
											<strong>{t("orderDetails.driver")}:</strong> {order.driver}
										</span>
									</div>
								)}
								{order.workers && order.workers.length > 0 && (
									<div className="flex items-start gap-2">
										<svg
											className="w-5 h-5 text-green-600 mt-0.5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
											/>
										</svg>
										<span className="text-sm text-amber-900">
											<strong>{t("orderDetails.workers")}:</strong> {order.workers.join(", ")}
										</span>
									</div>
								)}
								{order.teamLeader && (
									<div className="flex items-center gap-2 pt-2 border-t border-green-200">
										<svg
											className="w-5 h-5 text-purple-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
											/>
										</svg>
										<span className="text-sm text-amber-900">
											<strong>{t("orderDetails.teamLeader")}:</strong> {order.teamLeader.name}
											<span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
												order.teamLeader.role === "Driver"
													? "bg-blue-100 text-blue-800"
													: "bg-green-100 text-green-800"
											}`}>
												{order.teamLeader.role === "Driver" ? t("modals.teamAssignment.driver") : t("modals.teamAssignment.mover")}
											</span>
										</span>
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-orange-100 bg-orange-50/30">
					<button
						onClick={onClose}
						className="px-4 sm:px-6 py-2 text-sm sm:text-base text-amber-700 hover:text-amber-900 font-medium transition-colors"
					>
						{t("common.buttons.close")}
					</button>
				</div>
			</div>
		</div>
		</>
	);

	return createPortal(modalContent, document.body);
};

export default function CompanyOrderCard({ order, onSetPrice, onAssignTeam, openOrderId = null, onOrderModalClose }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { toast } = useGlobalToast();
	const user = useAppSelector(selectUser);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [showAssignEmployeesModal, setShowAssignEmployeesModal] = useState(false);
	const [selectedOfferForAssignment, setSelectedOfferForAssignment] = useState(null);
	
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
	
	const handleAcceptOrderService = async (orderServiceId) => {
		try {
			const result = await dispatch(acceptOrderService({ orderId: order.id, orderServiceId })).unwrap();
			const message = result?.message || t("notifications.orderServiceAccepted") || "Order service accepted successfully";
			toast.success(message);
		} catch (error) {
			const errorMessage = error?.message || error?.payload?.message || t("common.errors.failedToAccept") || "Failed to accept order service";
			toast.error(errorMessage);
		}
	};
	
	const handleRejectOrderService = async (orderServiceId) => {
		try {
			const result = await dispatch(rejectOrderService({ orderId: order.id, orderServiceId })).unwrap();
			const message = result?.message || t("notifications.orderServiceRejected") || "Order service rejected successfully";
			toast.success(message);
		} catch (error) {
			const errorMessage = error?.message || error?.payload?.message || t("common.errors.failedToReject") || "Failed to reject order service";
			toast.error(errorMessage);
		}
	};
	
	const handleCancelOffer = async (offerId, orderServiceId) => {
		try {
			const result = await dispatch(cancelOffer({ offerId, orderId: order.id, orderServiceId })).unwrap();
			const message = result?.message || t("notifications.offerCancelled") || "Offer cancelled successfully";
			toast.success(message);
		} catch (error) {
			const errorMessage = error?.message || error?.payload?.message || t("common.errors.failedToCancelOffer") || "Failed to cancel offer";
			toast.error(errorMessage);
		}
	};

	const TRANSLATED_SERVICE_TYPES = getTranslatedServiceTypes(t);

	const formatDate = (dateString) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatTime = (timeString) => {
		if (!timeString) return "";
		const [hours, minutes] = timeString.split(":");
		return `${hours}:${minutes}`;
	};

	const getServiceNames = () => {
		if (order.servicesDetails && Array.isArray(order.servicesDetails) && order.servicesDetails.length > 0) {
			return order.servicesDetails.map((service) => {
				const serviceId = typeof service.id !== 'undefined' ? service.id : service;
				const serviceName = service.name || '';
				const translatedService = TRANSLATED_SERVICE_TYPES.find((s) => s.id === serviceId);
				return translatedService?.name || serviceName || String(serviceId);
			}).join(", ");
		}
		if (order.orderServices && order.orderServices.length > 0) {
			return order.orderServices.map((os) => {
				return os.serviceName || os.service?.name || (os.serviceId && TRANSLATED_SERVICE_TYPES.find(s => s.id === os.serviceId)?.name) || (os.service_id && TRANSLATED_SERVICE_TYPES.find(s => s.id === os.service_id)?.name) || t("common.nA");
			}).join(", ");
		}
		return order.services?.map((serviceId) => {
			const service = TRANSLATED_SERVICE_TYPES.find((s) => s.id === serviceId);
			return service?.name || serviceId;
		}).join(", ") || t("orderDetails.nA");
	};

	const getMainAddress = () => {
		if (order.addresses?.from) {
			return order.addresses.from;
		}
		if (order.fromAddress) {
			return order.fromAddress;
		}
		return order.location || "N/A";
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
								{order.customerName || order.client || "Unknown"}
							</h3>
							<div className="flex items-center gap-2 mt-1">
								<span className="text-xs sm:text-sm text-amber-700/70 truncate">{formatOrderId(order.id)}</span>
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
						<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2">
							{t("orderDetails.services")}
						</p>
						<div className="space-y-2">
							{/* Services with Status */}
							{order.orderServices && order.orderServices.length > 0 ? (
								<div className="space-y-2">
									{order.orderServices.map((orderService) => {
										const serviceId = orderService.serviceId || orderService.service_id || orderService.service?.id;
										const serviceName = orderService.serviceName || orderService.service?.name || (serviceId && TRANSLATED_SERVICE_TYPES.find(s => s.id === serviceId)?.name) || t("common.nA");
										
										const getStatusColor = (status) => {
											switch (status) {
												case "assigned":
													return "bg-green-100 text-green-800 border-green-200";
												case "accepted_by_company":
												case "accepted":
													return "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200";
												case "in_progress":
													return "bg-blue-100 text-blue-800 border-blue-200";
												case "completed":
													return "bg-purple-100 text-purple-800 border-purple-200";
												default:
													return "bg-gray-100 text-gray-800 border-gray-200";
											}
										};
										
										const getStatusLabel = (status) => {
											// Use getTranslatedStatusLabel to hide "offer_sent" and get proper translations
											return getTranslatedStatusLabel(status || "pending", t);
										};

										return (
											<div key={orderService.id || serviceId} className="p-2 bg-orange-50/30 rounded-lg border border-orange-200/50">
												<div className="flex items-center justify-between mb-2">
													<span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium border border-orange-200/50">
														{serviceName}
													</span>
													<span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(orderService.status || "pending")}`}>
														{getStatusLabel(orderService.status || "pending")}
													</span>
												</div>
												{/* Actions for orderService in card */}
												{orderService.status === "assigned" && (
													<div className="flex items-center gap-2 mt-2 pt-2 border-t border-orange-200/30">
														<button
															onClick={() => handleAcceptOrderService(orderService.id)}
															className="flex-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
														>
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
															</svg>
															{t("common.buttons.accept")}
														</button>
														<button
															onClick={() => handleRejectOrderService(orderService.id)}
															className="flex-1 px-3 py-1.5 text-amber-700 hover:text-amber-900 border border-orange-200/60 hover:bg-orange-50 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
														>
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
															</svg>
															{t("common.buttons.reject")}
														</button>
													</div>
												)}
												{orderService.status === "accepted_by_company" && (
													<div className="flex items-center gap-2 mt-2 pt-2 border-t border-orange-200/30">
														{onSetPrice && (
															<button
																onClick={() => onSetPrice(order, orderService.id)}
																className="flex-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
															>
																<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
																</svg>
																{t("common.buttons.sendOffer")}
															</button>
														)}
														<button
															onClick={() => handleRejectOrderService(orderService.id)}
															className="flex-1 px-3 py-1.5 text-amber-700 hover:text-amber-900 border border-orange-200/60 hover:bg-orange-50 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
														>
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
															</svg>
															{t("common.buttons.rejectOffer")}
														</button>
													</div>
												)}
												{(orderService.status === "accepted" || orderService.status === "in_progress") && (
													<div className="flex items-center gap-2 mt-2 pt-2 border-t border-orange-200/30">
														{!orderService.offer && onSetPrice && (
															<button
																onClick={() => onSetPrice(order, orderService.id)}
																className="flex-1 px-3 py-1.5 btn-primary text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
															>
																<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
																</svg>
																{t("common.buttons.sendOffer")}
															</button>
														)}
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
										{getServiceNames().split(", ").map((serviceName, idx) => (
											<span
												key={idx}
												className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium border border-orange-200/50"
											>
												{serviceName}
											</span>
										))}
									</div>
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
								</>
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
						{/* Show "Modify Offer" button for rejected offers */}
						{order.status === "offer_rejected" && (
							<button
								onClick={() => onSetPrice(order)}
								className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
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
								<span className="whitespace-nowrap">{t("common.buttons.modifyOffer")}</span>
							</button>
						)}
						{/* Show "Assign Team" button for accepted offers */}
						{order.status === "offer_accepted" && (
							<button
								onClick={() => onAssignTeam(order)}
								className="px-3 sm:px-4 py-2 btn-primary text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
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
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
								<span className="whitespace-nowrap">{t("common.buttons.assignTeam")}</span>
							</button>
						)}
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setShowDetailModal(true)}
							className="flex-1 sm:flex-initial px-3 py-2 text-amber-700 hover:text-amber-900 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
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
					</div>
				</div>
			</div>

			{/* Detail Modal */}
			<OrderDetailModal
				isOpen={showDetailModal}
				onClose={handleModalClose}
				order={order}
				t={t}
				onSetPrice={onSetPrice}
				onAssignEmployees={(offer) => {
					setSelectedOfferForAssignment(offer);
					setShowAssignEmployeesModal(true);
				}}
			/>
			
			{/* Assign Employees Modal */}
			{selectedOfferForAssignment && user?.company_id && (
				<AssignEmployeesModal
					isOpen={showAssignEmployeesModal}
					onClose={() => {
						setShowAssignEmployeesModal(false);
						setSelectedOfferForAssignment(null);
					}}
					offer={selectedOfferForAssignment}
					companyId={user.company_id}
				/>
			)}
		</>
	);
}

