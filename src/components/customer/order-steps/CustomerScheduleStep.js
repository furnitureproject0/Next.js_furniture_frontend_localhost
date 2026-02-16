"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedRoomTypes } from "@/utils/i18nUtils";
import { useMemo } from "react";

export default function CustomerScheduleStep({ formData, setFormData, validationErrors = {} }) {
	const { t } = useTranslation();
	const ROOM_TYPES = getTranslatedRoomTypes(t);

	const roomConfigSummary = useMemo(() => {
		if (!formData.roomConfigurations || formData.roomConfigurations.length === 0) return "";
		return formData.roomConfigurations
			.filter(room => room.roomType && room.quantity)
			.map(room => {
				const name = ROOM_TYPES.find(rt => rt.id === room.roomType)?.name || room.roomType;
				return `${room.quantity} ${name}`;
			})
			.join(", ");
	}, [formData.roomConfigurations, ROOM_TYPES]);

	const handleDateChange = (e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }));
	const handleTimeChange = (e) => setFormData((prev) => ({ ...prev, scheduledTime: e.target.value }));

	const notesDisplayValue = useMemo(() => {
		const userNotes = formData.notes || "";
		if (roomConfigSummary) return userNotes ? `${roomConfigSummary}\n${userNotes}` : roomConfigSummary;
		return userNotes;
	}, [roomConfigSummary, formData.notes]);

	const getMinDate = () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow.toISOString().split("T")[0];
	};

	return (
		<div className="space-y-4">
			{/* Date & Time — two columns */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div>
					<label className="block text-xs font-medium text-gray-600 mb-1">
						{t("orderSteps.preferredDate") || "Date"} <span className="text-red-500">*</span>
					</label>
					<input
						type="date"
						value={formData.scheduledDate}
						onChange={handleDateChange}
						min={getMinDate()}
						className={`w-full px-2.5 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 text-gray-800 ${validationErrors.scheduledDate ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-gray-400"
							}`}
						required
					/>
					{validationErrors.scheduledDate && <p className="text-[10px] text-red-500 mt-0.5">{validationErrors.scheduledDate}</p>}
				</div>
				<div>
					<label className="block text-xs font-medium text-gray-600 mb-1">
						{t("orderSteps.preferredTime") || "Time"} <span className="text-red-500">*</span>
					</label>
					<input
						type="time"
						value={formData.scheduledTime}
						onChange={handleTimeChange}
						className={`w-full px-2.5 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 text-gray-800 ${validationErrors.scheduledTime ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-gray-400"
							}`}
						required
					/>
					{validationErrors.scheduledTime && <p className="text-[10px] text-red-500 mt-0.5">{validationErrors.scheduledTime}</p>}
				</div>
			</div>

			{/* Notes */}
			<div>
				<label className="block text-xs font-medium text-gray-600 mb-1">
					{t("orderSteps.additionalNotesOptional") || "Notes (optional)"}
				</label>
				<textarea
					value={notesDisplayValue}
					onChange={(e) => {
						const inputValue = e.target.value;
						if (roomConfigSummary && inputValue.startsWith(roomConfigSummary)) {
							setFormData((prev) => ({ ...prev, notes: inputValue.substring(roomConfigSummary.length).trim() }));
						} else {
							setFormData((prev) => ({ ...prev, notes: inputValue }));
						}
					}}
					placeholder={t("orderSteps.additionalNotesPlaceholder") || "Any special instructions…"}
					rows={3}
					className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none text-gray-800 placeholder-gray-400"
				/>
			</div>
		</div>
	);
}
