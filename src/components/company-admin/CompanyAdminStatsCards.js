"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUser, selectCompanyOrders } from "@/store/selectors";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { appointmentsApi } from "@/lib/api";

// ─── Service Color Map ──────────────────────────────────────
const SERVICE_COLORS = {
	Moving:   { bg: "bg-rose-50",    border: "border-rose-200/60",   text: "text-rose-700",    dot: "bg-rose-400",    icon: "text-rose-500",    gradient: "from-rose-500 to-rose-600" },
	Cleaning: { bg: "bg-sky-50",     border: "border-sky-200/60",    text: "text-sky-700",     dot: "bg-sky-400",     icon: "text-sky-500",     gradient: "from-sky-500 to-sky-600" },
	Painting: { bg: "bg-amber-50",   border: "border-amber-200/60",  text: "text-amber-700",   dot: "bg-amber-400",   icon: "text-amber-500",   gradient: "from-amber-500 to-amber-600" },
	Packing:  { bg: "bg-violet-50",  border: "border-violet-200/60", text: "text-violet-700",  dot: "bg-violet-400",  icon: "text-violet-500",  gradient: "from-violet-500 to-violet-600" },
	default:  { bg: "bg-slate-50",   border: "border-slate-200/60",  text: "text-slate-700",   dot: "bg-slate-400",   icon: "text-slate-500",   gradient: "from-slate-500 to-slate-600" },
};

const getServiceColor = (serviceName) => {
	if (!serviceName) return SERVICE_COLORS.default;
	const key = Object.keys(SERVICE_COLORS).find(k =>
		serviceName.toLowerCase().includes(k.toLowerCase())
	);
	return SERVICE_COLORS[key] || SERVICE_COLORS.default;
};

// ─── Format Helpers ─────────────────────────────────────────
const formatTime = (t) => {
	if (!t) return "";
	const [h, m] = t.split(":");
	return `${h}:${m}`;
};

