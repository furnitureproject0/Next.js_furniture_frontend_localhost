"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch } from "@/store/hooks";
import { acceptOffer, rejectOffer, cancelOrder } from "@/store/slices/ordersSlice";
import { useState } from "react";
import { useRouter } from "next/navigation";
import OrderHeader from "./order-card/OrderHeader";
import OrderServices from "./order-card/OrderServices";
import OrderScheduleInfo from "./order-card/OrderScheduleInfo";
import OrderAddresses from "./order-card/OrderAddresses";
import OrderOfferInfo from "./order-card/OrderOfferInfo";
import OrderActions from "./order-card/OrderActions";
import RejectOfferDialog from "./order-card/RejectOfferDialog";
import CancelOrderDialog from "./order-card/CancelOrderDialog";

export default function SiteAdminOrderCard({ order, onAssignCompany }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const router = useRouter();
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");
	const [showCancelDialog, setShowCancelDialog] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	
	const handleViewDetails = () => {
		router.push(`/orders/${order.id}`);
	};

	const handleAcceptOffer = async () => {
		await dispatch(acceptOffer({ orderId: order.id }));
	};

	const handleRejectOffer = () => {
		setShowRejectDialog(true);
	};

	const confirmRejectOffer = async () => {
		await dispatch(rejectOffer({ orderId: order.id, reason: rejectionReason }));
		setShowRejectDialog(false);
		setRejectionReason("");
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
			<div className="group border border-orange-200/60 rounded-xl p-5 hover:shadow-lg hover:border-orange-300/60 transition-all duration-200 bg-white/60 backdrop-blur-sm">
				<OrderHeader order={order} t={t} onCancelOrder={handleCancelOrder} />
				
				<div className="space-y-4 mb-4">
					<OrderServices order={order} t={t} />
					<OrderScheduleInfo order={order} t={t} />
					<OrderAddresses order={order} t={t} />
				</div>



				<OrderActions
					order={order}
					onAssignCompany={onAssignCompany}
					onViewDetails={handleViewDetails}
					onAcceptOffer={handleAcceptOffer}
					onRejectOffer={handleRejectOffer}
					t={t}
				/>
			</div>

			<RejectOfferDialog
				isOpen={showRejectDialog}
				rejectionReason={rejectionReason}
				onReasonChange={setRejectionReason}
				onConfirm={confirmRejectOffer}
				onCancel={() => {
					setShowRejectDialog(false);
					setRejectionReason("");
				}}
				t={t}
			/>

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
