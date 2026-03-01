"use client";

import OrderServiceCompanyAssignmentModal from "@/components/modals/OrderServiceCompanyAssignmentModal";
import SiteAdminOrdersList from "@/components/site-admin/SiteAdminOrdersList";
import SiteAdminStatsCards from "@/components/site-admin/SiteAdminStatsCards";
import SiteAdminDayStriker from "@/components/site-admin/SiteAdminDayStriker";
import SiteAdminOrdersFilter from "@/components/site-admin/SiteAdminOrdersFilter";
import CalendarDatePicker from "@/components/site-admin/CalendarDatePicker";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectUser, selectAllOrders } from "@/store/selectors";
import { useState, useMemo } from "react";

export default function SiteAdminDashboard() {
	const { t, currentLanguage } = useTranslation();
	const dispatch = useAppDispatch();
	const user = useAppSelector(selectUser);
	const allOrders = useAppSelector(selectAllOrders);
	const router = useRouter();
	
	const [isAssignCompanyModalOpen, setIsAssignCompanyModalOpen] = useState(false);
	const [selectedOrderForAssignment, setSelectedOrderForAssignment] = useState(null);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	const [filters, setFilters] = useState({
		status: "all", 
		search: "",
		selectedDate: null,
		service_id: "all",
	});

	const busyDates = useMemo(() => {
		if (!allOrders) return [];
		return allOrders.map(o => o.preferred_date).filter(Boolean);
	}, [allOrders]);

	const handleAssignCompany = (order) => {
		setSelectedOrderForAssignment(order);
		setIsAssignCompanyModalOpen(true);
	};

	const handleCompanyAssignmentComplete = () => {
		setIsAssignCompanyModalOpen(false);
		setSelectedOrderForAssignment(null);
	};

	const handleDateSelect = (date) => {
		setFilters(prev => ({ ...prev, selectedDate: date }));
	};

	return (
		<ProtectedRoute requiredRoles={["site-admin", "super-admin"]}>
			<div className="min-h-screen" style={{ background: "#FFFFFF" }}>
				<div className="p-4 sm:p-6 lg:p-8 space-y-6">
				{/* Page Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
							{t("siteAdmin.dashboard.title")}
						</h1>
						<p className="text-sm text-slate-600/70">
							{t("siteAdmin.dashboard.subtitle")}
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
						{/* Create Order — Green */}
						<button
							onClick={() => router.push("/site-admin/create-order")}
							className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r from-emerald-500 to-green-600"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							<span className="whitespace-nowrap">{t("siteAdmin.dashboard.createOrder") || "Create Order"}</span>
						</button>
						{/* Create Offer — Orange */}
						<button
							onClick={() => router.push("/site-admin/create-offer")}
							className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r from-orange-500 to-amber-600"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
							</svg>
							<span className="whitespace-nowrap">{t("siteAdmin.dashboard.createOffer") || "Create Offer"}</span>
						</button>
						{/* Create Appointment — Blue */}
						<button
							onClick={() => router.push("/site-admin/create-appointment")}
							className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r from-blue-500 to-indigo-600"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							<span className="whitespace-nowrap">{t("siteAdmin.dashboard.createAppointment") || "Create Appointment"}</span>
						</button>
					</div>
				</div>

				{/* 1. Filters & Search */}
				<div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-primary-100 shadow-sm">
					<SiteAdminOrdersFilter 
						filters={filters}
						onFilterChange={setFilters}
					/>
				</div>

				{/* 2. Horizontal Day Striker */}
				<div className="bg-white p-2 rounded-2xl">
					<SiteAdminDayStriker 
						selectedDate={filters.selectedDate}
						onDateSelect={handleDateSelect}
						busyDates={busyDates}
						onOpenCalendar={() => setIsCalendarOpen(!isCalendarOpen)}
					/>
				</div>

				{/* Collapsible Calendar (Full) */}
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
				<SiteAdminStatsCards selectedDate={filters.selectedDate} />

				{/* 4. Orders List Table */}
				<SiteAdminOrdersList
					onAssignCompany={handleAssignCompany}
					refreshTrigger={refreshTrigger}
					filters={filters}
					onFilterChange={setFilters}
				/>
			</div>

			{/* Modals */}
			<OrderServiceCompanyAssignmentModal
				isOpen={isAssignCompanyModalOpen}
				onClose={() => {
					setIsAssignCompanyModalOpen(false);
					setSelectedOrderForAssignment(null);
				}}
				order={selectedOrderForAssignment}
				onAssignComplete={handleCompanyAssignmentComplete}
			/>
		</div>
		</ProtectedRoute>
	);
}
