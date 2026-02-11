"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { STATUS_COLORS } from "@/constants/orderConstants";
import { formatCurrency } from "@/utils/financeUtils";
import { getTranslatedServiceTypes, getTranslatedStatusLabel, getTranslatedLocationType } from "@/utils/i18nUtils";
import { formatOrderId } from "@/utils/orderUtils";
import { formatDate, formatTime } from "@/utils/dateUtils";
import OrderOfferInfo from "@/components/site-admin/order-card/OrderOfferInfo";

export default function OrderDetailsView({ order, onPrint, onBack, isPrintMode }) {
	const { t } = useTranslation();
	const TRANSLATED_SERVICE_TYPES = getTranslatedServiceTypes(t);
	
	const getServiceName = (serviceId) => {
		const service = TRANSLATED_SERVICE_TYPES.find((s) => s.id === serviceId);
		return service?.name || `Service ${serviceId}`;
	};

	return (
		<div className={`min-h-screen ${isPrintMode ? 'hidden' : ''}`} style={{ background: "#FFF8F3" }}>
			{/* Header */}
			<div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-orange-200/60 shadow-sm">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center justify-between">
						<button
							onClick={onBack}
							className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							<span className="font-medium">{t("common.buttons.back") || "Back"}</span>
						</button>
						<button
							onClick={onPrint}
							className="flex items-center gap-2 btn-primary px-6 py-2.5 rounded-lg cursor-pointer"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
							</svg>
							<span className="font-medium">{t("common.buttons.print") || "Print"}</span>
						</button>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="bg-white rounded-2xl shadow-lg border border-orange-200/60 overflow-hidden">
					{/* Header */}
					<div className="bg-gradient-to-r from-orange-50 to-amber-50 p-8 border-b border-orange-200/60">
						<div className="flex items-start justify-between mb-6">
							<div>
								<h1 className="text-3xl font-bold text-amber-900 mb-2">
									{formatOrderId(order.id)}
								</h1>
								<p className="text-amber-700/70">
									{t("order.created") || "Created"}: {formatDate(order.createdAt || order.created_at)}
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
						<div className="bg-white/60 rounded-xl p-4 border border-orange-200/30">
							<h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide mb-2">
								{t("order.customer") || "Customer"}
							</h3>
							<p className="text-lg font-medium text-amber-900">
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


					</div>
				</div>
			</div>
		</div>
	);
}

function OrderServicesSection({ order, getServiceName, t }) {
	return (
		<div>
			<h2 className="text-xl font-bold text-amber-900 mb-4 pb-2 border-b border-orange-200/50">
				{t("order.services") || "Services"}
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
							<div key={os.id || idx} className="p-4 bg-orange-50/50 rounded-lg border border-orange-200/50">
								<div className="flex items-center justify-between mb-2">
									<span className="text-base font-semibold text-amber-900">
										{serviceName}
									</span>
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
									<div className="mt-3 pt-3 border-t border-orange-200/50">
										<OrderOfferInfo offer={os.offer} t={t} isEmbedded={true} />
									</div>
								)}
								{os.additions && os.additions.length > 0 && (
									<div className="mt-3 pt-3 border-t border-orange-200/50">
										<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2">
											{t("orderSteps.selectAdditions") || "Additions"}
										</p>
										<div className="flex flex-wrap gap-2">
											{os.additions.map((addition, addIdx) => (
												<span
													key={addIdx}
													className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium"
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
					<p className="text-amber-700">{t("order.noServices") || t("common.noData") || "No services"}</p>
				)}
			</div>
		</div>
	);
}
function OrderAddressesSection({ order, t }) {
	return (
		<div>
			<h2 className="text-xl font-bold text-amber-900 mb-4 pb-2 border-b border-orange-200/50">
				{t("order.addresses") || "Addresses"}
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<AddressCard 
					title={t("order.fromAddress") || "From Address"}
					address={order.fromAddress || order.addresses?.from}
					details={order.addresses?.details?.from}
					t={t}
				/>
				{order.toAddress && (
					<AddressCard 
						title={t("order.toAddress") || "To Address"}
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
		<div className="p-4 bg-amber-50/30 rounded-lg border border-amber-200/30">
			<h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide mb-3">
				{title}
			</h3>
			<p className="text-sm text-amber-900 leading-relaxed mb-3">
				{address || t("common.notSpecified") || "-"}
			</p>
			{details && (
				<div className="text-xs text-amber-700/70 space-y-1 pt-3 border-t border-amber-200/50">
					<p><span className="font-medium">{t("order.type") || "Type"}:</span> {getTranslatedLocationType(details.locationType, t)}</p>
					{details.floor !== undefined && (
						<p><span className="font-medium">{t("order.floor") || "Floor"}:</span> {details.floor}</p>
					)}
					{details.area && (
						<p><span className="font-medium">{t("order.area") || "Area"}:</span> {details.area} m²</p>
					)}
					<p><span className="font-medium">{t("order.elevator") || "Elevator"}:</span> {details.hasElevator ? t("common.yes") || "Yes" : t("common.no") || "No"}</p>
				</div>
			)}
		</div>
	);
}

function OrderScheduleSection({ order, t }) {
	if (!order.preferred_date && !order.number_of_rooms) return null;

	return (
		<div>
			<h2 className="text-xl font-bold text-amber-900 mb-4 pb-2 border-b border-orange-200/50">
				{t("order.schedule") || "Schedule"} & {t("order.roomConfiguration") || "Room Configuration"}
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{order.preferred_date && (
					<div className="p-4 bg-orange-50/30 rounded-lg border border-orange-200/30">
						<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2">
							{t("order.date") || "Date"}
						</p>
						<p className="text-base font-medium text-amber-900">
							{formatDate(order.preferred_date)}
							{order.preferred_time && ` at ${formatTime(order.preferred_time)}`}
						</p>
					</div>
				)}
				{order.number_of_rooms && (
					<div className="p-4 bg-orange-50/30 rounded-lg border border-orange-200/30">
						<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2">
							{t("order.roomConfiguration") || "Room Configuration"}
						</p>
						<p className="text-base font-medium text-amber-900">
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
			<h2 className="text-xl font-bold text-amber-900 mb-4 pb-2 border-b border-orange-200/50">
				{t("order.notes") || "Notes"}
			</h2>
			<div className="p-4 bg-blue-50/30 rounded-lg border border-blue-200/30">
				<p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
					{notes}
				</p>
			</div>
		</div>
	);
}
