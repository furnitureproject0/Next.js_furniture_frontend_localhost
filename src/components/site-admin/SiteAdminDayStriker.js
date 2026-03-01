"use client";

import { useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function SiteAdminDayStriker({ 
    selectedDate, 
    onDateSelect, 
    busyDates = [],
    onOpenCalendar
}) {
    const { t, currentLanguage } = useTranslation();
    const isRTL = currentLanguage === 'ar';

    const days = useMemo(() => {
        const baseDate = selectedDate ? new Date(selectedDate) : new Date();
        const items = [];
        
        // Start 2 days before the selected/base date
        const startDate = new Date(baseDate);
        startDate.setDate(startDate.getDate() - 2);

        // Generate 15 days to ensure we fill the width
        for (let i = 0; i < 15; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            
            const isToday = d.toDateString() === new Date().toDateString();
            const isSelected = selectedDate 
                ? d.toDateString() === new Date(selectedDate).toDateString()
                : isToday;

            const isBusy = busyDates.some(bd => {
                const busyD = new Date(bd);
                return busyD.toDateString() === d.toDateString();
            });

            items.push({
                date: d,
                dayNum: d.getDate(),
                dayName: d.toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }),
                monthName: d.toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' }),
                isSelected,
                isToday,
                isBusy
            });
        }
        return items;
    }, [selectedDate, currentLanguage, busyDates]);

    return (
        <div className={`flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {days.map((item, idx) => (
                <button
                    key={idx}
                    onClick={() => onDateSelect(item.date)}
                    className={`
                        flex-shrink-0 min-w-[64px] h-20 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer
                        ${item.isSelected 
                            ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105 z-10" 
                            : item.isToday
                                ? "bg-primary-50 border-primary-200 text-primary-700 font-bold"
                                : "bg-white border-primary-100 text-slate-500 hover:border-primary-300 hover:bg-primary-50/30"
                        }
                    `}
                >
                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">
                        {item.dayName}
                    </span>
                    <span className="text-lg font-black leading-none">
                        {item.dayNum}
                    </span>
                    {item.isBusy && !item.isSelected && (
                        <span className={`w-1 h-1 rounded-full ${item.isToday ? 'bg-primary-600' : 'bg-primary-400'}`} />
                    )}
                    {item.isSelected && (
                        <span className="text-[8px] font-bold mt-0.5">{item.monthName}</span>
                    )}
                </button>
            ))}

            {/* Calendar Button sticky at the end if possible, or just as last item */}
            <button
                onClick={onOpenCalendar}
                className="flex-shrink-0 w-14 h-20 rounded-2xl border-2 border-dashed border-primary-200 text-primary-500 hover:border-primary-400 hover:bg-primary-50 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
                title={t("calendar.filterByDate") || "Filter by Date"}
            >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <span className="text-[9px] font-bold uppercase">{t("common.buttons.view") || "View"}</span>
            </button>
        </div>
    );
}
