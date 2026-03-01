"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";
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
	const [activeOrderId, setActiveOrderId] = useState(null);
	const [activeClient, setActiveClient] = useState(null);
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
				// Handle both formats: data as array directly OR data.orders
				const ordersData = Array.isArray(response?.data) 
					? response.data 
					: (response?.data?.orders || []);
				const paginationData = response?.pagination || response?.meta || { ...pagination, page: pageToFetch };
				
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
				// Search specifically for clients using the requested endpoint for suggestions
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
		setDebouncedSearch(""); // Clear general search when client is selected
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

	// Close suggestions on click outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setShowSuggestions(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Infinite scroll observer
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

	const handleClientClick = (e, orderId, client) => {
		e.stopPropagation();
		if (activeOrderId === orderId) {
			setActiveOrderId(null);
			setActiveClient(null);
		} else {
			setActiveOrderId(orderId);
			setActiveClient(client);
		}
	};

	if (isLoading) {
		return <LoadingSpinner />;
	}

	return (
		<ProtectedRoute requiredRoles={["site-admin", "super-admin"]}>
			<div className="min-h-screen" style={{ background: "#FFFFFF" }}>
				<div className="p-4 sm:p-6 lg:p-8">
				{/* Page Header */}
				<div className="mb-4 sm:mb-6 lg:mb-8">
					<h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
						{t("siteAdmin.orders.title") || "Orders"}
					</h1>
					<p className="text-sm sm:text-base text-slate-600/70">
						{t("siteAdmin.orders.subtitle") || "Manage and track all orders"}
					</p>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-700 text-sm">{error}</p>
					</div>
				)}

				{/* Search Bar & Actions */}
				<div className="mb-8 group relative max-w-2xl" ref={dropdownRef}>
					<div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
					<div className={`relative flex items-center bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden px-4 py-1.5 focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-400/10 transition-all duration-300 ${showSuggestions && searchResults.length > 0 ? 'rounded-b-none border-b-0' : ''}`}>
						<div className="flex items-center justify-center text-slate-400">
							{isSearching ? (
								<div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
							) : (
								<svg className="w-5 h-5 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							)}
						</div>
						<input 
							type="text" 
							placeholder={t("siteAdmin.orders.searchPlaceholder") || "Search by Order ID, Client Name, Email, Status..."}
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
						<div className="absolute top-full left-0 right-0 bg-white border border-slate-200 border-t-0 rounded-b-2xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
							<div className="px-4 py-2 bg-slate-50 border-b border-slate-100 italic text-[10px] text-slate-400 uppercase tracking-widest font-bold">
								Matching Clients
							</div>
							<div className="max-h-60 overflow-y-auto scrollbar-thin">
								{searchResults.map((client) => (
									<button
										key={client.id}
										onClick={() => handleSelectClient(client)}
										className="w-full px-4 py-3 flex flex-col items-start hover:bg-primary-50 transition-colors group border-b border-slate-50 last:border-0"
									>
										<span className="text-sm font-bold text-slate-800 group-hover:text-primary-600 truncate w-full text-left">
											{client.name}
										</span>
										<span className="text-xs text-slate-500 truncate w-full text-left">
											{client.email}
										</span>
									</button>
								))}
							</div>
						</div>
					)}

					{selectedClient && (
						<div className="mt-3 flex items-center gap-2">
							<div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold flex items-center gap-2 border border-primary-200 animate-in fade-in zoom-in duration-300">
								<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
								</svg>
								Filtering for: {selectedClient.name}
								<button onClick={clearFilters} className="hover:text-primary-900 transition-colors ml-1">
									<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Orders Table */}
				<div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
					{orders.length > 0 ? (
						<>
							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<thead className="bg-gray-50 border-b border-gray-200">
										<tr>
											<th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
											<th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
											<th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
											<th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
											<th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Services</th>
											<th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Price</th>
										</tr>
									</thead>
									<tbody>
										{orders.map((order, index) => (
											<Fragment key={order.id}>
												<tr 
													className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100 hover:bg-primary-50/30 transition-colors cursor-pointer group ${activeOrderId === order.id ? 'bg-primary-50/50' : ''}`}
													onClick={() => router.push(`/site-admin/orders/${order.id}`)}
												>
													<td className="px-5 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">#{order.id}</td>
													<td 
														className="px-5 py-4 text-sm text-gray-700"
														onClick={(e) => handleClientClick(e, order.id, order.client)}
													>
														<div className="flex flex-col gap-0.5">
															<div className="font-bold flex items-center gap-2 text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">
																{order.client?.name || "N/A"}
																<div className={`p-1 rounded-md bg-slate-100 group-hover:bg-primary-100 transition-colors ${activeOrderId === order.id ? 'rotate-180 bg-primary-200 text-primary-700' : ''}`}>
																	<svg className="w-3 h-3 text-slate-500 group-hover:text-primary-600 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
																	</svg>
																</div>
															</div>
															<div className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500">{order.client?.email || ""}</div>
														</div>
													</td>
													<td className="px-5 py-4 text-sm whitespace-nowrap">
														<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
															order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
															order.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
															order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
															order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
															'bg-gray-50 text-gray-700 border-gray-100'
														}`}>
															{order.status}
														</span>
													</td>
													<td className="px-5 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
														{order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
													</td>
													<td className="px-5 py-4 text-sm text-slate-600 font-bold whitespace-nowrap">
														{order.orderServices?.length || 0} service(s)
													</td>
													<td className="px-5 py-4 text-sm font-black text-slate-900 whitespace-nowrap">
														CHF {order.total_price || "0.00"}
													</td>
												</tr>
												
												{/* Action Drawer Row */}
												{activeOrderId === order.id && (
													<tr className="bg-slate-900 animate-in slide-in-from-top-4 fade-in duration-300">
														<td colSpan="6" className="p-0 overflow-hidden">
															<div className="relative p-6 flex items-center justify-between gap-8 border-t border-white/5">
																{/* Subtle Background Glows */}
																<div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
																<div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
																
																<div className="relative flex items-center gap-6">
																	<div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-primary-500/20">
																		{activeClient?.name?.charAt(0).toUpperCase()}
																	</div>
																	<div className="flex flex-col pr-8 border-r border-white/10">
																		<span className="text-sm font-black text-white uppercase tracking-widest mb-1">{activeClient?.name}</span>
																		<span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest opacity-80">Quick Dashboard</span>
																	</div>
																</div>

																<div className="flex-1 flex gap-3.5 pr-4">
																	<button 
																		onClick={(e) => {
																			e.stopPropagation();
																			router.push(`/site-admin/create-offer?email=${encodeURIComponent(activeClient?.email)}`);
																		}}
																		className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all duration-300 active:scale-[0.97] group border border-white/10"
																	>
																		<div className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-all duration-300">
																			<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
																			</svg>
																		</div>
																		<span className="text-[10px] font-black uppercase tracking-widest">Create Offer</span>
																	</button>

																	<button 
																		onClick={(e) => {
																			e.stopPropagation();
																			router.push(`/site-admin/create-order?email=${encodeURIComponent(activeClient?.email)}`);
																		}}
																		className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 active:scale-[0.97] group border border-white/10"
																	>
																		<div className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-all duration-300">
																			<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
																			</svg>
																		</div>
																		<span className="text-[10px] font-black uppercase tracking-widest">New Order</span>
																	</button>

																	<button 
																		onClick={(e) => {
																			e.stopPropagation();
																			router.push(`/site-admin/create-appointment?email=${encodeURIComponent(activeClient?.email)}`);
																		}}
																		className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 active:scale-[0.97] group border border-white/10"
																	>
																		<div className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-all duration-300">
																			<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
																			</svg>
																		</div>
																		<span className="text-[10px] font-black uppercase tracking-widest">Appointment</span>
																	</button>

																	<button 
																		onClick={(e) => {
																			e.stopPropagation();
																			router.push(`/site-admin/clients/${activeClient?.id}/history`);
																		}}
																		className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 active:scale-[0.97] group border border-white/5"
																	>
																		<div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
																			<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
																			</svg>
																		</div>
																		<span className="text-[10px] font-black uppercase tracking-widest">Archive</span>
																	</button>
																</div>
															</div>
														</td>
													</tr>
												)}
											</Fragment>
										))}
									</tbody>
								</table>
							</div>

							{/* Infinite Scroll Trigger */}
							{pagination.page < pagination.totalPages && (
								<div ref={loadMoreRef} className="py-8 flex justify-center">
									{isFetchingMore ? (
										<div className="flex items-center gap-2 text-primary-600 text-sm font-medium">
											<div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
											{t("common.loadingMore") || "Loading more..."}
										</div>
									) : null}
								</div>
							)}
						</>
					) : (
						<div className="p-8 text-center">
							<p className="text-gray-500">{t("orders.empty") || "No orders found"}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	</ProtectedRoute>
	);
}
