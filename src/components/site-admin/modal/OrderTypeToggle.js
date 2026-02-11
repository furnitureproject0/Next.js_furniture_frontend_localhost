export default function OrderTypeToggle({ orderType, onChange, companyScope, t }) {
	if (companyScope !== "internal") return null;

	return (
		<div className="flex items-center gap-2 pt-1">
			<button
				onClick={() => onChange("order")}
				className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg border-2 transition-all cursor-pointer ${
					orderType === "order"
						? "bg-orange-500 border-orange-500 text-white shadow-md"
						: "bg-white border-orange-100 text-amber-700 hover:border-orange-200"
				}`}
			>
				{t("siteAdmin.orderWizard.order") || "Order"}
			</button>
			<button
				onClick={() => onChange("offer")}
				className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg border-2 transition-all cursor-pointer ${
					orderType === "offer"
						? "bg-orange-500 border-orange-500 text-white shadow-md"
						: "bg-white border-orange-100 text-amber-700 hover:border-orange-200"
				}`}
			>
				{t("siteAdmin.orderWizard.offer") || "Offer"}
			</button>
		</div>
	);
}
