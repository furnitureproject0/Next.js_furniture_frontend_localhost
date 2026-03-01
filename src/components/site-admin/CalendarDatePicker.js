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

export default function CalendarDatePicker({ selectedDate, onDateSelect, busyDates = [] }) {
	const { t, currentLanguage } = useTranslation();
	const isRTL = currentLanguage === 'ar';

	const [currentMonth, setCurrentMonth] = useState(() => {
		const d = selectedDate ? new Date(selectedDate) : new Date();
		return new Date(d.getFullYear(), d.getMonth(), 1);
	});

	const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
	const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear());
	const [pickerMonth, setPickerMonth] = useState(currentMonth.getMonth());

	// Build all days for the month grid (includes padding from prev/next months)
	const calendarDays = useMemo(() => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();

		// First day of the month (0=Sun, 1=Mon, ...)
		const firstDay = new Date(year, month, 1).getDay();
		// Adjust to Monday-based (Mon=0, Tue=1, ..., Sun=6)
		const startPad = (firstDay + 6) % 7;

		// Days in this month
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		// Days from previous month to fill the first row
		const prevMonth = new Date(year, month, 0);
		const prevDays = prevMonth.getDate();

		const days = [];

		// Previous month padding
		for (let i = startPad - 1; i >= 0; i--) {
			const d = new Date(year, month - 1, prevDays - i);
			days.push({ date: d, isCurrentMonth: false });
		}

		// Current month
		for (let i = 1; i <= daysInMonth; i++) {
			days.push({ date: new Date(year, month, i), isCurrentMonth: true });
		}

		// Next month padding (fill to complete the last row)
		const remaining = 7 - (days.length % 7);
		if (remaining < 7) {
			for (let i = 1; i <= remaining; i++) {
				days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
			}
		}

		return days;
	}, [currentMonth]);

	const handlePrevMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
	};

	const handleNextMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
	};

	const handleDateClick = (date) => {
		onDateSelect(date);
	};

	const handleMonthYearClick = () => {
		setPickerYear(currentMonth.getFullYear());
		setPickerMonth(currentMonth.getMonth());
		setShowMonthYearPicker(true);
	};

	const handleMonthYearSelect = () => {
		setCurrentMonth(new Date(pickerYear, pickerMonth, 1));
		setShowMonthYearPicker(false);
	};

	const handleGoToToday = () => {
		const now = new Date();
		setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
	};

	const isSelected = (date) => {
		if (!selectedDate) return false;
		const selected = new Date(selectedDate);
		return date.toDateString() === selected.toDateString();
	};

	const isToday = (date) => {
		return date.toDateString() === new Date().toDateString();
	};

	const getWeekdayNames = () => {
		switch (currentLanguage) {
			case 'de': return WEEKDAYS_DE;
			case 'ar': return WEEKDAYS_AR;
			default: return WEEKDAYS_EN;
		}
	};

	const getMonthNames = () => {
		switch (currentLanguage) {
			case 'de': return MONTHS_DE;
			case 'ar': return MONTHS_AR;
			default: return MONTHS_EN;
		}
	};

	const weekdayNames = getWeekdayNames();
	const monthNames = getMonthNames();
	const displayWeekdays = isRTL ? [...weekdayNames].reverse() : weekdayNames;
	const displayDays = isRTL ? [...calendarDays].reverse() : calendarDays;

	const monthYearText = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

	const modalContent = showMonthYearPicker && typeof window !== 'undefined' ? (
		<div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
			<div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-4 border border-primary-200">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-sm font-bold text-slate-800">
						{t("calendar.selectMonthYear") || "Select Month & Year"}
					</h3>
					<button
						onClick={() => setShowMonthYearPicker(false)}
						className="p-1 hover:bg-primary-50 rounded transition-colors cursor-pointer"
						aria-label={t("common.buttons.close") || "Close"}
					>
						<svg className="w-4 h-4 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Year Selector */}
				<div className="mb-4">
					<label className="text-xs font-medium text-primary-600/70 uppercase tracking-wide mb-2 block">
						{t("calendar.year") || "Year"}
					</label>
					<div className="grid grid-cols-5 gap-1">
						{years.map((year) => (
							<button
								key={year}
								onClick={() => setPickerYear(year)}
								className={`py-2 text-xs font-medium rounded transition-all cursor-pointer ${
									pickerYear === year
										? "bg-primary-500 text-white shadow-sm"
										: "bg-primary-50 text-slate-800 hover:bg-primary-100"
								}`}
							>
								{year}
							</button>
						))}
					</div>
				</div>

				{/* Month Selector */}
				<div className="mb-4">
					<label className="text-xs font-medium text-primary-600/70 uppercase tracking-wide mb-2 block">
						{t("calendar.month") || "Month"}
					</label>
					<div className="grid grid-cols-3 gap-1">
						{monthNames.map((month, index) => (
							<button
								key={index}
								onClick={() => setPickerMonth(index)}
								className={`py-2 text-xs font-medium rounded transition-all cursor-pointer ${
									pickerMonth === index
										? "bg-primary-500 text-white shadow-sm"
										: "bg-primary-50 text-slate-800 hover:bg-primary-100"
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
						className="flex-1 px-3 py-2 text-xs text-slate-600 hover:text-slate-800 font-medium transition-colors cursor-pointer"
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
			<div className="bg-white rounded-xl border border-primary-200/60 p-3 shadow-sm">
				{/* Header */}
				<div className="flex items-center justify-between mb-3">
					<button
						onClick={isRTL ? handleNextMonth : handlePrevMonth}
						className="p-1.5 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
						aria-label={t("calendar.previousMonth") || "Previous month"}
					>
						<svg 
							className="w-4 h-4 text-slate-600" 
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
							style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>

					<div className="flex items-center gap-2">
						<button
							onClick={handleMonthYearClick}
							className="text-sm font-bold text-slate-800 hover:text-primary-600 transition-colors cursor-pointer px-3 py-1 rounded-lg hover:bg-primary-50"
						>
							{monthYearText}
						</button>
						<button
							onClick={handleGoToToday}
							className="text-[10px] font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
						>
							{t("calendar.today") || "Today"}
						</button>
					</div>

					<button
						onClick={isRTL ? handlePrevMonth : handleNextMonth}
						className="p-1.5 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
						aria-label={t("calendar.nextMonth") || "Next month"}
					>
						<svg 
							className="w-4 h-4 text-slate-600" 
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
						<div key={index} className="text-center text-[10px] font-semibold text-primary-600/70 py-1 uppercase tracking-wide">
							{day}
						</div>
					))}
				</div>

				{/* Month grid */}
				<div className="grid grid-cols-7 gap-0.5">
					{displayDays.map((dayObj, index) => {
						const selected = isSelected(dayObj.date);
						const today = isToday(dayObj.date);
						const inMonth = dayObj.isCurrentMonth;
						const busy = busyDates.some(bd => {
							const d = new Date(bd);
							return d.toDateString() === dayObj.date.toDateString();
						});

						return (
							<button
								key={index}
								onClick={() => handleDateClick(dayObj.date)}
								className={`
									h-10 flex flex-col items-center justify-center text-xs rounded-lg transition-all cursor-pointer relative
									${selected
										? "bg-primary-500 text-white font-bold shadow-md shadow-primary-500/20 scale-105"
										: today
											? "bg-primary-100 text-primary-700 font-bold border border-primary-300 ring-1 ring-primary-200"
											: inMonth
												? "text-slate-700 hover:bg-primary-50 font-medium"
												: "text-slate-300 hover:bg-slate-50"
									}
								`}
							>
								{busy && !selected && (
									<span className={`w-1 h-1 rounded-full mb-0.5 ${today ? 'bg-primary-600' : 'bg-primary-400'}`} />
								)}
								<span>{dayObj.date.getDate()}</span>
							</button>
						);
					})}
				</div>

				{/* Clear selection */}
				{selectedDate && (
					<button
						onClick={() => onDateSelect(null)}
						className="w-full mt-2 px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer font-medium"
					>
						{t("common.buttons.clearSelection") || "Clear Selection"}
					</button>
				)}
			</div>

			{/* Month/Year Picker Modal */}
			{modalContent && createPortal(modalContent, document.body)}
		</>
	);
}
