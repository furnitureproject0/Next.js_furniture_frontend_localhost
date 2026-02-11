"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectAllOrders } from "@/store/selectors";
import { useTranslation } from "@/hooks/useTranslation";
import OrderDetailsView from "@/components/orders/OrderDetailsView";
import OrderPrintView from "@/components/orders/OrderPrintView";

export default function OrderDetailsPage() {
	const { t } = useTranslation();
	const params = useParams();
	const router = useRouter();
	const orderId = parseInt(params.orderId);
	const allOrders = useAppSelector(selectAllOrders);
	const [isPrintMode, setIsPrintMode] = useState(false);
	
	const order = allOrders.find(o => o.id === orderId);

	useEffect(() => {
		const handleBeforePrint = () => setIsPrintMode(true);
		const handleAfterPrint = () => setIsPrintMode(false);

		window.addEventListener("beforeprint", handleBeforePrint);
		window.addEventListener("afterprint", handleAfterPrint);

		return () => {
			window.removeEventListener("beforeprint", handleBeforePrint);
			window.removeEventListener("afterprint", handleAfterPrint);
		};
	}, []);

	const handlePrint = () => {
		window.print();
	};

	if (!order) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ background: "#FFF8F3" }}>
				<div className="text-center">
					<h2 className="text-2xl font-bold text-amber-900 mb-4">
						{t("order.orderNotFound") || "Order Not Found"}
					</h2>
					<button
						onClick={() => router.back()}
						className="btn-primary px-6 py-3 rounded-lg cursor-pointer"
					>
						{t("common.buttons.back") || "Back"}
					</button>
				</div>
			</div>
		);
	}

	return (
		<>
			<OrderDetailsView 
				order={order} 
				onPrint={handlePrint} 
				onBack={() => router.back()}
				isPrintMode={isPrintMode}
			/>
			<OrderPrintView order={order} />
		</>
	);
}
