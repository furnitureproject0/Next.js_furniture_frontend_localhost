"use client";

import NewCompanyAdminOrderModal from "@/components/company-admin/NewCompanyAdminOrderModal";
import OrdersList from "@/components/dashboard/OrdersList";
import StatsCards from "@/components/dashboard/StatsCards";
import PricingModal from "@/components/modals/PricingModal";
import TeamAssignmentModal from "@/components/modals/TeamAssignmentModal";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCompanyOrders, selectDisplayEmployees, selectUser } from "@/store/selectors";
import { createCompanyAdminOrder, fetchCompanyAdminOrders, sendOffer, sendOrderServiceOffer, updateOrder } from "@/store/slices/ordersSlice";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CompanyAdminDashboard() {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const dispatch = useAppDispatch();
	const user = useAppSelector(selectUser);
	const employees = useAppSelector(selectDisplayEmployees);
	const companyOrders = useAppSelector((state) =>
		selectCompanyOrders(user?.company_id)(state),
	);
	
	
	const fetchedCompanyId = useRef(null); // Ref to track which company's orders have been fetched

	// Fetch company admin orders on component mount, after login, or when company_id changes
	useEffect(() => {
		// Also check if user is loaded (not just company_id)
		if (user && user.company_id) {
			// Fetch if we haven't fetched for this company yet, or if company_id changed
			if (user.company_id !== fetchedCompanyId.current) {
				dispatch(fetchCompanyAdminOrders({ company_id: user.company_id }));
				fetchedCompanyId.current = user.company_id; // Store the fetched company ID
			}
		}
	}, [user, user?.company_id, dispatch]);

	const searchParams = useSearchParams();
	
	// Check for openOrder query parameter
	useEffect(() => {
		const orderIdParam = searchParams.get('openOrder');
		if (orderIdParam) {
			const orderId = parseInt(orderIdParam, 10);
			if (orderId && companyOrders.length > 0) {
				// Check if order exists in the list
				const order = companyOrders.find(o => o.id === orderId);
				if (order && openOrderId !== orderId) {
					setOpenOrderId(orderId);
					// Remove query parameter from URL without reload
					window.history.replaceState({}, '', '/company-admin/dashboard');
				}
			}
		} else if (openOrderId !== null) {
			// Clear openOrderId if query parameter is removed
			setOpenOrderId(null);
		}
	}, [searchParams]);
	const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
	const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
	const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
	const [selectedOrderForPricing, setSelectedOrderForPricing] =
		useState(null);
	const [selectedOrderForTeam, setSelectedOrderForTeam] = useState(null);
	const [openOrderId, setOpenOrderId] = useState(null);

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
			// Use sendOrderServiceOffer if orderServiceId is provided
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
				// Refresh orders to get updated offer data
				if (user?.company_id) {
					dispatch(fetchCompanyAdminOrders({ company_id: user.company_id }));
				}
			} catch (error) {
				console.error("Failed to send offer:", error);
				const errorMessage = error?.message || error?.payload?.message || t("common.errors.failedToSendOffer") || "Failed to send offer";
				toast.error(errorMessage);
			}
		} else {
			// Use old sendOffer for backward compatibility
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

		// Create teamMembers array with all team members
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
					teamMembers: teamMembers, // Add the full team members array
				},
			}),
		);
		setIsTeamModalOpen(false);
		setSelectedOrderForTeam(null);
	};

	return (
		<div className="min-h-screen" style={{ background: "#FFF8F3" }}>
			<div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
				{/* Page Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6 lg:mb-8">
					<div className="flex-1 min-w-0">
						<h1 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">
							{t("dashboards.companyAdmin.title")}
						</h1>
						<p className="text-sm sm:text-base text-amber-700/70">
							{t("dashboards.companyAdmin.subtitle")}
						</p>
					</div>
					<button
						onClick={() => setIsNewOrderModalOpen(true)}
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
						<span className="whitespace-nowrap">{t("orders.newOrder")}</span>
					</button>
				</div>

				{/* Stats Cards */}
				<StatsCards />

				{/* Orders List */}
				<OrdersList
					onSetPrice={handleSetPrice}
					onAssignTeam={handleAssignTeam}
					openOrderId={openOrderId}
					onOrderModalClose={() => {
						setOpenOrderId(null);
					}}
				/>
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
					// Refresh orders list after creating a new order
					if (user?.company_id) {
						dispatch(fetchCompanyAdminOrders({ company_id: user.company_id }));
					}
				}}
				onOrderCreated={(orderData) => {
					// Order is already created by the modal, just refresh the list
					// No need to call createCompanyAdminOrder again - it's already done!
					if (user?.company_id) {
						dispatch(fetchCompanyAdminOrders({ company_id: user.company_id }));
					}
				}}
			/>
		</div>
	);
}
