"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedStatusLabel } from "@/utils/i18nUtils";

const OrderCard = ({ order, onViewOrder, t }) => {
	const getStatusColor = (status) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "assigned":
			case "scheduled":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "in-progress":
				return "bg-orange-100 text-orange-800 border-orange-200";
			case "completed":
				return "bg-green-100 text-green-800 border-green-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	return (
		<div
			className="bg-white border border-orange-200/40 rounded-xl p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow cursor-pointer"
			onClick={() => onViewOrder(order)}
		>
			<div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
				<div className="flex-1 min-w-0">
					<h3 className="text-base sm:text-lg font-semibold text-amber-900 mb-1.5 sm:mb-2 truncate">
						{t("driver.orderList.orderNumber", { id: order.id })}
					</h3>
					<span
						className={`inline-block px-2.5 sm:px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
							order.status,
						)}`}
					>
						{getTranslatedStatusLabel(order.status, t)}
					</span>
				</div>
			</div>

			<div className="space-y-2 mb-3 sm:mb-4">
				<div className="flex items-center gap-2 text-xs sm:text-sm text-amber-700">
					<svg
						className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					<span className="truncate">{t("driver.orderList.client")}: {order.customer || t("driver.orderList.notAssigned")}</span>
				</div>

				{order.address && (
					<div className="flex items-center gap-2 text-xs sm:text-sm text-amber-700">
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
						</svg>
						<span className="truncate">{order.address}</span>
					</div>
				)}

				{order.date && (
					<div className="flex items-center gap-2 text-xs sm:text-sm text-amber-700">
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						<span>{order.date}</span>
					</div>
				)}
			</div>

			<div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-orange-100 flex justify-end">
				<button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-orange-600 hover:to-amber-700 transition-all">
					{t("common.buttons.viewDetails")}
				</button>
			</div>
		</div>
	);
};

export default function DriverOrdersList({ orders, onViewOrder }) {
	const { t } = useTranslation();
	if (orders.length === 0) {
		return (
			<div className="bg-white border border-orange-200/40 rounded-xl p-8 sm:p-12 text-center">
				<div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
					<svg
						className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
						/>
					</svg>
				</div>
				<h3 className="text-lg sm:text-xl font-semibold text-amber-900 mb-1 sm:mb-2">
					{t("driver.orderList.noOrdersAssigned")}
				</h3>
				<p className="text-sm sm:text-base text-amber-700/70">
					{t("driver.orderList.newOrdersWillAppear")}
					<br />
					{t("driver.orderList.checkBackLater")}
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
			{orders.map((order) => (
				<OrderCard
					key={order.id}
					order={order}
					onViewOrder={onViewOrder}
					t={t}
				/>
			))}
		</div>
	);
}

