"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { useAppDispatch } from "@/store/hooks";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

// Shared logic
import {
    INITIAL_FORM_DATA,
    validateOrderStep
} from "@/components/customer/order-steps/orderWizardModel";

// Step Components
import SiteAdminCompanySelectionStep from "@/components/site-admin/order-steps/SiteAdminCompanySelectionStep";
import SiteAdminServiceStep from "@/components/site-admin/order-steps/SiteAdminServiceStep";
import SiteAdminAddressStep from "@/components/site-admin/order-steps/SiteAdminAddressStep";
import CustomerScheduleStep from "@/components/customer/order-steps/CustomerScheduleStep";
import CustomerEmailStep from "@/components/company-admin/order-steps/CustomerEmailStep";
import CreateUserModal from "@/components/company-admin/CreateUserModal";

export default function CreateOfferPage() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { toast } = useGlobalToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderIdToConvert = searchParams.get("orderId");
    const topRef = useRef(null);

    const [formData, setFormData] = useState({
        ...INITIAL_FORM_DATA,
        servicePricing: {},
        customerEmail: "",
        customerId: null,
        customerName: "",
        clientInfo: null,
    });

    // Extra offer fields
    const [clientPhone, setClientPhone] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [numberOfWorkers, setNumberOfWorkers] = useState("");

    const [companyScope, setCompanyScope] = useState("internal");
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [orderType, setOrderType] = useState("offer"); // Default to offer
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);

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

    useEffect(() => {
        setSelectedCompanyId(null);
    }, [companyScope]);

    // --- Check if form has unsaved data ---
    const hasUnsavedData = useCallback(() => {
        return (
            formData.services?.length > 0 ||
            selectedCompanyId !== null ||
            !!formData.customerId ||
            !!formData.customerEmail?.trim() ||
            !!formData.scheduledDate ||
            !!formData.notes?.trim() ||
            !!formData.fromAddress?.fullAddress ||
            !!clientPhone.trim() ||
            !!clientAddress.trim()
        );
    }, [formData, selectedCompanyId, clientPhone, clientAddress]);

    // --- Navigation Guard ---
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedData()) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedData]);

    const emailParam = searchParams.get("email");

    // Pre-fill client from email param
    useEffect(() => {
        if (emailParam && !orderIdToConvert) {
            const fetchClient = async () => {
                try {
                    const { companyAdminApi } = await import("@/lib/api");
                    const response = await companyAdminApi.searchClient({ search: emailParam.trim(), limit: 1 });
                    if (response?.success && response?.data?.clients?.length > 0) {
                        const client = response.data.clients[0];
                        setFormData(prev => ({
                            ...prev,
                            customerId: client.id,
                            customerEmail: client.email,
                            customerName: client.name,
                            clientInfo: client
                        }));
                        if (client.phones?.[0]?.phone) setClientPhone(client.phones[0].phone);
                        if (client.location?.fullAddress) setClientAddress(client.location.fullAddress);
                    }
                } catch (err) {
                    console.error("Error pre-filling client:", err);
                }
            };
            fetchClient();
        }
    }, [emailParam, orderIdToConvert]);

    useEffect(() => {
        window.history.pushState({ guard: true }, "");
        const handlePopState = () => {
            if (hasUnsavedData()) {
                window.history.pushState({ guard: true }, "");
                setPendingNavigation("back");
                setShowLeaveConfirm(true);
            } else {
                router.back();
            }
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [hasUnsavedData, router]);

    // Validation
    const isCompanyValid = selectedCompanyId !== null;
    const isCustomerValid = !!formData.customerId && !!formData.customerEmail?.trim();
    const isServicesValid = (() => {
        if (!formData.services || formData.services.length === 0) return false;
        
        for (const serviceId of formData.services) {
            const pricing = formData.servicePricing?.[serviceId];
            if (!pricing) return false;
            
            // Check pricing if internal
            if (companyScope === "internal") {
                const type = pricing.pricingType || 'hourly';
                if (type === 'hourly') {
                    if (pricing.minHours === undefined || pricing.minHours === null || pricing.minHours === "" || isNaN(parseFloat(pricing.minHours))) return false;
                    if (pricing.maxHours === undefined || pricing.maxHours === null || pricing.maxHours === "" || isNaN(parseFloat(pricing.maxHours))) return false;
                    if (pricing.pricePerHour === undefined || pricing.pricePerHour === null || pricing.pricePerHour === "" || isNaN(parseFloat(pricing.pricePerHour))) return false;
                } else if (type === 'flat_rate') {
                    if (!pricing.flatRatePrice && pricing.flatRatePrice !== 0) return false;
                } else if (type === 'max_price') {
                    if (!pricing.maxPrice && pricing.maxPrice !== 0) return false;
                } else if (type === 'pro_m3') {
                    if (!pricing.priceProM3 && pricing.priceProM3 !== 0) return false;
                    if (!pricing.meters && pricing.meters !== 0) return false;
                }
            }

            // Check date/time for each service
            if (!pricing.scheduledDate || !pricing.scheduledTime) return false;
        }
        return true;
    })();
    const isAddressValid = validateOrderStep(2, formData);
    const isScheduleValid = true; // Global date/time no longer mandatory here, now part of services
    const isExtraFieldsValid = !!clientPhone?.toString().trim() && !!clientAddress?.toString().trim();
    const canSubmit = isCompanyValid && isCustomerValid && isServicesValid && isAddressValid && isScheduleValid && isExtraFieldsValid;

    const completedCount = [isCompanyValid, isCustomerValid, isServicesValid, isAddressValid, isScheduleValid, isExtraFieldsValid].filter(Boolean).length;

    // Sync global company to service-level
    useEffect(() => {
        if (selectedCompanyId) {
            setFormData(prev => {
                const newPricing = { ...prev.servicePricing };
                let changed = false;
                prev.services?.forEach(serviceId => {
                    if (!newPricing[serviceId]) {
                        newPricing[serviceId] = { assignedCompanyId: selectedCompanyId };
                        changed = true;
                    } else if (!newPricing[serviceId].assignedCompanyId) {
                        newPricing[serviceId].assignedCompanyId = selectedCompanyId;
                        changed = true;
                    }
                });
                return changed ? { ...prev, servicePricing: newPricing } : prev;
            });
        }
    }, [selectedCompanyId]);

    // Fetch existing order if orderId is provided
    useEffect(() => {
        if (orderIdToConvert) {
            const fetchOrder = async () => {
                try {
                    const { siteAdminApi } = await import("@/lib/api");
                    const response = await siteAdminApi.getOrder(orderIdToConvert);
                    if (response?.success && response.data) {
                        const order = response.data;
                        
                        // Map shared fields
                        setFormData(prev => ({
                            ...prev,
                            services: order.orderServices?.map(s => s.serviceId) || [],
                            customerEmail: order.client?.email || "",
                            customerId: order.clientId,
                            customerName: order.client?.name || "",
                            clientInfo: order.client,
                            notes: order.notes || "",
                            fromAddress: {
                                fullAddress: order.location?.address || "",
                                floor: order.location?.floor || 0,
                                hasElevator: order.location?.has_elevator || false,
                                locationType: order.location?.type || "",
                                area: order.location?.area || 0,
                                numberOfRooms: order.number_of_rooms || 0,
                                roomConfigurations: order.rooms?.map(r => ({ 
                                    roomType: r.room_type, 
                                    quantity: r.quantity 
                                })) || []
                            },
                            toAddress: order.destination_location ? {
                                fullAddress: order.destination_location.address || "",
                                floor: order.destination_location.floor || 0,
                                hasElevator: order.destination_location.has_elevator || false,
                                locationType: order.destination_location.type || ""
                            } : prev.toAddress,
                            scheduledDate: order.preferred_date ? order.preferred_date.split('T')[0] : "",
                            scheduledTime: order.preferred_time || "09:00",
                            servicePricing: order.orderServices?.reduce((acc, s) => {
                                acc[s.serviceId] = {
                                    assignedCompanyId: s.company_id,
                                    scheduledDate: s.preferred_date ? s.preferred_date.split('T')[0] : (order.preferred_date ? order.preferred_date.split('T')[0] : ""),
                                    scheduledTime: s.preferred_time || order.preferred_time || "09:00",
                                    minHours: s.offer?.min_hours || "",
                                    maxHours: s.offer?.max_hours || "",
                                    pricePerHour: s.offer?.hourly_rate || "",
                                    notes: s.offer?.notes || ""
                                };
                                return acc;
                            }, {}) || {}
                        }));

                        // Set extra offer fields
                        setClientPhone(order.client_phone || order.client?.phone || "");
                        setClientAddress(order.client_address || order.location?.address || "");
                        setNumberOfWorkers(order.number_of_workers || "");
                        
                        // Set company if global
                        if (order.company_id) {
                            setSelectedCompanyId(order.company_id);
                        }
                    }
                } catch (err) {
                    console.error("Error fetching order:", err);
                    toast.error("Failed to load order data");
                }
            };
            fetchOrder();
        }
    }, [orderIdToConvert]);

    // Auto-fill phone/address from client info
    useEffect(() => {
        if (formData.clientInfo) {
            if (formData.clientInfo.phone && !clientPhone) setClientPhone(formData.clientInfo.phone);
            if (formData.clientInfo.address && !clientAddress) setClientAddress(formData.clientInfo.address);
        }
    }, [formData.clientInfo]);

    const handleEmailValid = (user) => {
        setFormData((prev) => ({ ...prev, customerEmail: user.email, customerId: user.id, customerName: user.name, clientInfo: user }));
        setError(null);
    };

    const handleUserCreated = (newUser) => {
        setFormData((prev) => ({ ...prev, customerEmail: newUser.email, customerId: newUser.id, customerName: newUser.name, clientInfo: newUser }));
        setIsCreateUserModalOpen(false);
        setError(null);
    };

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
        if (pendingNavigation === "back") {
            window.history.go(-2);
        } else {
            router.push("/site-admin/dashboard");
        }
    };

    const handleSubmit = async () => {
        setError(null);
        setIsSubmitting(true);
        try {
            const primary_location = {
                address: formData.fromAddress?.fullAddress || "",
                floor: Number(formData.fromAddress?.floor) || 0,
                has_elevator: !!formData.fromAddress?.hasElevator,
                type: formData.fromAddress?.locationType || "",
                area: Number(formData.fromAddress?.area) || 0
            };
            const secondary_location = {
                address: formData.toAddress?.fullAddress || "",
                floor: Number(formData.toAddress?.floor) || 0,
                has_elevator: !!formData.toAddress?.hasElevator,
                type: formData.toAddress?.locationType || ""
            };
            // Format helper for time
            const formatTime = (timeStr) => {
                let time = timeStr || "09:00";
                if (time.includes("-")) time = time.split("-")[0].trim();
                if (time === "flexible") time = "09:00";
                if (time.length === 5) time += ":00";
                return time;
            };

            const services = (formData.services || []).map(serviceId => {
                const pricing = formData.servicePricing?.[serviceId] || {};
                const selectedAdditions = formData.serviceAdditions?.[serviceId] || {};
                
                const serviceObj = {
                    service_id: serviceId,
                    pricing_type: pricing.pricingType || "per_hour",
                    price_per_unit: parseFloat(pricing.pricePerHour) || 0,
                    min_units: Number(pricing.minHours) || 0,
                    max_units: Number(pricing.maxHours) || 0,
                    minimum_charge: parseFloat(pricing.minimumCharge) || 0,
                    additions: []
                };
                
                Object.entries(selectedAdditions).forEach(([additionId, additionData]) => {
                    if (additionData) {
                        const additionPayload = {
                            addition_id: parseInt(additionId),
                            pricing_type: additionData.pricingType || "flat_rate",
                            fixed_price: Number(additionData.price) || 0,
                            total_price: Number(additionData.price) || 0
                        };
                        serviceObj.additions.push(additionPayload);
                    }
                });
                
                return serviceObj;
            });

            // Use first service's date/time as global fallback
            const firstServicePricing = formData.services.length > 0 ? formData.servicePricing?.[formData.services[0]] : {};
            const globalDate = firstServicePricing?.scheduledDate || "";
            const globalTime = formatTime(firstServicePricing?.scheduledTime);

            const requestBody = {
                email: formData.customerEmail.trim(),
                company_id: selectedCompanyId,
                execution_date: globalDate,
                execution_time: globalTime,
                primary_location,
                secondary_location,
                services,
                notes: formData.notes || '',
                _imageFiles: formData.images || [],
                type: "offer",
                client_phone: clientPhone.trim(),
                client_address: clientAddress.trim(),
                number_of_workers: Number(numberOfWorkers) || 0
            };

            const { siteAdminApi } = await import("@/lib/api");
            const response = await siteAdminApi.createOffer(requestBody);

            if (response && response.success) {
                toast.success(t("siteAdmin.dashboard.offerCreatedSuccess") || "Offer created successfully!");
                router.push("/site-admin/dashboard");
            } else {
                throw new Error(response?.message || "Failed to create offer");
            }
        } catch (err) {
            console.error("Submission error:", err);
            const errorMessage = err.message || "Failed to create offer";
            setError(errorMessage);
            toast.error(errorMessage);
            topRef.current?.scrollIntoView({ behavior: "smooth" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepProps = { 
        formData, 
        setFormData, 
        companyScope, 
        orderType,
        availableCompanies,
        isLoadingCompanies,
        companiesError,
        globalCompanyId: selectedCompanyId
    };

    return (
        <ProtectedRoute requiredRoles={["site-admin", "super-admin"]}>
            <div className="min-h-screen bg-white">
            {/* ── Compact Header ── */}
            <div className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg">
                <div className="w-full px-4 sm:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <button onClick={handleCancel} className="p-1.5 hover:bg-white/20 rounded-md transition-colors" title="Back">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <h1 className="text-sm font-bold text-white">
                                {t("siteAdmin.dashboard.createOffer") || "Create Offer"}
                            </h1>
                        </div>
                    </div>
                    <span className="text-xs text-white/80 bg-white/20 px-2.5 py-0.5 rounded-full font-medium">{completedCount}/6</span>
                </div>
            </div>

            {/* ── Form Body ── */}
            <div ref={topRef} className="w-full px-4 sm:px-8 py-5 pb-24">
                {/* Error */}
                {error && (
                    <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-xs text-red-700">
                        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
                    </div>
                )}

                {/* ── Flat Form Table ── */}
                <div className="divide-y divide-gray-100">

                    {/* Row 1: Company & Type */}
                    <div className="py-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            1. {t("orderSteps.companySelection") || "Company & Type"}
                        </h2>
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

                    {/* Row 2: Customer */}
                    <div className="py-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            2. {t("orderSteps.selectCustomer") || "Customer"}
                        </h2>
                        <CustomerEmailStep
                            {...stepProps}
                            onEmailValid={handleEmailValid}
                            onCreateUserClick={() => setIsCreateUserModalOpen(true)}
                        />
                    </div>

                    {/* Row 3: Extra Offer Fields (Phone, Address, Workers) */}
                    <div className="py-4">
                        <h2 className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            3. {t("siteAdmin.offerDetails") || "Offer Details"}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-orange-50/50 border border-orange-200/60 rounded-xl p-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    {t("common.labels.phone") || "Phone Number"} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    placeholder="+41 79 123 45 67"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    {t("siteAdmin.clientAddress") || "Client's Address"} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={clientAddress}
                                    onChange={(e) => setClientAddress(e.target.value)}
                                    placeholder="e.g., Bahnhofstrasse 1, Zürich"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    {t("siteAdmin.numberOfWorkers") || "Number of Workers"}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={numberOfWorkers}
                                    onChange={(e) => setNumberOfWorkers(e.target.value)}
                                    placeholder="e.g., 3"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Services */}
                    <div className="py-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            4. {t("orderSteps.selectServices") || "Services"}
                        </h2>
                        <SiteAdminServiceStep {...stepProps} />
                    </div>

                    {/* Row 5: Address */}
                    <div className="py-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            5. {t("orderSteps.addressesDetails") || "Address"}
                        </h2>
                        <SiteAdminAddressStep {...stepProps} />
                    </div>

                    {/* Row 6: Schedule */}
                    <div className="py-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            6. {t("orderSteps.scheduleNotes") || "Schedule & Notes"}
                        </h2>
                        <CustomerScheduleStep {...stepProps} />
                    </div>
                </div>
            </div>

            {/* ── Bottom Bar ── */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
                <div className="w-full px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${(completedCount / 6) * 100}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-400">{completedCount}/6</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleCancel}
                            className="flex-1 sm:flex-none px-4 py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit || isSubmitting}
                            className="flex-1 sm:flex-none px-5 py-2 text-xs bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-md"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div>
                                    <span>Submitting…</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{t("siteAdmin.dashboard.createOffer") || "Create Offer"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Leave Dialog ── */}
            {showLeaveConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl max-w-xs w-full p-5 text-center border border-gray-200">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Leave this page?</h3>
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                            Are you sure you want to leave without completing the offer? All entered data will be lost.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setShowLeaveConfirm(false); setPendingNavigation(null); }}
                                className="flex-1 px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-md text-xs font-medium"
                            >
                                Keep Editing
                            </button>
                            <button
                                onClick={handleConfirmLeave}
                                className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium"
                            >
                                Yes, Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create User Modal ── */}
            {isCreateUserModalOpen && (
                <CreateUserModal
                    isOpen={isCreateUserModalOpen}
                    onClose={() => setIsCreateUserModalOpen(false)}
                    onUserCreated={handleUserCreated}
                    companyId={selectedCompanyId}
                />
            )}
            </div>
        </ProtectedRoute>
    );
}
