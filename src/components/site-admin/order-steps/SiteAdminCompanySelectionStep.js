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
        <div className="space-y-6">
            {/* Page Title */}
            <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-amber-900 mb-2">
                    {t("orderSteps.companySelection") || "Company & Order Type"}
                </h3>
                <p className="text-sm sm:text-base text-amber-700/70">
                    {t("orderSteps.companySelectionDesc") || "Select the company and order type for this order"}
                </p>
            </div>

            {/* Company Scope Selection */}
            <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                    {t("siteAdmin.companyScope") || "Company Type"} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Internal Company */}
                    <button
                        type="button"
                        onClick={() => onCompanyScopeChange("internal")}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${companyScope === "internal"
                            ? "border-orange-500 bg-orange-50 shadow-md"
                            : "border-orange-200 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${companyScope === "internal" ? "border-orange-500 bg-orange-500" : "border-gray-300"
                                }`}>
                                {companyScope === "internal" && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-amber-900 mb-1">
                                    {t("siteAdmin.internalCompany") || "Internal Company"}
                                </h4>
                                <p className="text-xs text-amber-600/70">
                                    {t("siteAdmin.internalCompanyDesc") || "Companies managed by your organization"}
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* External Company */}
                    <button
                        type="button"
                        onClick={() => onCompanyScopeChange("external")}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${companyScope === "external"
                            ? "border-orange-500 bg-orange-50 shadow-md"
                            : "border-orange-200 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${companyScope === "external" ? "border-orange-500 bg-orange-500" : "border-gray-300"
                                }`}>
                                {companyScope === "external" && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-amber-900 mb-1">
                                    {t("siteAdmin.externalCompany") || "External Company"}
                                </h4>
                                <p className="text-xs text-amber-600/70">
                                    {t("siteAdmin.externalCompanyDesc") || "Third-party service providers"}
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Order Type Selection (Only for Internal Companies) */}
            {companyScope === "internal" && (
                <div>
                    <label className="block text-sm font-semibold text-amber-900 mb-3">
                        {t("siteAdmin.orderType") || "Order Type"} <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Order */}
                        <button
                            type="button"
                            onClick={() => onOrderTypeChange("order")}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${orderType === "order"
                                    ? "border-orange-500 bg-orange-50 shadow-md"
                                    : "border-orange-200 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${orderType === "order" ? "border-orange-500 bg-orange-500" : "border-gray-300"
                                    }`}>
                                    {orderType === "order" && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-amber-900 mb-1">
                                        {t("siteAdmin.orderTypeOrder") || "Order"}
                                    </h4>
                                    <p className="text-xs text-amber-600/70">
                                        {t("siteAdmin.orderTypeOrderDesc") || "Create a confirmed order"}
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Offer */}
                        <button
                            type="button"
                            onClick={() => onOrderTypeChange("offer")}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${orderType === "offer"
                                    ? "border-orange-500 bg-orange-50 shadow-md"
                                    : "border-orange-200 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${orderType === "offer" ? "border-orange-500 bg-orange-500" : "border-gray-300"
                                    }`}>
                                    {orderType === "offer" && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-amber-900 mb-1">
                                        {t("siteAdmin.orderTypeOffer") || "Offer"}
                                    </h4>
                                    <p className="text-xs text-amber-600/70">
                                        {t("siteAdmin.orderTypeOfferDesc") || "Create a price quote"}
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Company Selection */}
            <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                    {t("siteAdmin.selectCompany") || "Select Company"} <span className="text-red-500">*</span>
                </label>

                {isLoadingCompanies ? (
                    <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl text-center">
                        <div className="inline-block w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-amber-700 mt-2">{t("common.loading") || "Loading companies..."}</p>
                    </div>
                ) : companiesError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-700">{companiesError}</p>
                    </div>
                ) : companies && companies.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
                        {companies.map((company) => (
                            <button
                                key={company.id}
                                type="button"
                                onClick={() => onCompanyChange(company.id)}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${selectedCompanyId === company.id
                                    ? "border-orange-500 bg-orange-50 shadow-md"
                                    : "border-orange-200 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${selectedCompanyId === company.id ? "border-orange-500 bg-orange-500" : "border-gray-300"
                                        }`}>
                                        {selectedCompanyId === company.id && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-amber-900 mb-0.5 truncate">
                                            {company.name}
                                        </h4>
                                        {company.email && (
                                            <p className="text-xs text-amber-600/70 truncate">
                                                {company.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                        <svg className="w-12 h-12 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-sm text-yellow-800">
                            {t("siteAdmin.noCompanies") || "No companies available"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
