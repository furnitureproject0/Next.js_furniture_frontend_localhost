"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedRoomTypes } from "@/utils/i18nUtils";
import { useMemo } from "react";

export default function CustomerScheduleStep({ formData, setFormData, validationErrors = {} }) {
	const { t } = useTranslation();
	const ROOM_TYPES = getTranslatedRoomTypes(t);
	
	// Generate room configuration summary from step 3
	const roomConfigSummary = useMemo(() => {
		if (!formData.roomConfigurations || formData.roomConfigurations.length === 0) {
			return "";
		}
		
		return formData.roomConfigurations
			.filter(room => room.roomType && room.quantity)
			.map(room => {
				const roomTypeName = ROOM_TYPES.find(rt => rt.id === room.roomType)?.name || room.roomType;
				return `${room.quantity} ${roomTypeName}`;
			})
			.join(", ");
	}, [formData.roomConfigurations, ROOM_TYPES]);
	
	const handleDateChange = (e) => {
		setFormData((prev) => ({
			...prev,
			scheduledDate: e.target.value,
		}));
	};

	const handleTimeChange = (e) => {
		setFormData((prev) => ({
			...prev,
			scheduledTime: e.target.value,
		}));
	};

	
	// Get display value for notes field (room config + user notes)
	const notesDisplayValue = useMemo(() => {
		const userNotes = formData.notes || "";
		if (roomConfigSummary) {
			return userNotes ? `${roomConfigSummary}\n${userNotes}` : roomConfigSummary;
		}
		return userNotes;
	}, [roomConfigSummary, formData.notes]);


	// Get minimum date (tomorrow)
	const getMinDate = () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow.toISOString().split("T")[0];
	};

	return (
		<div className="space-y-4 sm:space-y-5 lg:space-y-6">
			<div>
				<h3 className="text-base sm:text-lg font-semibold text-amber-900 mb-1.5 sm:mb-2">
					{t("orderSteps.scheduleAdditionalNotes")}
				</h3>
				<p className="text-xs sm:text-sm text-amber-700/70">
					{t("orderSteps.scheduleQuestion")}
				</p>
			</div>

			{/* Scheduling */}
			<div className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-5 bg-orange-50/30 rounded-lg border border-orange-200/50">
				<h4 className="text-sm sm:text-base font-semibold text-amber-900">
					{t("orderSteps.preferredSchedule")} <span className="text-red-500">*</span>
				</h4>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
					<div>
						<label className="block text-xs sm:text-sm font-medium text-amber-800 mb-1.5 sm:mb-2">
							{t("orderSteps.preferredDate")} <span className="text-red-500">*</span>
						</label>
						<input
							type="date"
							value={formData.scheduledDate}
							onChange={handleDateChange}
							min={getMinDate()}
							className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-400 ${
								validationErrors.scheduledDate ? "border-red-500 focus:ring-red-500" : "border-orange-200 focus:ring-orange-400"
							}`}
							required
						/>
						{validationErrors.scheduledDate ? (
							<p className="text-[10px] sm:text-xs text-red-500 mt-0.5 sm:mt-1">
								{validationErrors.scheduledDate}
							</p>
						) : (
							<p className="text-[10px] sm:text-xs text-amber-600/70 mt-0.5 sm:mt-1">
								{t("orderSteps.dateAdvanceNotice")}
							</p>
						)}
					</div>

					<div>
						<label className="block text-xs sm:text-sm font-medium text-amber-800 mb-1.5 sm:mb-2">
							{t("orderSteps.preferredTime")} <span className="text-red-500">*</span>
						</label>
						<input
							type="time"
							value={formData.scheduledTime}
							onChange={handleTimeChange}
							className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-400 ${
								validationErrors.scheduledTime ? "border-red-500 focus:ring-red-500" : "border-orange-200 focus:ring-orange-400"
							}`}
							required
						/>
						{validationErrors.scheduledTime ? (
							<p className="text-[10px] sm:text-xs text-red-500 mt-0.5 sm:mt-1">
								{validationErrors.scheduledTime}
							</p>
						) : (
							<p className="text-[10px] sm:text-xs text-amber-600/70 mt-0.5 sm:mt-1">
								{t("orderSteps.timeHint") || "Select your preferred start time"}
							</p>
						)}
					</div>
				</div>

				<div className="p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
					<p className="text-[10px] sm:text-xs text-blue-800">
						💡 <strong>{t("orderSteps.note")}:</strong> {t("orderSteps.scheduleNote")}
					</p>
				</div>
			</div>

			{/* Additional Notes - includes room configuration */}
			<div>
				<label className="block text-xs sm:text-sm font-medium text-amber-800 mb-1.5 sm:mb-2">
					{t("orderSteps.additionalNotesOptional")}
				</label>
				<textarea
					value={notesDisplayValue}
					onChange={(e) => {
						// Extract user notes (remove room config prefix if present)
						const inputValue = e.target.value;
						if (roomConfigSummary && inputValue.startsWith(roomConfigSummary)) {
							const userNotes = inputValue.substring(roomConfigSummary.length).trim();
							setFormData((prev) => ({
								...prev,
								notes: userNotes,
							}));
						} else {
							setFormData((prev) => ({
								...prev,
								notes: inputValue,
							}));
						}
					}}
					placeholder={t("orderSteps.additionalNotesPlaceholder")}
					rows={5}
					className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 resize-none"
				/>
				<p className="text-[10px] sm:text-xs text-amber-600/70 mt-0.5 sm:mt-1">
					{t("orderSteps.additionalNotesHint")}
				</p>
			</div>

			{/* Summary */}
			<div className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
				<h4 className="text-xs sm:text-sm font-semibold text-green-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
					<svg
						className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					{t("orderSteps.readyToSubmit")}
				</h4>
				<p className="text-xs sm:text-sm text-green-800">
					{t("orderSteps.submitDescription")}
				</p>
			</div>
		</div>
	);
}

