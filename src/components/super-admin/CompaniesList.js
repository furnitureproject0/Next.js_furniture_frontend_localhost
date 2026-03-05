"use client";
import { useState, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
    updateCompanyThunk,
    activateCompanyThunk,
    suspendCompanyThunk,
} from "@/store/slices/companiesSlice";
import { useTranslation } from "@/hooks/useTranslation";
import EditCompanyModal from "./modals/EditCompanyModal";

// Company Icon Component
const CompanyIcon = ({ type }) => {
    switch (type?.toLowerCase()) {
        case "shipping":
            return (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 1a2 2 0 00-2 2v4h4V3a2 2 0 00-2-2zm14 0a2 2 0 00-2 2v4h4V3a2 2 0 00-2-2zm-7 2a1 1 0 102 0 1 1 0 00-2 0zM3 9v6a2 2 0 002 2h14a2 2 0 002-2V9H3z" />
                </svg>
            );
        case "warehouse":
            return (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            );
        case "retail":
            return (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
            );
        default:
            return (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
            );
    }
};

// Gradient helper function
const getGradientByType = (type) => {
    switch (type?.toLowerCase()) {
        case "shipping":
            return "from-blue-500 to-cyan-400";
        case "warehouse":
            return "from-purple-500 to-pink-400";
        case "retail":
            return "from-orange-500 to-red-400";
        default:
            return "from-slate-500 to-slate-400";
    }
};

