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

	const getStatusColor = (status) => {
		switch (status?.toLowerCase()) {
			case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "assigned": return "bg-blue-100 text-blue-800 border-blue-200";
			case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
			case "in_progress": return "bg-purple-100 text-purple-800 border-purple-200";
			case "completed": return "bg-green-100 text-green-800 border-green-200";
			case "cancelled": return "bg-red-100 text-red-800 border-red-200";
			default: return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const formatPrice = (value) => {
		const num = parseFloat(value);
		if (isNaN(num)) return "0.00 CHF";
		return `${num.toFixed(2)} CHF`;
	};

	const handleConvertToOrderInternal = () => {
		if (typeof window.onConvertToOrder === 'function') {
			window.onConvertToOrder();
		} else {
			window.location.href = `${getCreateOrderRoute()}?orderId=${order.id}`;
		}
	};

	const createdAt = order.createdAt || order.created_at;

	return (
		<div className="min-h-screen bg-slate-50/50 pb-20">
			{/* Top Navigation Bar */}
			<div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-6 py-4 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<button onClick={onBack} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
					</button>
					<div>
						<h1 className="text-xl font-black text-slate-900 flex items-center gap-3">
							Order #{order.id}
							<span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border ${getStatusColor(order.status)}`}>
								{getTranslatedStatusLabel(order.status, t)}
							</span>
						</h1>
						<p className="text-xs font-medium text-slate-500 mt-0.5">
							Created on {formatDate(createdAt)} • Type: <span className="uppercase">{order.order_type || order.type}</span>
						</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					{!isPrintMode && (
						<button 
							onClick={isAdmin ? handleDownloadPDF : onBack} 
							disabled={isDownloading}
							className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
						>
							{isDownloading ? (
								<div className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin"></div>
							) : (
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
							)}
							{isDownloading ? "Generating..." : "Print PDF"}
						</button>
					)}
				</div>
			</div>

			<div ref={contentRef} className="max-w-6xl mx-auto p-6 space-y-6">
				{/* Main Details Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Client Info */}
					<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
						<h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t("orderDetails.clientDetails") || "Client Details"}</h3>
						<div className="flex items-center gap-4 mb-4">
							<div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-black border border-blue-100">
								{(order.customerName || order.client?.name || "?").charAt(0).toUpperCase()}
							</div>
							<div>
								<p className="text-base font-bold text-slate-900">{order.customerName || order.client?.name}</p>
								<p className="text-sm font-medium text-slate-500">{order.client?.email}</p>
							</div>
						</div>
						{(order.client?.phone || (order.client?.phones && order.client?.phones.length > 0)) && (
							<div className="pt-3 border-t border-slate-100">
								<p className="text-xs text-slate-400 mb-1">Phone</p>
								<p className="text-sm font-semibold text-slate-700">{order.client?.phone || order.client?.phones?.[0]?.phone}</p>
							</div>
						)}
					</div>

					{/* Execution Information */}
					<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
						<h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t("orderDetails.executionInfo") || "Execution Information"}</h3>
						<div className="space-y-4">
							<div>
								<p className="text-xs text-slate-400 mb-1">{t("orderDetails.scheduledDateTime") || "Scheduled Date & Time"}</p>
								<p className="text-sm font-bold text-slate-800">
									{formatDate(order.execution_date || order.executionDate || order.preferred_date) || "TBD"}
									{(order.execution_time || order.preferred_time) && ` at ${(order.execution_time || order.preferred_time).substring(0,5)}`}
								</p>
							</div>
							<div>
								<p className="text-xs text-slate-400 mb-1">{t("orderDetails.leadCompany") || "Assigned Company"}</p>
								<p className="text-sm font-bold text-slate-800">{order.company?.name || order.assignedCompanyName || "Not Assigned"}</p>
							</div>
						</div>
					</div>

					{/* Pricing Summary */}
					<div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
						<div>
							<h3 className="text-xs font-black text-emerald-600/70 uppercase tracking-widest mb-4">Order Total Summary</h3>
							<div className="space-y-2">
								{parseFloat(order.fixed_price) > 0 && (
									<div className="flex justify-between items-center text-sm font-medium text-emerald-800">
										<span>Fixed Price</span>
										<span>{formatPrice(order.fixed_price)}</span>
									</div>
								)}
								{parseFloat(order.min_total_price) > 0 && (
									<div className="flex justify-between items-center text-sm font-medium text-emerald-800">
										<span>Min Estimated</span>
										<span>{formatPrice(order.min_total_price)}</span>
									</div>
								)}
								{parseFloat(order.max_total_price) > 0 && (
									<div className="flex justify-between items-center text-sm font-medium text-emerald-800">
										<span>Max Estimated</span>
										<span>{formatPrice(order.max_total_price)}</span>
									</div>
								)}
							</div>
						</div>
						<div className="mt-4 pt-4 border-t border-emerald-200/50 flex justify-between items-end">
							<span className="text-sm font-black text-emerald-900 uppercase">Total Estimate</span>
							<span className="text-2xl font-black text-emerald-600">
								{(parseFloat(order.fixed_price) > 0) 
									? formatPrice(order.fixed_price) 
									: (parseFloat(order.total_price) > 0 && parseFloat(order.min_total_price) <= 0)
										? formatPrice(order.total_price)
										: `${formatPrice(order.min_total_price)} - ${formatPrice(order.max_total_price)}`}
							</span>
						</div>
					</div>
				</div>

				{/* Locations Section */}
				{(order.fromAddress || order.toAddress || order.primary_location || order.secondary_location) && (
					<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
						<h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Route Locations</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
							{(order.fromAddress || order.primary_location) && (
								<div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
									<div className="flex items-center gap-2 mb-2">
										<div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
										<p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Primary (From)</p>
									</div>
									<p className="text-sm font-bold text-slate-800">{order.fromAddress || order.primary_location?.address}</p>
								</div>
							)}
							{(order.toAddress || order.secondary_location) && (
								<div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
									<div className="flex items-center gap-2 mb-2">
										<div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
										<p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Secondary (To)</p>
									</div>
									<p className="text-sm font-bold text-slate-800">{order.toAddress || order.secondary_location?.address}</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Services Section */}
				{(order.orderServices || order.servicesDetails)?.length > 0 && (
					<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
						<div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
							<h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Requested Services</h3>
						</div>
						<div className="divide-y divide-slate-100">
							{(order.orderServices || order.servicesDetails).map((os, idx) => (
								<div key={os.id || idx} className="p-6">
									<div className="flex flex-wrap justify-between items-start gap-4 mb-4">
										<div>
											<h4 className="text-lg font-bold text-slate-900 flex items-center gap-3">
												{os.service?.name || os.serviceName || os.name || getServiceName(os.serviceId)}
												<span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded border ${getStatusColor(os.status)}`}>
													{getTranslatedStatusLabel(os.status, t)}
												</span>
											</h4>
											<p className="text-xs text-slate-500 mt-1 max-w-2xl">{os.service?.description || os.description}</p>
										</div>
										<div className="text-right">
											<p className="text-xs text-slate-400 uppercase font-bold mb-1">Service Pricing</p>
											<p className="text-lg font-black text-slate-800">
												{parseFloat(os.fixed_price) > 0 
													? formatPrice(os.fixed_price) 
													: (parseFloat(os.total_price) > 0 && parseFloat(os.min_total_price) <= 0)
														? formatPrice(os.total_price)
														: `${formatPrice(os.min_total_price)} - ${formatPrice(os.max_total_price)}`}
											</p>
										</div>
									</div>
									{os.additions?.length > 0 && (
										<div className="mt-4">
											<h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Additions</h5>
											<div className="space-y-2">
												{os.additions.map((add, addIdx) => (
													<div key={add.id || addIdx} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
														<div>
															<span className="text-sm font-bold text-slate-800 block">{add.name || add.Addition?.name}</span>
															{add.note && <p className="text-xs text-slate-500 mt-1 italic">Note: {add.note}</p>}
														</div>
														<div className="text-right">
															<span className="text-sm font-bold text-slate-700">
																{parseFloat(add.fixed_price) > 0 ? formatPrice(add.fixed_price) : `${formatPrice(add.min_total_price)} - ${formatPrice(add.max_total_price)}`}
															</span>
														</div>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Global Notes */}
				{order.notes && (
					<div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
						<h3 className="text-xs font-black text-amber-600/70 uppercase tracking-widest mb-2 flex items-center gap-2">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							Important Order Notes
						</h3>
						<p className="text-sm font-medium text-amber-900 leading-relaxed">
							{order.notes}
						</p>
					</div>
				)}
			</div>

			{/* Actions Section */}
			{!isPrintMode && isAdmin && (order.order_type === "appointment" || order.order_type === "offer") && (
				<div className="max-w-6xl mx-auto px-6 pt-6 flex flex-wrap gap-4">
					{order.order_type === "appointment" && (
						<button
							onClick={() => setShowConvertModal(true)}
							className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all shadow-md shadow-orange-500/20 cursor-pointer"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{t("siteAdmin.actions.convertToOffer") || "Convert to Offer"}
						</button>
					)}
					{order.order_type === "offer" && (
						<button
							onClick={handleConvertToOrderInternal}
							className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
							{t("siteAdmin.actions.convertToOrder") || "Convert to Order"}
						</button>
					)}
				</div>
			)}

			{/* Conversion Modal */}
			{showConvertModal && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
					<div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-primary-100">
						<div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<h3 className="text-xl font-bold text-slate-800 mb-2">Convert to Offer?</h3>
						<p className="text-slate-600 mb-6 text-sm">Are you sure you want to convert this appointment to an offer?</p>
						<div className="flex gap-3">
							<button onClick={() => setShowConvertModal(false)} className="flex-1 px-4 py-2.5 border border-primary-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer">Cancel</button>
							<button
								onClick={() => {
									setShowConvertModal(false);
									window.location.href = `${getCreateOfferRoute()}?orderId=${order.id}&convertFrom=appointment`;
								}}
								className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold cursor-pointer"
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
