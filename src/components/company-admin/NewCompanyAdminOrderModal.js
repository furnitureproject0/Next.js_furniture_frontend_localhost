"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch } from "@/store/hooks";
import { createCompanyAdminOrder } from "@/store/slices/ordersSlice";
import { ApiError } from "@/lib/api";
import { useState } from "react";
import {
	LOCATION_TYPES_WITH_FLOOR,
	LOCATION_TYPES_WITH_BUILDING_FLOORS,
} from "@/constants/orderConstants";

// Import step components
import CustomerAddressStep from "@/components/customer/order-steps/CustomerAddressStep";
import CustomerRoomConfigStep from "@/components/customer/order-steps/CustomerRoomConfigStep";
import CustomerScheduleStep from "@/components/customer/order-steps/CustomerScheduleStep";
import CustomerServiceStep from "@/components/customer/order-steps/CustomerServiceStep";
import CreateUserModal from "./CreateUserModal";
import CustomerEmailStep from "./order-steps/CustomerEmailStep";

const TOTAL_STEPS = 5; // Email step + 4 original steps

const INITIAL_FORM_DATA = {
	customerEmail: "",
	customerId: null,
	customerName: "",
	clientInfo: null,
	services: [],
	serviceAdditions: {}, // { serviceId: { additionId: { note: "" }, ... } }
	servicesMetadata: {}, // { serviceId: { name, internalId } } - for validation
	fromAddress: { 
		locationType: "", 
		fullAddress: "", 
		floor: 0, 
		numberOfFloors: 0,
		numberOfRooms: 0,
		area: 0,
		hasElevator: false, 
		needsCrane: false,
		notes: "",
		lat: null,
		lon: null,
		place_id: null
	},
	toAddress: { 
		locationType: "", 
		fullAddress: "", 
		floor: 0, 
		numberOfFloors: 0,
		numberOfRooms: 0,
		area: 0,
		hasElevator: false, 
		needsCrane: false,
		notes: "",
		lat: null,
		lon: null,
		place_id: null
	},
	extraAddress: { 
		locationType: "", 
		fullAddress: "", 
		floor: 0, 
		numberOfFloors: 0,
		numberOfRooms: 0,
		area: 0,
		hasElevator: false, 
		needsCrane: false,
		notes: "",
		lat: null,
		lon: null,
		place_id: null
	},
	roomDescription: "",
	images: [],
	scheduledDate: "",
	scheduledTime: "",
	notes: "",
};

