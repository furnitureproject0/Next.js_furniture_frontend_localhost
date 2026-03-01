"use client";

import TimePicker24 from "@/components/TimePicker24";
import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { companyAdminApi, siteAdminApi } from "@/lib/api";
import { useCompanies } from "@/hooks/useCompanies";
import SiteAdminCompanySelectionStep from "@/components/site-admin/order-steps/SiteAdminCompanySelectionStep";

export default function CreateAppointmentPage() {
    const { t } = useTranslation();
    const { toast } = useGlobalToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email");
    const topRef = useRef(null);

    // Company selection
    const [companyScope, setCompanyScope] = useState("internal");
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [orderType, setOrderType] = useState("order");

    // Pre-fill client from email param
    useEffect(() => {
        if (emailParam) {
            const fetchClient = async () => {
                try {
                    const response = await companyAdminApi.searchClient({ search: emailParam.trim(), limit: 1 });
                    if (response?.success && response?.data?.clients?.length > 0) {
                        const client = response.data.clients[0];
                        setSelectedClient(client);
                        setClientName(client.name || "");
                        setClientEmail(client.email || "");
                        setClientPhone(client.phone || (client.phones?.[0]?.phone) || "");
                        setClientAddress(client.address || (client.location?.address) || "");
                    }
                } catch (err) {
                    console.error("Error pre-filling client:", err);
                }
            };
            fetchClient();
        }
    }, [emailParam]);

    // Fetch companies
    const {
        internalCompanies,
        externalCompanies,
        isLoading: isLoadingCompanies,
        error: companiesError
    } = useCompanies(true);

    const availableCompanies = useMemo(() =>
        companyScope === "internal" ? internalCompanies : externalCompanies,
        [companyScope, internalCompanies, externalCompanies]);

    // Client search
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // Selected client fields
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [clientAddress, setClientAddress] = useState("");

    // Appointment fields
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");
    const [appointmentNotes, setAppointmentNotes] = useState("");

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateClientModal, setShowCreateClientModal] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);

    // New client modal fields
    const [newClientName, setNewClientName] = useState("");
    const [newClientPhone, setNewClientPhone] = useState("");
    const [newClientEmail, setNewClientEmail] = useState("");
    const [newClientAddress, setNewClientAddress] = useState("");
    const [isCreatingClient, setIsCreatingClient] = useState(false);

    // Debounce search
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setSearchPerformed(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await companyAdminApi.searchClient({ search: searchQuery.trim(), limit: 10 });
                if (response?.success && response?.data) {
                    const clients = response.data.clients || response.data || [];
                    setSearchResults(Array.isArray(clients) ? clients : []);
                } else {
                    setSearchResults([]);
                }
            } catch (err) {
                console.error("Search error:", err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
                setSearchPerformed(true);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectClient = (client) => {
        setSelectedClient(client);
        setClientName(client.name || "");
        setClientEmail(client.email || "");
        setClientPhone(client.phone || "");
        setClientAddress(client.address || "");
        setSearchQuery("");
        setSearchResults([]);
        setSearchPerformed(false);
    };

    const handleClearClient = () => {
        setSelectedClient(null);
        setClientName("");
        setClientEmail("");
        setClientPhone("");
        setClientAddress("");
    };

    const handleCreateClient = async () => {
        if (!selectedCompanyId) {
            toast.error("Please select a company first");
            return;
        }
        if (!newClientName.trim() || !newClientEmail.trim()) {
            toast.error("Name and email are required");
            return;
        }
        setIsCreatingClient(true);
        try {
            const response = await companyAdminApi.createClient(selectedCompanyId, {
                name: newClientName.trim(),
                email: newClientEmail.trim(),
                phone: newClientPhone.trim(),
                address: newClientAddress.trim(),
            });

            if (response?.success && response?.data) {
                const createdClient = response.data.client || response.data;
                handleSelectClient({
                    id: createdClient.id,
                    name: newClientName.trim(),
                    email: newClientEmail.trim(),
                    phone: newClientPhone.trim(),
                    address: newClientAddress.trim(),
                });
                setShowCreateClientModal(false);
                setNewClientName("");
                setNewClientPhone("");
                setNewClientEmail("");
                setNewClientAddress("");
                toast.success("Client created successfully");
            } else {
                throw new Error(response?.message || "Failed to create client");
            }
        } catch (err) {
            console.error("Create client error:", err);
            toast.error(err.message || "Failed to create client");
        } finally {
            setIsCreatingClient(false);
        }
    };

    // Navigation guard
    const hasUnsavedData = useCallback(() => {
        return !!selectedCompanyId || !!selectedClient || !!appointmentDate || !!appointmentTime || !!clientName.trim();
    }, [selectedCompanyId, selectedClient, appointmentDate, appointmentTime, clientName]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedData()) { e.preventDefault(); e.returnValue = ""; }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedData]);

    useEffect(() => {
        window.history.pushState({ guard: true }, "");
        const handlePopState = () => {
            if (hasUnsavedData()) {
                window.history.pushState({ guard: true }, "");
                setPendingNavigation("back");
                setShowLeaveConfirm(true);
            } else { router.back(); }
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [hasUnsavedData, router]);

    const handleCancel = () => {
        if (hasUnsavedData()) {
            setPendingNavigation("dashboard");
            setShowLeaveConfirm(true);
        } else {
            router.push("/site-admin/dashboard");
        }
    };

    const handleConfirmLeave = () => {
        setShowLeaveConfirm(false);
        if (pendingNavigation === "back") window.history.go(-2);
        else router.push("/site-admin/dashboard");
    };

    // Validation
    const canSubmit = !!selectedCompanyId && !!selectedClient && !!appointmentDate && !!appointmentTime;

    const handleSubmit = async () => {
        if (!selectedCompanyId) {
            setError("Please select a company");
            return;
        }

        setError(null);
        setIsSubmitting(true);
        try {
            let preferredTime = appointmentTime;
            if (preferredTime.length === 5) preferredTime += ":00";

            const requestBody = {
                email: clientEmail.trim(),
                company_id: selectedCompanyId,
                execution_date: appointmentDate,
                execution_time: preferredTime,
                primary_location: {
                    address: clientAddress.trim() || "N/A",
                    floor: 0,
                    has_elevator: false,
                    type: "apartment",
                    area: 0
                },
                secondary_location: {
                    address: "",
                    floor: 0,
                    has_elevator: false,
                    type: ""
                },
                number_of_rooms: 0,
                rooms: [],
                // Virtual service to satisfy backend requirements and stats categorization
                services: [], 
                notes: appointmentNotes || `Appointment for ${clientName}`,
                type: "appointment",
                status: "scheduled"
            };

            const response = await siteAdminApi.createAppointment(requestBody);

            if (response && response.success) {
                toast.success(t("siteAdmin.dashboard.appointmentCreatedSuccess") || "Appointment created successfully!");
                router.push("/site-admin/dashboard");
            } else {
                throw new Error(response?.message || "Failed to create appointment");
            }
        } catch (err) {
            console.error("Submission error:", err);
            const errorMessage = err.message || "Failed to create appointment";
            setError(errorMessage);
            toast.error(errorMessage);
            topRef.current?.scrollIntoView({ behavior: "smooth" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tomorrow's date as min
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                <div className="w-full px-4 sm:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <button onClick={handleCancel} className="p-1.5 hover:bg-white/20 rounded-md transition-colors" title="Back">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h1 className="text-xs sm:text-sm font-bold text-white">
                                {t("siteAdmin.dashboard.createAppointment") || "Create Appointment"}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Body */}
            <div ref={topRef} className="max-w-2xl mx-auto px-4 sm:px-8 py-8">
                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Section 0: Company Selection */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-blue-100">
                            <h2 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {t("orderSteps.companySelection") || "Company Selection"}
                            </h2>
                        </div>
                        <div className="p-5">
                            <SiteAdminCompanySelectionStep
                                companyScope={companyScope}
                                onCompanyScopeChange={setCompanyScope}
                                selectedCompanyId={selectedCompanyId}
                                onCompanyChange={setSelectedCompanyId}
                                companies={availableCompanies}
                                isLoadingCompanies={isLoadingCompanies}
                                companiesError={companiesError}
                            />
                        </div>
                    </div>

                    {/* Section 1: Client Search */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-blue-100">
                            <h2 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                1. {t("orderSteps.selectCustomer") || "Select Client"}
                            </h2>
                        </div>
                        <div className="p-5 space-y-4">
                            {!selectedClient ? (
                                <>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={t("siteAdmin.searchClient") || "Search by name, email, or phone..."}
                                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                                        />
                                        {isSearching && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500/30 border-t-blue-500"></div>
                                            </div>
                                        )}
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                            {searchResults.map((client) => (
                                                <button
                                                    key={client.id}
                                                    onClick={() => handleSelectClient(client)}
                                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3"
                                                >
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                        {(client.name || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                                                        <p className="text-xs text-gray-500 truncate">{client.email} {client.phone ? `· ${client.phone}` : ""}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {searchPerformed && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
                                        <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                            <p className="text-sm font-medium text-gray-600 mb-3">No client found</p>
                                            <button
                                                onClick={() => {
                                                    if (!selectedCompanyId) { toast.error("Please select a company first"); return; }
                                                    setNewClientName(searchQuery);
                                                    setShowCreateClientModal(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-lg hover:shadow-md transition-all"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                {t("orderSteps.createUser") || "Create Customer"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                                                {clientName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{clientName}</p>
                                                <p className="text-xs text-gray-500">{clientEmail}</p>
                                            </div>
                                        </div>
                                        <button onClick={handleClearClient} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors">
                                            Change
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">{t("common.labels.name") || "Full Name"}</label>
                                            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">{t("common.labels.email") || "Email"}</label>
                                            <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">{t("common.labels.phone") || "Phone"}</label>
                                            <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">{t("common.labels.address") || "Address"}</label>
                                            <input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Date & Time */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-blue-100">
                            <h2 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                2. {t("orderSteps.scheduleNotes") || "Date & Time"}
                            </h2>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("orderSteps.preferredDate") || "Date"} *</label>
                                    <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} min={minDate} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("orderSteps.preferredTime") || "Time"} *</label>
                                    <TimePicker24 value={appointmentTime} onChange={(time) => setAppointmentTime(time)} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("common.labels.notes") || "Notes"}</label>
                                <textarea value={appointmentNotes} onChange={(e) => setAppointmentNotes(e.target.value)} rows={3} placeholder="Any notes..." className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pb-8">
                        <button onClick={handleCancel} className="flex-1 px-5 py-3 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                        <button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="flex-[2] px-5 py-3 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                            {isSubmitting ? "Creating…" : t("siteAdmin.dashboard.createAppointment")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Client Modal */}
            {showCreateClientModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white font-bold flex justify-between">
                            <span>{t("orderSteps.createUser") || "Create New Customer"}</span>
                            <button onClick={() => setShowCreateClientModal(false)}>✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" placeholder="Full Name" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="w-full p-2.5 border rounded-xl" />
                            <input type="tel" placeholder="Phone" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} className="w-full p-2.5 border rounded-xl" />
                            <input type="email" placeholder="Email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} className="w-full p-2.5 border rounded-xl" />
                            <input type="text" placeholder="Address" value={newClientAddress} onChange={(e) => setNewClientAddress(e.target.value)} className="w-full p-2.5 border rounded-xl" />
                            <div className="flex gap-3">
                                <button onClick={() => setShowCreateClientModal(false)} className="flex-1 p-2.5 border rounded-xl">Cancel</button>
                                <button onClick={handleCreateClient} disabled={isCreatingClient} className="flex-1 p-2.5 bg-blue-600 text-white rounded-xl">
                                    {isCreatingClient ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showLeaveConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 max-w-xs w-full text-center">
                        <h3 className="font-bold mb-2">Leave this page?</h3>
                        <p className="text-sm text-gray-500 mb-4">All entered data will be lost.</p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 p-2 border rounded">Stay</button>
                            <button onClick={handleConfirmLeave} className="flex-1 p-2 bg-red-600 text-white rounded">Leave</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
