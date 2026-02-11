"use client";

import { formatDate, getTodayString } from "../../utils/dateUtils";
import { useTranslation } from "@/hooks/useTranslation";

const TIME_SLOTS = [
	"08:00",
	"08:30",
	"09:00",
	"09:30",
	"10:00",
	"10:30",
	"11:00",
	"11:30",
	"12:00",
	"12:30",
	"13:00",
	"13:30",
	"14:00",
	"14:30",
	"15:00",
	"15:30",
	"16:00",
	"16:30",
	"17:00",
	"17:30",
	"18:00",
];

export function ScheduleDetailsStep({ formData, setFormData }) {
	const { t } = useTranslation();
	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	return (
		<div className="space-y-4 sm:space-y-5 lg:space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
				<div>
					<label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
						{t("modalSteps.scheduleDetails.preferredDate")} *
					</label>
					<input
						type="date"
						value={formData.date || ""}
						onChange={(e) =>
							handleInputChange("date", e.target.value)
						}
						min={getTodayString()}
						className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
					/>
					{formData.date && (
						<p className="text-[10px] sm:text-xs text-gray-600 mt-1">
							{formatDate(formData.date)}
						</p>
					)}
				</div>

				<div>
					<label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
						{t("modalSteps.scheduleDetails.preferredTime")} *
					</label>
					<select
						value={formData.time}
						onChange={(e) =>
							handleInputChange("time", e.target.value)
						}
						className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-orange-400 focus:border-transparent"
					>
						<option value="">{t("modalSteps.scheduleDetails.selectTime")}</option>
						{TIME_SLOTS.map((time) => (
							<option key={time} value={time}>
								{time}
							</option>
						))}
					</select>
				</div>
			</div>

			<div>
				<label
					htmlFor="description"
					className="text-xs sm:text-sm font-medium text-gray-700 block mb-1.5 sm:mb-2"
				>
					{t("modalSteps.scheduleDetails.serviceDescription")}
				</label>
				<textarea
					id="description"
					placeholder={t("modalSteps.scheduleDetails.describeWhatNeedsToBeDone")}
					value={formData.description}
					onChange={(e) =>
						handleInputChange("description", e.target.value)
					}
					className="mt-1 w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
					rows={3}
				/>
			</div>
		</div>
	);
}
