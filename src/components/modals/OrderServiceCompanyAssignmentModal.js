"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { customerApi } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { assignCompanyToOrderService } from "@/store/slices/ordersSlice";
import { getTranslatedServiceTypes, getTranslatedStatusLabel } from "@/utils/i18nUtils";
import { useEffect, useState } from "react";

const CompanyCard = ({ company, onSelect, isSelected, t }) => (
	<div
		className={`border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-200 cursor-pointer ${
			isSelected
				? "border-orange-500 bg-orange-50"
				: "border-orange-200/60 hover:border-orange-300 hover:shadow-lg bg-white"
		}`}
		onClick={() => onSelect(company.id)}
	>
		<div className="flex items-center justify-between gap-2 sm:gap-3">
			<div className="flex-1 min-w-0">
				<h3 className="text-base sm:text-lg font-semibold text-amber-900 truncate">
					{company.name}
				</h3>
				{company.email && (
					<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1 truncate">{company.email}</p>
				)}
				{company.address && (
					<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1 truncate">{company.address}</p>
				)}
			</div>
			{isSelected && (
				<div className="ml-2 sm:ml-4 flex-shrink-0">
					<div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
						<svg
							className="w-3 h-3 sm:w-4 sm:h-4 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
				</div>
			)}
		</div>
	</div>
);

