"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { useAppDispatch } from "@/store/hooks";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useRouter } from "next/navigation";

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

export default function CreateOrderPage() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { toast } = useGlobalToast();
    const router = useRouter();
    const topRef = useRef(null);

    const [formData, setFormData] = useState({
        ...INITIAL_FORM_DATA,
        servicePricing: {},
        customerEmail: "",
        customerId: null,
        customerName: "",
        clientInfo: null,
    });

    const [companyScope, setCompanyScope] = useState("internal");
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [orderType, setOrderType] = useState("order");
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
            !!formData.fromAddress?.fullAddress
        );
    }, [formData, selectedCompanyId]);

    // --- Navigation Guard: browser beforeunload ---
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

    // --- Navigation Guard: browser back/forward (popstate) ---
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
        if (companyScope === "internal") {
            for (const serviceId of formData.services) {
                const pricing = formData.servicePricing?.[serviceId];
                if (!pricing || !pricing.minHours || !pricing.maxHours || !pricing.pricePerHour) return false;
                if (parseFloat(pricing.minHours) <= 0 || parseFloat(pricing.maxHours) < parseFloat(pricing.minHours) || parseFloat(pricing.pricePerHour) <= 0) return false;
            }
        }
        return true;
    })();
    const isAddressValid = validateOrderStep(2, formData);
    const isScheduleValid = validateOrderStep(4, formData);
    const canSubmit = isCompanyValid && isCustomerValid && isServicesValid && isAddressValid && isScheduleValid;

    const completedCount = [isCompanyValid, isCustomerValid, isServicesValid, isAddressValid, isScheduleValid].filter(Boolean).length;

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
            const location = {
                address: formData.fromAddress?.fullAddress || "",
                floor: Number(formData.fromAddress?.floor) || 0,
                has_elevator: !!formData.fromAddress?.hasElevator,
                type: formData.fromAddress?.locationType || "",
                area: Number(formData.fromAddress?.area) || 0
            };
            const destination_location = {
                address: formData.toAddress?.fullAddress || "",
                floor: Number(formData.toAddress?.floor) || 0,
                has_elevator: !!formData.toAddress?.hasElevator,
                type: formData.toAddress?.locationType || ""
            };
            let preferredTime = formData.scheduledTime || "09:00";
            if (preferredTime.includes("-")) preferredTime = preferredTime.split("-")[0].trim();
            if (preferredTime === "flexible") preferredTime = "09:00";
            if (preferredTime.length === 5) preferredTime += ":00";

            let rooms = [];
            if (formData.fromAddress?.roomConfigurations?.length > 0) {
                rooms = formData.fromAddress.roomConfigurations.map(r => ({ room_type: r.roomType, quantity: r.quantity }));
            } else if (formData.roomDescription) {
                rooms = [{ room_type: formData.roomDescription, quantity: 1 }];
            }

            const services = (formData.services || []).map(serviceId => {
                const serviceObj = { service_id: serviceId, additions: [] };
                const selectedAdditions = formData.serviceAdditions?.[serviceId] || {};
                Object.entries(selectedAdditions).forEach(([additionId, additionData]) => {
                    if (additionData) {
                        const additionPayload = { addition_id: parseInt(additionId), note: additionData.note || "" };
                        if (companyScope === "internal") {
                            const additionPricing = formData.servicePricing?.[serviceId]?.additions?.[additionId];
                            if (additionPricing) {
                                additionPayload.quantity = Number(additionPricing.amount) || 1;
                                additionPayload.price = Number(additionPricing.price) || 0;
                            }
                        }
                        serviceObj.additions.push(additionPayload);
                    }
                });
                serviceObj.company_id = selectedCompanyId;
                if (companyScope === "internal") {
                    const pricing = formData.servicePricing?.[serviceId];
                    if (pricing) {
                        serviceObj.offer = {
                            hourly_rate: parseFloat(pricing.pricePerHour),
                            currency: "CHF",
                            min_hours: Number(pricing.minHours),
                            max_hours: Number(pricing.maxHours),
                            notes: pricing.notes || ""
                        };
                    }
                }
                return serviceObj;
            });

            const requestBody = {
                email: formData.customerEmail.trim(),
                preferred_date: formData.scheduledDate,
                preferred_time: preferredTime,
                location,
                destination_location,
                number_of_rooms: Number(formData.fromAddress?.numberOfRooms) || 0,
                rooms,
                services,
                notes: formData.notes || '',
                _imageFiles: formData.images || [],
                order_type: orderType
            };

            const { siteAdminApi } = await import("@/lib/api");
            const response = await siteAdminApi.createOrder(requestBody);

            if (response && response.success) {
                toast.success(t("orders.createSuccess") || "Order created successfully");
                router.push("/site-admin/dashboard");
            } else {
                throw new Error(response?.message || "Failed to create order");
            }
        } catch (err) {
            console.error("Submission error:", err);
            const errorMessage = err.message || "Failed to create order";
            setError(errorMessage);
            toast.error(errorMessage);
            topRef.current?.scrollIntoView({ behavior: "smooth" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepProps = { formData, setFormData, companyScope, orderType };

    return (
        <div className="min-h-screen bg-white">
            {/* ── Compact Header ── */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <button onClick={handleCancel} className="p-1.5 hover:bg-gray-100 rounded-md" title="Back">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-sm font-semibold text-gray-800">
                            {t("orderSteps.createNewOrder") || "New Order"}
                        </h1>
                    </div>
                    <span className="text-[11px] text-gray-400">{completedCount}/5</span>
                </div>
            </div>

            {/* ── Form Body ── */}
            <div ref={topRef} className="max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-24">
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
                            orderType={orderType}
                            onOrderTypeChange={setOrderType}
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

                    {/* Row 3: Services */}
                    <div className="py-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            3. {t("orderSteps.selectServices") || "Services"}
                        </h2>
                        <SiteAdminServiceStep {...stepProps} />
                    </div>

                    {/* Row 4: Address */}
                    <div className="py-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            4. {t("orderSteps.addressesDetails") || "Address"}
                        </h2>
                        <SiteAdminAddressStep {...stepProps} />
                    </div>

                    {/* Row 5: Schedule */}
                    <div className="py-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            5. {t("orderSteps.scheduleNotes") || "Schedule & Notes"}
                        </h2>
                        <CustomerScheduleStep {...stepProps} />
                    </div>
                </div>
            </div>

            {/* ── Bottom Bar ── */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-600 rounded-full transition-all duration-500" style={{ width: `${(completedCount / 5) * 100}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-400">{completedCount}/5</span>
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
                            className="flex-1 sm:flex-none px-5 py-2 text-xs bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
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
                                    <span>Submit Order</span>
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
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Leave this page?</h3>
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                            Are you sure you want to leave without completing the order? All entered data will be lost.
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

            {/* Create User Modal */}
            <CreateUserModal
                isOpen={isCreateUserModalOpen}
                onClose={() => setIsCreateUserModalOpen(false)}
                onUserCreated={handleUserCreated}
            />
        </div>
    );
}
