"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/utils/financeUtils";
import { getTranslatedServiceTypes, getTranslatedStatusLabel, getTranslatedLocationType } from "@/utils/i18nUtils";
import { formatOrderId } from "@/utils/orderUtils";
import { formatDate, formatTime } from "@/utils/dateUtils";

export default function OrderPrintView({ order }) {
	const { t } = useTranslation();
	const TRANSLATED_SERVICE_TYPES = getTranslatedServiceTypes(t);
	
	const getServiceName = (serviceId) => {
		const service = TRANSLATED_SERVICE_TYPES.find((s) => s.id === serviceId);
		return service?.name || `Service ${serviceId}`;
	};

	return (
		<>
			<style jsx global>{`
				@media print {
					body * {
						visibility: hidden;
					}
					#print-view,
					#print-view * {
						visibility: visible;
					}
					#print-view {
						position: absolute;
						left: 0;
						top: 0;
						width: 100%;
						background: white;
					}
					@page {
						size: A4;
						margin: 15mm;
					}
					.print-section {
						page-break-inside: avoid;
						break-inside: avoid;
					}
					.print-no-break {
						page-break-inside: avoid;
						break-inside: avoid;
					}
				}
				@media screen {
					#print-view {
						display: none;
					}
				}
			`}</style>

			<div id="print-view" className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
				{/* Company Header */}
				<div className="border-b-2 border-black pb-6 mb-6 print-no-break">
					<h1 className="text-3xl font-bold mb-2" style={{ color: '#000' }}>
						{t("company.name") || "Furniture Moving Services"}
					</h1>
					<div className="text-sm" style={{ color: '#333' }}>
						<p>{t("company.tagline") || "Professional Moving & Furniture Services"}</p>
						<p>{t("company.contact") || "Phone: +41 XX XXX XX XX | Email: info@furniture-services.ch"}</p>
					</div>
				</div>

				{/* Order Header */}
				<div className="mb-8 print-section">
					<div className="flex justify-between items-start mb-4">
						<div>
							<h2 className="text-2xl font-bold mb-1" style={{ color: '#000' }}>
								{t("order.orderNumber") || "Order"} {formatOrderId(order.id)}
							</h2>
							<p className="text-sm" style={{ color: '#666' }}>
								{t("order.created") || "Created"}: {formatDate(order.createdAt || order.created_at)}
							</p>
						</div>
						<div className="text-right">
							<div className="inline-block px-4 py-2 border-2 border-black font-bold">
								{getTranslatedStatusLabel(order.status, t)}
							</div>
						</div>
					</div>

					{/* Customer Info */}
					<div className="border border-black p-4 mt-4">
						<p className="text-xs font-bold uppercase mb-1" style={{ color: '#666' }}>
							{t("order.customer") || "Customer"}
						</p>
						<p className="text-lg font-bold" style={{ color: '#000' }}>
							{order.customerName || t("common.nA") || "N/A"}
						</p>
					</div>
				</div>

				{/* Services */}
				<div className="mb-6 print-section">
					<h3 className="text-lg font-bold mb-3 pb-2 border-b border-black" style={{ color: '#000' }}>
						{t("order.services") || "Services"}
					</h3>
					<table className="w-full border-collapse">
						<thead>
							<tr className="border-b-2 border-black">
								<th className="text-left py-2 px-2 text-sm font-bold">{t("order.service") || "Service"}</th>
								<th className="text-left py-2 px-2 text-sm font-bold">{t("order.company") || "Company"}</th>
								<th className="text-left py-2 px-2 text-sm font-bold">{t("order.status") || "Status"}</th>
							</tr>
						</thead>
						<tbody>
							{order.orderServices && order.orderServices.length > 0 ? (
								order.orderServices.map((os, idx) => {
									const serviceId = os.serviceId || os.service_id || os.service?.id;
									const serviceName = os.serviceName 
										|| os.service?.name 
										|| (serviceId ? getServiceName(serviceId) : null)
										|| t("common.nA") || "N/A";
									
									return (
										<tr key={os.id || idx} className="border-b border-gray-300">
											<td className="py-3 px-2">
												<div className="font-semibold">{serviceName}</div>
												{os.additions && os.additions.length > 0 && (
													<div className="text-xs mt-1" style={{ color: '#666' }}>
														{t("orderSteps.selectAdditions") || "Additions"}: {os.additions.map(a => a.name).join(", ")}
													</div>
												)}
												
												{/* Offer Details in Print */}
												{(os.offer || (os.offers && os.offers[0])) && (() => {
													const offer = os.offer || os.offers[0];
													return (
														<div className="mt-3 p-3 border border-gray-300 rounded bg-gray-50">
															<div className="font-bold border-b border-gray-300 pb-1 mb-2 text-xs uppercase" style={{ color: '#666' }}>
																{t("order.offerDetails") || "Offer Details"}
															</div>
															<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
																<div>
																	<span className="font-bold">{t("order.price") || "Price"}:</span>{' '}
																	{formatCurrency(offer.hourly_rate || offer.price, offer.currency || "CHF")}
																	{(offer.hourly_rate && !offer.price) ? ` / ${t("common.labels.hour") || "hr"}` : ""}
																</div>
																{(offer.min_hours) && (
																	<div>
																		<span className="font-bold">{t("order.estimatedHours") || "Hours"}:</span>{' '}
																		{Number(offer.min_hours)} - {Number(offer.max_hours)} {t("common.labels.hours") || "h"}
																	</div>
																)}
																{offer.date && (
																	<div className="col-span-2 mt-1">
																		<span className="font-bold">{t("order.date") || "Date"}:</span>{' '}
																		{formatDate(offer.date)} {offer.time && formatTime(offer.time)}
																	</div>
																)}
																{offer.notes && (
																	<div className="col-span-2 mt-1 pt-1 border-t border-gray-200 text-xs italic">
																		{offer.notes}
																	</div>
																)}
															</div>
														</div>
													);
												})()}
											</td>
											<td className="py-3 px-2 text-sm align-top">
												{os.assignedCompanyName || "-"}
											</td>
											<td className="py-3 px-2 text-sm align-top">
												{getTranslatedStatusLabel(os.status, t)}
											</td>
										</tr>
									);
								})
							) : (
								<tr>
									<td colSpan="3" className="py-3 px-2 text-center text-sm" style={{ color: '#666' }}>
										{t("order.noServices") || t("common.noData") || "No services"}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* Addresses */}
				<div className="mb-6 print-section">
					<h3 className="text-lg font-bold mb-3 pb-2 border-b border-black" style={{ color: '#000' }}>
						{t("order.addresses") || "Addresses"}
					</h3>
					<div className="grid grid-cols-2 gap-4">
						<PrintAddressCard 
							title={t("order.fromAddress") || "From Address"}
							address={order.fromAddress || order.addresses?.from}
							details={order.addresses?.details?.from}
							t={t}
						/>
						{order.toAddress && (
							<PrintAddressCard 
								title={t("order.toAddress") || "To Address"}
								address={order.toAddress || order.addresses?.to}
								details={order.addresses?.details?.to}
								t={t}
							/>
						)}
					</div>
				</div>

				{/* Schedule & Room Configuration */}
				{(order.preferred_date || order.number_of_rooms) && (
					<div className="mb-6 print-section">
						<h3 className="text-lg font-bold mb-3 pb-2 border-b border-black" style={{ color: '#000' }}>
							{t("order.schedule") || "Schedule"} & {t("order.roomConfiguration") || "Configuration"}
						</h3>
						<div className="grid grid-cols-2 gap-4">
							{order.preferred_date && (
								<div className="border border-gray-300 p-3">
									<p className="text-xs font-bold uppercase mb-1" style={{ color: '#666' }}>
										{t("order.date") || "Date"}
									</p>
									<p className="font-semibold">
										{formatDate(order.preferred_date)}
										{order.preferred_time && ` at ${formatTime(order.preferred_time)}`}
									</p>
								</div>
							)}
							{order.number_of_rooms && (
								<div className="border border-gray-300 p-3">
									<p className="text-xs font-bold uppercase mb-1" style={{ color: '#666' }}>
										{t("order.roomConfiguration") || "Rooms"}
									</p>
									<p className="font-semibold">
										{order.number_of_rooms} {t("common.labels.rooms") || "Rooms"}
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Notes */}
				{order.notes && (
					<div className="mb-6 print-section">
						<h3 className="text-lg font-bold mb-3 pb-2 border-b border-black" style={{ color: '#000' }}>
							{t("order.notes") || "Notes"}
						</h3>
						<div className="border border-gray-300 p-3">
							<p className="text-sm whitespace-pre-wrap">{order.notes}</p>
						</div>
					</div>
				)}

				{/* Footer */}
				<div className="mt-8 pt-4 border-t-2 border-black text-center text-xs print-no-break" style={{ color: '#666' }}>
					<p>{t("order.printedOn") || "Printed on"}: {new Date().toLocaleDateString()}</p>
					<p className="mt-1">{t("company.thankYou") || "Thank you for choosing our services"}</p>
				</div>
			</div>
		</>
	);
}

function PrintAddressCard({ title, address, details, t }) {
	return (
		<div className="border border-gray-300 p-3 print-no-break">
			<p className="text-xs font-bold uppercase mb-2" style={{ color: '#666' }}>
				{title}
			</p>
			<p className="text-sm mb-2">{address || t("common.notSpecified") || "-"}</p>
			{details && (
				<div className="text-xs pt-2 border-t border-gray-200" style={{ color: '#666' }}>
					<p><span className="font-bold">{t("order.type") || "Type"}:</span> {getTranslatedLocationType(details.locationType, t)}</p>
					{details.floor !== undefined && (
						<p><span className="font-bold">{t("order.floor") || "Floor"}:</span> {details.floor}</p>
					)}
					{details.area && (
						<p><span className="font-bold">{t("order.area") || "Area"}:</span> {details.area} m²</p>
					)}
					<p><span className="font-bold">{t("order.elevator") || "Elevator"}:</span> {details.hasElevator ? t("common.yes") || "Yes" : t("common.no") || "No"}</p>
				</div>
			)}
		</div>
	);
}
