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
    orderType,
    onOrderTypeChange,
}) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            {/* Company Scope */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {t("siteAdmin.companyScope") || "Company Type"} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                        <input type="radio" name="companyScope" checked={companyScope === "internal"} onChange={() => onCompanyScopeChange("internal")} className="w-3.5 h-3.5 accent-gray-700" />
                        <span>{t("siteAdmin.internalCompany") || "Internal"}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                        <input type="radio" name="companyScope" checked={companyScope === "external"} onChange={() => onCompanyScopeChange("external")} className="w-3.5 h-3.5 accent-gray-700" />
                        <span>{t("siteAdmin.externalCompany") || "External"}</span>
                    </label>
                </div>
            </div>

            {/* Order Type (internal only) */}
            {companyScope === "internal" && (
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        {t("siteAdmin.orderType") || "Order Type"} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                            <input type="radio" name="orderType" checked={orderType === "order"} onChange={() => onOrderTypeChange("order")} className="w-3.5 h-3.5 accent-gray-700" />
                            <span>{t("siteAdmin.orderTypeOrder") || "Order"}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                            <input type="radio" name="orderType" checked={orderType === "offer"} onChange={() => onOrderTypeChange("offer")} className="w-3.5 h-3.5 accent-gray-700" />
                            <span>{t("siteAdmin.orderTypeOffer") || "Offer"}</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Company Select */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {t("siteAdmin.selectCompany") || "Select Company"} <span className="text-red-500">*</span>
                </label>

                {isLoadingCompanies ? (
                    <div className="py-4 text-center">
                        <div className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[11px] text-gray-400 mt-1">{t("common.loading") || "Loading…"}</p>
                    </div>
                ) : companiesError ? (
                    <p className="text-xs text-red-600">{companiesError}</p>
                ) : companies && companies.length > 0 ? (
                    <select
                        value={selectedCompanyId || ""}
                        onChange={(e) => onCompanyChange(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 bg-white"
                    >
                        <option value="">-- Select --</option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ""}</option>
                        ))}
                    </select>
                ) : (
                    <p className="text-xs text-gray-400">{t("siteAdmin.noCompanies") || "No companies available"}</p>
                )}
            </div>
        </div>
    );
}
