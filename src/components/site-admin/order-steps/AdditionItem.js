export default function AdditionItem({ 
	addition, 
	isSelected, 
	pricing,
	serviceId,
	showPricing,
	onToggle,
	onPricingChange,
	t 
}) {
	const handleToggle = (e) => {
		e.stopPropagation();
		onToggle(serviceId, addition.id);
	};

	const handlePricingChange = (field, value) => {
		onPricingChange(serviceId, addition.id, field, value);
	};

	const totalPrice = (pricing.price || 0) * (pricing.amount || 0);

	return (
		<div className="space-y-2">
			<button
				type="button"
				onClick={handleToggle}
				className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg transition-all text-left ${
					isSelected
						? "bg-orange-500 text-white"
						: "bg-gray-100 text-gray-700 hover:bg-orange-100"
				}`}
			>
				{addition.name}
			</button>
			
			{isSelected && showPricing && (
				<div className="pl-2 grid grid-cols-2 gap-2">
					<div>
						<label className="block text-xs text-amber-700 mb-1">
							{t("siteAdmin.pricing.price") || "Price"}
						</label>
						<input
							type="number"
							min="0"
							step="1"
							value={pricing.price || 0}
							onChange={(e) => {
								e.stopPropagation();
								handlePricingChange('price', e.target.value);
							}}
							onClick={(e) => e.stopPropagation()}
							className="w-full px-2 py-1.5 text-xs border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
						/>
					</div>
					<div>
						<label className="block text-xs text-amber-700 mb-1">
							{t("siteAdmin.pricing.amount") || "Amount"}
						</label>
						<input
							type="number"
							min="1"
							step="1"
							value={pricing.amount || 1}
							onChange={(e) => {
								e.stopPropagation();
								handlePricingChange('amount', e.target.value);
							}}
							onClick={(e) => e.stopPropagation()}
							className="w-full px-2 py-1.5 text-xs border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
						/>
					</div>
					<div className="col-span-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
						Total: ${totalPrice.toFixed(2)}
					</div>
				</div>
			)}
		</div>
	);
}
