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

	const getStatusColor = (status) => {
		switch (status?.toLowerCase()) {
			case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "assigned": return "bg-blue-100 text-blue-800 border-blue-200";
			case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
			case "in_progress": return "bg-purple-100 text-purple-800 border-purple-200";
			case "completed": return "bg-green-100 text-green-800 border-green-200";
			case "cancelled": return "bg-red-100 text-red-800 border-red-200";
			default: return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const formatPrice = (min, max, fixed) => {
		const minP = parseFloat(min) || 0;
		const maxP = parseFloat(max) || 0;
		const fixedP = parseFloat(fixed) || 0;
		
		if (fixedP > 0) return `${fixedP.toFixed(2)} CHF`;
		if (minP > 0 || maxP > 0) return `${minP.toFixed(2)} - ${maxP.toFixed(2)} CHF`;
		return "TBD";
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

				<OrderActions
					order={order}
					onViewDetails={handleViewDetails}
					t={t}
				/>
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
