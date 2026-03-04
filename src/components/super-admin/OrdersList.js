import { useAppDispatch } from "@/store/hooks";
import { cancelOrderThunk } from "@/store/slices/ordersSlice";
import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedStatusLabel } from "@/utils/i18nUtils";

const getStatusStyle = (status) => {
	switch (status) {
		case "pending":
			return "from-amber-400 to-orange-500 shadow-orange-500/20 text-white border-orange-200/50";
		case "assigned":
			return "from-blue-400 to-indigo-600 shadow-blue-500/20 text-white border-blue-200/50";
		case "scheduled":
			return "from-purple-400 to-fuchsia-600 shadow-purple-500/20 text-white border-purple-200/50";
		case "in-progress":
			return "from-primary-400 to-primary-700 shadow-primary-500/20 text-white border-primary-200/50";
		case "completed":
			return "from-emerald-400 to-teal-600 shadow-emerald-500/20 text-white border-emerald-200/50";
		case "cancelled":
			return "from-rose-400 to-red-600 shadow-red-500/20 text-white border-red-200/50";
		default:
			return "from-slate-400 to-slate-600 shadow-slate-500/20 text-white border-slate-200/50";
	}
};

const getStatusBadgeColor = (status) => {
	switch (status) {
		case "pending": return "bg-orange-50 text-orange-700 border-orange-200";
		case "assigned": return "bg-blue-50 text-blue-700 border-blue-200";
		case "scheduled": return "bg-purple-50 text-purple-700 border-purple-200";
		case "in-progress": return "bg-primary-50 text-primary-700 border-primary-200";
		case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
		case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
		default: return "bg-slate-50 text-slate-700 border-slate-200";
	}
};

const OrderCard = ({ order, onCancel, t, index }) => {
	return (
		<div 
			className="group/order relative bg-white border border-primary-100 hover:border-primary-400 rounded-2xl p-6 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(34,132,230,0.1)] hover:-translate-y-1 animate-slide-in overflow-hidden"
			style={{ animationDelay: `${index * 70}ms` }}
		>
			{/* Status Background Glow */}
			<div className={`absolute -right-20 -top-20 w-64 h-64 opacity-0 group-hover/order:opacity-10 transition-opacity duration-700 rounded-full bg-gradient-to-br ${getStatusStyle(order.status)} blur-3xl`}></div>

			<div className="relative flex flex-col sm:flex-row items-start justify-between mb-5 gap-4">
				{/* Order Header */}
				<div className="flex items-start gap-4 flex-1">
					<div className={`w-14 h-14 bg-gradient-to-br ${getStatusStyle(order.status)} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover/order:scale-110 group-hover/order:rotate-3 transition-all duration-500 animate-shine`}>
						<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex flex-wrap items-center gap-3 mb-2">
							<h3 className="text-xl font-black text-slate-800 group-hover/order:text-primary-600 transition-colors">
								{t("common.labels.order").toUpperCase()} #{order.id}
							</h3>
							<span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${getStatusBadgeColor(order.status)}`}>
								{getTranslatedStatusLabel(order.status, t)}
							</span>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
							<p className="text-sm font-bold text-slate-600">
								<span className="text-[10px] text-slate-400 uppercase tracking-widest block">{t("superAdmin.orderDetails.customer")}</span>
								{order.customer || t("common.nA")}
							</p>
							<p className="text-sm font-bold text-slate-600">
								<span className="text-[10px] text-slate-400 uppercase tracking-widest block">{t("superAdmin.orderDetails.service")}</span>
								{order.service || t("common.nA")}
							</p>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-end gap-2">
					<div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm group-hover/order:bg-white group-hover/order:shadow-md transition-all">
						<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("superAdmin.orderDetails.price")}</p>
						<p className="text-lg font-black text-slate-800 text-right">
							{order.price ? `${t("common.currency.chf")} ${order.price.toLocaleString()}` : t("common.status.pending").toUpperCase()}
						</p>
					</div>
				</div>
			</div>

			{/* Info Grid */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 mt-2">
				<div className="space-y-1">
					<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("common.labels.schedule").toUpperCase()}</p>
					<div className="flex items-center gap-2 text-slate-700">
						<svg className="w-3.5 h-3.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<p className="text-xs font-bold uppercase">{order.date || t("common.labels.notSet").toUpperCase()}</p>
					</div>
				</div>
				<div className="col-span-1 space-y-1">
					<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("common.labels.location").toUpperCase()}</p>
					<div className="flex items-center gap-2 text-slate-700">
						<svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
						</svg>
						<p className="text-xs font-bold truncate">{order.address || t("common.labels.noAddress").toUpperCase()}</p>
					</div>
				</div>
				<div className="col-span-2 flex justify-end items-center gap-3">
					{order.status !== "cancelled" && order.status !== "completed" && (
						<button 
							onClick={() => onCancel(order)}
							className="px-4 py-2 bg-white text-rose-600 text-[10px] font-black uppercase tracking-tighter rounded-lg border border-rose-100 shadow-sm hover:bg-rose-50 transition-all transform hover:scale-105 active:scale-95"
						>
							{t("common.buttons.cancelOrder").toUpperCase()}
						</button>
					)}
					<button className="px-4 py-2 bg-white text-primary-600 text-[10px] font-black uppercase tracking-tighter rounded-lg border border-primary-100 shadow-sm hover:bg-primary-600 hover:text-white transition-all transform hover:scale-105 active:scale-95">
						{t("common.buttons.viewDetails").toUpperCase()}
					</button>
				</div>
			</div>
		</div>
	);
};

export default function OrdersList({ orders }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const handleCancelOrder = (order) => {
		const reason = window.prompt(t("superAdmin.orderManagement.cancelReasonPrompt") || "Enter reason for cancellation:");
		if (reason !== null) {
			dispatch(cancelOrderThunk({ orderId: order.id, reason }));
		}
	};

	if (orders.length === 0) {
		return (
			<div className="bg-white border border-primary-200/40 rounded-lg sm:rounded-xl p-8 sm:p-10 lg:p-12 text-center">
				<svg
					className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-primary-600/30 mx-auto mb-3 sm:mb-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<p className="text-slate-600/70 text-base sm:text-lg">
					{t("superAdmin.orderManagement.noOrdersFound")}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{orders.map((order, index) => (
				<OrderCard 
					key={order.id} 
					order={order} 
					onCancel={handleCancelOrder}
					t={t} 
					index={index} 
				/>
			))}
		</div>
	);
}

