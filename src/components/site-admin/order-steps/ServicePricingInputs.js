"use client";

import { useTranslation } from "@/hooks/useTranslation";

/**
 * Reusable component for service pricing inputs (min/max hours, price per hour)
 * Separated for better maintainability and reusability
 */
export default function ServicePricingInputs({ serviceId, pricing, onPricingChange, estimatedTotal }) {
	const { t } = useTranslation();

	const handleInputChange = (field, value) => {
		onPricingChange(serviceId, field, value);
	};

	const pricingType = pricing.pricingType || 'hourly';

	return (
		<div className="ml-4 pl-4 border-l-2 border-primary-200 space-y-4">
			{/* Pricing Type Selector */}
			<div className="w-full">
				<label className="block text-xs font-bold text-gray-700 mb-1">
					{t("siteAdmin.pricing.type") || "Pricing Type"}
				</label>
				<select
					value={pricingType}
					onChange={(e) => {
						e.stopPropagation();
						handleInputChange('pricingType', e.target.value);
					}}
					onClick={(e) => e.stopPropagation()}
					className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white font-medium text-gray-800"
				>
					<option value="hourly">{t("siteAdmin.pricing.hourly")}</option>
					<option value="flat_rate">{t("siteAdmin.pricing.flatRate")}</option>
					<option value="max_price">{t("siteAdmin.pricing.maxPriceOption")}</option>
				</select>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
				{/* Conditional Inputs based on Pricing Type */}
				{pricingType === 'hourly' && (
					<>
						<div>
							<label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-tight">
								{t("siteAdmin.pricing.minHours")}
							</label>
							<input
								type="number"
								min="0"
								step="0.5"
								value={pricing.minHours || 0}
								onChange={(e) => {
									e.stopPropagation();
									handleInputChange('minHours', e.target.value);
								}}
								onClick={(e) => e.stopPropagation()}
								className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
							/>
						</div>
						<div>
							<label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-tight">
								{t("siteAdmin.pricing.maxHours")}
							</label>
							<input
								type="number"
								min="0"
								step="0.5"
								value={pricing.maxHours || 0}
								onChange={(e) => {
									e.stopPropagation();
									handleInputChange('maxHours', e.target.value);
								}}
								onClick={(e) => e.stopPropagation()}
								className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
							/>
						</div>
						<div>
							<label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-tight">
								{t("siteAdmin.pricing.pricePerHour")}
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">CHF</span>
								<input
									type="number"
									min="0"
									step="1"
									value={pricing.pricePerHour || 0}
									onChange={(e) => {
										e.stopPropagation();
										handleInputChange('pricePerHour', e.target.value);
									}}
									onClick={(e) => e.stopPropagation()}
									className="w-full pl-11 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
								/>
							</div>
						</div>
					</>
				)}

				{pricingType === 'flat_rate' && (
					<div className="col-span-1">
						<label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-tight">
							{t("siteAdmin.pricing.flatRatePrice") || "Flat Rate Price"}
						</label>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">CHF</span>
							<input
								type="number"
								min="0"
								step="1"
								value={pricing.flatRatePrice || 0}
								onChange={(e) => {
									e.stopPropagation();
									handleInputChange('flatRatePrice', e.target.value);
								}}
								onClick={(e) => e.stopPropagation()}
								className="w-full pl-11 pr-3 py-2 text-sm border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium bg-primary-50/10"
							/>
						</div>
					</div>
				)}

				{pricingType === 'max_price' && (
					<>
						<div>
							<label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-tight">
								{t("siteAdmin.pricing.minHours")}
							</label>
							<input
								type="number"
								min="0"
								step="0.5"
								value={pricing.minHours || 0}
								onChange={(e) => {
									e.stopPropagation();
									handleInputChange('minHours', e.target.value);
								}}
								onClick={(e) => e.stopPropagation()}
								className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
							/>
						</div>
						<div>
							<label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-tight">
								{t("siteAdmin.pricing.maxHours")}
							</label>
							<input
								type="number"
								min="0"
								step="0.5"
								value={pricing.maxHours || 0}
								onChange={(e) => {
									e.stopPropagation();
									handleInputChange('maxHours', e.target.value);
								}}
								onClick={(e) => e.stopPropagation()}
								className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
							/>
						</div>
						<div>
							<label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-tight">
								{t("siteAdmin.pricing.pricePerHour")}
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">CHF</span>
								<input
									type="number"
									min="0"
									step="1"
									value={pricing.pricePerHour || 0}
									onChange={(e) => {
										e.stopPropagation();
										handleInputChange('pricePerHour', e.target.value);
									}}
									onClick={(e) => e.stopPropagation()}
									className="w-full pl-11 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
								/>
							</div>
						</div>
						<div className="col-span-1">
							<label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-tight">
								{t("siteAdmin.pricing.maxPrice") || "Max Price"}
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">CHF</span>
								<input
									type="number"
									min="0"
									step="1"
									value={pricing.maxPrice || 0}
									onChange={(e) => {
										e.stopPropagation();
										handleInputChange('maxPrice', e.target.value);
									}}
									onClick={(e) => e.stopPropagation()}
									className="w-full pl-11 pr-3 py-2 text-sm border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium bg-primary-50/10"
								/>
							</div>
						</div>
					</>
				)}



				{/* Number of Workers Field */}
				<div className="col-span-1">
					<label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-tight">
						{t("siteAdmin.pricing.workersCount") || "Number of Workers"}
					</label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
							<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</span>
						<input
							type="number"
							min="1"
							step="1"
							value={pricing.workersCount || 1}
							onChange={(e) => {
								e.stopPropagation();
								handleInputChange('workersCount', e.target.value);
							}}
							onClick={(e) => e.stopPropagation()}
							className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 font-bold text-gray-800 bg-white"
						/>
					</div>
				</div>

				{/* Shared Discount Field */}
				<div className="col-span-1">
					<label className="block text-[11px] font-bold text-primary-600 mb-1 uppercase tracking-tight">
						{t("siteAdmin.pricing.discount")}
					</label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 text-sm">CHF</span>
						<input
							type="number"
							min="0"
							step="1"
							value={pricing.discount || 0}
							onChange={(e) => {
								e.stopPropagation();
								handleInputChange('discount', e.target.value);
							}}
							onClick={(e) => e.stopPropagation()}
							className="w-full pl-11 pr-3 py-2 text-sm border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 font-bold text-primary-700 bg-primary-50/30"
						/>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg shadow-inner">
				<span className="text-xs font-semibold text-slate-400">
					{t("siteAdmin.pricing.estimatedTotal")}
				</span>
				<span className="text-base font-bold text-white">
					CHF {estimatedTotal.min.toFixed(2)}
					{estimatedTotal.min !== estimatedTotal.max && ` - ${estimatedTotal.max.toFixed(2)}`}
				</span>
			</div>
			
			{/* Notes field */}
			<div className="pt-1">
				<label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-tight">
					{t("siteAdmin.pricing.notes") || "Offer Notes"}
				</label>
				<textarea
					rows={2}
					value={pricing.notes || ""}
					onChange={(e) => {
						e.stopPropagation();
						handleInputChange('notes', e.target.value);
					}}
					onClick={(e) => e.stopPropagation()}
					placeholder={t("siteAdmin.pricing.notesPlaceholder") || "Add specialized notes for this service offer..."}
					className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none bg-gray-50/50"
				/>
			</div>
		</div>
	);

}
