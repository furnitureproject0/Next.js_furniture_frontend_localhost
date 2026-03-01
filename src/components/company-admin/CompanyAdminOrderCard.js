"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch } from "@/store/hooks";
import { cancelOrder } from "@/store/slices/ordersSlice";
import { useState } from "react";
import { useRouter } from "next/navigation";
import OrderHeader from "@/components/site-admin/order-card/OrderHeader";
import OrderServices from "@/components/site-admin/order-card/OrderServices";
import OrderScheduleInfo from "@/components/site-admin/order-card/OrderScheduleInfo";
import OrderAddresses from "@/components/site-admin/order-card/OrderAddresses";
import OrderOfferInfo from "@/components/site-admin/order-card/OrderOfferInfo";
import OrderActions from "@/components/site-admin/order-card/OrderActions";
import CancelOrderDialog from "@/components/site-admin/order-card/CancelOrderDialog";

export default function CompanyAdminOrderCard({ order, onAssignCompany }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const router = useRouter();
	const [showCancelDialog, setShowCancelDialog] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	
	const handleViewDetails = () => {
		router.push(`/company-admin/orders/${order.id}`);
	};

	const handleCancelOrder = () => {
		setShowCancelDialog(true);
	};

	const confirmCancelOrder = async () => {
		await dispatch(cancelOrder({ orderId: order.id, reason: cancelReason }));
		setShowCancelDialog(false);
		setCancelReason("");
	};

	return (
		<>
			<div className="group border border-primary-200/60 rounded-xl p-5 hover:shadow-lg hover:border-primary-300/60 transition-all duration-200 bg-white/60 backdrop-blur-sm">
				<OrderHeader order={order} t={t} onCancelOrder={handleCancelOrder} />
				
				<div className="space-y-4 mb-4">
					<OrderServices order={order} t={t} />
					<OrderScheduleInfo order={order} t={t} />
					<OrderAddresses order={order} t={t} />
				</div>

				<div className="flex items-center gap-2 pt-3 border-t border-primary-100/50">
					<button
						onClick={handleViewDetails}
						className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
						{t("common.buttons.viewDetails") || "View Details"}
					</button>
				</div>
			</div>

			<CancelOrderDialog
				isOpen={showCancelDialog}
				reason={cancelReason}
				onReasonChange={setCancelReason}
				onConfirm={confirmCancelOrder}
				onCancel={() => {
					setShowCancelDialog(false);
					setCancelReason("");
				}}
				t={t}
			/>
		</>
	);
}
