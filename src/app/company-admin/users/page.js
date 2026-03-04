"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { companyAdminApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CompanyAdminUsersPage() {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const router = useRouter();
	const user = useAppSelector(selectUser);

	const [clients, setClients] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchTerm);
		}, 400);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Fetch clients
	const fetchClients = useCallback(async (search = "") => {
		setIsLoading(true);
		try {
			const params = { limit: 100 };
			if (search.trim()) {
				params.search = search.trim();
			}
			const response = await companyAdminApi.searchClient(params);
			if (response?.success && response?.data) {
				const clientList = response.data.clients || response.data || [];
				setClients(Array.isArray(clientList) ? clientList : []);
			} else {
				setClients([]);
			}
		} catch (error) {
			console.error("Error fetching clients:", error);
			toast.error("Failed to fetch clients");
			setClients([]);
		} finally {
			setIsLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		fetchClients(debouncedSearch);
	}, [debouncedSearch, fetchClients]);

	const handleCreateOffer = (client) => {
		router.push(`/company-admin/create-offer?email=${encodeURIComponent(client.email)}`);
	};

	const handleCreateAppointment = (client) => {
		router.push(`/company-admin/create-appointment?email=${encodeURIComponent(client.email)}`);
	};

	if (isLoading && clients.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 border-b-2 border-primary-500"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
								{t("companyAdmin.clients") || "Our Clients"}
							</h1>
							<p className="text-gray-600 mt-1">
								{t("companyAdmin.clientsDescription") || "Manage your company's clients"}
							</p>
						</div>
					</div>
				</div>

				{/* Search Bar */}
				<div className="mb-6">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<input
								type="text"
								placeholder={t("companyAdmin.searchClients") || "Search clients by name, email, or phone..."}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
							/>
						</div>
						<button
							onClick={() => fetchClients(debouncedSearch)}
							className="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							{t("common.refresh") || "Refresh"}
						</button>
					</div>
				</div>

				{/* Clients List */}
				<div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
					{clients.length === 0 ? (
						<div className="p-8 text-center">
							<svg
								className="w-16 h-16 text-gray-400 mx-auto mb-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a3 3 0 003-3v-2a3 3 0 00-3-3H3a3 3 0 00-3 3v2a3 3 0 003 3h3z"
								/>
							</svg>
							<h3 className="text-lg font-semibold text-gray-900 mb-1">
								{t("companyAdmin.noClientsFound") || "No clients found"}
							</h3>
							<p className="text-gray-600 mb-4">
								{searchTerm 
									? (t("companyAdmin.tryAdjustingSearch") || "Try adjusting your search criteria")
									: (t("companyAdmin.noClientsYet") || "No clients have been added yet")
								}
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 border-b border-gray-200">
									<tr>
										<th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
											{t("common.labels.name") || "Name"}
										</th>
										<th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
											{t("common.labels.email") || "Email"}
										</th>
										<th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
											{t("common.labels.phone") || "Phone"}
										</th>
										<th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
											{t("common.labels.actions") || "Actions"}
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{clients.map((client) => (
										<tr key={client.id} className="hover:bg-gray-50 transition-colors">
											<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
														<span className="text-sm font-semibold text-primary-700">
															{client.name?.charAt(0).toUpperCase() || 'C'}
														</span>
													</div>
													<div className="text-sm font-medium text-gray-900">
														{client.name || "Unknown"}
													</div>
												</div>
											</td>
											<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
												<span className="text-sm text-gray-600">
													{client.email || "-"}
												</span>
											</td>
											<td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
												<span className="text-sm text-gray-600">
													{client.phone || client.phones?.[0]?.phone || "-"}
												</span>
											</td>
											<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
												<div className="flex items-center justify-end gap-2">
													<button
														onClick={() => handleCreateOffer(client)}
														className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
													>
														<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
														</svg>
														{t("companyAdmin.createOffer") || "Offer"}
													</button>
													<button
														onClick={() => handleCreateAppointment(client)}
														className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
													>
														<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
														</svg>
														{t("companyAdmin.createAppointment") || "Appt"}
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Stats */}
				{clients.length > 0 && (
					<div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
						<div className="bg-white rounded-lg p-4 sm:p-6 text-center">
							<div className="text-2xl sm:text-3xl font-bold text-primary-600">
								{clients.length}
							</div>
							<div className="text-xs sm:text-sm text-gray-600 mt-1">
								{t("companyAdmin.totalClients") || "Total Clients"}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
