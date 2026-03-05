"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllCompanies } from "@/store/slices/companiesSlice";
import { updateCompanyAssignmentsThunk } from "@/store/slices/usersSlice"; 
// 🟢 بنستدعي الـ API بتاعك اللي بيهندل التوكن والمسار 🟢
import { adminCompaniesV2Api } from "@/lib/api"; 
import { useState, useEffect, useMemo } from "react";
import { useGlobalToast } from "@/hooks/useGlobalToast";

export default function AssignCompanyModal({ isOpen, onClose, user }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { toast } = useGlobalToast();

    const { companies, isLoading: isLoadingCompanies } = useAppSelector((state) => state.companies);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
    
    // State لحفظ الاختيارات
    const [selections, setSelections] = useState({});

    // جلب كل الشركات للسيستم
    useEffect(() => {
        if (isOpen && (!companies || companies.length === 0)) {
            dispatch(fetchAllCompanies());
        }
    }, [isOpen, companies, dispatch]);

    // 🟢 جلب شركات اليوزر الحالية بدالة الـ apiRequest عشان التوكن 🟢
    useEffect(() => {
        const fetchUserCompanies = async () => {
            if (user && isOpen) {
                setIsLoadingAssignments(true);
                try {
                    // استخدام دالتك اللي بتظبط الـ baseURL والتوكن أوتوماتيك
                    const response = await adminCompaniesV2Api.getUserCompanies(user.id);
                    
                    const initialSelections = {};

                    if (response?.success && Array.isArray(response?.data)) {
                        // البوست مان بتاعك وضح إن الشركات راجعة كـ Array جوه data
                        response.data.forEach(company => {
                            const compId = company.id;
                            const type = company.type || 'internal';

                            if (compId) {
                                if (!initialSelections[compId]) {
                                    initialSelections[compId] = { internal: false, external: false };
                                }
                                if (type === 'internal') initialSelections[compId].internal = true;
                                if (type === 'external') initialSelections[compId].external = true;
                            }
                        });
                    }
                    
                    setSelections(initialSelections);
                } catch (error) {
                    console.error("Failed to fetch user's companies", error);
                    toast.error("Failed to load user's current companies");
                } finally {
                    setIsLoadingAssignments(false);
                }
            }
        };

        fetchUserCompanies();
        setSearchQuery(""); // تصفير البحث
    }, [user, isOpen]);

    // فلترة الشركات للبحث
    const filteredCompanies = useMemo(() => {
        if (!companies) return [];
        return companies.filter(company => 
            company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (company.email && company.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [companies, searchQuery]);

    // دالة تغيير حالة الاختيار
    const handleToggle = (companyId, type) => {
        setSelections(prev => {
            const currentCompanySelections = prev[companyId] || { internal: false, external: false };
            return {
                ...prev,
                [companyId]: {
                    ...currentCompanySelections,
                    [type]: !currentCompanySelections[type]
                }
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const assignments = [];
        
        Object.entries(selections).forEach(([companyId, types]) => {
            if (types.internal) {
                assignments.push({ company_id: parseInt(companyId), type: "internal" });
            }
            if (types.external) {
                assignments.push({ company_id: parseInt(companyId), type: "external" });
            }
        });

        try {
            await dispatch(updateCompanyAssignmentsThunk({
                userId: user.id,
                payload: { assignments }
            })).unwrap();

            toast.success("Companies updated successfully");
            onClose();
        } catch (error) {
            toast.error(error?.message || error || t("common.error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-scale-in overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Assign Companies</h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">User: <span className="text-indigo-600">{user.name}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 bg-white">
                    {/* Search */}
                    <div className="relative shrink-0">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search companies..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:bg-white transition-all"
                            disabled={isLoadingAssignments}
                        />
                    </div>

                    {/* Companies List */}
                    <div className="flex-1 space-y-3 overflow-y-auto min-h-[250px] pr-1 mt-2">
                        {isLoadingCompanies || isLoadingAssignments ? (
                            <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-3">
                                <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>{isLoadingAssignments ? "Loading user's companies..." : "Loading companies list..."}</span>
                            </div>
                        ) : filteredCompanies.length > 0 ? (
                            filteredCompanies.map(company => {
                                const isInternal = selections[company.id]?.internal || false;
                                const isExternal = selections[company.id]?.external || false;
                                const isSelected = isInternal || isExternal;

                                return (
                                    <div key={company.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${isSelected ? 'border-indigo-400 bg-indigo-50/30 shadow-sm' : 'border-slate-100 hover:border-slate-300'}`}>
                                        
                                        {/* Company Info */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                                {company.logo ? (
                                                    <img src={`https://api.angebotsprofi.ch${company.logo}`} alt={company.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{company.name}</p>
                                                {company.email && <p className="text-xs text-slate-500 truncate">{company.email}</p>}
                                            </div>
                                        </div>

                                        {/* Toggle Checkboxes */}
                                        <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg border border-slate-100 shrink-0">
                                            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${isInternal ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isInternal}
                                                    onChange={() => handleToggle(company.id, 'internal')}
                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" 
                                                />
                                                <span className="text-xs font-bold uppercase tracking-wider">Internal</span>
                                            </label>
                                            
                                            <div className="w-px h-5 bg-slate-200"></div>

                                            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${isExternal ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isExternal}
                                                    onChange={() => handleToggle(company.id, 'external')}
                                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" 
                                                />
                                                <span className="text-xs font-bold uppercase tracking-wider">External</span>
                                            </label>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                No companies found matching your search.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting || isLoadingAssignments}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isLoadingAssignments}
                        className="flex items-center justify-center min-w-[150px] gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Saving...
                            </>
                        ) : (
                            "Save Assignments"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}