"use client";

import { useGlobalToast } from "@/hooks/useGlobalToast";
import { useTranslation } from "@/hooks/useTranslation";
import { companyAdminApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const EmployeeCard = ({ 
	employee, 
	isAssigned, 
	assignment, 
	isLeader, 
	onAssign,
	onCancel,
	onMakeLeader,
	isAssigning,
	t 
}) => {
	const isAssignedToOffer = isAssigned;
	const employeeRole = employee.role || assignment?.employee?.role || "worker";
	const isDriver = employeeRole === "driver" || employeeRole === "Driver";
	
	return (
		<div
			className={`border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-200 ${
				employee.available !== false
					? isAssignedToOffer
						? "border-orange-400 bg-orange-50/60 shadow-md"
						: "border-orange-200/60 hover:border-orange-300 hover:shadow-lg bg-white"
					: "border-gray-200 bg-gray-50 opacity-60"
			}`}
		>
			<div className="flex items-center justify-between gap-2 sm:gap-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
						<div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
							<span className="text-orange-600 font-bold text-xs sm:text-sm">
								{employee.name
									?.split(" ")
									.map((n) => n[0])
									.join("") || "?"}
							</span>
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
								<h3 className="text-base sm:text-lg font-semibold text-amber-900 truncate">
									{employee.name || employee.email || "Unknown"}
								</h3>
								{isLeader && (
									<span className="px-1.5 sm:px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
										{t("modals.teamAssignment.teamLeader") || "Team Leader"}
									</span>
								)}
								{isAssignedToOffer && !isLeader && (
									<span className="px-1.5 sm:px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
										{t("modals.assignEmployees.assigned") || "Assigned"}
									</span>
								)}
							</div>
							<div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
								<span
									className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${
										isDriver
											? "bg-blue-100 text-blue-800"
											: "bg-green-100 text-green-800"
									}`}
								>
									{isDriver
										? t("modals.teamAssignment.driver") || "Driver"
										: t("modals.teamAssignment.worker") || "Worker"}
								</span>
								{employee.phone && (
									<span className="text-xs text-amber-700/70 truncate">
										{employee.phone}
									</span>
								)}
							</div>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
					{isAssignedToOffer ? (
						<>
							{!isLeader && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										const employeeId = employee.employee_id || employee.id;
										onMakeLeader(employeeId);
									}}
									disabled={isAssigning}
									className="px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
								>
									{t("modals.assignEmployees.makeLeader") || "Make Leader"}
								</button>
							)}
							<button
								onClick={(e) => {
									e.stopPropagation();
									onCancel(assignment.id);
								}}
								disabled={isAssigning}
								className="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
							>
								{t("common.buttons.cancel") || "Cancel"}
							</button>
						</>
					) : (
						<button
							onClick={(e) => {
								e.stopPropagation();
								onAssign(employee);
							}}
							disabled={isAssigning || employee.available === false}
							className="px-2 sm:px-3 py-1 sm:py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
						>
							{t("common.buttons.assign") || "Assign"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default function AssignEmployeesModal({
	isOpen,
	onClose,
	offer,
	companyId,
}) {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const [employees, setEmployees] = useState([]);
	const [assignments, setAssignments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [assigningEmployee, setAssigningEmployee] = useState(null);
	const [isAssigning, setIsAssigning] = useState(false);
	const [roleFilter, setRoleFilter] = useState("all"); // "all", "driver", "worker"

	useEffect(() => {
		if (isOpen && companyId && offer?.id) {
			fetchEmployees();
			fetchAssignments();
		}
	}, [isOpen, companyId, offer?.id]);

	const fetchEmployees = async () => {
		try {
			setLoading(true);
			const response = await companyAdminApi.getCompanyEmployees(companyId);
			
			// Handle different response structures
			let employeesData = [];
			
			if (response?.data?.employments && Array.isArray(response.data.employments)) {
				// Response structure: { success: true, data: { employments: [...] } }
				// Each employment has a User object
				employeesData = response.data.employments.map((employment) => {
					const user = employment.User || {};
					// Extract phone from phones array if available
					const phone = user.phones && user.phones.length > 0 
						? user.phones[0].phone 
						: user.phone;
					
					// Ensure employee_id exists
					if (!employment.employee_id) {
						console.warn("Employment missing employee_id:", employment);
					}
					
					const employeeId = employment.employee_id;
					if (!employeeId) {
						console.error("Cannot process employment without employee_id:", employment);
					}
					
					return {
						// Use employee_id as the primary ID for API calls
						id: employeeId, // This is the key field for assignments
						employee_id: employeeId, // Explicitly set for API calls
						user_id: user.id, // Keep user.id for reference
						name: user.name,
						email: user.email,
						phone: phone,
						role: user.role || employment.role || "worker",
						hourly_rate: employment.hourly_rate,
						currency: employment.currency,
						status: employment.status || user.status,
						available: employment.status !== "inactive" && user.status !== "inactive",
						// Include other user properties but don't override critical fields
						...Object.fromEntries(
							Object.entries(user).filter(([key]) => 
								!['id', 'phone', 'phones'].includes(key)
							)
						),
					};
				}).filter(emp => emp.employee_id); // Filter out any employees without employee_id
			} else if (response?.data && Array.isArray(response.data)) {
				// Direct array in data
				employeesData = response.data;
			} else if (Array.isArray(response)) {
				// Direct array response
				employeesData = response;
			}
			
			setEmployees(employeesData);
		} catch (error) {
			console.error("Failed to fetch employees:", error);
			toast.error(t("common.errors.failedToFetch") || "Failed to fetch employees");
			setEmployees([]);
		} finally {
			setLoading(false);
		}
	};

	const fetchAssignments = async () => {
		if (!offer?.id) return;
		try {
			const response = await companyAdminApi.getOfferAssignments(offer.id);
			// Response structure: { success: true, data: { assignments: [...] } }
			const assignmentsData = response?.data?.assignments || response?.data || response || [];
			setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
		} catch (error) {
			console.error("Failed to fetch assignments:", error);
			toast.error(t("common.errors.failedToFetch") || "Failed to fetch assignments");
		}
	};

	const handleAssignEmployee = async (employee) => {
		if (!offer?.id) return;
		try {
			// Use employee_id from employment, not user.id
			const employeeId = employee.employee_id || employee.id;
			if (!employeeId) {
				console.error("Employee ID is missing:", employee);
				toast.error(t("common.errors.invalidEmployee") || "Invalid employee data");
				return;
			}
			
			
			setAssigningEmployee(employeeId);
			setIsAssigning(true);
			// Backend expects only 'employeeId' according to API spec: POST /offers/1/assignments { employeeId: 5 }
			const response = await companyAdminApi.assignEmployeeToOffer(offer.id, {
				employeeId: employeeId,
			});
			const message = response?.message || t("notifications.employeeAssigned") || "Employee assigned successfully";
			toast.success(message);
			await fetchAssignments();
		} catch (error) {
			console.error("Failed to assign employee:", error);
			const errorMessage = error?.data?.message || error?.message || t("common.errors.failedToAssign") || "Failed to assign employee";
			toast.error(errorMessage);
		} finally {
			setAssigningEmployee(null);
			setIsAssigning(false);
		}
	};

	const handleCancelAssignment = async (assignmentId) => {
		if (!offer?.id) return;
		try {
			const response = await companyAdminApi.cancelAssignment(offer.id, assignmentId);
			const message = response?.message || t("notifications.assignmentCancelled") || "Assignment cancelled successfully";
			toast.success(message);
			await fetchAssignments();
		} catch (error) {
			console.error("Failed to cancel assignment:", error);
			const errorMessage = error?.data?.message || error?.message || t("common.errors.failedToUnassign") || "Failed to cancel assignment";
			toast.error(errorMessage);
		}
	};

	const handleMakeLeader = async (employeeId) => {
		if (!offer?.id || !employeeId) return;
		try {
			setAssigningEmployee(employeeId);
			setIsAssigning(true);
			const response = await companyAdminApi.makeEmployeeLeader(offer.id, employeeId);
			const message = response?.message || t("notifications.leaderAssigned") || "Employee set as leader successfully";
			toast.success(message);
			await fetchAssignments();
		} catch (error) {
			console.error("Failed to make leader:", error);
			const errorMessage = error?.data?.message || error?.message || t("common.errors.failedToMakeLeader") || "Failed to make leader";
			toast.error(errorMessage);
		} finally {
			setAssigningEmployee(null);
			setIsAssigning(false);
		}
	};

	const getAssignmentForEmployee = (employee) => {
		const employeeId = employee.employee_id || employee.id;
		if (!employeeId) return null;
		
		// Match by assignment.employee_id or assignment.employee.id
		return assignments.find(a => {
			const assignmentEmployeeId = a.employee_id || a.employee?.id;
			return assignmentEmployeeId === employeeId;
		});
	};

	const isLeader = (employee) => {
		const assignment = getAssignmentForEmployee(employee);
		return assignment?.is_leader === true;
	};

	const isAssigned = (employee) => {
		const employeeId = employee.employee_id || employee.id;
		if (!employeeId) return false;
		
		// Check if employee is in assignments (excluding cancelled status)
		return assignments.some(a => {
			const assignmentEmployeeId = a.employee_id || a.employee?.id;
			return assignmentEmployeeId === employeeId && a.status !== "cancelled";
		});
	};

	// Filter employees by role
	const getFilteredEmployees = () => {
		if (roleFilter === "all") {
			return employees;
		}
		
		return employees.filter(employee => {
			const employeeRole = employee.role || "worker";
			const isDriver = employeeRole === "driver" || employeeRole === "Driver";
			
			if (roleFilter === "driver") {
				return isDriver;
			} else if (roleFilter === "worker") {
				return !isDriver;
			}
			
			return true;
		});
	};

	const filteredEmployees = getFilteredEmployees();

	if (!isOpen || typeof window === 'undefined') return null;

	const modalContent = (
		<div className="fixed inset-0 z-[10000] flex items-center justify-center" style={{ zIndex: 10000 }}>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col">
				{/* Header */}
				<div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 border-b border-orange-100/50 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
					<div className="flex items-center justify-between gap-3">
						<div className="flex-1 min-w-0">
							<h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent truncate">
								{t("modals.assignEmployees.title") || "Assign Employees"}
							</h2>
							<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1 truncate">
								{t("modals.assignEmployees.description") || "Assign employees to this offer"}
							</p>
						</div>
						<button
							onClick={onClose}
							className="p-1.5 sm:p-2 text-amber-600/60 hover:text-amber-700 hover:bg-orange-50/60 rounded-lg transition-colors flex-shrink-0"
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
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto">
					{loading ? (
						<div className="flex items-center justify-center py-8 sm:py-12">
							<div className="text-sm sm:text-base text-amber-600">{t("common.labels.loading") || "Loading..."}</div>
						</div>
					) : (
						<>
							{/* Filter Buttons */}
							{employees.length > 0 && (
								<div className="mb-4 sm:mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
									<span className="text-xs sm:text-sm font-medium text-amber-700/70">
										{t("modals.assignEmployees.filterBy") || "Filter by role:"}
									</span>
									<div className="flex items-center gap-2">
										<button
											onClick={() => setRoleFilter("all")}
											className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
												roleFilter === "all"
													? "bg-orange-500 text-white shadow-md"
													: "bg-white text-amber-700 border border-orange-200 hover:bg-orange-50"
											}`}
										>
											{t("modals.assignEmployees.all") || "All"}
										</button>
										<button
											onClick={() => setRoleFilter("driver")}
											className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
												roleFilter === "driver"
													? "bg-blue-500 text-white shadow-md"
													: "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
											}`}
										>
											{t("modals.teamAssignment.driver") || "Driver"}
										</button>
										<button
											onClick={() => setRoleFilter("worker")}
											className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
												roleFilter === "worker"
													? "bg-green-500 text-white shadow-md"
													: "bg-white text-green-700 border border-green-200 hover:bg-green-50"
											}`}
										>
											{t("modals.teamAssignment.worker") || "Worker"}
										</button>
									</div>
								</div>
							)}
							
							<div className="space-y-2 sm:space-y-3">
								{filteredEmployees.length === 0 ? (
									<div className="text-center py-8 sm:py-12 text-xs sm:text-sm text-amber-700/70">
										{roleFilter === "all"
											? t("modals.assignEmployees.noEmployees") || "No employees available"
											: t("modals.assignEmployees.noEmployeesForRole") || `No ${roleFilter === "driver" ? "drivers" : "workers"} available`}
									</div>
								) : (
									filteredEmployees.map((employee) => {
									const assignment = getAssignmentForEmployee(employee);
									const assigned = isAssigned(employee);
									const leader = isLeader(employee);
									const employeeId = employee.employee_id || employee.id;
									const isCurrentlyAssigning = assigningEmployee === employeeId;
									
									return (
										<EmployeeCard
											key={employeeId}
											employee={employee}
											isAssigned={assigned}
											assignment={assignment}
											isLeader={leader}
											onAssign={handleAssignEmployee}
											onCancel={handleCancelAssignment}
											onMakeLeader={handleMakeLeader}
											isAssigning={isCurrentlyAssigning || isAssigning}
											t={t}
										/>
									);
								})
								)}
							</div>
						</>
					)}
				</div>

				{/* Footer */}
				<div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 border-t border-orange-100/50 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
						<button
							onClick={onClose}
							className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm btn-primary text-white font-medium rounded-lg transition-colors cursor-pointer hover:shadow-lg"
						>
							{t("common.buttons.close") || "Close"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
}

