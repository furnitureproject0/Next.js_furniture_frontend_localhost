"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectUser, selectCompanyOrders } from "@/store/selectors";
import { useEffect, useState } from "react";
import OrderDetailsView from "@/components/orders/OrderDetailsView";
import { useTranslation } from "@/hooks/useTranslation";
import { fetchCompanyAdminOrders, updateOrder } from "@/store/slices/ordersSlice";
import { siteAdminApi, companyAdminApi } from "@/lib/api";
import { useGlobalToast } from "@/hooks/useGlobalToast";

export default function CompanyAdminOrderDetailsPage() {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const params = useParams();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const user = useAppSelector(selectUser);
	const companyOrders = useAppSelector((state) =>
		user?.company_id ? selectCompanyOrders(user.company_id)(state) : [],
	);
	const [singleOrder, setSingleOrder] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isConverting, setIsConverting] = useState(false);

	const orderId = parseInt(params.orderId, 10);
	const storeOrder = companyOrders.find((o) => o.id === orderId);
	const order = storeOrder || singleOrder;

	useEffect(() => {
		const loadOrder = async () => {
			if (storeOrder) {
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			try {
				// Try fetching single order from API directly
				const response = await siteAdminApi.getOrder(orderId);
				if (response?.success) {
					setSingleOrder(response.data.order);
				} else {
					// Fallback to fetching all company orders
					if (user?.company_id) {
						await dispatch(fetchCompanyAdminOrders({ company_id: user.company_id })).unwrap();
					}
				}
			} catch (error) {
				console.error("Failed to load order:", error);
			} finally {
				setIsLoading(false);
			}
		};

		if (orderId) loadOrder();
	}, [orderId, storeOrder, dispatch, user?.company_id]);

	const handleBack = () => {
		router.back();
	};

	const handlePrint = () => {
		window.print();
	};

	const handleConvertToOrder = async () => {
		if (!orderId) return;
		
		setIsConverting(true);
		try {
			const response = await companyAdminApi.convertToOrder(orderId);
			if (response && response.success) {
				dispatch(updateOrder({
					id: orderId,
					updates: {
						order_type: "order",
						status: "pending"
					}
				}));
				toast.success("Offer converted to Order successfully!");
				if (singleOrder) {
					setSingleOrder({
						...singleOrder,
						order_type: "order",
						status: "pending"
					});
				}
				router.refresh();
			} else {
				throw new Error(response?.message || "Failed to convert");
			}
		} catch (err) {
			console.error("Convert error:", err);
			toast.error(err.message || "Failed to convert to order");
		} finally {
			setIsConverting(false);
		}
	};

	// Expose conversion to window for OrderDetailsView to pick up
	useEffect(() => {
		if (typeof window !== 'undefined') {
			window.onConvertToOrder = handleConvertToOrder;
		}
		return () => {
			if (typeof window !== 'undefined') {
				delete window.onConvertToOrder;
			}
		};
	}, [orderId, order]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
					<p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Order Details</p>
				</div>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
				<div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8 border border-slate-100 relative">
					<div className="absolute inset-0 bg-primary-50 rounded-3xl animate-ping opacity-20"></div>
					<svg className="w-12 h-12 text-primary-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
					{t("siteAdmin.orders.notFoundTitle") || "Order Not Found"}
				</h1>
				<p className="text-slate-500 max-w-sm mb-10 leading-relaxed font-medium">
					{t("siteAdmin.orders.notFoundDesc") || `We couldn't find order #${orderId} in our records. It may have been permanently deleted or you might have used an incorrect link.`}
				</p>
				<button
					onClick={handleBack}
					className="group flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200/60 hover:shadow-primary-100 hover:bg-slate-50 transition-all border border-slate-100"
				>
					<svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					{t("common.buttons.backToOrders") || "Back to Orders"}
				</button>
			</div>
		);
	}

	return (
		<OrderDetailsView
			order={order}
			onBack={handleBack}
			onPrint={handlePrint}
			isAdmin={true}
		/>
	);
}
