export default function OrderAddresses({ order, t }) {
	const AddressIcon = () => (
		<svg
			className="w-4 h-4 text-amber-600/60 mt-0.5 flex-shrink-0"
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
	);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
			<div>
				<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2">
					{t("orderDetails.fromAddress")}
				</p>
				<div className="flex items-start gap-2">
					<AddressIcon />
					<p className="text-sm text-amber-900 font-medium leading-relaxed">
						{order.fromAddress || order.addresses?.from || "-"}
					</p>
				</div>
			</div>
			{order.toAddress && (
				<div>
					<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2">
						{t("orderDetails.toAddress")}
					</p>
					<div className="flex items-start gap-2">
						<AddressIcon />
						<p className="text-sm text-amber-900 font-medium leading-relaxed">
							{order.toAddress || order.addresses?.to || "-"}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
