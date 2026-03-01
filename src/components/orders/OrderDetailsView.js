"use client";

import { useState, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import { STATUS_COLORS } from "@/constants/orderConstants";
import { formatCurrency } from "@/utils/financeUtils";
import { getTranslatedServiceTypes, getTranslatedStatusLabel, getTranslatedLocationType } from "@/utils/i18nUtils";
import { formatOrderId } from "@/utils/orderUtils";
import { formatDate, formatTime } from "@/utils/dateUtils";
import OrderOfferInfo from "@/components/site-admin/order-card/OrderOfferInfo";

export default function OrderDetailsView({ order, onBack, isPrintMode, isAdmin }) {
	const { t } = useTranslation();
	const user = useAppSelector(selectUser);
	const [showConvertModal, setShowConvertModal] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const contentRef = useRef(null);
	const TRANSLATED_SERVICE_TYPES = getTranslatedServiceTypes(t);

	// Determine the correct create-offer route based on user role
	const getCreateOfferRoute = () => {
		const normalizedRole = user?.role?.replace(/_/g, "-");
		switch (normalizedRole) {
			case "company-admin":
			case "company-secretary":
				return "/company-admin/create-offer";
			case "site-admin":
			case "super-admin":
				return "/site-admin/create-offer";
			default:
				return "/site-admin/create-offer"; // fallback
		}
	};

	// Determine the correct create-order route based on user role
	const getCreateOrderRoute = () => {
		const normalizedRole = user?.role?.replace(/_/g, "-");
		switch (normalizedRole) {
			case "company-admin":
			case "company-secretary":
				return "/company-admin/create-order";
			case "site-admin":
			case "super-admin":
				return "/site-admin/create-order";
			default:
				return "/site-admin/create-order"; // fallback
		}
	};

	const handleDownloadPDF = async () => {
		try {
			setIsDownloading(true);
			const html2pdfModule = await import("html2pdf.js");
			const html2pdf = html2pdfModule.default || html2pdfModule;
			
			const element = contentRef.current;
			if (!element) return;

			const opt = {
				margin: [10, 10, 10, 10],
				filename: `Order_${formatOrderId(order.id)}.pdf`,
				image: { type: 'jpeg', quality: 0.98 },
				html2canvas: { 
					scale: 2, 
					useCORS: true,
					letterRendering: true,
					scrollY: 0,
					windowWidth: 1200
				},
				jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
				pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
				onclone: (clonedDoc) => {
					// html2canvas fails when parsing ANY stylesheet that contains oklch/oklab.
					// We must remove these rules from all stylesheets in the cloned document.
					try {
						Array.from(clonedDoc.styleSheets).forEach(sheet => {
							try {
								const rules = sheet.cssRules || sheet.rules;
								if (!rules) return;
								
								for (let i = rules.length - 1; i >= 0; i--) {
									const rule = rules[i];
									if (rule.cssText && (rule.cssText.includes('oklch') || rule.cssText.includes('oklab'))) {
										sheet.deleteRule(i);
									}
								}
							} catch (e) {
								// Some stylesheets are cross-origin and can't be accessed
								console.warn("Could not sanitize stylesheet:", e);
							}
						});
					} catch (e) {
						console.error("Global CSS sanitization failed:", e);
					}

					// Inject a safe stylesheet for the PDF
					const style = clonedDoc.createElement('style');
					style.innerHTML = `
						/* High-compatibility fallbacks for PDF */
						:root {
							--primary-50: #EBF3FC !important;
							--primary-500: #1B67B3 !important;
						}
						* {
							color-scheme: light !important;
						}
						.bg-primary-50 { background-color: #EBF3FC !important; }
						.text-slate-800 { color: #1e293b !important; }
						.text-slate-600 { color: #475569 !important; }
						.border-primary-200 { border-color: #A1C9F3 !important; }
						.bg-white { background-color: #ffffff !important; }
						[data-html2canvas-ignore] { display: none !important; }
					`;
					clonedDoc.head.appendChild(style);

					// Force clean styles on elements
					const allElements = clonedDoc.querySelectorAll('*');
					allElements.forEach(el => {
						const computed = window.getComputedStyle(el);
						if (computed.color.includes('okl') || computed.backgroundColor.includes('okl')) {
							el.style.color = '#1e293b';
							if (el.classList.contains('bg-primary-50')) el.style.backgroundColor = '#EBF3FC';
							else if (!el.classList.contains('bg-transparent')) el.style.backgroundColor = '#ffffff';
						}
						el.style.boxShadow = 'none';
						el.style.backdropFilter = 'none';
					});
				}
			};

			await html2pdf().set(opt).from(element).save();
		} catch (error) {
			console.error("PDF generation failed:", error);
			// Do not fallback to window.print() as it causes the sidebar/header to show up
		} finally {
			setIsDownloading(false);
		}
	};
	
	const getServiceName = (serviceId) => {
		const service = TRANSLATED_SERVICE_TYPES.find((s) => s.id === serviceId);
		return service?.name || `Service ${serviceId}`;
	};

	return (
		<div className={`min-h-screen ${isPrintMode ? 'hidden' : ''}`} style={{ background: "#FFFFFF" }}>
			{/* Header */}
			<div data-html2canvas-ignore className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-primary-200/60 shadow-sm">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center justify-between">
						<button
							onClick={onBack}
							className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							<span className="font-medium">{t("common.buttons.back") || "Back"}</span>
						</button>
					</div>
				</div>
			</div>

			{/* Content */}
			<div ref={contentRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="bg-white rounded-2xl shadow-lg border border-primary-200/60 overflow-hidden">
					{/* Header */}
					<div className="bg-gradient-to-r from-primary-50 to-primary-50 p-8 border-b border-primary-200/60">
						<div className="flex items-start justify-between mb-6">
							<div>
								<h1 className="text-3xl font-bold text-slate-800 mb-2">
									{formatOrderId(order.id)}
								</h1>
								<p className="text-slate-600/70">
									{t("orderDetails.created") || "Created"}: {formatDate(order.createdAt || order.created_at)}
								</p>
							</div>
							<div className="text-right">
								<span
									className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${STATUS_COLORS[order.status]}`}
								>
									{getTranslatedStatusLabel(order.status, t)}
								</span>
							</div>
						</div>

						{/* Customer Info */}
						<div className="bg-white/60 rounded-xl p-4 border border-primary-200/30">
							<h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-2">
								{t("orderDetails.customer") || "Customer"}
							</h3>
							<p className="text-lg font-medium text-slate-800">
								{order.customerName || t("common.nA") || "N/A"}
							</p>
						</div>
					</div>

					{/* Content */}
					<div className="p-8 space-y-6">
						{/* Services */}
						<OrderServicesSection order={order} getServiceName={getServiceName} t={t} />

						{/* Addresses */}
						<OrderAddressesSection order={order} t={t} />

						{/* Schedule & Room Configuration */}
						<OrderScheduleSection order={order} t={t} />

						{/* Notes */}
						{order.notes && <OrderNotesSection notes={order.notes} t={t} />}

						{/* Order History Timeline */}
						{order.history && order.history.length > 0 && (
							<OrderHistorySection history={order.history} t={t} />
						)}

						{/* Images Section */}
						{order.images && order.images.length > 0 && (
							<OrderImagesSection images={order.images} t={t} />
						)}

						{/* Admin Conversion Actions */}
						{!isPrintMode && isAdmin && (order.order_type === "appointment" || order.order_type === "offer") && (
							<div data-html2canvas-ignore className="pt-6 border-t border-primary-200/50 flex flex-wrap gap-4">
								{order.order_type === "appointment" && (
									<button
										onClick={() => setShowConvertModal(true)}
										className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										{t("siteAdmin.actions.convertToOffer") || "Convert to Offer"}
									</button>
								)}
								{order.order_type === "offer" && (
									<button
										onClick={() => {
											if (typeof window.onConvertToOrder === 'function') {
												window.onConvertToOrder();
											} else {
												window.location.href = `${getCreateOrderRoute()}?orderId=${order.id}`;
											}
										}}
										className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
										{t("siteAdmin.actions.convertToOrder") || "Convert to Order"}
									</button>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
			{/* Conversion Confirmation Modal */}
			{showConvertModal && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
					<div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-primary-100 transform scale-100 transition-transform duration-300">
						<div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<h3 className="text-xl font-bold text-slate-800 mb-2">
							{t("common.messages.confirmConversionTitle") || "Convert to Offer?"}
						</h3>
						<p className="text-slate-600 mb-6 leading-relaxed text-sm">
							{t("common.messages.confirmConversionBody") || "Are you sure you want to convert this appointment to an offer? Existing data will be pre-filled to complete the offer."}
						</p>
						<div className="flex gap-3">
							<button
								onClick={() => setShowConvertModal(false)}
								className="flex-1 px-4 py-2.5 border border-primary-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors"
							>
								{t("common.buttons.cancel") || "Cancel"}
							</button>
							<button
								onClick={() => {
									setShowConvertModal(false);
									window.location.href = `${getCreateOfferRoute()}?orderId=${order.id}&convertFrom=appointment`;
								}}
								className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
							>
								{t("common.messages.confirm") || "Confirm"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function OrderServicesSection({ order, getServiceName, t }) {
	return (
		<div>
			<h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-primary-200/50">
				{t("orderDetails.services") || "Services"}
			</h2>
			<div className="space-y-3">
				{order.orderServices && order.orderServices.length > 0 ? (
					order.orderServices.map((os, idx) => {
						const serviceId = os.serviceId || os.service_id || os.service?.id;
						const serviceName = os.serviceName 
							|| os.service?.name 
							|| (serviceId ? getServiceName(serviceId) : null)
							|| t("common.nA") || "N/A";
						
						return (
							<div key={os.id || idx} className="p-4 bg-primary-50/50 rounded-lg border border-primary-200/50">
								<div className="flex items-center justify-between mb-2">
									<div className="flex flex-col gap-1">
										<span className="text-base font-semibold text-slate-800">
											{serviceName}
										</span>
										{(os.preferred_date || os.preferred_time) && (
											<div className="flex items-center gap-1 text-slate-500 text-xs">
												<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												<span>
													{os.preferred_date ? formatDate(os.preferred_date) : ""}
													{os.preferred_date && os.preferred_time ? " at " : ""}
													{os.preferred_time ? formatTime(os.preferred_time) : ""}
												</span>
											</div>
										)}
									</div>
									<div className="flex items-center gap-2">
										{os.assignedCompanyName && (
											<span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
												{os.assignedCompanyName}
											</span>
										)}
										<span className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[os.status] || STATUS_COLORS.pending}`}>
											{getTranslatedStatusLabel(os.status, t)}
										</span>
									</div>
								</div>
								{os.offer && (
									<div className="mt-3 pt-3 border-t border-primary-200/50">
										<OrderOfferInfo offer={os.offer} t={t} isEmbedded={true} />
									</div>
								)}
								{os.additions && os.additions.length > 0 && (
									<div className="mt-3 pt-3 border-t border-primary-200/50">
										<p className="text-xs font-medium text-primary-600/70 uppercase tracking-wide mb-2">
											{t("orderSteps.selectAdditions") || "Additions"}
										</p>
										<div className="flex flex-wrap gap-2">
											{os.additions.map((addition, addIdx) => (
												<span
													key={addIdx}
													className="px-3 py-1 bg-primary-100 text-slate-700 rounded-lg text-sm font-medium"
												>
													{addition.name}
													{addition.note && ` (${addition.note})`}
												</span>
											))}
										</div>
									</div>
								)}
							</div>
						);
					})
				) : (
					<p className="text-slate-600">{t("orderDetails.noServices") || t("common.noData") || "No services"}</p>
				)}
			</div>
		</div>
	);
}
function OrderAddressesSection({ order, t }) {
	return (
		<div>
			<h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-primary-200/50">
				{t("orderDetails.addresses") || "Addresses"}
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<AddressCard 
					title={t("orderDetails.fromAddress") || "From Address"}
					address={order.fromAddress || order.addresses?.from}
					details={order.addresses?.details?.from}
					t={t}
				/>
				{order.toAddress && (
					<AddressCard 
						title={t("orderDetails.toAddress") || "To Address"}
						address={order.toAddress || order.addresses?.to}
						details={order.addresses?.details?.to}
						t={t}
					/>
				)}
			</div>
		</div>
	);
}

