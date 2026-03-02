"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { siteAdminApi } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

export default function SiteAdminOrdersPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, totalItems: 0 });
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const loadMoreRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);

    const fetchOrders = useCallback(async (pageToFetch = 1, append = false) => {
        try {
            if (pageToFetch === 1) setIsLoading(true);
            else setIsFetchingMore(true);
            
            setError(null);
            const response = await siteAdminApi.getSiteAdminOrders({
                page: pageToFetch,
                limit: pagination.limit,
                search: debouncedSearch,
                client_id: selectedClient?.id
            });

            if (response?.success) {
                const ordersData = Array.isArray(response?.data) 
                    ? response.data 
                    : (response?.data?.orders || []);
                const paginationData = response?.meta || response?.pagination || { ...pagination, page: pageToFetch };
                
                if (append) {
                    setOrders(prev => [...prev, ...ordersData]);
                } else {
                    setOrders(ordersData);
                }
                setPagination(paginationData);
            } else {
                setError("Failed to load orders");
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.message || "Failed to load orders");
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, [pagination.limit, debouncedSearch, selectedClient]);

    useEffect(() => {
        fetchOrders(1, false);
    }, [fetchOrders]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        if (!value.trim()) {
            setSearchResults([]);
            setShowSuggestions(false);
            return;
        }

        setIsSearching(true);
        
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        
        searchTimeoutRef.current = setTimeout(async () => {
            setDebouncedSearch(value);
            try {
                const clientResponse = await siteAdminApi.searchClients({ search: value, limit: 5 });
                if (clientResponse?.success && clientResponse?.data?.clients) {
                    setSearchResults(clientResponse.data.clients);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 400);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            setDebouncedSearch(searchQuery);
            setShowSuggestions(false);
            setIsSearching(false);
        }
    };

    const handleSelectClient = (client) => {
        setSelectedClient(client);
        setSearchQuery(client.name);
        setDebouncedSearch(""); 
        setSearchResults([]);
        setShowSuggestions(false);
    };

    const clearFilters = () => {
        setSelectedClient(null);
        setSearchQuery("");
        setDebouncedSearch("");
        setSearchResults([]);
        setShowSuggestions(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isLoading || isFetchingMore || pagination.page >= pagination.totalPages) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchOrders(pagination.page + 1, true);
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [isLoading, isFetchingMore, pagination, fetchOrders]);

    // دوال المساعدة للأسعار والألوان (نفس الموجودة في الكروت)
    const formatPrice = (min, max, fixed) => {
        const minP = parseFloat(min) || 0;
        const maxP = parseFloat(max) || 0;
        const fixedP = parseFloat(fixed) || 0;
        
        if (fixedP > 0) return `${fixedP.toFixed(2)} CHF`;
        if (minP > 0 || maxP > 0) {
            if (minP === maxP) return `${minP.toFixed(2)} CHF`;
            return `${minP.toFixed(2)} - ${maxP.toFixed(2)} CHF`;
        }
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
        return <LoadingSpinner />;
    }

    return (
        <ProtectedRoute requiredRoles={["site-admin", "super-admin"]}>
            <div className="min-h-screen" style={{ background: "#f8fafc" }}>
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    
                    {/* Page Header */}
                    <div className="mb-6 lg:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
                            {t("siteAdmin.orders.title") || "Orders"}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {t("siteAdmin.orders.subtitle") || "Manage and track all orders"}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="mb-8 group relative" ref={dropdownRef}>
                        <div className={`relative flex items-center bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden px-4 py-1.5 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-400/10 transition-all duration-300 ${showSuggestions && searchResults.length > 0 ? 'rounded-b-none border-b-0' : ''}`}>
                            <div className="flex items-center justify-center text-slate-400">
                                {isSearching ? (
                                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                )}
                            </div>
                            <input 
                                type="text" 
                                placeholder={t("siteAdmin.orders.searchPlaceholder") || "Search by Client Name or Email..."}
                                className="w-full px-4 py-3 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-sm font-medium"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => searchQuery && searchResults.length > 0 && setShowSuggestions(true)}
                            />
                            {(searchQuery || selectedClient) && (
                                <button 
                                    onClick={clearFilters}
                                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 border-t-0 rounded-b-2xl shadow-lg z-50 overflow-hidden">
                                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                    Matching Clients
                                </div>
                                <div className="max-h-60 overflow-y-auto scrollbar-thin">
                                    {searchResults.map((client) => (
                                        <button
                                            key={client.id}
                                            onClick={() => handleSelectClient(client)}
                                            className="w-full px-4 py-3 flex flex-col items-start hover:bg-emerald-50 transition-colors group border-b border-slate-50 last:border-0"
                                        >
                                            <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-600">
                                                {client.name}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {client.email}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedClient && (
                            <div className="mt-3 flex items-center gap-2">
                                <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-2 border border-emerald-200">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Filtering for: {selectedClient.name}
                                    <button onClick={clearFilters} className="hover:text-emerald-900 ml-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Orders Cards List */}
                    {orders.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                    
                                    {/* Header Row */}
                                    <div className="flex flex-wrap justify-between items-center gap-3 mb-5 border-b border-gray-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-black text-gray-900">#{order.id}</span>
                                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            {order.type && (
                                                <span className="px-2 py-1 text-[10px] font-bold bg-gray-100 text-gray-600 rounded uppercase tracking-widest border border-gray-200">
                                                    {order.type}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-800">
                                                {order.execution_date ? order.execution_date : 'N/A'} 
                                                <span className="text-gray-400 font-medium"> at {order.execution_time?.slice(0, 5) || '00:00'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Grid Content */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        
                                        {/* Column 1: Customer Details & Company */}
                                        <div className="space-y-5">
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Customer Details</h4>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg shrink-0 border border-blue-100">
                                                        {order.client?.name?.charAt(0)?.toUpperCase() || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{order.client?.name || 'Unknown Client'}</p>
                                                        <p className="text-xs font-medium text-gray-500">{order.client?.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Assigned Company</h4>
                                                <p className="text-sm font-bold text-gray-800">
                                                    {order.company?.name || <span className="text-gray-400 italic">No Company Assigned</span>}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Column 2: Locations */}
                                        <div>
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Locations</h4>
                                            <div className="space-y-4 relative before:absolute before:inset-y-2 before:left-[7px] before:w-[2px] before:bg-gray-100">
                                                {order.primary_location?.address && (
                                                    <div className="flex gap-3 relative z-10">
                                                        <div className="w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500 flex-shrink-0 mt-0.5"></div>
                                                        <p className="text-xs font-medium text-gray-600 leading-relaxed">{order.primary_location.address}</p>
                                                    </div>
                                                )}
                                                {order.secondary_location?.address && (
                                                    <div className="flex gap-3 relative z-10">
                                                        <div className="w-4 h-4 rounded-full bg-red-100 border-2 border-red-500 flex-shrink-0 mt-0.5"></div>
                                                        <p className="text-xs font-medium text-gray-600 leading-relaxed">{order.secondary_location.address}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Column 3: Services & Pricing */}
                                        <div className="flex flex-col justify-between bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                                                    Services Requested
                                                </h4>
                                                <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
                                                    {order.orderServices?.map(os => (
                                                        <div key={os.id} className="flex justify-between items-center py-1.5 border-b border-gray-200/60 last:border-0">
                                                            <span className="text-xs font-bold text-gray-700">{os.service?.name}</span>
                                                            <span className="text-[10px] font-bold text-gray-500">
                                                                {formatPrice(os.min_total_price, os.max_total_price, os.fixed_price)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                                                <span className="text-sm font-black text-gray-900">Total Price:</span>
                                                <span className="text-lg font-black text-emerald-600">
                                                    {formatPrice(order.min_total_price, order.max_total_price, order.fixed_price)}
                                                </span>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                                        <button 
                                            onClick={() => router.push(`/site-admin/orders/${order.id}`)} 
                                            className="px-5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
                                        >
                                            View Details
                                        </button>
                                        <button 
                                            onClick={() => router.push(`/site-admin/orders/${order.id}/edit`)} 
                                            className="px-5 py-2 text-xs font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-900 shadow-sm transition-all"
                                        >
                                            Edit Order
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Infinite Scroll Trigger */}
                            {pagination.page < pagination.totalPages && (
                                <div ref={loadMoreRef} className="py-6 flex justify-center">
                                    {isFetchingMore ? (
                                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                            Loading more...
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-700 mb-1">No Orders Found</h3>
                            <p className="text-sm text-gray-500">{t("orders.empty") || "There are no orders matching your criteria."}</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}