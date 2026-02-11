export default function RejectOfferDialog({ 
	isOpen, 
	rejectionReason, 
	onReasonChange, 
	onConfirm, 
	onCancel, 
	t 
}) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
			<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
				<h3 className="text-xl font-bold text-amber-900 mb-4">
					{t("common.buttons.rejectOffer")}
				</h3>
				<p className="text-amber-700/70 mb-4">
					{t("orderDetails.rejectConfirmMessageOptional")}
				</p>
				<textarea
					value={rejectionReason}
					onChange={(e) => onReasonChange(e.target.value)}
					placeholder={t("orderDetails.rejectReasonPlaceholder")}
					rows={3}
					className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 resize-none mb-4"
				/>
				<div className="flex items-center justify-end gap-3">
					<button
						onClick={onCancel}
						className="px-4 py-2 text-amber-700 hover:text-amber-900 font-medium transition-colors"
					>
						{t("common.buttons.cancel")}
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
					>
						{t("common.buttons.rejectOffer")}
					</button>
				</div>
			</div>
		</div>
	);
}