function AddressCard({ title, address, details, t }) {
	return (
		<div className="p-4 bg-primary-50/30 rounded-lg border border-primary-200/30">
			<h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3">
				{title}
			</h3>
			<p className="text-sm text-slate-800 leading-relaxed mb-3">
				{address || t("common.notSpecified") || "-"}
			</p>
			{details && (
				<div className="text-xs text-slate-600/70 space-y-1 pt-3 border-t border-primary-200/50">
					<p><span className="font-medium">{t("orderDetails.type") || "Type"}:</span> {getTranslatedLocationType(details.locationType, t)}</p>
					{details.floor !== undefined && (
						<p><span className="font-medium">{t("orderDetails.floor") || "Floor"}:</span> {details.floor}</p>
					)}
					{details.area && (
						<p><span className="font-medium">{t("orderDetails.area") || "Area"}:</span> {details.area} m²</p>
					)}
					<p><span className="font-medium">{t("orderDetails.elevator") || "Elevator"}:</span> {details.hasElevator ? t("common.yes") || "Yes" : t("common.no") || "No"}</p>
				</div>
			)}
		</div>
	);
}

function OrderScheduleSection({ order, t }) {
	if (!order.preferred_date && !order.number_of_rooms) return null;

	return (
		<div>
			<h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-primary-200/50">
				{t("orderDetails.schedule") || "Schedule"} & {t("orderDetails.roomConfiguration") || "Room Configuration"}
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{order.preferred_date && (
					<div className="p-4 bg-primary-50/30 rounded-lg border border-primary-200/30">
						<p className="text-xs font-medium text-primary-600/70 uppercase tracking-wide mb-2">
							{t("orderDetails.date") || "Date"}
						</p>
						<p className="text-base font-medium text-slate-800">
							{formatDate(order.preferred_date)}
							{order.preferred_time && ` at ${formatTime(order.preferred_time)}`}
						</p>
					</div>
				)}
				{order.number_of_rooms && (
					<div className="p-4 bg-primary-50/30 rounded-lg border border-primary-200/30">
						<p className="text-xs font-medium text-primary-600/70 uppercase tracking-wide mb-2">
							{t("orderDetails.roomConfiguration") || "Room Configuration"}
						</p>
						<p className="text-base font-medium text-slate-800">
							{order.number_of_rooms} {t("common.labels.rooms") || "Rooms"}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

function OrderNotesSection({ notes, t }) {
	return (
		<div>
			<h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-primary-200/50">
				{t("orderDetails.notes") || "Notes"}
			</h2>
			<div className="p-4 bg-blue-50/30 rounded-lg border border-blue-200/30">
				<p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
					{notes}
				</p>
			</div>
		</div>
	);
}
function OrderImagesSection({ images, t }) {
	return (
		<div>
			<h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-primary-200/50">
				{t("orderDetails.images") || "Images"}
			</h2>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
				{Array.isArray(images) && images.map((img, idx) => (
					<div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-primary-200/50">
						<img 
							src={img.url || img} 
							alt={`Order detail ${idx + 1}`} 
							className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
						/>
						<a 
							href={img.url || img} 
							target="_blank" 
							rel="noopener noreferrer"
							className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium"
						>
							View Full
						</a>
					</div>
				))}
			</div>
		</div>
	);
}

function OrderHistorySection({ history, t }) {
	return (
		<div>
			<h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-primary-200/50">
				{t("orderDetails.orderTimeline") || "Order History"}
			</h2>
			<div className="relative pl-6">
				{/* Timeline line */}
				<div className="absolute left-3 top-0 bottom-0 w-0.5 bg-primary-100"></div>
				<div className="space-y-4">
					{history.map((event, index) => (
						<div key={event.id || index} className="relative">
							<div className="absolute -left-4 w-2 h-2 rounded-full bg-primary-400 mt-1.5 ring-4 ring-white"></div>
							<div className="flex flex-col">
								<div className="flex items-center gap-2 mb-1">
									<span className="text-sm font-semibold text-slate-800 capitalize">
										{event.type.replace(/_/g, " ")}
									</span>
									<span className="text-[10px] text-slate-400">
										{new Date(event.at).toLocaleString(t.language || "en-US", {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</span>
								</div>
								{event.payload?.message && (
									<p className="text-sm text-slate-600 font-light italic">
										{event.payload.message}
									</p>
								)}
								<p className="text-[10px] text-slate-400 mt-1">
									By: <span className="text-primary-600/70 font-medium">{event.byRole}</span>
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
