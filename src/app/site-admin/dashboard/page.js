"use client";

import OrderServiceCompanyAssignmentModal from "@/components/modals/OrderServiceCompanyAssignmentModal";
import SiteAdminStatsCards from "@/components/site-admin/SiteAdminStatsCards";
import SiteAdminDayStriker from "@/components/site-admin/SiteAdminDayStriker";
import SiteAdminOrdersFilter from "@/components/site-admin/SiteAdminOrdersFilter";
import CalendarDatePicker from "@/components/site-admin/CalendarDatePicker";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectUser, selectAllOrders } from "@/store/selectors";
import { useState, useMemo, useEffect } from "react";

// ==========================================
// 1. مكون عرض الأوردرات (SiteAdminOrdersList)
// ==========================================
function SiteAdminOrdersList({ onAssignCompany, refreshTrigger, filters, onFilterChange }) {
    const { t } = useTranslation();
    const router = useRouter();

    const [orders, setOrders] = useState([]);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const queryParams = new URLSearchParams({
                    page: meta.page,
                    limit: 10,
                });

                if (filters?.search) queryParams.append("search", filters.search);
                if (filters?.status && filters.status !== "all") queryParams.append("status", filters.status);
                if (filters?.selectedDate) queryParams.append("date", filters.selectedDate);

                const response = await fetch(`https://angebotsprofi.ch/api/orders-v2/?${queryParams.toString()}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include" 
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setOrders(data.data || []);
                    setMeta(data.meta || { page: 1, totalPages: 1, totalItems: 0 });
                } else {
                    throw new Error(data.message || "Failed to fetch orders");
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, refreshTrigger, meta.page]);

    const formatPrice = (min, max, fixed) => {
        const minP = parseFloat(min) || 0;
        const maxP = parseFloat(max) || 0;
        const fixedP = parseFloat(fixed) || 0;
        
        if (fixedP > 0) return `${fixedP.toFixed(2)} CHF`;
        if (minP > 0 || maxP > 0) return `${minP.toFixed(2)} - ${maxP.toFixed(2)} CHF`;
        return "TBD";
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "assigned": return "bg-blue-100 text-blue-800 border-blue-200";
            case "in_progress": return "bg-purple-100 text-purple-800 border-purple-200";
            case "completed": return "bg-green-100 text-green-800 border-green-200";
            case "cancelled": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    if (isLoading && orders.length === 0) {
        return (
            <div className="w-full p-8 flex justify-center items-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return <div className="w-full p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center text-sm">{error}</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="w-full p-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                <p className="text-gray-500 text-sm">No orders found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-wrap justify-between items-start gap-3 mb-4 border-b border-gray-50 pb-3">
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-gray-900">#{order.id}</span>
                                <span className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                                {order.type && (
                                    <span className="px-2 py-1 text-[11px] font-medium bg-gray-100 text-gray-600 rounded-md">
                                        {order.type.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800">
                                    {order.execution_date} <span className="text-gray-400 font-normal">at {order.execution_time?.slice(0, 5) || '00:00'}</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Details</h4>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                                            {order.client?.name?.charAt(0)?.toUpperCase() || 'C'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{order.client?.name || 'Unknown Client'}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{order.client?.email}</p>
                                            {order.client?.phones?.[0] && <p className="text-xs text-gray-500 mt-0.5">{order.client.phones[0].phone}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Assigned Company</h4>
                                    {order.company ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">{order.company.name}</span>
                                        </div>
                                    ) : (
                                        <button onClick={() => onAssignCompany(order)} className="text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2">
                                            Assign a Company
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Locations</h4>
                                <div className="space-y-3 relative">
                                    {order.primary_location && (
                                        <div className="flex gap-2">
                                            <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed">{order.primary_location.address}</p>
                                        </div>
                                    )}
                                    {order.secondary_location && (
                                        <div className="flex gap-2">
                                            <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed">{order.secondary_location.address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col justify-between">
                                <div>
                                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Services Requested</h4>
                                    <div className="space-y-2">
                                        {order.orderServices?.map(os => (
                                            <div key={os.id} className="p-2 bg-gray-50 rounded border border-gray-100">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-semibold text-gray-700">{os.service?.name}</span>
                                                    <span className="text-[10px] text-gray-500">{formatPrice(os.min_total_price, os.max_total_price, os.fixed_price)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-800">Total Price:</span>
                                    <span className="text-lg font-black text-emerald-600">{formatPrice(order.min_total_price, order.max_total_price, order.fixed_price)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end gap-2">
                            <button onClick={() => router.push(`/site-admin/orders/${order.id}`)} className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">View Details</button>
                            <button onClick={() => router.push(`/site-admin/orders/${order.id}/edit`)} className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900">Edit Order</button>
                        </div>
                    </div>
                ))}
            </div>

            {meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-2">
                    <span className="text-xs text-gray-500">Showing page {meta.page} of {meta.totalPages}</span>
                    <div className="flex gap-1">
                        <button disabled={meta.page <= 1} onClick={() => setMeta(prev => ({ ...prev, page: prev.page - 1 }))} className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">Previous</button>
                        <button disabled={meta.page >= meta.totalPages} onClick={() => setMeta(prev => ({ ...prev, page: prev.page + 1 }))} className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// 2. مكون عرض العروض (SiteAdminOffersList)
// ==========================================
function SiteAdminOffersList({ onAssignCompany, refreshTrigger, filters, onFilterChange }) {
    const { t } = useTranslation();
    const router = useRouter();

    const [offers, setOffers] = useState([]);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOffers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const queryParams = new URLSearchParams({
                    page: meta.page,
                    limit: 10,
                });

                if (filters?.search) queryParams.append("search", filters.search);
                if (filters?.status && filters.status !== "all") queryParams.append("status", filters.status);
                if (filters?.selectedDate) queryParams.append("date", filters.selectedDate);

                // Fetching from the offers-v2 endpoint
                const response = await fetch(`https://angebotsprofi.ch/api/offers-v2/?${queryParams.toString()}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setOffers(data.data || []);
                    setMeta(data.meta || { page: 1, totalPages: 1, totalItems: 0 });
                } else {
                    throw new Error(data.message || "Failed to fetch offers");
                }
            } catch (err) {
                console.error("Error fetching offers:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, refreshTrigger, meta.page]);

    const formatPrice = (min, max, fixed) => {
        const minP = parseFloat(min) || 0;
        const maxP = parseFloat(max) || 0;
        const fixedP = parseFloat(fixed) || 0;
        
        if (fixedP > 0) return `${fixedP.toFixed(2)} CHF`;
        if (minP > 0 || maxP > 0) return `${minP.toFixed(2)} - ${maxP.toFixed(2)} CHF`;
        return "TBD";
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "accepted": return "bg-blue-100 text-blue-800 border-blue-200";
            case "confirmed": return "bg-green-100 text-green-800 border-green-200";
            case "rejected": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    if (isLoading && offers.length === 0) {
        return (
            <div className="w-full p-8 flex justify-center items-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return <div className="w-full p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center text-sm">{error}</div>;
    }

    if (offers.length === 0) {
        return (
            <div className="w-full p-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                <p className="text-gray-500 text-sm">No offers found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                {offers.map((offer) => (
                    <div key={offer.id} className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-orange-400"></div>

                        <div className="flex flex-wrap justify-between items-start gap-3 mb-4 border-b border-gray-50 pb-3 pl-2">
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-black text-gray-900">#{offer.id}</span>
                                <span className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md border ${getStatusColor(offer.status)}`}>
                                    {offer.status}
                                </span>
                                {offer.type && (
                                    <span className="px-2 py-1 text-[11px] font-bold bg-orange-50 text-orange-600 rounded-md border border-orange-100 uppercase tracking-wide">
                                        {offer.type}
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-800">
                                    {offer.execution_date} <span className="text-gray-400 font-medium">at {offer.execution_time?.slice(0, 5) || '00:00'}</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-2">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Info</h4>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                                            {offer.client?.name?.charAt(0)?.toUpperCase() || 'C'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{offer.client?.name || 'Unknown Client'}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{offer.client?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Lead Company</h4>
                                    {offer.company ? (
                                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100 w-fit pr-3">
                                            <span className="text-xs font-semibold text-gray-700">{offer.company.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">No lead company</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Locations</h4>
                                <div className="space-y-3 relative">
                                    {offer.primary_location && (
                                        <div className="flex gap-2">
                                            <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed font-medium">{offer.primary_location.address}</p>
                                        </div>
                                    )}
                                    {offer.secondary_location && (
                                        <div className="flex gap-2">
                                            <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed font-medium">{offer.secondary_location.address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col justify-between">
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        Included Services
                                        <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full text-[9px]">{offer.orderServices?.length || 0}</span>
                                    </h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                        {offer.orderServices?.map(os => (
                                            <div key={os.id} className="p-2 bg-orange-50/30 rounded-lg border border-orange-100/50">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-800 block">{os.service?.name}</span>
                                                        <span className="text-[9px] text-gray-500 font-medium">By: {os.company?.name || offer.company?.name || 'Pending'}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-orange-600 whitespace-nowrap bg-orange-50 px-1.5 py-0.5 rounded">
                                                        {formatPrice(os.min_total_price, os.max_total_price, os.fixed_price)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm font-black text-gray-800 uppercase tracking-wide">Estimated Total:</span>
                                    <span className="text-lg font-black text-orange-500 drop-shadow-sm">{formatPrice(offer.min_total_price, offer.max_total_price, offer.fixed_price)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end gap-2 pl-2">
                            <button onClick={() => router.push(`/site-admin/offers/${offer.id}`)} className="px-4 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">View Offer</button>
                            <button onClick={() => router.push(`/site-admin/offers/${offer.id}/edit`)} className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 shadow-sm">Edit Offer</button>
                        </div>
                    </div>
                ))}
            </div>

            {meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-2">
                    <span className="text-xs font-medium text-gray-500">Showing page {meta.page} of {meta.totalPages}</span>
                    <div className="flex gap-1">
                        <button disabled={meta.page <= 1} onClick={() => setMeta(prev => ({ ...prev, page: prev.page - 1 }))} className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 transition-colors">Previous</button>
                        <button disabled={meta.page >= meta.totalPages} onClick={() => setMeta(prev => ({ ...prev, page: prev.page + 1 }))} className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 transition-colors">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// 3. الصفحة الرئيسية (SiteAdminDashboard)
// ==========================================
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

    // State for Tabs (Orders or Offers)
    const [activeTab, setActiveTab] = useState("orders"); // "orders" or "offers"

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

    const handleAssignCompany = (orderOrOffer) => {
        setSelectedOrderForAssignment(orderOrOffer);
        setIsAssignCompanyModalOpen(true);
    };

    const handleCompanyAssignmentComplete = () => {
        setIsAssignCompanyModalOpen(false);
        setSelectedOrderForAssignment(null);
        setRefreshTrigger(prev => prev + 1); // لتحديث الجدول بعد التعديل
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
                            {t("siteAdmin.dashboard.title") || "Dashboard"}
                        </h1>
                        <p className="text-sm text-slate-600/70">
                            {t("siteAdmin.dashboard.subtitle") || "Manage orders, offers, and schedules."}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => router.push("/site-admin/create-order")}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r from-emerald-500 to-green-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="whitespace-nowrap">{t("siteAdmin.dashboard.createOrder") || "Create Order"}</span>
                        </button>
                        <button
                            onClick={() => router.push("/site-admin/create-offer")}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r from-orange-500 to-amber-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="whitespace-nowrap">{t("siteAdmin.dashboard.createOffer") || "Create Offer"}</span>
                        </button>
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
                <SiteAdminStatsCards selectedDate={filters.selectedDate} />

                {/* 4. TABS & LISTS */}
                <div className="pt-4">
                    {/* Tabs UI */}
                    <div className="flex gap-6 mb-4 border-b border-gray-200">
                        <button
                            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'orders' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            Orders List
                        </button>
                        <button
                            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'offers' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                            onClick={() => setActiveTab('offers')}
                        >
                            Offers List
                        </button>
                    </div>

                    {/* Render specific list based on active tab */}
                    {activeTab === 'orders' ? (
                        <SiteAdminOrdersList
                            onAssignCompany={handleAssignCompany}
                            refreshTrigger={refreshTrigger}
                            filters={filters}
                            onFilterChange={setFilters}
                        />
                    ) : (
                        <SiteAdminOffersList
                            onAssignCompany={handleAssignCompany}
                            refreshTrigger={refreshTrigger}
                            filters={filters}
                            onFilterChange={setFilters}
                        />
                    )}
                </div>

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