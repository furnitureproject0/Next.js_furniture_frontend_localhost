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
import SiteAdminAddressStep from "@/components/site-admin/order-steps/SiteAdminAddressStep";
import CustomerScheduleStep from "@/components/customer/order-steps/CustomerScheduleStep";
import CustomerEmailStep from "@/components/company-admin/order-steps/CustomerEmailStep";
import CreateUserModal from "@/components/company-admin/CreateUserModal";

export default function CreateOrderPage() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { toast } = useGlobalToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderIdToConvert = searchParams.get("orderId");
    const topRef = useRef(null);

    // Fetch Available Services State
    const [availableServices, setAvailableServices] = useState([]);
    const [isLoadingServices, setIsLoadingServices] = useState(false);

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
    const [orderType, setOrderType] = useState("order"); // Default to order
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

    // Fetch Services
    useEffect(() => {
        const fetchServices = async () => {
            setIsLoadingServices(true);
            try {
                const res = await fetch("https://api.angebotsprofi.ch/api/services-v2/?search=&limit=100", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });
                const data = await res.json();
                if (res.ok && data?.success) {
                    setAvailableServices(data.data?.services || []);
                } else {
                    console.error("Failed to fetch services:", data);
                }
            } catch (err) {
                console.error("Failed to fetch services", err);
            } finally {
                setIsLoadingServices(false);
            }
        };
        fetchServices();
    }, []);

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
            !!formData.toAddress?.fullAddress
        );
    }, [formData, selectedCompanyId]);

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

    // التحقق من الحقول الإجبارية للإضافات التي اسمها "custom"
    const isCustomNotesValid = useMemo(() => {
        if (!formData.services) return true;
        
        for (const serviceId of formData.services) {
            const pricing = formData.servicePricing?.[serviceId] || {};
            const actualService = availableServices.find(s => s.id === parseInt(serviceId));
            
            if (pricing.additions && actualService) {
                for (const addId in pricing.additions) {
                    const addState = pricing.additions[addId];
                    const actualAddition = actualService.additions?.find(a => a.id === parseInt(addId));
                    
                    if (addState.selected && actualAddition?.name?.toLowerCase() === 'custom') {
                        if (!addState.notes?.trim()) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }, [formData.services, formData.servicePricing, availableServices]);

    // Validation
    const isCompanyValid = selectedCompanyId !== null;
    const isCustomerValid = !!formData.customerId && !!formData.customerEmail?.trim();
    const isServicesValid = formData.services && formData.services.length > 0;
    const isAddressValid = !!formData.fromAddress?.fullAddress?.trim(); // التأكد من إدخال العنوان الأساسي على الأقل
    const isScheduleValid = true; 
    
    // عدد الخطوات 6 
    const canSubmit = isCompanyValid && isCustomerValid && isServicesValid && isAddressValid && isScheduleValid && isCustomNotesValid;
    const completedCount = [isCompanyValid, isCustomerValid, isServicesValid, isAddressValid, isScheduleValid].filter(Boolean).length; // يمكن إضافة شرط للعنوان الثاني لو حابب تخليه يزود العداد

    // Sync global company to service-level if not set
    useEffect(() => {
        if (selectedCompanyId) {
            setFormData(prev => {
                const newPricing = { ...prev.servicePricing };
                let changed = false;
                prev.services?.forEach(serviceId => {
                    if (!newPricing[serviceId]) {
                        newPricing[serviceId] = { companyId: selectedCompanyId, companyScope: companyScope };
                        changed = true;
                    } else if (!newPricing[serviceId].companyId) {
                        newPricing[serviceId].companyId = selectedCompanyId;
                        newPricing[serviceId].companyScope = companyScope;
                        changed = true;
                    }
                });
                return changed ? { ...prev, servicePricing: newPricing } : prev;
            });
        }
    }, [selectedCompanyId, companyScope]);

    // Fetch existing order if orderId is provided
    useEffect(() => {
        if (orderIdToConvert) {
            const fetchOrder = async () => {
                try {
                    const { siteAdminApi } = await import("@/lib/api");
                    const response = await siteAdminApi.getOrder(orderIdToConvert);
                    if (response?.success && response.data) {
                        const order = response.data;
                        
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
                                    companyScope: "internal", 
                                    companyId: s.company_id,
                                    pricingType: s.pricing_type || "per_hour",
                                    pricePerUnit: s.price_per_unit || s.offer?.hourly_rate || "",
                                    minUnits: s.min_units || s.offer?.min_hours || "",
                                    maxUnits: s.max_units || s.offer?.max_hours || "",
                                    fixedPrice: s.fixed_price || "",
                                    notes: s.notes || s.offer?.notes || "",
                                    scheduledDate: s.preferred_date ? s.preferred_date.split('T')[0] : "",
                                    scheduledTime: s.preferred_time || "09:00",
                                };
                                return acc;
                            }, {}) || {}
                        }));

                        if (order.company_id) setSelectedCompanyId(order.company_id);
                    }
                } catch (err) {
                    console.error("Error fetching order:", err);
                    toast.error("Failed to load order data");
                }
            };
            fetchOrder();
        }
    }, [orderIdToConvert]);

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
            const formatTime = (timeStr) => {
                let time = timeStr || "09:00:00";
                if (time.includes("-")) time = time.split("-")[0].trim();
                if (time === "flexible") time = "09:00:00";
                if (time.length === 5) time += ":00";
                return time;
            };

            const firstServicePricing = formData.services.length > 0 ? formData.servicePricing?.[formData.services[0]] : {};
            const globalDate = formData.scheduledDate || firstServicePricing?.scheduledDate || new Date().toISOString().split('T')[0];
            const globalTime = formatTime(formData.scheduledTime || firstServicePricing?.scheduledTime);

            const payloadServices = (formData.services || []).map(serviceId => {
                const pricing = formData.servicePricing?.[serviceId] || {};
                const actualService = availableServices.find(s => s.id === parseInt(serviceId));
                
                const additions = [];
                if (pricing.additions) {
                    Object.entries(pricing.additions).forEach(([additionId, additionPricing]) => {
                        if (additionPricing.selected) {
                            const addType = additionPricing.pricingType || "flat_rate";
                            const actualAddition = actualService?.additions?.find(a => a.id === parseInt(additionId));
                            
                            const additionPayload = {
                                addition_id: parseInt(additionId),
                                pricing_type: addType,
                            };
                            
                            if (addType === 'flat_rate' || addType === 'max_price') {
                                additionPayload.fixed_price = Number(additionPricing.fixedPrice) || 0;
                            }
                            if (addType === 'per_hour' || addType === 'max_price') {
                                additionPayload.price_per_unit = Number(additionPricing.pricePerUnit) || 0;
                                additionPayload.min_units = Number(additionPricing.minUnits) || 0;
                                additionPayload.max_units = Number(additionPricing.maxUnits) || 0;
                            }

                            if (actualAddition?.name?.toLowerCase() === 'custom') {
                                additionPayload.note = additionPricing.notes || "";
                            }
                            
                            additions.push(additionPayload);
                        }
                    });
                }

                const srvType = pricing.pricingType || actualService?.pricing_type || "per_hour";
                const servicePayload = {
                    service_id: parseInt(serviceId),
                    pricing_type: srvType,
                    additions: additions
                };

                if (srvType === 'flat_rate' || srvType === 'max_price') {
                    servicePayload.fixed_price = Number(pricing.fixedPrice) || Number(actualService?.fixed_price) || 0;
                }
                if (srvType === 'per_hour' || srvType === 'max_price') {
                    servicePayload.price_per_unit = Number(pricing.pricePerUnit) || Number(actualService?.price_per_unit) || 0;
                    servicePayload.min_units = Number(pricing.minUnits) || Number(actualService?.min_units) || 0;
                    servicePayload.max_units = Number(pricing.maxUnits) || Number(actualService?.max_units) || 0;
                }
                if (srvType === 'custom') {
                    servicePayload.note = pricing.notes || "";
                }

                const compId = pricing.companyId ? parseInt(pricing.companyId) : (selectedCompanyId ? parseInt(selectedCompanyId) : null);
                if (compId) {
                    servicePayload.company_id = compId;
                }

                return servicePayload;
            });

            // --- بناء العنوان الأساسي ---
            const primary_location = {
                address: formData.fromAddress?.fullAddress || "",
                type: formData.fromAddress?.locationType || "apartment",
                floor: Number(formData.fromAddress?.floor) || 0
            };
            if (formData.fromAddress?.lat && formData.fromAddress?.lon) {
                primary_location.latitude = Number(formData.fromAddress.lat);
                primary_location.longitude = Number(formData.fromAddress.lon);
            }

            const requestBody = {
                email: formData.customerEmail.trim(),
                execution_date: globalDate,
                execution_time: globalTime,
                primary_location: primary_location,
                services: payloadServices,
                timelineMessage: "Order initiated by Admin for the client",
                timelineStatus: "pending"
            };

            if (selectedCompanyId) {
                requestBody.company_id = parseInt(selectedCompanyId);
            }

            if (formData.notes && formData.notes.trim() !== "") {
                requestBody.notes = formData.notes.trim();
            }

            // --- بناء العنوان الثاني بنفس دقة العنوان الأساسي ---
            if (formData.toAddress?.fullAddress && formData.toAddress.fullAddress.trim() !== "") {
                const secondary_location = {
                    address: formData.toAddress.fullAddress.trim(),
                    type: formData.toAddress.locationType || "apartment",
                    floor: Number(formData.toAddress?.floor) || 0
                };
                if (formData.toAddress?.lat && formData.toAddress?.lon) {
                    secondary_location.latitude = Number(formData.toAddress.lat);
                    secondary_location.longitude = Number(formData.toAddress.lon);
                }
                requestBody.secondary_location = secondary_location;
            }

            console.log("Order Payload sent to backend:", JSON.stringify(requestBody, null, 2));

            const response = await fetch("https://api.angebotsprofi.ch/api/orders-v2/admin-create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success(t("siteAdmin.dashboard.orderCreatedSuccess") || "Order created successfully!");
                router.push("/site-admin/dashboard");
            } else {
                console.error("Validation Error Details:", data);
                throw new Error(data?.message || "Validation Error. Check console for details.");
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

    // --- الحل للمشكلة: تعريف stepProps قبل استخدامه ---
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

    // تمرير type="from" للعنوان الأول، و type="to" للعنوان الثاني حتى يتمكن مكون العنوان من تمييزهما
    const primaryStepProps = { ...stepProps, addressType: "from" };
    const secondaryStepProps = { ...stepProps, addressType: "to" };

    return (
        <ProtectedRoute requiredRoles={["site-admin", "super-admin"]}>
            <div className="min-h-screen bg-white">
            {/* ── Compact Header ── */}
            <div className="sticky top-0 z-40 bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg">
                <div className="w-full px-4 sm:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <button onClick={handleCancel} className="p-1.5 hover:bg-white/20 rounded-md transition-colors" title="Back">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <h1 className="text-sm font-bold text-white">
                                {t("siteAdmin.dashboard.createOrder") || "Create Order"}
                            </h1>
                        </div>
                    </div>
                    <span className="text-xs text-white/80 bg-white/20 px-2.5 py-0.5 rounded-full font-medium">{completedCount}/6</span>
                </div>
            </div>

            {/* ── Form Body ── */}
            <div ref={topRef} className="w-full px-4 sm:px-8 py-5 pb-24">
                {error && (
                    <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-xs text-red-700">
                        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
                    </div>
                )}

                <div className="divide-y divide-gray-100">
                    {/* Row 1: Company */}
                    <div className="py-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            1. {t("orderSteps.companySelection") || "Company"}
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

                    {/* Row 3: Services */}
                    <div className="py-4">
                        <h2 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                             <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            3. {t("orderSteps.selectServices") || "Services & Order Details"}
                        </h2>
                        
                        {isLoadingServices ? (
                            <div className="text-xs text-gray-400 p-4 text-center border border-dashed border-gray-200 rounded-lg">
                                Loading services...
                            </div>
                        ) : availableServices.length === 0 ? (
                            <div className="text-xs text-red-500 p-4 text-center border border-dashed border-red-200 rounded-lg bg-red-50">
                                No services found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {availableServices.map(service => {
                                    const isSelected = formData.services?.includes(service.id);
                                    const pricing = formData.servicePricing?.[service.id] || {};

                                    const serviceCompanyScope = pricing.companyScope || companyScope;
                                    const serviceCompaniesList = serviceCompanyScope === 'external' ? externalCompanies : internalCompanies;

                                    return (
                                        <div key={service.id} className={`p-4 border rounded-xl transition-colors ${isSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <label className="flex items-start gap-3 cursor-pointer mb-3">
                                                <input 
                                                    type="checkbox" 
                                                    className="mt-1 w-4 h-4 accent-emerald-500"
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setFormData(prev => {
                                                            const newServices = checked 
                                                                ? [...(prev.services || []), service.id]
                                                                : (prev.services || []).filter(id => id !== service.id);
                                                            
                                                            const newPricing = { ...prev.servicePricing };
                                                            if (checked && !newPricing[service.id]) {
                                                                newPricing[service.id] = {
                                                                    companyScope: companyScope,
                                                                    companyId: selectedCompanyId || "", 
                                                                    pricingType: service.pricing_type || 'per_hour',
                                                                    fixedPrice: service.fixed_price || '',
                                                                    pricePerUnit: service.price_per_unit || '',
                                                                    minUnits: service.min_units || '',
                                                                    maxUnits: service.max_units || '',
                                                                    notes: '',
                                                                    additions: {}
                                                                };
                                                            }
                                                            return { ...prev, services: newServices, servicePricing: newPricing };
                                                        });
                                                    }}
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-gray-800">{service.name}</span>
                                                    <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                                                </div>
                                            </label>

                                            {isSelected && (
                                                <div className="ml-7 mt-3 p-4 bg-white border border-gray-100 rounded-lg shadow-sm space-y-4">
                                                    
                                                    {/* Service Settings Row */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b border-gray-50">
                                                        <div>
                                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Company Type</label>
                                                            <select 
                                                                className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none bg-gray-50/50"
                                                                value={pricing.companyScope || 'internal'}
                                                                onChange={(e) => {
                                                                    const newScope = e.target.value;
                                                                    setFormData(prev => ({
                                                                        ...prev, 
                                                                        servicePricing: { 
                                                                            ...prev.servicePricing, 
                                                                            [service.id]: { 
                                                                                ...pricing, 
                                                                                companyScope: newScope,
                                                                                companyId: "" 
                                                                            } 
                                                                        }
                                                                    }));
                                                                }}
                                                            >
                                                                <option value="internal">Internal Company</option>
                                                                <option value="external">External Company</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Assigned Company</label>
                                                            <select 
                                                                className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none bg-gray-50/50"
                                                                value={pricing.companyId || ''}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev, servicePricing: { ...prev.servicePricing, [service.id]: { ...pricing, companyId: e.target.value } }
                                                                }))}
                                                            >
                                                                <option value="">-- Use Global Company --</option>
                                                                {serviceCompaniesList?.map(comp => (
                                                                    <option key={comp.id} value={comp.id}>{comp.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Pricing Type</label>
                                                            <select 
                                                                className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none bg-gray-50/50"
                                                                value={pricing.pricingType || 'per_hour'}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev, servicePricing: { ...prev.servicePricing, [service.id]: { ...pricing, pricingType: e.target.value } }
                                                                }))}
                                                            >
                                                                <option value="per_hour">Per Hour</option>
                                                                <option value="flat_rate">Flat Rate</option>
                                                                <option value="max_price">Max Price (Mixed)</option>
                                                                <option value="custom">Custom</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Units & Pricing Row */}
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {(pricing.pricingType === 'custom') && (
                                                            <div className="col-span-2 sm:col-span-4">
                                                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Custom Service Notes <span className="text-red-500">*</span></label>
                                                                <input type="text" 
                                                                    className={`w-full text-xs border rounded p-1.5 focus:border-emerald-400 outline-none ${!pricing.notes?.trim() ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                                                    value={pricing.notes || ''}
                                                                    placeholder="Describe the custom service requirements..."
                                                                    onChange={(e) => setFormData(prev => ({
                                                                        ...prev, servicePricing: { ...prev.servicePricing, [service.id]: { ...pricing, notes: e.target.value } }
                                                                    }))}
                                                                />
                                                            </div>
                                                        )}
                                                        {(pricing.pricingType === 'flat_rate' || pricing.pricingType === 'max_price') && (
                                                            <div>
                                                                <label className="block text-[10px] uppercase font-medium text-gray-500 mb-1">Fixed Price</label>
                                                                <input type="number" 
                                                                    className="w-full text-xs border border-gray-200 rounded p-1.5 focus:border-emerald-400 outline-none"
                                                                    value={pricing.fixedPrice || ''}
                                                                    placeholder="0.00"
                                                                    onChange={(e) => setFormData(prev => ({
                                                                        ...prev, servicePricing: { ...prev.servicePricing, [service.id]: { ...pricing, fixedPrice: e.target.value } }
                                                                    }))}
                                                                />
                                                            </div>
                                                        )}
                                                        {(pricing.pricingType === 'per_hour' || pricing.pricingType === 'max_price') && (
                                                            <>
                                                                <div>
                                                                    <label className="block text-[10px] uppercase font-medium text-gray-500 mb-1">Price per unit</label>
                                                                    <input type="number" 
                                                                        className="w-full text-xs border border-gray-200 rounded p-1.5 focus:border-emerald-400 outline-none"
                                                                        value={pricing.pricePerUnit || ''}
                                                                        placeholder="0.00"
                                                                        onChange={(e) => setFormData(prev => ({
                                                                            ...prev, servicePricing: { ...prev.servicePricing, [service.id]: { ...pricing, pricePerUnit: e.target.value } }
                                                                        }))}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] uppercase font-medium text-gray-500 mb-1">Min Units</label>
                                                                    <input type="number" 
                                                                        className="w-full text-xs border border-gray-200 rounded p-1.5 focus:border-emerald-400 outline-none"
                                                                        value={pricing.minUnits || ''}
                                                                        placeholder="0"
                                                                        onChange={(e) => setFormData(prev => ({
                                                                            ...prev, servicePricing: { ...prev.servicePricing, [service.id]: { ...pricing, minUnits: e.target.value } }
                                                                        }))}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] uppercase font-medium text-gray-500 mb-1">Max Units</label>
                                                                    <input type="number" 
                                                                        className="w-full text-xs border border-gray-200 rounded p-1.5 focus:border-emerald-400 outline-none"
                                                                        value={pricing.maxUnits || ''}
                                                                        placeholder="0"
                                                                        onChange={(e) => setFormData(prev => ({
                                                                            ...prev, servicePricing: { ...prev.servicePricing, [service.id]: { ...pricing, maxUnits: e.target.value } }
                                                                        }))}
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Additions List */}
                                                    {service.additions?.length > 0 && (
                                                        <div className="pt-3 border-t border-gray-100">
                                                            <h4 className="text-[11px] font-bold text-gray-600 mb-2 uppercase tracking-wide">Additions</h4>
                                                            <div className="space-y-2">
                                                                {service.additions.map(addition => {
                                                                    const addState = pricing.additions?.[addition.id] || {};
                                                                    const isAddSelected = !!addState.selected;
                                                                    const addType = addState.pricingType || addition.pricing_type || 'flat_rate';
                                                                    const isCustomAddition = addition.name?.toLowerCase() === 'custom';

                                                                    return (
                                                                        <div key={addition.id} className="flex flex-col gap-2 p-3 rounded-lg border border-gray-50 bg-gray-50/50">
                                                                            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                                                                <input type="checkbox"
                                                                                    className="accent-emerald-500"
                                                                                    checked={isAddSelected}
                                                                                    onChange={(e) => {
                                                                                        const checked = e.target.checked;
                                                                                        setFormData(prev => ({
                                                                                            ...prev, 
                                                                                            servicePricing: { 
                                                                                                ...prev.servicePricing, 
                                                                                                [service.id]: { 
                                                                                                    ...pricing, 
                                                                                                    additions: { 
                                                                                                        ...(pricing.additions || {}), 
                                                                                                        [addition.id]: { 
                                                                                                            ...addState,
                                                                                                            selected: checked, 
                                                                                                            pricingType: addType,
                                                                                                            fixedPrice: addState.fixedPrice || addition.fixed_price || '',
                                                                                                            pricePerUnit: addState.pricePerUnit || addition.price_per_unit || '',
                                                                                                            minUnits: addState.minUnits || addition.min_units || '',
                                                                                                            maxUnits: addState.maxUnits || addition.max_units || '',
                                                                                                            notes: addState.notes || ''
                                                                                                        } 
                                                                                                    } 
                                                                                                } 
                                                                                            }
                                                                                        }))
                                                                                    }}
                                                                                />
                                                                                <span className="font-medium">{addition.name}</span>
                                                                            </label>

                                                                            {isAddSelected && (
                                                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 ml-6">
                                                                                    <select
                                                                                        className="text-[11px] border border-gray-200 rounded p-1.5 focus:border-emerald-400 outline-none w-full sm:w-auto"
                                                                                        value={addType}
                                                                                        onChange={(e) => setFormData(prev => ({
                                                                                            ...prev, servicePricing: { ...prev.servicePricing, [service.id]: { ...pricing, additions: { ...pricing.additions, [addition.id]: { ...addState, pricingType: e.target.value } } } }
                                                                                        }))}
                                                                                    >
                                                                                        <option value="per_hour">Per Hour</option>
                                                                                        <option value="flat_rate">Flat Rate</option>
                                                                                        <option value="max_price">Max Price (Mixed)</option>
                                                                                    </select>

                                                                                    <div className="flex flex-wrap items-center gap-2 w-full">
                                                                                        {(addType === 'flat_rate' || addType === 'max_price') && (
                                                                                            <input 
                                                                                                type="number"
                                                                                                placeholder="Fixed Price"
                                                                                                className="text-[11px] p-1.5 border border-gray-200 rounded w-24 outline-none focus:border-emerald-400"
                                                                                                value={addState.fixedPrice || ''}
                                                                                                onChange={(e) => setFormData(prev => ({
                                                                                                    ...prev, servicePricing: { ...prev.servicePricing, [service.id]: { ...pricing, additions: { ...pricing.additions, [addition.id]: { ...addState, fixedPrice: e.target.value } } } }
                                                                                                }))}
                                                                                            />
                                                                                        )}
                                                                                        {(addType === 'per_hour' || addType === 'max_price') && (
                                                                                            <>
                                                                                                <input 
                                                                                                    type="number"
                                                                                                    placeholder="Price/Unit"
                                                                                                    className="text-[11px] p-1.5 border border-gray-200 rounded w-20 outline-none focus:border-emerald-400"
                                                                                                    value={addState.pricePerUnit || ''}
                                                                                                    onChange={(e) => setFormData(prev => ({
                                                                                                        ...prev, servicePricing: { ...prev.servicePricing, [service.id]: { ...pricing, additions: { ...pricing.additions, [addition.id]: { ...addState, pricePerUnit: e.target.value } } } }
                                                                                                    }))}
                                                                                                />
                                                                                                <input 
                                                                                                    type="number"
                                                                                                    placeholder="Min Units"
                                                                                                    className="text-[11px] p-1.5 border border-gray-200 rounded w-20 outline-none focus:border-emerald-400"
                                                                                                    value={addState.minUnits || ''}
                                                                                                    onChange={(e) => setFormData(prev => ({
                                                                                                        ...prev, servicePricing: { ...prev.servicePricing, [service.id]: { ...pricing, additions: { ...pricing.additions, [addition.id]: { ...addState, minUnits: e.target.value } } } }
                                                                                                    }))}
                                                                                                />
                                                                                                <input 
                                                                                                    type="number"
                                                                                                    placeholder="Max Units"
                                                                                                    className="text-[11px] p-1.5 border border-gray-200 rounded w-20 outline-none focus:border-emerald-400"
                                                                                                    value={addState.maxUnits || ''}
                                                                                                    onChange={(e) => setFormData(prev => ({
                                                                                                        ...prev, servicePricing: { ...prev.servicePricing, [service.id]: { ...pricing, additions: { ...pricing.additions, [addition.id]: { ...addState, maxUnits: e.target.value } } } }
                                                                                                    }))}
                                                                                                />
                                                                                            </>
                                                                                        )}
                                                                                        
                                                                                        {isCustomAddition && (
                                                                                            <input 
                                                                                                type="text"
                                                                                                placeholder="Note required *"
                                                                                                className={`text-[11px] p-1.5 border rounded flex-1 min-w-[150px] outline-none focus:border-emerald-400 ${!addState.notes?.trim() ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}
                                                                                                value={addState.notes || ''}
                                                                                                onChange={(e) => setFormData(prev => ({
                                                                                                    ...prev, servicePricing: { ...prev.servicePricing, [service.id]: { ...pricing, additions: { ...pricing.additions, [addition.id]: { ...addState, notes: e.target.value } } } }
                                                                                                }))}
                                                                                            />
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Row 4: Primary Address */}
                    <div className="py-4 border-b border-gray-100">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            4. {t("orderSteps.primaryAddress") || "Primary Address"}
                        </h2>
                        {/* تمرير prop (addressType) لكي يعلم المكون أنه يتعامل مع العنوان الأساسي */}
                        <SiteAdminAddressStep {...primaryStepProps} />
                    </div>

                    {/* Row 5: Secondary Address */}
                    <div className="py-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            5. {t("orderSteps.secondaryAddress") || "Secondary Address (Optional)"}
                        </h2>
                        {/* تمرير prop (addressType) لكي يعلم المكون أنه يتعامل مع العنوان الثاني */}
                        <SiteAdminAddressStep {...secondaryStepProps} />
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
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(completedCount / 6) * 100}%` }} />
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
                            className="flex-1 sm:flex-none px-5 py-2 text-xs bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-md"
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
                                    <span>{t("siteAdmin.dashboard.createOrder") || "Create Order"}</span>
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
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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