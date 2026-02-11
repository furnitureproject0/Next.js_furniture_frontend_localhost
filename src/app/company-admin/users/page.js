"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { companyAdminApi, ApiError } from "@/lib/api";
import AddEmployeeModal from "@/components/company-admin/AddEmployeeModal";
import EditEmployeeModal from "@/components/company-admin/EditEmployeeModal";

const StatusBadge = ({ status }) => {
	const statusConfig = {
		active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
		pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
		terminated: { bg: "bg-red-100", text: "text-red-800", label: "Terminated" },
		cancelled: { bg: "bg-gray-100", text: "text-gray-800", label: "Cancelled" }
	};
	
	const config = statusConfig[status] || statusConfig.active;
	
	return (
		<span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
			{config.label}
		</span>
	);
};

const RoleBadge = ({ role }) => {
	const roleConfig = {
		worker: { bg: "bg-blue-100", text: "text-blue-800", label: "Worker" },
		driver: { bg: "bg-purple-100", text: "text-purple-800", label: "Driver" },
		company_secretary: { bg: "bg-orange-100", text: "text-orange-800", label: "Secretary" }
	};
	
	const config = roleConfig[role] || roleConfig.worker;
	
	return (
		<span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
			{config.label}
		</span>
	);
};

export default function CompanyUsersPage() {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const user = useAppSelector(selectUser);
	
	const [employees, setEmployees] = useState([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		totalPages: 0,
		totalItems: 0
	});
	const [filters, setFilters] = useState({
		role: "",
		status: "",
		sort: 1 // 1 = DESC (newest first), 0 = ASC
	});
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedEmployment, setSelectedEmployment] = useState(null);

	// Normalize employment data from API response
	const normalizeEmploymentData = (employments) => {
		return employments.map((employment) => {
			const userData = employment.User || {};
			const phone = userData.phones && userData.phones.length > 0 
				? userData.phones[0].phone 
				: null;
			
			return {
				// Employment data (for API compatibility)
				id: employment.id,
				employmentId: employment.id,
				employeeId: employment.employee_id,
				companyId: employment.company_id,
				hourly_rate: employment.hourly_rate,
				hourlyRate: employment.hourly_rate,
				currency: employment.currency || "CHF",
				start_date: employment.start_date,
				startDate: employment.start_date,
				end_date: employment.end_date,
				endDate: employment.end_date,
				status: employment.status, // active, pending, terminated, cancelled
				
				// User data (nested for EditEmployeeModal)
				employee: {
					id: userData.id,
					name: userData.name,
					email: userData.email,
					role: userData.role,
				},
				
				// User data (flat for display)
				userId: userData.id,
				name: userData.name,
				email: userData.email,
				phone: phone,
				role: userData.role, // worker, driver, company_secretary
				birthdate: userData.birthdate,
				isVerified: userData.is_verified,
				
				// Combined data
				available: employment.status === "active",
				createdAt: employment.createdAt
			};
		});
	};

	// Fetch employees
	const fetchEmployees = async () => {
		if (!user?.company_id) return;
		
		try {
			setLoading(true);
			const params = {
				page: pagination.page,
				limit: pagination.limit,
				sort: filters.sort
			};
			
			// Only add filters if they're not empty/default
			if (filters.role) params.role = filters.role;
			if (filters.status) params.status = filters.status;
			
			const response = await companyAdminApi.getCompanyEmployees(user.company_id, params);
			
			if (response?.success && response?.data?.employments) {
				const normalized = normalizeEmploymentData(response.data.employments);
				setEmployees(normalized);
				
				if (response.pagination) {
					setPagination(prev => ({
						...prev,
						totalPages: response.pagination.totalPages,
						totalItems: response.pagination.totalItems
					}));
				}
			} else {
				setEmployees([]);
			}
		} catch (error) {
			console.error("Failed to fetch employees:", error);
			toast.error(t("common.errors.failedToFetch") || "Failed to fetch employees");
			setEmployees([]);
		} finally {
			setLoading(false);
		}
	};

	// Fetch on mount and when filters/pagination change
	useEffect(() => {
		fetchEmployees();
	}, [user?.company_id, pagination.page, pagination.limit, filters.role, filters.status, filters.sort]);

	// Handle filter change
	const handleFilterChange = (filterType, value) => {
		setFilters(prev => ({ ...prev, [filterType]: value }));
		setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
	};

	// Handle page change
	const handlePageChange = (newPage) => {
		setPagination(prev => ({ ...prev, page: newPage }));
	};

	// Handle modal success
	const handleModalSuccess = () => {
		fetchEmployees(); // Refresh list
		toast.success(t("users.employeeAdded") || "Employee added successfully");
	};

	// Handle edit click
	const handleEditClick = (employee) => {
		setSelectedEmployment(employee);
		setIsEditModalOpen(true);
	};

	// Handle terminate click
	const handleTerminateClick = async (employee) => {
		if (!window.confirm(t("users.terminate.confirmMessage") || "Are you sure you want to terminate this employee? This action cannot be undone.")) {
			return;
		}

		try {
			await companyAdminApi.terminateEmployment(user.company_id, employee.employmentId);
			toast.success(t("users.terminate.success") || "Employee terminated successfully");
			fetchEmployees(); // Refresh list
		} catch (error) {
			console.error("Failed to terminate employment:", error);
			
			if (error instanceof ApiError) {
				toast.error(error.message || t("users.terminate.error"));
			} else {
				toast.error(t("users.terminate.error") || "Failed to terminate employee");
			}
		}
	};

	// Handle cancel click (for pending employments)
	const handleCancelClick = async (employee) => {
		if (!window.confirm(t("users.cancel.confirmMessage") || "Are you sure you want to cancel this employment offer?")) {
			return;
		}

		try {
			await companyAdminApi.cancelEmployment(user.company_id, employee.employmentId);
			toast.success(t("users.cancel.success") || "Employment offer cancelled successfully");
			fetchEmployees(); // Refresh list
		} catch (error) {
			console.error("Failed to cancel employment:", error);
			
			if (error instanceof ApiError) {
				toast.error(error.message || t("users.cancel.error"));
			} else {
				toast.error(t("users.cancel.error") || "Failed to cancel employment");
			}
		}
	};

	// Check if user can manage employees (only company_admin)
	const canManageEmployees = user?.role === "company_admin";

	return (
		<div className="min-h-screen" style={{ background: "#FFF8F3" }}>
			<div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
				{/* Page Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div className="flex-1 min-w-0">
						<h1 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">
							{t("users.title") || "Users"}
						</h1>
						<p className="text-sm sm:text-base text-amber-700/70">
							{t("users.subtitle") || "Manage your company employees"}
						</p>
					</div>
					{canManageEmployees && (
						<button
							onClick={() => setIsAddModalOpen(true)}
							className="w-full sm:w-auto btn-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
						>
							<svg
								className="w-4 h-4 sm:w-5 sm:h-5"
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
							<span className="whitespace-nowrap">{t("users.addEmployee") || "Add Employee"}</span>
						</button>
					)}
				</div>

				{/* Filters */}
				<div className="glass-effect backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6">
					<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
						{/* Role Filter */}
						<div className="flex-1">
							<label className="block text-xs sm:text-sm font-medium text-amber-800 mb-2">
								{t("users.filterByRole") || "Filter by Role"}
							</label>
							<select
								value={filters.role}
								onChange={(e) => handleFilterChange("role", e.target.value)}
								className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-sm"
							>
								<option value="">{t("users.allRoles") || "All Roles"}</option>
								<option value="worker">{t("users.worker") || "Worker"}</option>
								<option value="driver">{t("users.driver") || "Driver"}</option>
								<option value="company_secretary">{t("users.secretary") || "Secretary"}</option>
							</select>
						</div>

						{/* Status Filter */}
						<div className="flex-1">
							<label className="block text-xs sm:text-sm font-medium text-amber-800 mb-2">
								{t("users.filterByStatus") || "Filter by Status"}
							</label>
							<select
								value={filters.status}
								onChange={(e) => handleFilterChange("status", e.target.value)}
								className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-sm"
							>
								<option value="">{t("users.allStatuses") || "All Statuses"}</option>
								<option value="active">{t("users.active") || "Active"}</option>
								<option value="pending">{t("users.pending") || "Pending"}</option>
								<option value="terminated">{t("users.terminated") || "Terminated"}</option>
								<option value="cancelled">{t("users.cancelled") || "Cancelled"}</option>
							</select>
						</div>

						{/* Sort Order */}
						<div className="flex-1">
							<label className="block text-xs sm:text-sm font-medium text-amber-800 mb-2">
								{t("users.sortBy") || "Sort By"}
							</label>
							<select
								value={filters.sort}
								onChange={(e) => handleFilterChange("sort", parseInt(e.target.value))}
								className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-sm"
							>
								<option value={1}>{t("users.newestFirst") || "Newest First"}</option>
								<option value={0}>{t("users.oldestFirst") || "Oldest First"}</option>
							</select>
						</div>
					</div>
				</div>

				{/* Employees List */}
				<div className="glass-effect backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
						</div>
					) : employees.length === 0 ? (
						<div className="text-center py-12">
							<svg
								className="mx-auto h-12 w-12 text-amber-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
								/>
							</svg>
							<h3 className="mt-2 text-sm font-medium text-amber-900">
								{t("users.noEmployees") || "No employees found"}
							</h3>
							<p className="mt-1 text-sm text-amber-700/70">
								{t("users.noEmployeesDescription") || "Get started by adding a new employee"}
							</p>
						</div>
					) : (
						<div className="space-y-3 sm:space-y-4">
							{employees.map((employee) => (
								<div
									key={employee.employmentId}
									onClick={() => canManageEmployees && handleEditClick(employee)}
									className={`border-2 border-orange-200/60 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:border-orange-300 hover:shadow-lg transition-all duration-200 bg-white ${
										canManageEmployees ? "cursor-pointer" : ""
									}`}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex items-start gap-3 flex-1 min-w-0">
											{/* Avatar */}
											<div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
												<span className="text-orange-600 font-bold text-sm sm:text-base">
													{employee.name
														?.split(" ")
														.map((n) => n[0])
														.join("") || "?"}
												</span>
											</div>

											{/* Info */}
											<div className="flex-1 min-w-0">
												<div className="flex items-start flex-wrap gap-2 mb-2">
													<h3 className="text-base sm:text-lg font-semibold text-amber-900 truncate">
														{employee.name || employee.email}
													</h3>
													<RoleBadge role={employee.role} />
													<StatusBadge status={employee.status} />
												</div>
												
												<div className="space-y-1 text-xs sm:text-sm text-amber-700/70">
													<p className="flex items-center gap-2">
														<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
														</svg>
														<span className="truncate">{employee.email}</span>
													</p>
													{employee.phone && (
														<p className="flex items-center gap-2">
															<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
															</svg>
															{employee.phone}
														</p>
													)}
													{(employee.role === "worker" || employee.role === "driver") && employee.hourlyRate && (
														<p className="flex items-center gap-2">
															<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
															</svg>
															{employee.hourlyRate} {employee.currency}/hr
														</p>
													)}
													{employee.startDate && (
														<p className="flex items-center gap-2">
															<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
															</svg>
															{t("users.startDate") || "Start"}: {new Date(employee.startDate).toLocaleDateString()}
														</p>
													)}
												</div>
											</div>
										</div>

										{/* Action Buttons */}
										{canManageEmployees && (
											<div className="flex flex-col gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
												{/* Edit Button - Show for pending and active */}
												{(employee.status === "pending" || employee.status === "active") && (
													<button
														onClick={() => handleEditClick(employee)}
														className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
														title={t("users.edit.button") || "Edit"}
													>
														<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
													</button>
												)}

												{/* Terminate/Cancel Button */}
												{employee.status === "active" && (
													<button
														onClick={() => handleTerminateClick(employee)}
														className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
														title={t("users.terminate.button") || "Terminate"}
													>
														<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
														</svg>
													</button>
												)}

												{employee.status === "pending" && (
													<button
														onClick={() => handleCancelClick(employee)}
														className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
														title={t("users.cancel.button") || "Cancel"}
													>
														<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
														</svg>
													</button>
												)}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}

					{/* Pagination */}
					{!loading && employees.length > 0 && pagination.totalPages > 1 && (
						<div className="flex items-center justify-between gap-3 mt-6 pt-6 border-t border-orange-100">
							<button
								onClick={() => handlePageChange(pagination.page - 1)}
								disabled={pagination.page === 1}
								className="px-3 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{t("common.buttons.previous") || "Previous"}
							</button>
							
							<span className="text-sm text-amber-700">
								{t("users.pageInfo") || "Page"} {pagination.page} {t("users.of") || "of"} {pagination.totalPages}
								{" "}({pagination.totalItems} {t("users.total") || "total"})
							</span>
							
							<button
								onClick={() => handlePageChange(pagination.page + 1)}
								disabled={pagination.page >= pagination.totalPages}
								className="px-3 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{t("common.buttons.next") || "Next"}
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Add Employee Modal */}
			<AddEmployeeModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onSuccess={handleModalSuccess}
			/>

			{/* Edit Employee Modal */}
			<EditEmployeeModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setSelectedEmployment(null);
				}}
				onSuccess={() => {
					fetchEmployees();
					toast.success(t("users.edit.successMessage") || "Employee updated successfully");
				}}
				employment={selectedEmployment}
			/>
		</div>
	);
}
