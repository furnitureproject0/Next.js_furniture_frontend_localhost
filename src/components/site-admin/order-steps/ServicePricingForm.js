export default function ServicePricingForm({ 
	pricing, 
	serviceId, 
	onPricingChange, 
	estimatedTotal,
	t 
}) {
	const handleChange = (field, value) => {
		onPricingChange(serviceId, field, value);
	};

	return (
		<div className="ml-4 pl-4 border-l-2 border-orange-200 space-y-3">
			<div className="grid grid-cols-3 gap-2">
				<div>
					<label className="block text-xs font-medium text-amber-900 mb-1">
						{t("siteAdmin.pricing.minHours") || "Min Hours"}
					</label>
					<input
						type="number"
						min="0"
						step="0.5"
						value={pricing.minHours || 0}
						onChange={(e) => {
							e.stopPropagation();
							handleChange('minHours', e.target.value);
						}}
						onClick={(e) => e.stopPropagation()}
						className="w-full px-2 py-1.5 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
					/>
				</div>
				<div>
					<label className="block text-xs font-medium text-amber-900 mb-1">
						{t("siteAdmin.pricing.maxHours") || "Max Hours"}
					</label>
					<input
						type="number"
						min="0"
						step="0.5"
						value={pricing.maxHours || 0}
						onChange={(e) => {
							e.stopPropagation();
							handleChange('maxHours', e.target.value);
						}}
						onClick={(e) => e.stopPropagation()}
						className="w-full px-2 py-1.5 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
					/>
				</div>
				<div>
					<label className="block text-xs font-medium text-amber-900 mb-1">
						{t("siteAdmin.pricing.pricePerHour") || "$/Hour"}
					</label>
					<input
						type="number"
						min="0"
						step="1"
						value={pricing.pricePerHour || 0}
						onChange={(e) => {
							e.stopPropagation();
							handleChange('pricePerHour', e.target.value);
						}}
						onClick={(e) => e.stopPropagation()}
						className="w-full px-2 py-1.5 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
					/>
				</div>
			</div>
			<div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
				<span className="text-xs font-medium text-green-800">
					{t("siteAdmin.pricing.estimatedTotal") || "Estimated Total"}
				</span>
				<span className="text-sm font-bold text-green-900">
					${estimatedTotal.toFixed(2)}
				</span>
			</div>
		</div>
	);
}
