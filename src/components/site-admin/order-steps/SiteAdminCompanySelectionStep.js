"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function SiteAdminCompanySelectionStep({
    companyScope,
    onCompanyScopeChange,
    selectedCompanyId,
    onCompanyChange,
    companies,
    isLoadingCompanies,
    companiesError,
}) {
    const { t } = useTranslation();

    return (
        <div className="space-y-5">
            {/* Company Scope Selector */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2.5">
                    {t("siteAdmin.companyScope") || "Company Type"} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input 
                                type="radio" 
                                name="companyScope" 
                                checked={companyScope === "internal"} 
                                onChange={() => onCompanyScopeChange("internal")} 
                                className="peer appearance-none w-4 h-4 border border-gray-300 rounded-full checked:border-gray-800 transition-all cursor-pointer" 
                            />
                            <div className="absolute w-2 h-2 bg-gray-800 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors uppercase tracking-tight">
                            {t("siteAdmin.internalCompany") || "Internal Company"}
                        </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input 
                                type="radio" 
                                name="companyScope" 
                                checked={companyScope === "external"} 
                                onChange={() => onCompanyScopeChange("external")} 
                                className="peer appearance-none w-4 h-4 border border-gray-300 rounded-full checked:border-gray-800 transition-all cursor-pointer" 
                            />
                            <div className="absolute w-2 h-2 bg-gray-800 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors uppercase tracking-tight">
                            {t("siteAdmin.externalCompany") || "External Company"}
                        </span>
                    </label>
                </div>
            </div>

            {/* Company list selection */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2.5">
                    {t("siteAdmin.selectPrompt") || "Select Provider"} <span className="text-red-500">*</span>
                </label>

                {isLoadingCompanies ? (
                    <div className="py-2 flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[11px] text-gray-400 font-medium">{t("common.loading") || "Loading companies…"}</p>
                    </div>
                ) : companiesError ? (
                    <p className="text-xs text-red-600 font-medium">{companiesError}</p>
                ) : companies && companies.length > 0 ? (
                    companyScope === "internal" ? (
                        <div className="flex flex-wrap items-center gap-5 py-1">
                            {companies.map((c) => (
                                <label key={c.id} className="flex items-center gap-2.5 cursor-pointer group px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-white transition-all shadow-sm">
                                    <div className="relative flex items-center justify-center">
                                        <input 
                                            type="radio" 
                                            name="companySelection" 
                                            checked={selectedCompanyId === c.id} 
                                            onChange={() => onCompanyChange(c.id)} 
                                            className="peer appearance-none w-4 h-4 border border-gray-300 rounded-full checked:border-gray-800 transition-all cursor-pointer" 
                                        />
                                        <div className="absolute w-2 h-2 bg-gray-800 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                                    </div>
                                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">
                                        {c.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <div className="relative group max-w-md">
                            <select
                                value={selectedCompanyId || ""}
                                onChange={(e) => onCompanyChange(e.target.value ? Number(e.target.value) : null)}
                                className="w-full appearance-none px-4 py-2.5 text-xs font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800/5 focus:border-gray-800 text-slate-800 bg-white shadow-sm transition-all"
                            >
                                {companies.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ""}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    )
                ) : (
                    <p className="text-xs text-gray-400 font-medium italic">
                        {t("siteAdmin.noCompanies") || `No ${companyScope} companies available`}
                    </p>
                )}
            </div>
        </div>
    );
}
