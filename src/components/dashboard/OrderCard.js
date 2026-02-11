"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedStatusLabel } from "@/utils/i18nUtils";
import {
	formatOrderId,
	formatOrderIdShort,
	getPriorityColor,
	getStatusColor,
	getStatusIcon,
} from "@/utils/orderUtils";

const OrderHeader = ({ order, t }) => (
	<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
		<div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
			<div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
				<span className="text-orange-600 font-bold text-xs sm:text-sm">
					{formatOrderIdShort(order.id)}
				</span>
			</div>
			<div className="flex-1 min-w-0">
				<h3 className="font-semibold text-amber-900 text-base sm:text-lg truncate">
					{order.client}
				</h3>
				<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
					<span className="text-xs sm:text-sm text-amber-700/70">
						{formatOrderId(order.id)}
					</span>
					<span className="text-orange-300">•</span>
					<span className="text-xs sm:text-sm text-amber-700/70">
						{order.date}
					</span>
				</div>
			</div>
		</div>
		<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
			{order.priority && (
				<div
					className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
						order.priority,
					)}`}
				>
					{order.priority.charAt(0).toUpperCase() +
						order.priority.slice(1)}
				</div>
			)}
			<div
				className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
					order.status,
				)}`}
			>
				{getStatusIcon(order.status)}
				{getTranslatedStatusLabel(order.status, t)}
			</div>
		</div>
	</div>
);

const OrderDetails = ({ order, t }) => (
	<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
		<div className="space-y-2 sm:space-y-3">
			<div>
				<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-0.5 sm:mb-1">
					{t("orderDetails.furnitureItems")}
				</p>
				<p className="text-xs sm:text-sm text-amber-900 font-medium">
					{order.furniture}
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-4 sm:gap-6">
				<div>
					<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-0.5 sm:mb-1">
						{t("orderDetails.floor")}
					</p>
					<div className="flex items-center gap-1">
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600/60 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
						<span className="text-xs sm:text-sm font-semibold text-amber-900">
							{order.floor}
						</span>
					</div>
				</div>
				<div>
					<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-0.5 sm:mb-1">
						{t("orderDetails.cleaning")}
					</p>
					<div className="flex items-center gap-1">
						{order.cleaning ? (
							<>
								<svg
									className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0"
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
								<span className="text-xs sm:text-sm font-semibold text-green-600">
									{t("orderDetails.yes")}
								</span>
							</>
						) : (
							<>
								<svg
									className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600/60 flex-shrink-0"
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
								<span className="text-xs sm:text-sm font-semibold text-amber-700/70">
									{t("orderDetails.no")}
								</span>
							</>
						)}
					</div>
				</div>
				{order.price && (
					<div>
						<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-0.5 sm:mb-1">
							{t("orderDetails.price")}
						</p>
						<span className="text-xs sm:text-sm font-bold text-green-600">
							{order.price}
						</span>
						{order.estimatedHours && (
							<p className="text-xs text-amber-600/70">
								{order.estimatedHours}h @ CHF {order.hourlyRate}
								/h
							</p>
						)}
					</div>
				)}
			</div>
		</div>
		<div>
			<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-0.5 sm:mb-1">
				{t("orderDetails.deliveryLocation")}
			</p>
			<div className="flex items-start gap-1.5 sm:gap-2">
				<svg
					className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600/60 mt-0.5 flex-shrink-0"
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
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
				<p className="text-xs sm:text-sm text-amber-900 font-medium">
					{order.location}
				</p>
			</div>
		</div>
	</div>
);

const TeamAssignment = ({ order, t }) => {
	if (!order.driver) return null;

	return (
		<div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-orange-50/60 rounded-lg">
			<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1.5 sm:mb-2">
				{t("orderDetails.assignedTeam")}
			</p>
			<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
				<div className="flex items-center gap-1.5 sm:gap-2">
					<svg
						className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0"
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
					<span className="text-xs sm:text-sm font-medium text-amber-900 truncate">
						{t("orderDetails.driver")}: {order.driver}
					</span>
				</div>
				{order.workers && (
					<div className="flex items-center gap-1.5 sm:gap-2">
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						<span className="text-xs sm:text-sm font-medium text-amber-900 truncate">
							{t("orderDetails.workers")}: {order.workers.join(", ")}
						</span>
					</div>
				)}
			</div>
		</div>
	);
};

const OrderActions = ({
	order,
	onSetPrice,
	onAssignTeam,
	showSiteAdminActions,
	onAssignCompany,
	t,
}) => (
		<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-2 sm:pt-3 border-t border-orange-100/50">
		<div className="flex flex-wrap items-center gap-2">
			{!showSiteAdminActions && order.status === "pending" && (
				<button
					onClick={() => onSetPrice(order)}
					className="px-3 sm:px-4 py-1.5 sm:py-2 btn-primary text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer"
				>
					<svg
						className="w-3.5 h-3.5 sm:w-4 sm:h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
						/>
					</svg>
					{t("common.buttons.setPrice")}
				</button>
			)}
			{!showSiteAdminActions &&
				(order.status === "approved" || order.status === "priced") && (
					<button
						onClick={() => onAssignTeam(order)}
						className="px-3 sm:px-4 py-1.5 sm:py-2 btn-primary text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer"
					>
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						{t("common.buttons.assignTeam")}
					</button>
				)}
			{showSiteAdminActions &&
				(order.status === "pending" || order.status === "rejected") && (
					<button
						onClick={() => onAssignCompany(order)}
						className="px-3 sm:px-4 py-1.5 sm:py-2 btn-primary text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer"
					>
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
						{t("common.buttons.assignCompany")}
					</button>
				)}
		</div>
		<div className="flex items-center gap-2">
			<button className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors flex items-center gap-1.5 sm:gap-2">
				<svg
					className="w-3.5 h-3.5 sm:w-4 sm:h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 12a3 3 0 11-6 0 3 3 0 616 0z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
					/>
				</svg>
				{t("common.buttons.viewDetails")}
			</button>
		</div>
	</div>
);

export default function OrderCard({
	order,
	onSetPrice,
	onAssignTeam,
	showSiteAdminActions,
	onAssignCompany,
}) {
	const { t } = useTranslation();
	return (
		<div className="group border border-orange-200/60 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:border-orange-300/60 transition-all duration-200 bg-white/60 backdrop-blur-sm">
			<OrderHeader order={order} t={t} />
			<OrderDetails order={order} t={t} />
			<TeamAssignment order={order} t={t} />
			<OrderActions
				order={order}
				onSetPrice={onSetPrice}
				onAssignTeam={onAssignTeam}
				showSiteAdminActions={showSiteAdminActions}
				onAssignCompany={onAssignCompany}
				t={t}
			/>
		</div>
	);
}
