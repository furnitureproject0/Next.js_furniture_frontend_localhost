"use client";

import TimePicker24 from "@/components/TimePicker24";
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

	const notesDisplayValue = useMemo(() => {
		const userNotes = formData.notes || "";
		if (roomConfigSummary) return userNotes ? `${roomConfigSummary}\n${userNotes}` : roomConfigSummary;
		return userNotes;
	}, [roomConfigSummary, formData.notes]);

	return (
		<div className="space-y-4">
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
