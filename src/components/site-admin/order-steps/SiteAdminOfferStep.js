"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/utils/financeUtils";

export default function SiteAdminOfferStep({ 
	formData, 
	setFormData, 
	companyScope, 
	selectedCompanyId 
}) {
	const { t } = useTranslation();
	const offerData = formData.offerData || {};

	const handleChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			offerData: {
				...offerData,
				[field]: value
			}
		}));
	};

	const isExternal = companyScope === "external";

	if (isExternal) {
		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-lg font-semibold text-amber-900 mb-2">
						{t("orderSteps.offerDetails") || "Offer Details"}
					</h3>
					<p className="text-sm text-amber-700/70">
						{t("orderSteps.externalOfferNotice") || "Since you selected an external company, they will provide their own offer later. You don't need to enter any pricing details now."}
					</p>
				</div>

				<div className="p-6 bg-blue-50 border border-blue-200 rounded-xl text-center">
					<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
						<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<p className="text-blue-800 font-medium">
						{t("orderSteps.externalFlowHint") || "The external company will receive this order and submit their price for your approval."}
					</p>
				</div>
			</div>
		);
	}

	const totalPrice = ((offerData.min_hours || 0) + (offerData.max_hours || 0)) / 2 * (offerData.hourly_rate || 0);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold text-amber-900 mb-2">
					{t("orderSteps.offerDetails") || "Set Internal Offer"}
				</h3>
				<p className="text-sm text-amber-700/70">
					{t("orderSteps.internalOfferDesc") || "Enter the pricing and schedule details for this internal order."}
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-4">
					<div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
						<label className="block text-sm font-medium text-amber-900 mb-3">
							{t("pricingModal.hourlyRate") || "Hourly Rate (CHF)"}
						</label>
						<div className="flex items-center gap-3">
							<input
								type="number"
								value={offerData.hourly_rate}
								onChange={(e) => handleChange("hourly_rate", parseInt(e.target.value) || 0)}
								className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400"
							/>
							<span className="text-amber-700 font-medium whitespace-nowrap">CHF/h</span>
						</div>
					</div>

					<div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 space-y-4">
						<label className="block text-sm font-medium text-amber-900">
							{t("pricingModal.estimatedHours") || "Estimated Hours"}
						</label>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<span className="text-[10px] text-amber-600 uppercase font-bold">{t("common.min") || "Min"}</span>
								<input
									type="number"
									value={offerData.min_hours}
									onChange={(e) => handleChange("min_hours", parseInt(e.target.value) || 0)}
									className="w-full px-3 py-2 border border-orange-200 rounded-lg"
								/>
							</div>
							<div>
								<span className="text-[10px] text-amber-600 uppercase font-bold">{t("common.max") || "Max"}</span>
								<input
									type="number"
									value={offerData.max_hours}
									onChange={(e) => handleChange("max_hours", parseInt(e.target.value) || 0)}
									className="w-full px-3 py-2 border border-orange-200 rounded-lg"
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
						<label className="block text-sm font-medium text-amber-900 mb-2">
							{t("pricingModal.offerNotes") || "Offer Notes"}
						</label>
						<textarea
							value={offerData.notes}
							onChange={(e) => handleChange("notes", e.target.value)}
							rows={5}
							placeholder={t("pricingModal.notesPlaceholder") || "Any specific details about this price..."}
							className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 resize-none"
						/>
					</div>
				</div>
			</div>

			<div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200/60 text-center">
				<p className="text-xs font-medium text-green-600/70 uppercase tracking-wide mb-1">
					{t("pricingModal.estimatedTotal") || "Estimated Total Price"}
				</p>
				<p className="text-3xl font-bold text-green-700">
					{formatCurrency(totalPrice, offerData.currency || "CHF")}
				</p>
				<p className="text-xs text-green-600/80 mt-1">
					{offerData.min_hours}-{offerData.max_hours}h avg @ {offerData.hourly_rate} CHF/h
				</p>
			</div>
		</div>
	);
}