export default function NewCompanyAdminOrderModal({
	isOpen,
	onClose,
	onOrderCreated,
}) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const STEP_TITLES = [
		t("orderSteps.selectCustomer"),
		t("orderSteps.selectServices"),
		t("orderSteps.addressesDetails"),
		t("orderSteps.roomConfiguration"),
		t("orderSteps.scheduleNotes"),
	];
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);
	const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hasSubmitted, setHasSubmitted] = useState(false); // Prevent double submission

	if (!isOpen) return null;

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

	const handleClose = () => {
		setCurrentStep(1);
		setFormData(INITIAL_FORM_DATA);
		setIsCreateUserModalOpen(false);
		setError(null);
		setIsSubmitting(false);
		setHasSubmitted(false); // Reset submission flag
		onClose();
	};

	const validateStep = (step) => {
		switch (step) {
			case 1:
				// Step 1: Email step - customer must be found or created
				return !!formData.customerId && !!formData.customerEmail && formData.customerEmail.trim();
				
			case 2:
				// Step 2: Service selection - at least one service must be selected
				return formData.services.length > 0;
				
			case 3: {
				// Step 3: Address validation - comprehensive validation
				// Check if any selected service is furniture moving type
				const hasFurnitureMoving = formData.services.some(serviceId => {
					const metadata = formData.servicesMetadata?.[serviceId];
					return metadata?.internalId === "furniture_moving" || 
						metadata?.name === "Moving";
				});
				
				// Validate fromAddress (always required)
				const fromAddressValid = 
					formData.fromAddress.locationType &&
					formData.fromAddress.fullAddress && 
					formData.fromAddress.fullAddress.trim() &&
					formData.fromAddress.lat !== null && 
					formData.fromAddress.lat !== undefined &&
					formData.fromAddress.lon !== null && 
					formData.fromAddress.lon !== undefined;
				
				// Validate toAddress (required for furniture_moving)
				const toAddressValid = !hasFurnitureMoving ? true : (
					formData.toAddress.locationType &&
					formData.toAddress.fullAddress && 
					formData.toAddress.fullAddress.trim() &&
					formData.toAddress.lat !== null && 
					formData.toAddress.lat !== undefined &&
					formData.toAddress.lon !== null && 
					formData.toAddress.lon !== undefined
				);
				
				// Validate conditional fields based on location type
				const locationType = formData.fromAddress.locationType || "";
				const showFloorNumber = LOCATION_TYPES_WITH_FLOOR.includes(locationType);
				const showNumberOfFloors = LOCATION_TYPES_WITH_BUILDING_FLOORS.includes(locationType);
				
				let fromAddressFieldsValid = true;
				if (showFloorNumber) {
					fromAddressFieldsValid = fromAddressFieldsValid && 
						formData.fromAddress.floor !== undefined && 
						formData.fromAddress.floor !== null &&
						formData.fromAddress.numberOfRooms && 
						formData.fromAddress.numberOfRooms > 0;
				}
				if (showNumberOfFloors) {
					fromAddressFieldsValid = fromAddressFieldsValid && 
						formData.fromAddress.numberOfFloors && 
						formData.fromAddress.numberOfFloors > 0;
				}
				
				return fromAddressValid && toAddressValid && fromAddressFieldsValid;
			}
			case 4:
				// Step 4: Room config is optional
				return true;
				
			case 5: {
				// Step 5: Schedule validation - date and time required
				const dateValid = formData.scheduledDate && formData.scheduledDate.trim();
				const timeValid = formData.scheduledTime && formData.scheduledTime.trim();
				
				// Validate date is in the future
				if (dateValid) {
					const selectedDate = new Date(formData.scheduledDate);
					const tomorrow = new Date();
					tomorrow.setDate(tomorrow.getDate() + 1);
					tomorrow.setHours(0, 0, 0, 0);
					
					if (selectedDate < tomorrow) {
						return false;
					}
				}
				
				return dateValid && timeValid;
			}
			default:
				return false;
		}
	};

	const handleEmailValid = (user) => {
		// Customer found, update form data but don't auto-advance
		// User must click "Next" to proceed
		setFormData((prev) => ({
			...prev,
			customerEmail: user.email,
			customerId: user.id,
			customerName: user.name,
			clientInfo: user,
		}));
		// Clear any errors on success
		setError(null);
	};

	const handleUserCreated = (newUser) => {
		// Update form data with new user
		setFormData((prev) => ({
			...prev,
			customerEmail: newUser.email,
			customerId: newUser.id,
			customerName: newUser.name,
			clientInfo: {
				id: newUser.id,
				email: newUser.email,
				name: newUser.name,
				is_verified: newUser.is_verified,
			},
		}));
		setIsCreateUserModalOpen(false);
		// Clear any errors on success
		setError(null);
		// Don't auto-advance - user must click "Next" to proceed
	};

	const handleSubmit = async () => {
		// Prevent double submission
		if (isSubmitting || hasSubmitted) {
			return;
		}

		// Format location object for API - matches endpoint structure
		// Only include fields that the backend expects (no id, lat, lon, number_of_floors, createdAt, updatedAt, etc.)
		const formatLocation = (addressData) => {
			if (!addressData.fullAddress || !addressData.fullAddress.trim()) {
				return null;
			}
			
			// Create a clean location object with ONLY the fields the backend expects
			// Based on error messages, backend does NOT want: id, lat, lon, number_of_floors, createdAt, updatedAt
			const location = {
				address: addressData.fullAddress.trim(),
				type: addressData.locationType || "",
				floor: Number(addressData.floor) || 0,
				area: addressData.area !== null && addressData.area !== undefined && addressData.area > 0 
					? Number(addressData.area) 
					: 0,
				num_of_floors: addressData.numberOfFloors !== null && addressData.numberOfFloors !== undefined && addressData.numberOfFloors > 0
					? Number(addressData.numberOfFloors)
					: 0,
				has_elevator: addressData.hasElevator || false,
				latitude: addressData.lat !== null && addressData.lat !== undefined && addressData.lat !== 0
					? Number(addressData.lat) 
					: 0,
				longitude: addressData.lon !== null && addressData.lon !== undefined && addressData.lon !== 0
					? Number(addressData.lon) 
					: 0,
				notes: (addressData.notes && addressData.notes.trim() && addressData.notes !== "N/A") 
					? addressData.notes.trim() 
					: "N/A", // Send "N/A" if empty (backend requires non-empty string)
			};
			
			// Remove any undefined or null values that might cause issues
			Object.keys(location).forEach(key => {
				if (location[key] === undefined || location[key] === null) {
					delete location[key];
				}
			});
			
			return location;
		};

		// Convert scheduledTime to format expected by API (HH:MM:SS)
		let preferredTime = formData.scheduledTime || "09:00";
		if (preferredTime.includes("-")) {
			preferredTime = preferredTime.split("-")[0].trim();
		} else if (preferredTime === "flexible") {
			preferredTime = "09:00";
		}
		
		// Ensure time format is HH:MM:SS
		if (preferredTime && preferredTime.length === 5 && preferredTime.includes(":")) {
			preferredTime = `${preferredTime}:00`;
		}

		// Format services array with additions - matches endpoint structure
		const formatServices = () => {
			return formData.services.map(serviceId => {
				const selectedAdditions = formData.serviceAdditions?.[serviceId] || {};
				
				// Format additions array from object format { additionId: { note: "" }, ... }
				const additions = Object.entries(selectedAdditions).map(([additionId, additionData]) => ({
					addition_id: Number(additionId),
					note: (additionData?.note?.trim()) || "N/A", // Send "N/A" if empty (backend requires non-empty string)
				}));

				return {
					service_id: serviceId,
					additions: additions,
				};
			});
		};

		// Validate required fields before submission
		if (!formData.customerEmail || !formData.customerEmail.trim()) {
			setError("Customer email is required");
			return;
		}

		// Format data to match endpoint requirements - matches endpoint structure exactly
		const location = formatLocation(formData.fromAddress);
		const destinationLocation = formatLocation(formData.toAddress);
		
		if (!location) {
			setError("Location address is required");
			return;
		}
		
		// Build order data object - matches endpoint structure exactly
		// Only include fields that the backend expects
		const orderData = {
			email: formData.customerEmail.trim(), // Required for company admin endpoint
			preferred_date: formData.scheduledDate,
			preferred_time: preferredTime,
			number_of_rooms: (formData.fromAddress.numberOfRooms && formData.fromAddress.numberOfRooms > 0) 
				? formData.fromAddress.numberOfRooms 
				: 1, // Default to 1 if not filled (backend requires >= 1)
			location: location, // Required - should not be null
			services: formatServices(),
			notes: (formData.notes && formData.notes.trim() && formData.notes !== "N/A") 
				? formData.notes.trim() 
				: "N/A", // Send "N/A" if empty (backend requires non-empty string)
		};
		
		// Only include destination_location if it's not null
		if (destinationLocation) {
			orderData.destination_location = destinationLocation;
		}

		// Prevent double submission - check again right before API call
		if (isSubmitting || hasSubmitted) {
			console.warn("Prevented double submission");
			return;
		}

		setError(null);
		setIsSubmitting(true);
		setHasSubmitted(true); // Mark as submitted to prevent double submission

		try {
			// Use Redux thunk to create order
			const result = await dispatch(createCompanyAdminOrder(orderData));
			
			if (createCompanyAdminOrder.fulfilled.match(result)) {
				// Call onOrderCreated callback with the created order data
				if (onOrderCreated) {
					onOrderCreated(result.payload);
				}
				// Close modal after successful creation
				handleClose();
			} else {
				// Handle error from Redux thunk
				const errorData = result.payload || {};
				
				// Extract field-specific errors if available
				if (errorData.errors) {
					const fieldErrors = {};
					Object.keys(errorData.errors).forEach(field => {
						const errorMessages = errorData.errors[field];
						if (Array.isArray(errorMessages) && errorMessages.length > 0) {
							fieldErrors[field] = errorMessages[0];
						}
					});
					
					// Show first error message
					const firstError = Object.values(fieldErrors)[0] || errorData.message || "Failed to create order. Please try again.";
					setError(firstError);
				} else {
					const errorMessage = errorData.message || "Failed to create order. Please try again.";
					setError(errorMessage);
				}
				setHasSubmitted(false); // Reset on error to allow retry
			}
		} catch (error) {
			console.error("Error creating order:", error);
			
			// Extract field-specific errors if available
			if (error instanceof ApiError && error.data?.errors) {
				const fieldErrors = {};
				Object.keys(error.data.errors).forEach(field => {
					const errorMessages = error.data.errors[field];
					if (Array.isArray(errorMessages) && errorMessages.length > 0) {
						fieldErrors[field] = errorMessages[0];
					}
				});
				
				// Show first error message
				const firstError = Object.values(fieldErrors)[0] || error.message || "Failed to create order. Please try again.";
				setError(firstError);
			} else {
				setError(error.message || "Failed to create order. Please try again.");
			}
			setHasSubmitted(false); // Reset on error to allow retry
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderStepContent = () => {
		const stepProps = {
			formData,
			setFormData,
		};

		switch (currentStep) {
			case 1:
				return (
					<CustomerEmailStep
						{...stepProps}
						onEmailValid={handleEmailValid}
						onCreateUserClick={() => setIsCreateUserModalOpen(true)}
					/>
				);
			case 2:
				return <CustomerServiceStep {...stepProps} />;
			case 3:
				return <CustomerAddressStep {...stepProps} />;
			case 4:
				return <CustomerRoomConfigStep {...stepProps} />;
			case 5:
				return <CustomerScheduleStep {...stepProps} />;
			default:
				return null;
		}
	};

	const canProceed = validateStep(currentStep);

	return (
		<>
			<div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
				<div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
					{/* Header */}
					<div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 border-b border-orange-100">
						<div className="flex-1 min-w-0 pr-2">
							<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 truncate">
								{t("orderSteps.createNewOrder")}
							</h2>
							<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1 truncate">
								{t("orderSteps.stepOf", { current: currentStep, total: TOTAL_STEPS, title: STEP_TITLES[currentStep - 1] })}
							</p>
						</div>
						<button
							onClick={handleClose}
							className="p-1.5 sm:p-2 hover:bg-orange-50 rounded-lg transition-colors flex-shrink-0"
						>
							<svg
								className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					{/* Progress Bar */}
					<div className="px-4 sm:px-5 lg:px-6 pt-3 sm:pt-4">
						<div className="flex flex-wrap items-center justify-between gap-1 sm:gap-0 mb-1.5 sm:mb-2">
							{STEP_TITLES.map((title, index) => (
								<div
									key={index}
									className={`text-[10px] sm:text-xs font-medium ${
										index + 1 === currentStep
											? "text-orange-600"
											: index + 1 < currentStep
											? "text-green-600"
											: "text-gray-400"
									}`}
								>
									{index + 1}. {title}
								</div>
							))}
						</div>
						<div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-orange-500 to-amber-600 transition-all duration-300"
								style={{
									width: `${(currentStep / TOTAL_STEPS) * 100}%`,
								}}
							/>
						</div>
					</div>

					{/* Content */}
					<div className="p-4 sm:p-5 lg:p-6 overflow-y-auto flex-1 max-h-[calc(95vh-280px)] sm:max-h-[calc(90vh-280px)]">
						{error && (
							<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-600">{error}</p>
							</div>
						)}
						{renderStepContent()}
					</div>

					{/* Footer */}
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 p-4 sm:p-5 lg:p-6 border-t border-orange-100 bg-orange-50/30">
						<button
							onClick={handleBack}
							disabled={currentStep === 1}
							className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2"
						>
							<svg
								className="w-4 h-4 sm:w-5 sm:h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							{t("common.buttons.back")}
						</button>

						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
							<button
								onClick={handleClose}
								className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors"
							>
								{t("common.buttons.cancel")}
							</button>
							{currentStep < TOTAL_STEPS ? (
								<button
									onClick={handleNext}
									disabled={!canProceed}
									className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
								>
									{t("common.buttons.next")}
									<svg
										className="w-4 h-4 sm:w-5 sm:h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</button>
							) : (
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										if (!isSubmitting && !hasSubmitted) {
											handleSubmit();
										}
									}}
									disabled={!canProceed || isSubmitting || hasSubmitted}
									className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
								>
									{isSubmitting ? (
										<>
											<div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
											<span className="hidden sm:inline">{t("common.buttons.submitting") || "Submitting..."}</span>
											<span className="sm:hidden">...</span>
										</>
									) : (
										t("common.buttons.submit")
									)}
								</button>
							)}
						</div>
					</div>
				</div>
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

