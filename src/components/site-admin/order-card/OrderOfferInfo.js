import { formatCurrency } from "@/utils/financeUtils";

export default function OrderOfferInfo({ offer, t, isEmbedded = false }) {
	if (!offer) return null;

	const formatDate = (dateString) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Determine values
	const price = offer.price || offer.hourly_rate;
	const isHourly = !!offer.hourly_rate && !offer.price; // precise check
	const minHours = offer.min_hours ? Number(offer.min_hours) : null;
	const maxHours = offer.max_hours ? Number(offer.max_hours) : null;
	const date = offer.date || offer.scheduledDate;

	const containerClass = isEmbedded 
		? "mt-1" 
		: "mb-4 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200/50";

	return (
		<div className={containerClass}>
			{!isEmbedded && (
				<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-3">
					{t("orderDetails.offerDetails")}
				</p>
			)}
			<div className="space-y-2">
				<div className="flex items-baseline justify-between">
					<span className="text-sm text-amber-700 font-medium">
						{t("orderDetails.price")}:
					</span>
					<div className="flex items-baseline gap-1">
						<span className="text-2xl font-bold text-green-600">
							{formatCurrency(price, offer.currency || "CHF")}
						</span>
						{isHourly && (
							<span className="text-sm font-medium text-green-600/70">
								/ {t("common.labels.hour") || "hr"}
							</span>
						)}
					</div>
				</div>
				{(minHours || offer.estimatedHours) && (
					<div className="flex items-center justify-between text-sm">
						<span className="text-amber-700">
							{t("orderDetails.estimatedHours")}:
						</span>
						<span className="text-amber-900 font-medium">
							{minHours 
								? `${minHours} - ${maxHours || minHours}`
								: offer.estimatedHours} {t("common.labels.hours") || "hrs"}
						</span>
					</div>
				)}
				{date && (
					<div className="flex items-center justify-between text-sm">
						<span className="text-amber-700">
							{t("orderDetails.scheduledDate")}:
						</span>
						<span className="text-amber-900 font-medium">
							{formatDate(date)}
						</span>
					</div>
				)}
				{offer.notes && (
					<div className="pt-2 mt-2 border-t border-orange-200/50">
						<p className="text-xs text-amber-600 mb-1">{t("common.notes") || "Notes"}:</p>
						<p className="text-sm text-amber-900 italic">&ldquo;{offer.notes}&rdquo;</p>
					</div>
				)}
			</div>
		</div>
	);
}
