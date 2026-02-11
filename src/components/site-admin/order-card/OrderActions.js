export default function OrderActions({ 
	order, 
	onAssignCompany, 
	onViewDetails,
	onAcceptOffer,
	onRejectOffer,
	t 
}) {
	const shouldShowAssignButton = () => {
		const orderServices = order.orderServices || [];
		
		if (orderServices.length === 0) {
			return order.status === "pending";
		}
		
		const hasPendingOrderService = orderServices.some(
			os => !os.status || os.status === "pending"
		);
		const allAssigned = orderServices.every(
			os => os.status && os.status !== "pending" && os.company_id
		);
		
		if (allAssigned && orderServices.length === 1) {
			return false;
		}
		
		return hasPendingOrderService;
	};

	const shouldShowOfferActions = () => {
		return order.status === "offer_sent" && order.offer && order.createdBy === "site_admin";
	};

	return (
		<div className="flex items-center justify-between pt-3 border-t border-orange-100/50">
			<div className="flex items-center gap-2">
				{shouldShowAssignButton() && (
					<button
						onClick={() => onAssignCompany(order)}
						className="px-4 py-2 btn-primary text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
					>
						<svg
							className="w-4 h-4"
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
				{shouldShowOfferActions() && (
					<>
						<button
							onClick={onRejectOffer}
							className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
						>
							{t("common.buttons.reject")}
						</button>
						<button
							onClick={onAcceptOffer}
							className="px-4 py-2 btn-primary text-sm font-medium rounded-lg transition-colors cursor-pointer"
						>
							{t("common.buttons.acceptOffer")}
						</button>
					</>
				)}
				<button
					onClick={onViewDetails}
					className="px-3 py-2 text-amber-700 hover:text-amber-900 text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
				>
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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
}
