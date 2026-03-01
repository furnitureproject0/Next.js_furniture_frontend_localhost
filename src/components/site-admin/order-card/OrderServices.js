import { getTranslatedServiceTypes, getTranslatedStatusLabel } from "@/utils/i18nUtils";
import { formatDate, formatTime } from "@/utils/dateUtils";
import OrderOfferInfo from "./OrderOfferInfo";

export default function OrderServices({ order, t }) {
	const TRANSLATED_SERVICE_TYPES = getTranslatedServiceTypes(t);

	const getStatusColor = (status) => {
		switch (status) {
			case "assigned":
				return "bg-green-100 text-green-800 border-green-200";
			case "in_progress":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "completed":
				return "bg-purple-100 text-purple-800 border-purple-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const renderOrderServices = () => {
		if (!order.orderServices || order.orderServices.length === 0) {
			console.log('No orderServices found, falling back to legacy services. Order:', order);
			return renderLegacyServices();
		}

		console.log('Rendering orderServices:', order.orderServices);

		return (
			<div className="space-y-2">
				{order.orderServices.map((orderService) => {
					const serviceId = orderService.serviceId || orderService.service_id || orderService.service?.id;
					const serviceName = orderService.serviceName 
						|| orderService.service?.name 
						|| (serviceId && TRANSLATED_SERVICE_TYPES.find(s => s.id === serviceId)?.name) 
						|| `Service ${serviceId}`;

					console.log(`Service ${serviceName} - Date: ${orderService.preferred_date}, Time: ${orderService.preferred_time}`);
					console.log('Full orderService object:', orderService);

					return (
						<div key={orderService.id} className="border border-primary-200/60 rounded-lg p-3 bg-primary-50/30 flex flex-col gap-2">
							<div className="flex items-center justify-between">
								<span className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium border border-primary-200/50">
									{serviceName}
								</span>
								<div className="flex items-center gap-2">
									{orderService.company && (
										<span className="text-xs text-slate-600">
											{orderService.company.name}
										</span>
									)}
									<span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(orderService.status || "pending")}`}>
										{getTranslatedStatusLabel(orderService.status || "pending", t)}
									</span>
								</div>
							</div>

							{(orderService.preferred_date || orderService.preferred_time) && (
								<div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white/50 px-2 py-1 rounded border border-primary-200/30">
									<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span>
										{console.log(`Service ${serviceName} - Date: ${orderService.preferred_date}, Time: ${orderService.preferred_time}`)}
										{orderService.preferred_date ? formatDate(orderService.preferred_date) : ""}
										{orderService.preferred_date && orderService.preferred_time ? " at " : ""}
										{orderService.preferred_time ? formatTime(orderService.preferred_time) : ""}
									</span>
								</div>
							)}
							
							{orderService.offer && (
								<div className="mt-2 pl-2 border-l-2 border-primary-200/50">
									<OrderOfferInfo offer={orderService.offer} t={t} isEmbedded={true} />
								</div>
							)}
						</div>
					);
				})}
			</div>
		);
	};

	const renderLegacyServices = () => {
		const servicesData = order.servicesDetails && Array.isArray(order.servicesDetails) && order.servicesDetails.length > 0
			? order.servicesDetails
			: (Array.isArray(order.services) ? order.services : []);

		return (
			<div className="flex flex-wrap gap-2">
				{servicesData.map((serviceItem, idx) => {
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
							className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium border border-primary-200/50"
						>
							{displayName}
						</span>
					);
				})}
			</div>
		);
	};

	const renderAdditions = () => {
		if (!order.additions || order.additions.length === 0) return null;

		return (
			<div className="flex flex-wrap gap-2">
				{order.additions.map((addition, idx) => {
					if (!addition || typeof addition !== 'object') return null;
					const additionName = addition.name || addition.note || 'Unknown Addition';
					return (
						<span
							key={idx}
							className="px-2.5 py-1 bg-primary-100 text-slate-700 rounded-lg text-xs font-medium border border-primary-200/50 flex items-center gap-1"
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
		);
	};

	return (
		<div>
			<p className="text-xs font-medium text-primary-600/70 uppercase tracking-wide mb-2">
				{t("orderDetails.services")}
			</p>
			<div className="space-y-3">
				{renderOrderServices()}
				{renderAdditions()}
			</div>
		</div>
	);
}
