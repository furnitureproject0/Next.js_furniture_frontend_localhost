export default function OrderScheduleInfo({ order, t }) {
	const formatDate = (dateString) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatTime = (timeString) => {
		if (!timeString) return "";
		const [hours, minutes] = timeString.split(":");
		return `${hours}:${minutes}`;
	};

	if (!order.preferred_date && !order.number_of_rooms) return null;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-lg">
			{order.preferred_date && (
				<div className="flex items-start gap-2">
					<svg
						className="w-4 h-4 text-amber-600/70 mt-0.5 flex-shrink-0"
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
					<div>
						<p className="text-xs text-amber-600/70 uppercase tracking-wide">
							{t("orderDetails.schedule")}
						</p>
						<p className="text-sm text-amber-900 font-medium">
							{formatDate(order.preferred_date)}
							{order.preferred_time && ` at ${formatTime(order.preferred_time)}`}
						</p>
					</div>
				</div>
			)}
			{order.number_of_rooms && (
				<div className="flex items-start gap-2">
					<svg
						className="w-4 h-4 text-amber-600/70 mt-0.5 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
						/>
					</svg>
					<div>
						<p className="text-xs text-amber-600/70 uppercase tracking-wide">
							{t("orderDetails.roomConfiguration")}
						</p>
						<p className="text-sm text-amber-900 font-medium">
							{order.number_of_rooms} {t("common.labels.rooms")}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
