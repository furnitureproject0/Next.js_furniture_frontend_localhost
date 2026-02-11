"use client";

import { STATUS_COLORS } from "@/constants/orderConstants";
import { useClientToken } from "@/hooks/useClientToken";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { useTranslation } from "@/hooks/useTranslation";
import { ApiError, customerApi, servicesApi } from "@/lib/api";
import { formatCurrency } from "@/utils/financeUtils";
import { getTranslatedServiceTypes, getTranslatedStatusLabel } from "@/utils/i18nUtils";
import { formatOrderId } from "@/utils/orderUtils";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import OrderPrintView from "@/components/orders/OrderPrintView";
import OrderOfferInfo from "@/components/site-admin/order-card/OrderOfferInfo";

// Helper function to extract token directly from URL (synchronous)
const getTokenFromUrl = () => {
	if (typeof window === "undefined") return null;
	const urlParams = new URLSearchParams(window.location.search);
	const token = urlParams.get("token");
	if (token) {
		sessionStorage.setItem("clientOrderToken", token);
		return token;
	}
	return sessionStorage.getItem("clientOrderToken");
};

function LoadingFallback() {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 border-b-2 border-orange-500"></div>
		</div>
	);
}

function ClientOrderPageContent() {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const params = useParams();
	const router = useRouter();
	const { token, hasToken } = useClientToken();
	
	const orderId = parseInt(params.orderId, 10);
	
	const [order, setOrder] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");
	const [selectedOfferId, setSelectedOfferId] = useState(null);
	const [hasFetched, setHasFetched] = useState(false); // Track if we've attempted to fetch
	const [isPrintMode, setIsPrintMode] = useState(false);

	// Fetch order data
	useEffect(() => {
		const fetchOrder = async () => {
			if (!orderId) {
				setError(t("client.orderNotFound.invalidId") || "Invalid order ID");
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				setError(null);
				setOrder(null); // Clear previous order to prevent showing stale data
				
				// Get token from URL directly first (synchronous, before API call)
				// This ensures we have the token before making the API request
				const tokenFromUrl = getTokenFromUrl();
				const finalToken = token || tokenFromUrl;
				
				// Pass token to API call if available
				const response = await customerApi.getOrderById(orderId, finalToken || null);
				setHasFetched(true); // Mark that we've attempted to fetch
				
				
				// Check if response is null (401 unauthorized)
				if (response === null) {
					setError(t("client.orderNotFound.unauthorized") || "Unauthorized. Please check your token.");
					setIsLoading(false);
					return;
				}
				
				// Check response structure - handle different possible structures
				let orderData = null;
				
				if (response?.success && response?.data?.order) {
					// Standard structure: { success: true, data: { order: {...} } }
					orderData = response.data.order;
				} else if (response?.data && !response?.data?.order) {
					// Alternative structure: { success: true, data: {...} } where data IS the order
					orderData = response.data;
				} else if (response?.order) {
					// Direct order structure: { order: {...} }
					orderData = response.order;
				} else if (response && !response.success && response.id) {
					// Order data directly without wrapper
					orderData = response;
				}
				
				if (orderData) {
					
					// Collect all unique addition IDs from order
					const additionIds = new Set();
					(orderData.orderServices || []).forEach((os) => {
						(os.orderServiceAdditions || os.additions || []).forEach((osa) => {
							const additionId = osa.addition?.id || osa.addition_id;
							if (additionId) {
								additionIds.add(additionId);
							}
						});
					});
					
					// Fetch all addition details in parallel
					const additionsMap = new Map();
					await Promise.all(
						Array.from(additionIds).map(async (additionId) => {
							try {
								const additionResponse = await servicesApi.getAdditionById(additionId);
								if (additionResponse?.success && additionResponse?.data?.addition) {
									additionsMap.set(additionId, additionResponse.data.addition);
								} else if (additionResponse?.data && !additionResponse?.data?.addition) {
									// Alternative structure: data IS the addition
									additionsMap.set(additionId, additionResponse.data);
								} else if (additionResponse?.addition) {
									// Direct addition structure
									additionsMap.set(additionId, additionResponse.addition);
								} else if (additionResponse && additionResponse.id) {
									// Addition data directly without wrapper
									additionsMap.set(additionId, additionResponse);
								}
							} catch (error) {
								console.warn(`Failed to fetch addition ${additionId}:`, error);
							}
						})
					);
					
					// Transform order data similar to fetchCustomerOrders
					try {
						const transformedOrder = transformOrderData(orderData, additionsMap);
						if (transformedOrder && transformedOrder.id) {
							// Set order and clear error
							// We'll use useEffect to set isLoading to false after order is confirmed
							setError(null);
							setOrder(transformedOrder);
							// Don't set isLoading to false here - let useEffect handle it
						} else {
							console.error("Transformed order is invalid:", transformedOrder);
							setError(t("client.orderNotFound.invalidStructure") || "Failed to process order data. Invalid order structure.");
							setIsLoading(false);
						}
					} catch (transformError) {
						console.error("Error transforming order data:", transformError);
						console.error("Transform error stack:", transformError.stack);
						setError(t("client.orderNotFound.processingError") || "Failed to process order data. Please try again.");
						setIsLoading(false);
					}
				} else {
					console.warn("Unexpected response structure:", response);
					setError(response?.message || t("client.orderNotFound.notFound") || "Order not found or invalid response structure");
					setIsLoading(false);
				}
			} catch (err) {
				console.error("Error fetching order:", err);
				if (err instanceof ApiError) {
					setError(err.data?.message || err.message || t("client.orderNotFound.failedToLoad") || "Failed to load order");
				} else {
					setError(t("client.orderNotFound.failedToLoad") || "Failed to load order. Please try again.");
				}
				setIsLoading(false);
			}
		};

		fetchOrder();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderId]); // Only depend on orderId, token is extracted inside the function

	// Effect to set isLoading to false only after order is confirmed to be set
	// This prevents the error screen from flashing
	useEffect(() => {
		if (order && order.id && isLoading) {
			// Order is confirmed to be set, safe to hide loading
			setIsLoading(false);
		}
	}, [order, isLoading]);

	// Print mode event listeners
	useEffect(() => {
		const handleBeforePrint = () => setIsPrintMode(true);
		const handleAfterPrint = () => setIsPrintMode(false);

		window.addEventListener("beforeprint", handleBeforePrint);
		window.addEventListener("afterprint", handleAfterPrint);

		return () => {
			window.removeEventListener("beforeprint", handleBeforePrint);
			window.removeEventListener("afterprint", handleAfterPrint);
		};
	}, []);

	// Transform order data to match frontend format
	const transformOrderData = (orderData, additionsMap = new Map()) => {
		// Extract services and their additions from orderServices array
		const servicesWithAdditions = (orderData.orderServices || []).map(os => {
			const latestOffer = os.offers?.[0] || null;
			const allOffers = os.offers || [];
			
			const transformedOffer = latestOffer ? {
				id: latestOffer.id,
				status: latestOffer.status || "pending",
				hourly_rate: latestOffer.hourly_rate,
				currency: latestOffer.currency || "CHF",
				min_hours: latestOffer.min_hours,
				max_hours: latestOffer.max_hours,
				notes: latestOffer.notes || "",
				date: latestOffer.date || null,
				time: latestOffer.time || null,
				createdAt: latestOffer.createdAt,
				updatedAt: latestOffer.updatedAt,
				hourlyRate: latestOffer.hourly_rate,
				minHours: latestOffer.min_hours,
				maxHours: latestOffer.max_hours,
				scheduledDate: latestOffer.date,
				scheduledTime: latestOffer.time,
			} : null;
			
			const transformedOffers = allOffers.map(offer => ({
				id: offer.id,
				status: offer.status || "pending",
				hourly_rate: offer.hourly_rate,
				currency: offer.currency || "CHF",
				min_hours: offer.min_hours,
				max_hours: offer.max_hours,
				notes: offer.notes || "",
				date: offer.date || null,
				time: offer.time || null,
				createdAt: offer.createdAt,
				updatedAt: offer.updatedAt,
			}));
			
			return {
				id: os.id,
				serviceId: os.service?.id || os.service_id,
				serviceName: os.service?.name || "Unknown Service",
				status: os.status,
				assignedCompanyId: os.company_id,
				assignedCompanyName: os.company?.name,
				offer: transformedOffer,
				offers: transformedOffers,
				additions: (os.orderServiceAdditions || os.additions || []).map(osa => {
					const additionId = osa.addition?.id || osa.addition_id;
					const additionDetails = additionsMap.get(additionId);
					return {
						id: additionId || osa.id,
						name: additionDetails?.name || additionDetails?.title || osa.addition?.name || osa.addition?.title || "Unknown Addition",
						note: osa.note || "",
					};
				}),
			};
		});
		
		const services = servicesWithAdditions.map(s => ({
			id: s.serviceId,
			name: s.serviceName,
		}));
		
		const allAdditions = servicesWithAdditions.flatMap(s => s.additions);
		
		return {
			...orderData,
			id: orderData.id,
			customerId: orderData.client_id,
			customerName: orderData.client?.name || "Unknown",
			fromAddress: orderData.location?.address || "",
			toAddress: orderData.destinationLocation?.address || orderData.destination_location?.address || "",
			addresses: {
				from: orderData.location?.address || "",
				to: orderData.destinationLocation?.address || orderData.destination_location?.address || null,
			},
			services: services.map(s => s.id),
			servicesDetails: services,
			servicesWithAdditions: servicesWithAdditions,
			additions: allAdditions,
			offer: servicesWithAdditions[0]?.offer || null,
			assignedCompanyId: servicesWithAdditions[0]?.assignedCompanyId || null,
			orderServices: servicesWithAdditions,
			history: (orderData.timeline || []).map(timelineItem => ({
				id: timelineItem.id,
				type: timelineItem.status || timelineItem.type || "status_change",
				byRole: timelineItem.by_role || "system",
				byUserId: timelineItem.by_user_id || null,
				at: timelineItem.createdAt || timelineItem.at,
				payload: timelineItem.payload || { message: timelineItem.message },
			})) || [],
			status: orderData.status,
			preferred_date: orderData.preferred_date,
			preferred_time: orderData.preferred_time,
			number_of_rooms: orderData.number_of_rooms,
			notes: orderData.notes && orderData.notes.trim() ? orderData.notes.trim() : null,
			createdAt: orderData.createdAt,
			updatedAt: orderData.updatedAt,
		};
	};

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

	const handleAcceptOffer = async (offerId) => {
		try {
			// Use customerApi directly with token
			const response = await customerApi.acceptOffer(offerId, token || null);
			const message = response?.message || t("notifications.offerAccepted") || "Offer accepted successfully";
			toast.success(message);
			// Refresh order data
			const refreshResponse = await customerApi.getOrderById(orderId, token || null);
			if (refreshResponse?.success && refreshResponse?.data?.order) {
				setOrder(transformOrderData(refreshResponse.data.order));
			}
		} catch (error) {
			const errorMessage = error?.data?.message || error?.message || t("common.errors.failedToAcceptOffer") || "Failed to accept offer";
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
			// Use customerApi directly with token
			const response = await customerApi.rejectOffer(selectedOfferId, rejectionReason, token || null);
			const message = response?.message || t("notifications.offerRejected") || "Offer rejected successfully";
			toast.success(message);
			setShowRejectDialog(false);
			setRejectionReason("");
			setSelectedOfferId(null);
			// Refresh order data
			const refreshResponse = await customerApi.getOrderById(orderId, token || null);
			if (refreshResponse?.success && refreshResponse?.data?.order) {
				setOrder(transformOrderData(refreshResponse.data.order));
			}
		} catch (error) {
			const errorMessage = error?.data?.message || error?.message || t("common.errors.failedToRejectOffer") || "Failed to reject offer";
			toast.error(errorMessage);
		}
	};

	const handlePrint = () => {
		window.print();
	};

	// Priority: Always show loading if isLoading is true OR if order doesn't exist yet
	// Only show error if we've definitely finished loading, attempted fetch, have error, and no order
	if (isLoading || !order) {
		// Check if this is a real error (after fetch attempt and loading complete)
		if (hasFetched && !isLoading && error && !order) {
			// Real error case - show error screen
			return (
				<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
						<svg
							className="w-16 h-16 text-red-500 mx-auto mb-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<h2 className="text-xl font-bold text-gray-900 mb-2">
							{t("client.orderNotFound.title") || t("common.errors.orderNotFound") || "Order Not Found"}
						</h2>
						<p className="text-gray-600 mb-4">
							{error || t("client.orderNotFound.message") || "The order you're looking for doesn't exist or you don't have permission to view it."}
						</p>
						<button
							onClick={() => router.push("/")}
							className="px-4 py-2 btn-primary rounded-lg"
						>
							{t("client.orderNotFound.goHome") || t("common.buttons.goHome") || "Go Home"}
						</button>
					</div>
				</div>
			);
		}
		// Otherwise, show loading screen
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 border-b-2 border-orange-500"></div>
			</div>
		);
	}

	const TRANSLATED_SERVICE_TYPES = getTranslatedServiceTypes(t);

	return (
		<div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				{/* Header - Similar to CustomerOrderDetailModal */}
				<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6 border-b border-orange-100 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
							<div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
								<span className="text-orange-600 font-bold text-sm sm:text-base lg:text-lg">
									#{order.id.toString().padStart(4, "0")}
								</span>
							</div>
							<div className="flex-1 min-w-0">
								<h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 truncate">
									{t("orderDetails.title") || "Order Details"}
								</h1>
								<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1 truncate">
									{formatOrderId(order.id)} • {formatDate(order.createdAt)}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
							<button
								onClick={handlePrint}
								className="p-2 hover:bg-orange-100 rounded-lg transition-colors cursor-pointer"
								title={t("common.buttons.print") || "Print"}
							>
								<svg
									className="w-5 h-5 text-amber-700"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
									/>
								</svg>
							</button>
							<div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}>
								{getTranslatedStatusLabel(order.status, t)}
							</div>
						</div>
					</div>
				</div>

				{/* Order Details - Reusing CustomerOrderDetailModal structure */}
				<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6">
					{/* Status & Company Info */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
						<div>
							<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1.5 sm:mb-2">
								{t("orderDetails.status")}
							</p>
							<span
								className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}
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
										if (serviceAdditions.length === 0) {
											serviceAdditions = orderService.additions || [];
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
															{t("orderDetails.offers")} ({orderService.offers.length})
														</p>
														<div className="space-y-2 sm:space-y-3">
															{orderService.offers.map((offer, idx) => (
																<div
																	key={offer.id || idx}
																	className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200/50"
																>
																	<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-0 mb-1.5 sm:mb-2">
																		<span className="text-sm font-bold text-amber-900">
																			{t("orderDetails.offer")} #{(idx + 1)}
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
																	
																	<OrderOfferInfo offer={offer} t={t} isEmbedded={true} />
																	
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
																	key={addition.id || idx}
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
								<p className="text-gray-500">{t("orderDetails.noServices") || "No services"}</p>
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
					{order.notes && 
					 typeof order.notes === 'string' &&
					 order.notes.trim() && 
					 order.notes.trim().toLowerCase() !== "n/a" && 
					 order.notes.trim().toLowerCase() !== "na" && (
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
											offer_sent: t("orderDetails.offerSent"),
											offer_modified: t("orderDetails.offerModified"),
											offer_accepted: t("orderDetails.offerAccepted"),
											offer_rejected: t("orderDetails.offerRejected"),
											status_change: event.payload?.status || t("orderDetails.status"),
										};
										const eventColors = {
											order_created: "bg-green-500 border-green-600",
											company_assigned: "bg-indigo-500 border-indigo-600",
											offer_sent: "bg-blue-500 border-blue-600",
											offer_modified: "bg-purple-500 border-purple-600",
											offer_accepted: "bg-green-600 border-green-700",
											offer_rejected: "bg-red-500 border-red-600",
											status_change: "bg-amber-500 border-amber-600",
										};
										return (
											<div key={event.id || index} className="flex items-start gap-4 relative">
												<div className={`w-3 h-3 ${eventColors[event.type] || "bg-gray-500 border-gray-600"} rounded-full border-2 border-white mt-1 z-10 flex-shrink-0`}></div>
												<div className="flex-1 pb-4">
													<p className="text-sm font-medium text-amber-900">
														{eventLabels[event.type] || event.type}
													</p>
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

				{/* Reject Dialog */}
				{showRejectDialog && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
			<OrderPrintView order={order} />
		</div>
	);
}

export default function ClientOrderPage() {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<ClientOrderPageContent />
		</Suspense>
	);
}