const toDateKey = (d) => {
	const dt = new Date(d);
	return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

const todayKey = () => toDateKey(new Date());

// ─── Service Icon SVG ───────────────────────────────────────
const ServiceIcon = ({ name, className = "w-4 h-4" }) => {
	const n = (name || "").toLowerCase();
	if (n.includes("moving")) return (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12l-2 5H8m0 0L6 4H3m5 3v10a2 2 0 104 0m-4 0a2 2 0 104 0m8-10a2 2 0 100-4 2 2 0 000 4z" />
		</svg>
	);
	if (n.includes("clean")) return (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
		</svg>
	);
	if (n.includes("paint")) return (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
		</svg>
	);
	if (n.includes("pack")) return (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
		</svg>
	);
	return (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
		</svg>
	);
};

// ─── Card Component ─────────────────────────────────────────
const TodayServiceCard = ({ title, icon, gradient, services, emptyMsg, onViewOrder, dateLabel, t, cardType }) => {
	return (
		<div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-primary-200/40 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
			{/* Card Header */}
			<div className={`bg-gradient-to-r ${gradient} p-4 flex items-center gap-3`}>
				<div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
					{icon}
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="text-sm font-bold text-white truncate">{title}</h3>
					<div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 opacity-90">
						{(() => {
							const counts = services.reduce((acc, s) => {
								const type = (s.orderType || "").toLowerCase();
								if (type === "offer") acc.offers++;
								else if (type === "appointment") acc.appts++;
								else acc.orders++;
								return acc;
							}, { orders: 0, offers: 0, appts: 0 });

							const parts = [];
							
							if (counts.orders > 0 || (services.length === 0 && cardType === 'order')) {
								const label = counts.orders === 1 ? t("pluralForms.order") : t("pluralForms.orders");
								parts.push(`${counts.orders} ${label}`);
							}
							if (counts.offers > 0 || (services.length === 0 && cardType === 'offer')) {
								const label = counts.offers === 1 ? t("pluralForms.offer") : t("pluralForms.offers");
								parts.push(`${counts.offers} ${label}`);
							}
							if (counts.appts > 0 || (services.length === 0 && cardType === 'appointment')) {
								const label = counts.appts === 1 ? t("pluralForms.appt") : t("pluralForms.appts");
								parts.push(`${counts.appts} ${label}`);
							}
							
							return (
								<p className="text-[10px] sm:text-xs text-white leading-tight flex items-center gap-1">
									{parts.join(" · ")} {dateLabel}
								</p>
							);
						})()}
					</div>
				</div>
				<div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
					<span className="text-lg font-bold text-white">{services.length}</span>
				</div>
			</div>

			{/* Service List */}
			<div className="p-3 flex-1">
				{services.length === 0 ? (
					<div className="py-6 text-center">
						<div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
							<svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
							</svg>
						</div>
						<p className="text-xs text-slate-400 font-medium">{emptyMsg}</p>
					</div>
				) : (
					<div className="space-y-1.5 pt-1">
						{services.map((svc, idx) => {
							const color = getServiceColor(svc.serviceName);
							return (
								<button
									key={`${svc.orderId}-${svc.serviceName}-${idx}`}
									onClick={() => svc.orderId && onViewOrder(svc.orderId)}
									className={`
										w-full ${color.bg} border ${color.border} rounded-xl p-3
										flex items-center gap-3 text-left
										hover:shadow-md hover:-translate-y-[1px] transition-all duration-200
										cursor-pointer group/svc
									`}
								>
									{/* Time badge */}
									<div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-white/80 border ${color.border} flex flex-col items-center justify-center`}>
										<span className={`text-xs font-bold ${color.text}`}>
											{svc.time ? formatTime(svc.time) : "—"}
										</span>
									</div>

									{/* Service info */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-1.5 mb-0.5">
											<ServiceIcon name={svc.serviceName} className={`w-3.5 h-3.5 ${color.icon}`} />
											<span className={`text-xs font-bold ${color.text} truncate`}>{svc.serviceName}</span>
										</div>
										<div className="flex items-center gap-1.5">
											<span className="text-[10px] text-slate-500 truncate">
												#{svc.orderId} · {svc.customerName}
											</span>
										</div>
									</div>

									{/* Arrow */}
									<svg className="w-4 h-4 text-slate-300 group-hover/svc:text-slate-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

// ─── Main Component ─────────────────────────────────────────
export default function CompanyAdminStatsCards({ selectedDate }) {
	const { t } = useTranslation();
	const user = useAppSelector(selectUser);
	const memoizedSelectCompanyOrders = useMemo(() => {
		return user?.company_id ? selectCompanyOrders(user.company_id) : () => [];
	}, [user?.company_id]);

	const companyOrders = useAppSelector(memoizedSelectCompanyOrders);
	const router = useRouter();

	// Appointments fetched from backend (separate appointments table)
	const [appointments, setAppointments] = useState([]);
	const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

	// Helper function to translate service type name
	const getServiceTypeName = (orderType, serviceName, status) => {
		// If service has its own name, use it
		if (serviceName && serviceName.trim()) return serviceName;
		
		// Translate based on order type and status
		if (orderType === "offer") {
			return t("orderTypes.offerRequest") || "Offer Request";
		} else if (orderType === "appointment") {
			const isPending = status === "pending";
			return isPending ? (t("orderTypes.newAppointment") || "New Appointment") : (t("orderTypes.appointment") || "Appointment");
		} else if (orderType === "order") {
			const isPending = status === "pending";
			return isPending ? (t("orderTypes.newOrder") || "New Order") : (t("orderTypes.order") || "Order");
		}
		return t("orderTypes.newOrder") || "New Order";
	};

	const activeDateKey = useMemo(() => {
		if (selectedDate) return toDateKey(selectedDate);
		return todayKey();
	}, [selectedDate]);

	// Fetch appointments for the active date (backend `/appointments` table)
	useEffect(() => {
		// If no logged-in company admin, skip
		if (!user) return;

		const fetchAppointments = async () => {
			setIsLoadingAppointments(true);
			try {
				const response = await appointmentsApi.getAppointments({
					expected_date: activeDateKey,
				});

				if (response?.success && Array.isArray(response.data)) {
					setAppointments(response.data);
				} else {
					setAppointments([]);
				}
			} catch (err) {
				console.error("Failed to load appointments:", err);
				setAppointments([]);
			} finally {
				setIsLoadingAppointments(false);
			}
		};

		fetchAppointments();
	}, [activeDateKey, user]);

	const dateLabel = useMemo(() => {
		if (!selectedDate) return t("siteAdmin.cards.today") || "today";
		return new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
	}, [selectedDate, t]);

	// Extract services for the active date from orders, grouped by card type
	const { ordersServices, offersServices, appointmentsServices } = useMemo(() => {
		if (!companyOrders || companyOrders.length === 0) {
			// Still include standalone appointments from backend
			const appts = [];
			appointments.forEach((appt) => {
				if (!appt.expected_date) return;
				const key = toDateKey(appt.expected_date);
				if (key !== activeDateKey) return;

				appts.push({
					orderId: appt.order_id || null,
					serviceName: getServiceTypeName("appointment", null, appt.status),
					customerName: appt.client?.name || `Client #${appt.client_id}`,
					time: appt.expected_time || null,
					status: appt.status,
					orderType: "appointment",
					orderServices: [],
				});
			});

			// Sort by time
			const sortByTime = (a, b) => (a.time || "23:59").localeCompare(b.time || "23:59");
			appts.sort(sortByTime);

			return { ordersServices: [], offersServices: [], appointmentsServices: appts };
		}

		const orders = [];   // order_type = 'order' (or default)
		const offers = [];   // order_type = 'offer'
		const appointmentsList = [];

		companyOrders.forEach((order) => {
			if (order.status === "cancelled") return;

			// Get services from orderServices if available, otherwise fallback to servicesDetails
			const sources = (order.orderServices && order.orderServices.length > 0) 
				? order.orderServices 
				: (order.servicesDetails || []);

			if (sources.length === 0) {
				// Fallback for orders with no services (like appointments)
				const orderDateKey = order.preferred_date ? toDateKey(order.preferred_date) : null;
				if (orderDateKey === activeDateKey) {
				const entry = {
						orderId: order.id,
						serviceName: getServiceTypeName(order.order_type, null, order.status),
						customerName: order.customerName || "Unknown",
						time: order.preferred_time || null,
						status: order.status,
						orderType: order.order_type || order.orderType,
						orderServices: order.orderServices || [],
					};
					categorizeEntry(entry, orders, offers, appointmentsList);
				}
				return;
			}

			sources.forEach((s) => {
				// Use service-specific date if available, otherwise order date
				const serviceDate = s.preferred_date || order.preferred_date;
				if (!serviceDate) return;

				const key = toDateKey(serviceDate);
				if (key !== activeDateKey) return;

				const entry = {
					orderId: order.id,
					serviceName: (s.serviceName || s.name || getServiceTypeName(order.order_type, null, order.status)),
					customerName: order.customerName || "Unknown",
					// Use service-specific time if available, otherwise order time
					time: s.preferred_time || order.preferred_time || null,
					status: s.status || order.status,
					orderType: order.order_type || order.orderType,
					orderServices: order.orderServices || [],
				};
				categorizeEntry(entry, orders, offers, appointmentsList);
			});
		});

		function categorizeEntry(entry, orders, offers, appointments) {
			const orderType = (entry.orderType || entry.order_type || entry.type || "").toLowerCase();
			
			// Use explicit orderType as the primary source of truth
			if (orderType === "appointment") {
				appointmentsList.push(entry);
			} else if (orderType === "offer") {
				offers.push(entry);
			} else {
				// Default to orders (including "order", "", "new_order")
				orders.push(entry);
			}
		}

		// Sort all by time (ascending)
		const sortByTime = (a, b) => (a.time || "23:59").localeCompare(b.time || "23:59");
		orders.sort(sortByTime);
		offers.sort(sortByTime);
		appointmentsList.sort(sortByTime);

		// Merge standalone appointments (from `/appointments`) into the appointments list
		const mergedAppointments = [...appointmentsList];

		appointments.forEach((appt) => {
			if (!appt.expected_date) return;
			const key = toDateKey(appt.expected_date);
			if (key !== activeDateKey) return;

			mergedAppointments.push({
				orderId: appt.order_id || null,
				serviceName: getServiceTypeName("appointment", null, appt.status),
				customerName: appt.client?.name || `Client #${appt.client_id}`,
				time: appt.expected_time || null,
				status: appt.status,
				orderType: "appointment",
				orderServices: [],
			});
		});

		mergedAppointments.sort(sortByTime);

		return { ordersServices: orders, offersServices: offers, appointmentsServices: mergedAppointments };
	}, [companyOrders, activeDateKey, appointments]);

	const handleViewOrder = (orderId) => {
		router.push(`/company-admin/orders/${orderId}`);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
			<TodayServiceCard
				title={t("siteAdmin.cards.orders") }
				gradient="from-emerald-500 to-teal-700"
				icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
				services={ordersServices}
				emptyMsg={t("siteAdmin.cards.noOrdersToday") || "No new orders today"}
				onViewOrder={handleViewOrder}
				dateLabel={dateLabel}
				t={t}
				cardType="order"
			/>
			<TodayServiceCard
				title={t("siteAdmin.cards.offers")}
				gradient="from-orange-500 to-orange-600"
				icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
				services={offersServices}
				emptyMsg={t("siteAdmin.cards.noOffersToday") || "No offers today"}
				onViewOrder={handleViewOrder}
				dateLabel={dateLabel}
				t={t}
				cardType="offer"
			/>
			<TodayServiceCard
				title={t("siteAdmin.cards.appointments")}
				gradient="from-primary-500 to-primary-700"
				icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
				services={appointmentsServices}
				emptyMsg={t("siteAdmin.cards.noAppointmentsToday") || "No appointments today"}
				onViewOrder={handleViewOrder}
				dateLabel={dateLabel}
				t={t}
				cardType="appointment"
			/>
		</div>
	);
}
