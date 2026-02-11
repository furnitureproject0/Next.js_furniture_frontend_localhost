"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import CustomerOrdersList from "@/components/customer/CustomerOrdersList";
import CustomerStatsCards from "@/components/customer/CustomerStatsCards";
import NewCustomerOrderModal from "@/components/customer/NewCustomerOrderModal";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAllOrders, selectUser } from "@/store/selectors";
import { fetchCustomerOrders } from "@/store/slices/ordersSlice";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function CustomerDashboard() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const searchParams = useSearchParams();
	const { isLoading, isAuthorized } = useRoleRedirect("client");
	const user = useAppSelector(selectUser);
	// Use selectAllOrders since fetchCustomerOrders already returns only this client's orders from API
	const customerOrders = useAppSelector(selectAllOrders);
	const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
	const [openOrderId, setOpenOrderId] = useState(null);
	const fetchedUserIdRef = useRef(null);

	// Fetch customer orders on component mount (only once per user)
	useEffect(() => {
		// Only fetch if we have a user ID and haven't fetched for this user yet
		if (user?.id && fetchedUserIdRef.current !== user.id) {
			fetchedUserIdRef.current = user.id;
			dispatch(fetchCustomerOrders({ client_id: user.id }));
		}
	}, [user?.id, dispatch]);

	// Check for openOrder query parameter
	useEffect(() => {
		const orderIdParam = searchParams.get('openOrder');
		if (orderIdParam) {
			const orderId = parseInt(orderIdParam, 10);
			if (orderId && customerOrders.length > 0) {
				// Check if order exists in the list
				const order = customerOrders.find(o => o.id === orderId);
				if (order && openOrderId !== orderId) {
					setOpenOrderId(orderId);
					// Remove query parameter from URL without reload
					window.history.replaceState({}, '', '/client/dashboard');
				}
			}
		} else if (openOrderId !== null) {
			// Clear openOrderId if query parameter is removed
			setOpenOrderId(null);
		}
	}, [searchParams]);

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (!isAuthorized) {
		return null;
	}

	const handleOrderCreated = (orderData) => {
		// Order is already created via Redux thunk in the modal
		// This callback is just for any additional handling if needed
	};

	return (
		<div className="min-h-screen" style={{ background: "#FFF8F3" }}>
			<div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
				{/* Page Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6 lg:mb-8">
					<div className="flex-1 min-w-0">
						<h1 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">
							{t("dashboards.customer.title")}
						</h1>
						<p className="text-sm sm:text-base text-amber-700/70">
							{t("dashboards.customer.subtitle")}
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
				<CustomerStatsCards orders={customerOrders} />

				{/* Orders List */}
				<CustomerOrdersList 
					orders={customerOrders}
					customerId={user?.id}
					openOrderId={openOrderId}
					onOrderModalClose={() => setOpenOrderId(null)}
				/>
			</div>

			{/* New Order Modal */}
			<NewCustomerOrderModal
				isOpen={isNewOrderModalOpen}
				onClose={() => setIsNewOrderModalOpen(false)}
				onOrderCreated={handleOrderCreated}
			/>
		</div>
	);
}