export default function OrderServiceCompanyAssignmentModal({
	isOpen,
	onClose,
	order,
	onAssignComplete,
}) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const TRANSLATED_SERVICE_TYPES = getTranslatedServiceTypes(t);

	const [loadingCompanies, setLoadingCompanies] = useState({});
	const [companies, setCompanies] = useState({}); // { orderServiceId: [companies] }
	const [selectedCompanies, setSelectedCompanies] = useState({}); // { orderServiceId: companyId }
	const [assigning, setAssigning] = useState({}); // { orderServiceId: boolean }
	const [error, setError] = useState(null);

	// Fetch companies for each orderService when modal opens
	useEffect(() => {
		if (!isOpen || !order?.orderServices) return;

		const fetchCompanies = async () => {
			const orderServices = order.orderServices || [];
			// Filter to only pending orderServices
			const pendingOrderServices = orderServices.filter(os => !os.status || os.status === "pending");
			
			if (pendingOrderServices.length === 0) {
				// No pending services, close modal
				onClose();
				return;
			}

			const companiesMap = {};
			const loadingMap = {};

			// Initialize loading state only for pending services
			pendingOrderServices.forEach(os => {
				loadingMap[os.id] = true;
			});
			setLoadingCompanies(loadingMap);

			// Fetch companies for each pending orderService
			await Promise.all(
				pendingOrderServices.map(async (os) => {
					try {
						const response = await customerApi.getOrderServiceCompanies(order.id, os.id);
						const companiesList = response?.data?.companies || [];
						companiesMap[os.id] = companiesList;
					} catch (error) {
						console.error(`Failed to fetch companies for orderService ${os.id}:`, error);
						companiesMap[os.id] = [];
					}
					loadingMap[os.id] = false;
				})
			);

			setCompanies(companiesMap);
			setLoadingCompanies(loadingMap);

			// Pre-select already assigned companies (shouldn't happen for pending, but just in case)
			const selectedMap = {};
			pendingOrderServices.forEach(os => {
				if (os.company_id) {
					selectedMap[os.id] = os.company_id;
				}
			});
			setSelectedCompanies(selectedMap);
		};

		fetchCompanies();
	}, [isOpen, order, onClose]);

	const handleCompanySelect = (orderServiceId, companyId) => {
		setSelectedCompanies(prev => ({
			...prev,
			[orderServiceId]: companyId,
		}));
	};

	const handleAssign = async (orderServiceId) => {
		const companyId = selectedCompanies[orderServiceId];
		if (!companyId) {
			setError(t("modals.companyAssignment.selectCompanyFirst") || "Please select a company first");
			return;
		}

		setAssigning(prev => ({ ...prev, [orderServiceId]: true }));
		setError(null);

		try {
			await dispatch(
				assignCompanyToOrderService({
					orderId: order.id,
					orderServiceId,
					companyId,
				})
			).unwrap();

			if (onAssignComplete) {
				onAssignComplete();
			}
		} catch (error) {
			setError(error.message || t("errors.companyAssignmentFailed") || "Failed to assign company");
		} finally {
			setAssigning(prev => ({ ...prev, [orderServiceId]: false }));
		}
	};

	const getServiceName = (orderService) => {
		// Priority 1: Use serviceName from transformed data (already translated)
		if (orderService.serviceName) {
			return orderService.serviceName;
		}
		// Priority 2: Use service object name from API
		if (orderService.service?.name) {
			return orderService.service.name;
		}
		// Priority 3: Map numeric service IDs to translated service types
		const serviceId = orderService.serviceId || orderService.service?.id || orderService.service_id;
		if (serviceId) {
			// Map numeric service IDs to translated service types
			// API returns: 1=Moving, 2=Cleaning, 3=Painting, 4=Packing
			const serviceIdMap = {
				1: "furniture_moving",
				2: "cleaning_service",
				3: "painting",
				4: "packing",
			};
			const mappedServiceId = serviceIdMap[serviceId];
			if (mappedServiceId) {
				const service = TRANSLATED_SERVICE_TYPES.find((s) => s.id === mappedServiceId);
				if (service?.name) {
					return service.name;
				}
			}
		}
		// Fallback
		return `Service ${serviceId || 'Unknown'}`;
	};

	// Use getTranslatedStatusLabel from i18nUtils instead
	const getStatusLabel = (status) => {
		return getTranslatedStatusLabel(status || "pending", t);
	};

	if (!isOpen || !order) return null;

	// Filter to show only pending orderServices
	const orderServices = (order.orderServices || []).filter(os => !os.status || os.status === "pending");
	
	// If no pending orderServices, don't render
	if (orderServices.length === 0) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
				{/* Header */}
				<div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 border-b border-orange-100/50">
					<div className="flex items-center justify-between gap-3">
						<div className="flex-1 min-w-0 pr-2">
							<h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent truncate">
								{t("modals.companyAssignment.assignCompanyToServices") || "Assign Companies to Services"}
							</h2>
							<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1 truncate">
								{t("modals.companyAssignment.orderId", { id: order?.id }) || `Order #${order?.id}`}
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
					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative mb-3 sm:mb-4" role="alert">
							<span className="block sm:inline text-xs sm:text-sm">{error}</span>
						</div>
					)}

					<div className="space-y-4 sm:space-y-5 lg:space-y-6">
						{orderServices.map((orderService) => {
							// Get service name - prefer serviceName from transformed data
							const serviceName = orderService.serviceName || getServiceName(orderService);
							const serviceCompanies = companies[orderService.id] || [];
							const isLoading = loadingCompanies[orderService.id];
							const selectedCompanyId = selectedCompanies[orderService.id];
							const isAssigning = assigning[orderService.id];
							const isAlreadyAssigned = orderService.company_id && orderService.company;

							return (
								<div key={orderService.id} className="border border-orange-200/60 rounded-lg sm:rounded-xl p-4 sm:p-5">
									{/* Service Header */}
									<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
										<div className="flex-1 min-w-0">
											<h3 className="text-base sm:text-lg font-semibold text-amber-900 truncate">
												{serviceName}
											</h3>
											<div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
												<span className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
													orderService.status === "assigned" 
														? "bg-green-100 text-green-800"
														: orderService.status === "in_progress"
														? "bg-blue-100 text-blue-800"
														: orderService.status === "completed"
														? "bg-purple-100 text-purple-800"
														: "bg-gray-100 text-gray-800"
												}`}>
													{getStatusLabel(orderService.status)}
												</span>
												{isAlreadyAssigned && (
													<span className="text-xs sm:text-sm text-amber-700 truncate">
														{t("modals.companyAssignment.currentlyAssigned") || "Currently assigned to"}: <strong>{orderService.company.name}</strong>
													</span>
												)}
											</div>
										</div>
									</div>

									{/* Companies List */}
									{isLoading ? (
										<div className="flex items-center justify-center py-6 sm:py-8">
											<div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500"></div>
										</div>
									) : serviceCompanies.length === 0 ? (
										<p className="text-xs sm:text-sm text-amber-700/70 py-3 sm:py-4">
											{t("modals.companyAssignment.noCompaniesAvailable") || "No companies available for this service"}
										</p>
									) : (
										<div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
											{serviceCompanies.map((company) => (
												<CompanyCard
													key={company.id}
													company={company}
													onSelect={(companyId) => handleCompanySelect(orderService.id, companyId)}
													isSelected={selectedCompanyId === company.id}
													t={t}
												/>
											))}
										</div>
									)}

									{/* Assign Button */}
									{!isLoading && serviceCompanies.length > 0 && (
										<div className="flex justify-end">
											<button
												onClick={() => handleAssign(orderService.id)}
												disabled={!selectedCompanyId || isAssigning}
												className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
											>
												{isAssigning ? (
													<>
														<div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
														{t("common.buttons.assigning") || "Assigning..."}
													</>
												) : (
													<>
														{t("common.buttons.assign") || "Assign Company"}
													</>
												)}
											</button>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>

				{/* Footer */}
				<div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 border-t border-orange-100/50 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
					<div className="flex justify-end">
						<button
							onClick={onClose}
							className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 border border-orange-200/60 rounded-lg hover:bg-white/80 transition-colors font-medium cursor-pointer"
						>
							{t("common.buttons.close")}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

