"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function PricingModal({ isOpen, onClose, order, orderServiceId, onSubmit }) {
	const { t } = useTranslation();
	
	// Get offer from orderService if available
	const orderService = order?.orderServices?.find(os => os.id === orderServiceId);
	const existingOffer = orderService?.offer || order?.offer;
	
	const [minHours, setMinHours] = useState(existingOffer?.min_hours || 8);
	const [maxHours, setMaxHours] = useState(existingOffer?.max_hours || 25);
	const [hourlyRate, setHourlyRate] = useState(existingOffer?.hourly_rate || 75);
	const [notes, setNotes] = useState(existingOffer?.notes || "");
	const [scheduledDate, setScheduledDate] = useState(
		existingOffer?.date || ""
	);
	const [scheduledTime, setScheduledTime] = useState(
		existingOffer?.time || ""
	);

	const isModifying = existingOffer !== null && existingOffer !== undefined;

	// Calculate total price based on average hours
	const averageHours = (minHours + maxHours) / 2;
	const totalPrice = averageHours * hourlyRate;

	const handleMinHoursChange = (newMinHours) => {
		setMinHours(newMinHours);
		// Ensure min_hours <= max_hours
		if (newMinHours > maxHours) {
			setMaxHours(newMinHours);
		}
	};

	const handleMaxHoursChange = (newMaxHours) => {
		setMaxHours(newMaxHours);
		// Ensure min_hours <= max_hours
		if (newMaxHours < minHours) {
			setMinHours(newMaxHours);
		}
	};

	const handleRateChange = (newRate) => {
		setHourlyRate(newRate);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const offerData = {
			hourly_rate: hourlyRate,
			currency: "CHF",
			min_hours: minHours,
			max_hours: maxHours,
			notes: notes.trim(),
			...(scheduledDate && { date: scheduledDate }),
			...(scheduledTime && { time: scheduledTime }),
		};
		onSubmit(offerData);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="p-4 sm:p-5 lg:p-6 border-b border-orange-100/50 flex-shrink-0">
					<div className="flex items-center justify-between gap-3">
						<div className="flex-1 min-w-0">
							<h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent truncate">
								{isModifying ? t("pricingModal.modifyOffer") || "Modify Offer" : t("pricingModal.sendOffer") || "Send Offer"}
							</h2>
							<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1 truncate">
								{t("pricingModal.order") || "Order"} #{order?.id}
								{isModifying && <span className="text-purple-600 ml-1 sm:ml-2">(Modifying v{existingOffer?.version || 1})</span>}
							</p>
						</div>
						<button
							onClick={onClose}
							className="p-1.5 sm:p-2 text-amber-600/60 hover:text-amber-700 hover:bg-orange-50/60 rounded-lg transition-colors flex-shrink-0"
						>
							<svg
								className="w-4 h-4 sm:w-5 sm:h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>

				{/* Content - Scrollable */}
				<form onSubmit={handleSubmit} className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
					{/* Hours Range - Combined */}
					<div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200/50">
						<label className="block text-sm font-semibold text-amber-900 mb-4">
							Estimated Hours Range
						</label>
						
						{/* Min Hours */}
						<div className="mb-4">
							<div className="flex items-center justify-between mb-2">
								<label className="text-sm font-medium text-amber-800">
									Minimum Hours
								</label>
								<div className="flex items-center gap-2">
									<input
										type="number"
										min="1"
										max={maxHours}
										value={minHours}
										onChange={(e) => {
											const val = Math.max(1, Math.min(maxHours, parseInt(e.target.value) || 1));
											handleMinHoursChange(val);
										}}
										className="w-20 px-2 py-1 text-center border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-amber-900 font-semibold"
									/>
									<span className="text-sm text-amber-600">hours</span>
								</div>
							</div>
							<input
								type="range"
								min="1"
								max={maxHours}
								step="1"
								value={minHours}
								onChange={(e) => handleMinHoursChange(parseInt(e.target.value))}
								className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
							/>
						</div>

						{/* Max Hours */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="text-sm font-medium text-amber-800">
									Maximum Hours
								</label>
								<div className="flex items-center gap-2">
									<input
										type="number"
										min={minHours}
										max="50"
										value={maxHours}
										onChange={(e) => {
											const val = Math.max(minHours, Math.min(50, parseInt(e.target.value) || minHours));
											handleMaxHoursChange(val);
										}}
										className="w-20 px-2 py-1 text-center border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-amber-900 font-semibold"
									/>
									<span className="text-sm text-amber-600">hours</span>
								</div>
							</div>
							<input
								type="range"
								min={minHours}
								max="50"
								step="1"
								value={maxHours}
								onChange={(e) => handleMaxHoursChange(parseInt(e.target.value))}
								className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
							/>
						</div>
					</div>

					{/* Hourly Rate Input */}
					<div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
						<div className="flex items-center justify-between mb-2">
							<label className="text-sm font-semibold text-amber-900">
								Hourly Rate (CHF)
							</label>
							<div className="flex items-center gap-2">
								<input
									type="number"
									min="50"
									max="300"
									step="5"
									value={hourlyRate}
									onChange={(e) => {
										const val = Math.max(50, Math.min(300, parseInt(e.target.value) || 50));
										handleRateChange(val);
									}}
									className="w-24 px-2 py-1 text-center border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-amber-900 font-semibold"
								/>
								<span className="text-sm text-amber-600">CHF/hour</span>
							</div>
						</div>
						<input
							type="range"
							min="50"
							max="300"
							step="5"
							value={hourlyRate}
							onChange={(e) => handleRateChange(parseInt(e.target.value))}
							className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
						/>
						<div className="flex justify-between text-xs text-amber-600/70 mt-1">
							<span>CHF 50</span>
							<span>CHF 300</span>
						</div>
					</div>

					{/* Schedule - Combined */}
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm font-medium text-amber-900 mb-2">
								Date <span className="text-amber-500/70 text-xs">(Optional)</span>
							</label>
							<input
								type="date"
								value={scheduledDate}
								onChange={(e) => setScheduledDate(e.target.value)}
								min={new Date().toISOString().split("T")[0]}
								className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-amber-900"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-amber-900 mb-2">
								Time <span className="text-amber-500/70 text-xs">(Optional)</span>
							</label>
							<input
								type="time"
								value={scheduledTime}
								onChange={(e) => setScheduledTime(e.target.value)}
								className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-amber-900"
							/>
						</div>
					</div>

					{/* Notes Input */}
					<div>
						<label className="block text-sm font-medium text-amber-900 mb-2">
							{t("pricingModal.additionalNotesOptional")}
						</label>
						<textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder={t("pricingModal.specialInstructions")}
							rows={3}
							className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-amber-900 placeholder-amber-400"
						/>
					</div>

					{/* Total Price Display */}
					<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-5 border-2 border-green-200/60">
						<div className="text-center">
							<p className="text-xs font-medium text-green-600/70 uppercase tracking-wide mb-1.5 sm:mb-2">
								Estimated Total Price
							</p>
							<p className="text-3xl sm:text-4xl font-bold text-green-700 mb-1.5 sm:mb-2">
								CHF {Math.round(totalPrice)}
							</p>
							<div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm text-green-600/80">
								<span className="font-medium">
									{minHours === maxHours 
										? `${minHours}h`
										: `${minHours}-${maxHours}h (avg: ${Math.round(averageHours)}h)`
									}
								</span>
								<span>×</span>
								<span className="font-medium">CHF {hourlyRate}/h</span>
							</div>
						</div>
					</div>
				</form>

				{/* Action Buttons - Fixed at bottom */}
				<div className="p-4 sm:p-5 lg:p-6 border-t border-orange-100/50 bg-white flex-shrink-0">
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-amber-700 hover:text-amber-900 border border-orange-200/60 rounded-lg hover:bg-orange-50/60 transition-colors font-medium"
						>
							{t("pricingModal.cancel") || "Cancel"}
						</button>
						<button
							type="button"
							onClick={handleSubmit}
							className="flex-1 px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium rounded-lg transition-all cursor-pointer hover:shadow-lg transform hover:scale-[1.02]"
						>
							{isModifying ? (t("pricingModal.updateOffer") || "Update Offer") : (t("pricingModal.sendOfferButton") || "Send Offer")}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