const CompanyCard = ({ company, onEdit, onDelete, onToggleStatus, t, index }) => {
    const cardRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setMousePos({ x, y });
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const tiltX = (y - centerY) / 25;
        const tiltY = (centerX - x) / 25;
        setTilt({ x: tiltX, y: tiltY });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    // تجهيز رابط اللوجو
    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        return `https://api.angebotsprofi.ch${logoPath}`; 
    };

    const logoUrl = getLogoUrl(company.logo);

    return (
        <div 
            ref={cardRef}
            className="group/card relative bg-white border border-primary-100 hover:border-primary-400/50 rounded-2xl p-6 transition-all duration-300 animate-slide-in overflow-hidden"
            style={{ 
                animationDelay: `${index * 60}ms`,
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                boxShadow: tilt.x !== 0 ? '0 30px 60px -12px rgba(34, 132, 230, 0.15)' : 'none'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div 
                className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-30 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, var(--color-primary-200), transparent 70%)`
                }}
            ></div>

            <div className="relative flex items-start justify-between z-10">
                <div className="flex items-start gap-6 flex-1">
                    <div className={`relative w-20 h-20 ${getGradientByType(company.type)} rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-500 border-2 border-white/20 animate-shine overflow-hidden`}>
                        {logoUrl ? (
                            <img src={logoUrl} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                            <CompanyIcon type={company.type} />
                        )}
                        <div className="absolute -inset-4 bg-white/20 rounded-full blur-2xl opacity-0 group-hover/card:opacity-60 transition-opacity animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2.5">
                            <h3 className="text-xl font-bold text-slate-800 group-hover/card:text-primary-600 transition-colors">
                                {company.name || "Unnamed Company"}
                            </h3>
                            <div className="relative">
                                <span
                                    className={`px-3.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border shadow-sm ${
                                        company.available || company.status === 'active'
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-gray-50 text-gray-600 border-gray-200"
                                    }`}
                                >
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${company.available || company.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                    {company.available || company.status === 'active' ? (t("superAdmin.companyDetails.active") || "Active") : (t("superAdmin.companyDetails.inactive") || "Inactive")}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-4 px-1">
                            {company.url && (
                                <a
                                    href={company.url.startsWith("http") ? company.url : `https://${company.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 text-sm font-medium text-primary-500 hover:text-primary-700 transition-colors group/link"
                                >
                                    <div className="w-5 h-5 rounded-lg bg-primary-100 flex items-center justify-center group-hover/link:animate-bounce-subtle">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9" />
                                        </svg>
                                    </div>
                                    {company.url}
                                </a>
                            )}
                            {company.email && (
                                <div className="flex items-center gap-2.5 text-sm text-slate-500 font-medium">
                                    <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    {company.email}
                                </div>
                            )}
                            {company.phone && (
                                <div className="flex items-center gap-2.5 text-sm text-slate-500 font-medium">
                                    <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28m1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516" />
                                        </svg>
                                    </div>
                                    {company.phone}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 group/tag">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("superAdmin.companyDetails.type") || "Type"}:</span>
                                <span className="text-xs font-bold text-slate-700 group-hover/tag:text-primary-600 transition-colors uppercase tracking-tight">{company.type || t("common.nA")}</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 group/tag">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("superAdmin.companyDetails.services") || "Services"}:</span>
                                <span className="text-xs font-bold text-slate-700 group-hover/tag:text-primary-600 transition-colors uppercase tracking-tight">{company.services ? (Array.isArray(company.services) ? company.services.join(', ') : company.services) : t("common.nA")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-6">
                    <div className="flex items-center gap-6">
                        {/* Joined Date */}
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                {t("superAdmin.companyDetails.joined") || "Joined"}
                            </p>
                            <div className="flex items-center gap-2 text-slate-800">
                                <svg className="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-xs font-bold uppercase">{company.createdAt ? new Date(company.createdAt).toLocaleDateString() : (company.joined || t("common.labels.notSet")?.toUpperCase() || "NOT SET")}</p>
                            </div>
                        </div>

                        {/* Last Activity */}
                        <div className="text-right border-l border-slate-100 pl-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                {t("superAdmin.companyDetails.lastActivity") || "Last Activity"}
                            </p>
                            <div className="flex items-center gap-2 text-slate-800">
                                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-xs font-bold uppercase">{company.lastActivity || t("common.labels.notSet")?.toUpperCase() || "NOT SET"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 shadow-sm opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-x-4 group-hover/card:translate-x-0">
                        <button
                            onClick={() => onToggleStatus(company)}
                            className="group/btn p-2 text-slate-500 hover:text-green-600 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm"
                            title={company.available || company.status === 'active' ? (t("superAdmin.companyDetails.deactivateCompany") || "Deactivate") : (t("superAdmin.companyDetails.activateCompany") || "Activate")}
                        >
                            <svg className={`w-5 h-5 group-hover/btn:scale-110 transition-transform ${company.available || company.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onEdit(company)}
                            className="group/btn p-2 text-slate-500 hover:text-primary-600 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm"
                            title={t("superAdmin.companyDetails.editCompany") || "Edit"}
                        >
                            <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function CompaniesList({ companies }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [editingCompany, setEditingCompany] = useState(null);

    const handleEdit = (company) => {
        setEditingCompany(company);
    };

    const handleToggleStatus = (company) => {
        if (company.available || company.status === 'active') {
            dispatch(suspendCompanyThunk(company.id));
        } else {
            dispatch(activateCompanyThunk(company.id));
        }
    };

    if (!Array.isArray(companies) || companies.length === 0) {
        return (
            <div className="bg-white border border-primary-200/40 rounded-lg sm:rounded-xl p-8 sm:p-10 lg:p-12 text-center animate-scale-in">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-10 h-10 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                    </svg>
                </div>
                <p className="text-slate-600 font-medium text-lg">
                    {t("superAdmin.companyManagement.noCompaniesFound") || "No companies found."}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-5">
                {companies.map((company, index) => {
                    // 🟢 ضمان مفتاح فريد دائمًا حتى لو الـ id غير موجود 🟢
                    const uniqueKey = company?.id ? `company-${company.id}` : `company-fallback-${index}`;
                    
                    return (
                        <CompanyCard
                            key={uniqueKey}
                            company={company}
                            onEdit={handleEdit}
                            onToggleStatus={handleToggleStatus}
                            t={t}
                            index={index}
                        />
                    );
                })}
            </div>

            {/* Edit Company Modal */}
            {editingCompany && (
                <EditCompanyModal
                    isOpen={!!editingCompany}
                    onClose={() => setEditingCompany(null)}
                    company={editingCompany}
                />
            )}
        </>
    );
}