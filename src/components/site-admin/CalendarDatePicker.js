"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { createPortal } from "react-dom";

const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const WEEKDAYS_AR = ["إث", "ثل", "أر", "خم", "جم", "سب", "أح"];

const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_DE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export default function CalendarDatePicker({ selectedDate, onDateSelect }) {
	const { t, currentLanguage } = useTranslation();
	const isRTL = currentLanguage === 'ar';
	
	const [currentWeekStart, setCurrentWeekStart] = useState(() => {
		const date = selectedDate ? new Date(selectedDate) : new Date();
		const day = date.getDay();
		const diff = date.getDate() - day + (day === 0 ? -6 : 1);
		return new Date(date.setDate(diff));
	});

	const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
	const [pickerYear, setPickerYear] = useState(currentWeekStart.getFullYear());
	const [pickerMonth, setPickerMonth] = useState(currentWeekStart.getMonth());

	const weekDays = useMemo(() => {
		const days = [];
		const start = new Date(currentWeekStart);
		
		for (let i = 0; i < 7; i++) {
			const date = new Date(start);
			date.setDate(start.getDate() + i);
			days.push(date);
		}
		
		return days;
	}, [currentWeekStart]);

	const handlePrevWeek = () => {
		const newStart = new Date(currentWeekStart);
		newStart.setDate(currentWeekStart.getDate() - 7);
		setCurrentWeekStart(newStart);
	};

	const handleNextWeek = () => {
		const newStart = new Date(currentWeekStart);
		newStart.setDate(currentWeekStart.getDate() + 7);
		setCurrentWeekStart(newStart);
	};

	const handleDateClick = (date) => {
		onDateSelect(date);
	};

	const handleMonthYearClick = () => {
		setPickerYear(currentWeekStart.getFullYear());
		setPickerMonth(currentWeekStart.getMonth());
		setShowMonthYearPicker(true);
	};

	const handleMonthYearSelect = () => {
		const newDate = new Date(pickerYear, pickerMonth, 1);
		const day = newDate.getDay();
		const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
		setCurrentWeekStart(new Date(newDate.setDate(diff)));
		setShowMonthYearPicker(false);
	};

	const isSelected = (date) => {
		if (!selectedDate) return false;
		const selected = new Date(selectedDate);
		return date.toDateString() === selected.toDateString();
	};

	const isToday = (date) => {
		const today = new Date();
		return date.toDateString() === today.toDateString();
	};

	const getWeekdayNames = () => {
		switch (currentLanguage) {
			case 'de':
				return WEEKDAYS_DE;
			case 'ar':
				return WEEKDAYS_AR;
			default:
				return WEEKDAYS_EN;
		}
	};

	const getMonthNames = () => {
		switch (currentLanguage) {
			case 'de':
				return MONTHS_DE;
			case 'ar':
				return MONTHS_AR;
			default:
				return MONTHS_EN;
		}
	};

	const weekdayNames = getWeekdayNames();
	const monthNames = getMonthNames();
	const displayWeekdays = isRTL ? [...weekdayNames].reverse() : weekdayNames;
	const displayDays = isRTL ? [...weekDays].reverse() : weekDays;

	const weekStart = weekDays[0];
	const monthYearText = `${monthNames[weekStart.getMonth()]} ${weekStart.getFullYear()}`;

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

	const modalContent = showMonthYearPicker && typeof window !== 'undefined' ? (
		<div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
			<div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-4 border border-orange-200">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-sm font-bold text-amber-900">
						{t("calendar.selectMonthYear") || "Select Month & Year"}
					</h3>
					<button
						onClick={() => setShowMonthYearPicker(false)}
						className="p-1 hover:bg-orange-50 rounded transition-colors cursor-pointer"
						aria-label={t("common.buttons.close") || "Close"}
					>
						<svg className="w-4 h-4 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Year Selector */}
				<div className="mb-4">
					<label className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2 block">
						{t("calendar.year") || "Year"}
					</label>
					<div className="grid grid-cols-5 gap-1">
						{years.map((year) => (
							<button
								key={year}
								onClick={() => setPickerYear(year)}
								className={`py-2 text-xs font-medium rounded transition-all cursor-pointer ${
									pickerYear === year
										? "bg-orange-500 text-white shadow-sm"
										: "bg-orange-50 text-amber-900 hover:bg-orange-100"
								}`}
							>
								{year}
							</button>
						))}
					</div>
				</div>

				{/* Month Selector */}
				<div className="mb-4">
					<label className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-2 block">
						{t("calendar.month") || "Month"}
					</label>
					<div className="grid grid-cols-3 gap-1">
						{monthNames.map((month, index) => (
							<button
								key={index}
								onClick={() => setPickerMonth(index)}
								className={`py-2 text-xs font-medium rounded transition-all cursor-pointer ${
									pickerMonth === index
										? "bg-orange-500 text-white shadow-sm"
										: "bg-orange-50 text-amber-900 hover:bg-orange-100"
								}`}
							>
								{month.substring(0, 3)}
							</button>
						))}
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2">
					<button
						onClick={() => setShowMonthYearPicker(false)}
						className="flex-1 px-3 py-2 text-xs text-amber-700 hover:text-amber-900 font-medium transition-colors cursor-pointer"
					>
						{t("common.buttons.cancel") || "Cancel"}
					</button>
					<button
						onClick={handleMonthYearSelect}
						className="flex-1 px-3 py-2 text-xs btn-primary font-medium rounded-lg transition-colors cursor-pointer"
					>
						{t("common.buttons.apply") || "Apply"}
					</button>
				</div>
			</div>
		</div>
	) : null;

	return (
		<>
			<div className="bg-white rounded-lg border border-orange-200/60 p-3 shadow-sm">
				{/* Header */}
				<div className="flex items-center justify-between mb-2">
					<button
						onClick={isRTL ? handleNextWeek : handlePrevWeek}
						className="p-1 hover:bg-orange-50 rounded transition-colors cursor-pointer"
						aria-label={t("calendar.previousWeek") || "Previous week"}
					>
						<svg 
							className="w-4 h-4 text-amber-700" 
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
							style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<button
						onClick={handleMonthYearClick}
						className="text-xs font-semibold text-amber-900 hover:text-orange-600 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-orange-50"
					>
						{monthYearText}
					</button>
					<button
						onClick={isRTL ? handlePrevWeek : handleNextWeek}
						className="p-1 hover:bg-orange-50 rounded transition-colors cursor-pointer"
						aria-label={t("calendar.nextWeek") || "Next week"}
					>
						<svg 
							className="w-4 h-4 text-amber-700" 
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
							style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>

				{/* Weekday headers */}
				<div className="grid grid-cols-7 gap-0.5 mb-1">
					{displayWeekdays.map((day, index) => (
						<div key={index} className="text-center text-[10px] font-medium text-amber-600/70 py-0.5">
							{day}
						</div>
					))}
				</div>

				{/* Week days */}
				<div className="grid grid-cols-7 gap-0.5">
					{displayDays.map((date, index) => {
						const selected = isSelected(date);
						const today = isToday(date);

						return (
							<button
								key={index}
								onClick={() => handleDateClick(date)}
								className={`h-8 flex items-center justify-center text-sm rounded transition-all cursor-pointer ${
									selected
										? "bg-orange-500 text-white font-semibold shadow-sm"
										: today
										? "bg-orange-100 text-orange-700 font-medium border border-orange-300"
										: "text-amber-900 hover:bg-orange-50"
								}`}
							>
								{date.getDate()}
							</button>
						);
					})}
				</div>

				{/* Clear selection button */}
				{selectedDate && (
					<button
						onClick={() => onDateSelect(null)}
						className="w-full mt-2 px-2 py-1 text-xs text-amber-700 hover:text-amber-900 hover:bg-orange-50 rounded transition-colors cursor-pointer"
					>
						{t("common.buttons.clearSelection") || "Clear Selection"}
					</button>
				)}
			</div>

			{/* Month/Year Picker Modal - Rendered at root level */}
			{modalContent && createPortal(modalContent, document.body)}
		</>
	);
}
