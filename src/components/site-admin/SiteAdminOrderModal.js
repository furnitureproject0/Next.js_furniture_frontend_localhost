"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { useAppDispatch } from "@/store/hooks";
import { useState, useMemo, useEffect, useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";

// Shared logic
import {
	INITIAL_FORM_DATA,
	validateOrderStep
} from "../customer/order-steps/orderWizardModel";

// UI Components
import SiteAdminCompanySelectionStep from "./order-steps/SiteAdminCompanySelectionStep";
import SiteAdminServiceStep from "./order-steps/SiteAdminServiceStep";
import SiteAdminAddressStep from "./order-steps/SiteAdminAddressStep";
import CustomerScheduleStep from "../customer/order-steps/CustomerScheduleStep";
import CustomerEmailStep from "../company-admin/order-steps/CustomerEmailStep";
import CreateUserModal from "../company-admin/CreateUserModal";
import ModalHeader from "./modal/ModalHeader";
import ProgressStepper from "./modal/ProgressStepper";
import ModalFooter from "./modal/ModalFooter";

const TOTAL_STEPS = 5;

export default function SiteAdminOrderModal({
	isOpen,
	onClose,
	onOrderCreated,
}) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { toast } = useGlobalToast();

	const STEP_TITLES = [
		t("orderSteps.companySelection") || "Company & Type",
		t("orderSteps.selectCustomer") || "Customer Selection",
		t("orderSteps.selectServices"),
		t("orderSteps.addressesDetails"),
		t("orderSteps.scheduleNotes"),
	];

	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState({
		...INITIAL_FORM_DATA,
		servicePricing: {},
		customerEmail: "",
		customerId: null,
		customerName: "",
		clientInfo: null,
	});

	const [companyScope, setCompanyScope] = useState("internal"); // "internal" | "external"
	const [selectedCompanyId, setSelectedCompanyId] = useState(null);
	const [orderType, setOrderType] = useState("order"); // "order" | "offer"
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [showCloseConfirm, setShowCloseConfirm] = useState(false);
	const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

	const modalContentRef = useRef(null);

	// Fetch companies
	const {
		internalCompanies,
		externalCompanies,
		isLoading: isLoadingCompanies,
		error: companiesError
	} = useCompanies(isOpen);

	const availableCompanies = useMemo(() =>
		companyScope === "internal" ? internalCompanies : externalCompanies,
		[companyScope, internalCompanies, externalCompanies]);

	// Reset company when scope changes
	useEffect(() => {
		setSelectedCompanyId(null);
	}, [companyScope]);

	// Handle click outside modal
	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (event) => {
			// Don't close if creating user modal is open
			if (isCreateUserModalOpen) return;
			
			if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
				handleCloseAttempt();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen, isCreateUserModalOpen]);

	const validateStep = (step) => {
		if (step === 1) return selectedCompanyId !== null;
		
		if (step === 2) {
			return !!formData.customerId && !!formData.customerEmail && !!formData.customerEmail.trim();
		}

		if (step === 3) {
			if (!formData.services || formData.services.length === 0) return false;
			// If internal company and order type is "offer", validate pricing
			if (companyScope === "internal") {
				for (const serviceId of formData.services) {
					const pricing = formData.servicePricing?.[serviceId];
					if (!pricing || !pricing.minHours || !pricing.maxHours || !pricing.pricePerHour) {
						return false;
					}
					// Basic validation logic
					if (parseFloat(pricing.minHours) <= 0 || parseFloat(pricing.maxHours) < parseFloat(pricing.minHours) || parseFloat(pricing.pricePerHour) <= 0) {
						return false;
					}
				}
			}
			return true;
		}
		
		// Map SiteAdmin steps to shared validation steps
		if (step === 4) return validateOrderStep(2, formData); // Address
		if (step === 5) return validateOrderStep(4, formData); // Schedule

		return false;
	};

	const handleNext = () => {
		if (currentStep < TOTAL_STEPS && validateStep(currentStep)) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleStepClick = (step) => {
		if (step <= currentStep || (step > currentStep && validateStep(currentStep - 1))) {
			setCurrentStep(step);
		}
	};

	const handleCloseAttempt = () => {
		const hasData = formData.services?.length > 0 || selectedCompanyId !== null;
		if (hasData) setShowCloseConfirm(true);
		else handleClose();
	};

	const handleClose = () => {
		setCurrentStep(1);
		setFormData({
			...INITIAL_FORM_DATA,
			servicePricing: {},
			customerEmail: "",
			customerId: null,
			customerName: "",
			clientInfo: null,
		});
		setSelectedCompanyId(null);
		setCompanyScope("internal");
		setOrderType("order");
		setError(null);
		setShowCloseConfirm(false);
		setIsCreateUserModalOpen(false);
		onClose();
	};

	const handleCancelClose = () => setShowCloseConfirm(false);

	const handleEmailValid = (user) => {
		setFormData((prev) => ({
			...prev,
			customerEmail: user.email,
			customerId: user.id,
			customerName: user.name,
			clientInfo: user,
		}));
		setError(null);
	};

	const handleUserCreated = (newUser) => {
		setFormData((prev) => ({
			...prev,
			customerEmail: newUser.email,
			customerId: newUser.id,
			customerName: newUser.name,
			clientInfo: newUser,
		}));
		setIsCreateUserModalOpen(false);
		setError(null);
	};

	const handleSubmit = async () => {
		console.log("Submit started");
		setError(null);
		setIsSubmitting(true);
		try {
			// Build locations
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

			// Format time
			let preferredTime = formData.scheduledTime || "09:00";
			if (preferredTime.includes("-")) preferredTime = preferredTime.split("-")[0].trim();
			if (preferredTime === "flexible") preferredTime = "09:00";
			if (preferredTime.length === 5) preferredTime += ":00";

			// Build rooms
			let rooms = [];
			if (formData.fromAddress?.roomConfigurations?.length > 0) {
				rooms = formData.fromAddress.roomConfigurations.map(r => ({
					room_type: r.roomType,
					quantity: r.quantity
				}));
			} else if (formData.roomDescription) {
				rooms = [{ room_type: formData.roomDescription, quantity: 1 }];
			}

			// Build services
			const services = (formData.services || []).map(serviceId => {
				const serviceObj = { service_id: serviceId, additions: [] };
				const selectedAdditions = formData.serviceAdditions?.[serviceId] || {};
				
				Object.entries(selectedAdditions).forEach(([additionId, additionData]) => {
					if (additionData) {
						const additionPayload = {
							addition_id: parseInt(additionId),
							note: additionData.note || ""
						};

						// Add pricing details if it's an internal offer
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

				// Handle Company Assignment / Offer logic
				serviceObj.company_id = selectedCompanyId;
				
				// Always send offer details if company is internal, regardless of orderType
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

			console.log("Submitting order:", requestBody);

			const { siteAdminApi } = await import("@/lib/api");
			const response = await siteAdminApi.createOrder(requestBody);

			if (response && response.success) {
				toast.success(t("orders.createSuccess") || "Order created successfully");
				if (onOrderCreated) {
					onOrderCreated(response.data);
				}
				handleClose();
			} else {
				throw new Error(response?.message || "Failed to create order");
			}

		} catch (err) {
			console.error("Submission error:", err);
			const errorMessage = err.message || "Failed to create order";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const stepProps = {
		formData,
		setFormData,
		companyScope,
		orderType,
	};

	if (!isOpen) return null;

	return (
		<>
			<div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
				<div
					ref={modalContentRef}
					className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
				>
					<ModalHeader
						currentStep={currentStep}
						totalSteps={TOTAL_STEPS}
						stepTitles={STEP_TITLES}
						onClose={handleCloseAttempt}
						t={t}
					/>

					<ProgressStepper
						currentStep={currentStep}
						totalSteps={TOTAL_STEPS}
						stepTitles={STEP_TITLES}
						onStepClick={handleStepClick}
						isStepValid={validateStep}
					/>

					{/* Content */}
					<div className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto">
						{currentStep === 1 && (
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
						)}
						{currentStep === 2 && (
							<CustomerEmailStep
								{...stepProps}
								onEmailValid={handleEmailValid}
								onCreateUserClick={() => setIsCreateUserModalOpen(true)}
							/>
						)}
						{currentStep === 3 && <SiteAdminServiceStep {...stepProps} />}
						{currentStep === 4 && <SiteAdminAddressStep {...stepProps} />}
						{currentStep === 5 && <CustomerScheduleStep {...stepProps} />}

						{error && (
							<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
								{error}
							</div>
						)}
					</div>

					{/* Footer */}
					<ModalFooter
						currentStep={currentStep}
						totalSteps={TOTAL_STEPS}
						canProceed={validateStep(currentStep)}
						isSubmitting={isSubmitting}
						onBack={handleBack}
						onNext={handleNext}
						onSubmit={handleSubmit}
						onCancel={handleCloseAttempt}
						t={t}
					/>
				</div>

				{/* Close Confirmation Dialog */}
				{showCloseConfirm && (
					<div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60">
						<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								{t("common.confirmClose")}
							</h3>
							<p className="text-gray-600 mb-6">
								{t("common.unsavedChanges")}
							</p>
							<div className="flex gap-3 justify-end">
								<button
									onClick={handleCancelClose}
									className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
								>
									{t("common.buttons.cancel")}
								</button>
								<button
									onClick={handleClose}
									className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
								>
									{t("common.closeAnyway")}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Create User Modal */}
			<CreateUserModal
				isOpen={isCreateUserModalOpen}
				onClose={() => setIsCreateUserModalOpen(false)}
				onUserCreated={handleUserCreated}
			/>
		</>
	);
}
