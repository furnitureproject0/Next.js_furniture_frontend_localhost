"use client";

import CompanyAdminOrdersList from "@/components/company-admin/CompanyAdminOrdersList";
import CompanyAdminStatsCards from "@/components/company-admin/CompanyAdminStatsCards";
import CompanyAdminDayStriker from "@/components/company-admin/CompanyAdminDayStriker";
import CompanyAdminNewOrdersFilter from "@/components/company-admin/CompanyAdminNewOrdersFilter";
import CalendarDatePicker from "@/components/site-admin/CalendarDatePicker";
import PricingModal from "@/components/modals/PricingModal";
import TeamAssignmentModal from "@/components/modals/TeamAssignmentModal";
import NewCompanyAdminOrderModal from "@/components/company-admin/NewCompanyAdminOrderModal";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectUser, selectCompanyOrders, selectDisplayEmployees } from "@/store/selectors";
import { fetchCompanyAdminOrders, sendOffer, sendOrderServiceOffer, updateOrder } from "@/store/slices/ordersSlice";
import { useState, useMemo, useEffect, useRef } from "react";

export default function CompanyAdminDashboard() {
	const { t, currentLanguage } = useTranslation();
	const { toast } = useGlobalToast();
	const dispatch = useAppDispatch();
	const user = useAppSelector(selectUser);
	const employees = useAppSelector(selectDisplayEmployees);
	const memoizedSelectCompanyOrders = useMemo(() => {
		return user?.company_id ? selectCompanyOrders(user.company_id) : () => [];
	}, [user?.company_id]);

	const companyOrders = useAppSelector(memoizedSelectCompanyOrders);
	const router = useRouter();

	const fetchedCompanyId = useRef(null);

	// Fetch company admin orders on component mount
	useEffect(() => {
		if (user && user.company_id) {
			if (user.company_id !== fetchedCompanyId.current) {
				dispatch(fetchCompanyAdminOrders({ company_id: user.company_id }));
				fetchedCompanyId.current = user.company_id;
			}
		}
	}, [user, user?.company_id, dispatch]);
	
	const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
	const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
	const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
	const [selectedOrderForPricing, setSelectedOrderForPricing] = useState(null);
	const [selectedOrderForTeam, setSelectedOrderForTeam] = useState(null);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	const [filters, setFilters] = useState({
		status: "all", 
		search: "",
		selectedDate: null,
		service_id: "all",
		type: "order",
	});

	const busyDates = useMemo(() => {
		if (!companyOrders) return [];
		return companyOrders.map(o => o.preferred_date).filter(Boolean);
	}, [companyOrders]);

	const handleDateSelect = (date) => {
		setFilters(prev => ({ ...prev, selectedDate: date }));
	};

	const handleSetPrice = (order, orderServiceId) => {
		setSelectedOrderForPricing({ order, orderServiceId });
		setIsPricingModalOpen(true);
	};

	const handleAssignTeam = (order) => {
		setSelectedOrderForTeam(order);
		setIsTeamModalOpen(true);
	};

	const handlePricingSubmit = async (pricingData) => {
		if (selectedOrderForPricing?.orderServiceId) {
			try {
				const result = await dispatch(
					sendOrderServiceOffer({
						orderId: selectedOrderForPricing.order.id,
						orderServiceId: selectedOrderForPricing.orderServiceId,
						offerData: pricingData,
					}),
				).unwrap();
				const message = result?.message || t("notifications.offerSent") || "Offer sent successfully";
				toast.success(message);
				if (user?.company_id) {
					dispatch(fetchCompanyAdminOrders({ company_id: user.company_id }));
				}
			} catch (error) {
				console.error("Failed to send offer:", error);
				const errorMessage = error?.message || error?.payload?.message || t("common.errors.failedToSendOffer") || "Failed to send offer";
				toast.error(errorMessage);
			}
		} else {
			await dispatch(
				sendOffer({
					orderId: selectedOrderForPricing.order.id,
					offerData: pricingData,
				}),
			);
		}
		setIsPricingModalOpen(false);
		setSelectedOrderForPricing(null);
	};

	const handleTeamAssignment = (teamData) => {
		const { employees, teamLeader } = teamData;
		const driver = employees.find((emp) => emp.role === "Driver");
		const workers = employees.filter((emp) => emp.role === "Mover");

		const teamMembers = employees.map((emp) => ({
			id: emp.id,
			name: emp.name,
			role: emp.role,
			phone: emp.phone || "+41-XX-XXX-XXXX",
		}));

		dispatch(
			updateOrder({
				id: selectedOrderForTeam.id,
				updates: {
					status: "scheduled",
					driver: driver?.name,
					workers: workers.map((w) => w.name),
					teamLeader: teamLeader ? {
						id: teamLeader.id,
						name: teamLeader.name,
						role: teamLeader.role,
					} : null,
					teamMembers: teamMembers,
				},
			}),
		);
		setIsTeamModalOpen(false);
		setSelectedOrderForTeam(null);
	};

	return (
		<div className="min-h-screen" style={{ background: "#FFFFFF" }}>
			<div className="p-4 sm:p-6 lg:p-8 space-y-6">
				{/* Page Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
							{t("dashboards.companyAdmin.title")}
						</h1>
						<p className="text-sm text-slate-600/70">
							{t("dashboards.companyAdmin.subtitle")}
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
						<button
							onClick={() => router.push("/company-admin/create-order")}
							className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r from-emerald-500 to-green-600"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							<span className="whitespace-nowrap">{t("dashboards.companyAdmin.createOrder")}</span>
						</button>
						<button
							onClick={() => router.push("/company-admin/create-offer")}
							className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r from-orange-500 to-amber-600"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
							</svg>
							<span className="whitespace-nowrap">{t("dashboards.companyAdmin.createOffer")}</span>
						</button>
						<button
							onClick={() => router.push("/company-admin/create-appointment")}
							className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r from-blue-500 to-indigo-600"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							<span className="whitespace-nowrap">{t("dashboards.companyAdmin.createAppointment")}</span>
						</button>
					</div>
				</div>

				{/* 1. Filters & Search */}
				<div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-primary-100 shadow-sm">
					<CompanyAdminNewOrdersFilter 
						filters={filters}
						onFilterChange={setFilters}
					/>
				</div>

				{/* 2. Horizontal Day Striker */}
				<div className="bg-white p-2 rounded-2xl">
					<CompanyAdminDayStriker 
						selectedDate={filters.selectedDate}
						onDateSelect={handleDateSelect}
						busyDates={busyDates}
						onOpenCalendar={() => setIsCalendarOpen(!isCalendarOpen)}
					/>
				</div>

				{/* Collapsible Calendar */}
				<div className={`overflow-hidden transition-all duration-500 ease-in-out ${isCalendarOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
					<div className="max-w-md mx-auto">
						<CalendarDatePicker
							selectedDate={filters.selectedDate}
							onDateSelect={(date) => {
								handleDateSelect(date);
								setIsCalendarOpen(false);
							}}
							busyDates={busyDates}
						/>
					</div>
				</div>

				{/* 3. Stats Cards */}
				<CompanyAdminStatsCards selectedDate={filters.selectedDate} />

				{/* 4. TABS & LISTS */}
				<div className="pt-4">
					{/* Tabs UI */}
					<div className="flex gap-6 mb-4 border-b border-gray-200">
						<button
							className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${filters.type === 'order' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
							onClick={() => setFilters(prev => ({ ...prev, type: 'order' }))}
						>
							{t("sidebar.orders") || "Orders List"}
						</button>
						<button
							className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${filters.type === 'offer' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
							onClick={() => setFilters(prev => ({ ...prev, type: 'offer' }))}
						>
							{t("orders.offers") || "Offers List"}
						</button>
						<button
							className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${filters.type === 'appointment' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
							onClick={() => setFilters(prev => ({ ...prev, type: 'appointment' }))}
						>
							{t("orders.appointments") || "Appointments List"}
						</button>
					</div>

					<CompanyAdminOrdersList
						refreshTrigger={refreshTrigger}
						filters={filters}
						onFilterChange={setFilters}
						type={filters.type || "order"}
					/>
				</div>
			</div>


			{/* Modals */}
			<PricingModal
				isOpen={isPricingModalOpen}
				onClose={() => {
					setIsPricingModalOpen(false);
					setSelectedOrderForPricing(null);
				}}
				order={selectedOrderForPricing?.order || selectedOrderForPricing}
				orderServiceId={selectedOrderForPricing?.orderServiceId}
				onSubmit={handlePricingSubmit}
			/>

			<TeamAssignmentModal
				isOpen={isTeamModalOpen}
				onClose={() => setIsTeamModalOpen(false)}
				order={selectedOrderForTeam}
				employees={employees}
				onSubmit={handleTeamAssignment}
			/>

			<NewCompanyAdminOrderModal
				isOpen={isNewOrderModalOpen}
				onClose={() => {
					setIsNewOrderModalOpen(false);
					if (user?.company_id) {
						dispatch(fetchCompanyAdminOrders({ company_id: user.company_id }));
					}
				}}
				onOrderCreated={(orderData) => {
					if (user?.company_id) {
						dispatch(fetchCompanyAdminOrders({ company_id: user.company_id }));
					}
				}}
			/>
		</div>
	);
}
