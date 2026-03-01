"use client";

import { useState, useEffect, use } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { siteAdminApi } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";

export default function ClientHistoryPage({ params: paramsPromise }) {
    // Robustly handle params (could be a promise or already resolved depending on router version)
    const params = paramsPromise && typeof paramsPromise.then === 'function' 
        ? use(paramsPromise) 
        : paramsPromise;
        
    const clientId = params?.clientId;
    const { t } = useTranslation();
    const router = useRouter();
    
    const [client, setClient] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // 1. Fetch Client Details
                const clientRes = await siteAdminApi.getClient(clientId);
                if (clientRes?.success) {
                    setClient(clientRes.data);
                }

                // 2. Fetch All Orders for this client (Appointments, Offers, Orders)
                // We use a large limit to show the "Archive" as requested
                const ordersRes = await siteAdminApi.getSiteAdminOrders({
                    client_id: clientId,
                    status: 'all',
                    limit: 100 
                });

                if (ordersRes?.success) {
                    console.log("HistoryPage: Orders fetched:", ordersRes.data.orders);
                    setOrders(ordersRes.data.orders || []);
                }
                console.log("HistoryPage: API Responses:", { client: clientRes, orders: ordersRes });
            } catch (err) {
                console.error("Error fetching client history:", err);
                setError(err.message || "Failed to load history");
            } finally {
                setIsLoading(false);
            }
        };

        if (clientId && clientId !== 'undefined') {
            fetchData();
        } else {
            console.warn("ClientHistoryPage: No valid clientId found in params:", params);
            setIsLoading(false);
            if (paramsPromise && !clientId) {
                setError("Invalid Client ID in URL");
            }
        }
    }, [clientId, params]);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                        <button onClick={() => window.location.reload()} className="text-xs font-bold uppercase tracking-wider hover:underline">Retry</button>
                    </div>
                )}
                
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors text-sm font-medium group"
                >
                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Orders
                </button>

                {/* Client Profile Header */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>
                    
                    <div className="flex items-center gap-5 relative">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg shadow-primary-100">
                            {client?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{client?.name}</h1>
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {client?.email}
                                </div>
                                {client?.phones?.[0] && (
                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {client?.phones[0].phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 relative">
                         <div className="text-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Total Activities</p>
                            <p className="text-xl font-bold text-slate-800">{orders.length}</p>
                         </div>
                         <div className="text-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Joined</p>
                            <p className="text-sm font-bold text-slate-800">{client?.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}</p>
                         </div>
                    </div>
                </div>

                {/* History Timeline */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-4 w-1 bg-primary-500 rounded-full"></div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Activity Timeline</h2>
                    </div>

                    {orders.length > 0 ? (
                        <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-8">
                            {orders.map((order, idx) => {
                                const type = order.order_type || 'order'; // Assume order if not specified
                                const isOffer = type === 'offer';
                                const isAppointment = type === 'appointment';
                                const isOrder = type === 'order' || (!isOffer && !isAppointment);

                                return (
                                    <div key={order.id} className="relative group">
                                        {/* Dot on timeline */}
                                        <div className={`absolute -left-[41px] top-6 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-transform group-hover:scale-125 ${
                                            isOffer ? 'bg-orange-500' :
                                            isAppointment ? 'bg-blue-500' :
                                            'bg-emerald-500'
                                        }`}></div>

                                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                        isOffer ? 'bg-orange-50 text-orange-600' :
                                                        isAppointment ? 'bg-blue-50 text-blue-600' :
                                                        'bg-emerald-50 text-emerald-600'
                                                    }`}>
                                                        {type}
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-700">#{order.id}</span>
                                                    <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                                                        order.status === 'completed' ? 'border-green-200 text-green-700 bg-green-50' :
                                                        order.status === 'pending' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                                        order.status === 'cancelled' ? 'border-red-200 text-red-700 bg-red-50' :
                                                        'border-blue-200 text-blue-700 bg-blue-50'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Services</p>
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {order.orderServices?.map(oss => (
                                                            <span key={oss.id} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                                                {oss.service?.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Price</p>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        CHF {order.total_price || (isOffer ? 'Estimation' : '0.00')}
                                                    </p>
                                                </div>

                                                <div className="flex items-end justify-start sm:justify-end">
                                                    <button 
                                                        onClick={() => router.push(`/site-admin/orders/${order.id}`)}
                                                        className="text-xs font-bold text-primary-600 hover:text-primary-700 border-b border-primary-100 hover:border-primary-600 transition-all flex items-center gap-1 pb-0.5"
                                                    >
                                                        View Details
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">No History Found</h3>
                            <p className="text-sm text-slate-500 max-w-xs">There are no records of orders, offers, or appointments for client #{clientId} yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
