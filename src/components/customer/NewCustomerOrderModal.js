"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import { createCustomerOrder } from "@/store/slices/ordersSlice";
import { useState } from "react";
import {
	LOCATION_TYPES_WITH_FLOOR,
	LOCATION_TYPES_WITH_BUILDING_FLOORS,
} from "@/constants/orderConstants";

// Shared logic
import { 
	validateOrderStep, 
	formatOrderPayload 
} from "./order-steps/orderWizardModel";

// UI Components
import OrderWizardModal from "../order-wizard/OrderWizardModal";
import CustomerAddressStep from "./order-steps/CustomerAddressStep";
import CustomerRoomConfigStep from "./order-steps/CustomerRoomConfigStep";
import CustomerScheduleStep from "./order-steps/CustomerScheduleStep";
import CustomerServiceStep from "./order-steps/CustomerServiceStep";

const TOTAL_STEPS = 4;

const INITIAL_FORM_DATA = {
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
		notes: "",
		lat: null,
		lon: null,
		place_id: null,
		// Manual address fields (when OSM fails)
		buildingNumber: "",
		streetName: "",
		city: "",
		country: "",
		useManualAddress: false
	},
	toAddress: { 
		locationType: "", 
		fullAddress: "", 
		floor: 0, 
		numberOfFloors: 0,
		numberOfRooms: 0,
		area: 0,
		hasElevator: false, 
		notes: "",
		lat: null,
		lon: null,
		place_id: null,
		// Manual address fields (when OSM fails)
		buildingNumber: "",
		streetName: "",
		city: "",
		country: "",
		useManualAddress: false
	},
	roomConfigurations: [], // Array of { roomType: string, quantity: number }
	images: [],
	scheduledDate: "",
	scheduledTime: "",
	notes: "",
};

export default function NewCustomerOrderModal({
	isOpen,
	onClose,
	onOrderCreated,
}) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const STEP_TITLES = [
		t("orderSteps.selectServices"),
		t("orderSteps.addressesDetails"),
		t("orderSteps.roomConfiguration"),
		t("orderSteps.scheduleNotes"),
	];
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [validationErrors, setValidationErrors] = useState({}); // Store validation errors per step
	const user = useAppSelector(selectUser);

	if (!isOpen) return null;

	const handleNext = () => {
		if (currentStep < TOTAL_STEPS) {
			const errors = validateStepAndGetErrors(currentStep);
			if (Object.keys(errors).length === 0) {
				setValidationErrors({});
				setCurrentStep(currentStep + 1);
			} else {
				setValidationErrors(errors);
			}
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setValidationErrors({}); // Clear validation errors when going back
			setCurrentStep(currentStep - 1);
		}
	};

	const handleClose = () => {
		setCurrentStep(1);
		setFormData(INITIAL_FORM_DATA);
		setError(null);
		setIsSubmitting(false);
		setValidationErrors({});
		onClose();
	};

	const resetForm = () => {
		setFormData(INITIAL_FORM_DATA);
		setCurrentStep(1);
		setValidationErrors({});
	};

	// Enhanced validation function for each step - returns true/false
	const validateStep = (step) => {
		const errors = validateStepAndGetErrors(step);
		return Object.keys(errors).length === 0;
	};

	// Enhanced validation function that returns errors object
	const validateStepAndGetErrors = (step) => {
		const errors = {};
		switch (step) {
			case 1:
				// Step 1: Service selection - at least one service must be selected
				if (formData.services.length === 0) {
					errors.services = t("orderSteps.validation.servicesRequired") || "At least one service must be selected";
				}
				break;
				
			case 2: {
				// Step 2: Address validation - comprehensive validation
				// Check if any selected service is furniture moving type
				const hasFurnitureMoving = formData.services.some(serviceId => {
					const metadata = formData.servicesMetadata?.[serviceId];
					return metadata?.internalId === "furniture_moving" || 
						metadata?.name === "Moving";
				});
				
				// Validate fromAddress (always required)
				if (!formData.fromAddress.locationType) {
					errors.fromAddress_locationType = t("orderSteps.validation.locationTypeRequired") || "Location type is required";
				}
				if (!formData.fromAddress.fullAddress || !formData.fromAddress.fullAddress.trim()) {
					errors.fromAddress_fullAddress = t("orderSteps.validation.addressRequired") || "Address is required";
				}
				// Validate coordinates (lat/lon or manual address)
				if (!formData.fromAddress.useManualAddress) {
					if (formData.fromAddress.lat === null || formData.fromAddress.lat === undefined || 
						formData.fromAddress.lon === null || formData.fromAddress.lon === undefined) {
						errors.fromAddress_coordinates = t("orderSteps.validation.addressCoordinatesRequired") || "Please select an address from the search results";
					}
				}
				// Validate conditional fields
				const locationType = formData.fromAddress.locationType || "";
				const showFloorNumber = LOCATION_TYPES_WITH_FLOOR.includes(locationType);
				const showNumberOfFloors = LOCATION_TYPES_WITH_BUILDING_FLOORS.includes(locationType);
				
				if (showFloorNumber && (formData.fromAddress.floor === undefined || formData.fromAddress.floor === null || formData.fromAddress.floor < 0)) {
					errors.fromAddress_floor = t("orderSteps.validation.floorRequired") || "Floor number is required";
				}
				if (showNumberOfFloors && (!formData.fromAddress.numberOfFloors || formData.fromAddress.numberOfFloors <= 0)) {
					errors.fromAddress_numberOfFloors = t("orderSteps.validation.floorsRequired") || "Number of floors is required";
				}
				if (!formData.fromAddress.numberOfRooms || formData.fromAddress.numberOfRooms <= 0) {
					errors.fromAddress_numberOfRooms = t("orderSteps.validation.roomsRequired") || "Number of rooms is required";
				}
				if (!formData.fromAddress.area || formData.fromAddress.area <= 0) {
					errors.fromAddress_area = t("orderSteps.validation.areaRequired") || "Area is required";
				}
				
				// Validate toAddress (required for furniture_moving)
				if (hasFurnitureMoving) {
					if (!formData.toAddress.locationType) {
						errors.toAddress_locationType = t("orderSteps.validation.locationTypeRequired") || "Location type is required";
					}
					if (!formData.toAddress.fullAddress || !formData.toAddress.fullAddress.trim()) {
						errors.toAddress_fullAddress = t("orderSteps.validation.addressRequired") || "Address is required";
					}
					if (!formData.toAddress.useManualAddress) {
						if (formData.toAddress.lat === null || formData.toAddress.lat === undefined || 
							formData.toAddress.lon === null || formData.toAddress.lon === undefined) {
							errors.toAddress_coordinates = t("orderSteps.validation.addressCoordinatesRequired") || "Please select an address from the search results";
						}
					}
					if (showFloorNumber && (formData.toAddress.floor === undefined || formData.toAddress.floor === null || formData.toAddress.floor < 0)) {
						errors.toAddress_floor = t("orderSteps.validation.floorRequired") || "Floor number is required";
					}
					if (showNumberOfFloors && (!formData.toAddress.numberOfFloors || formData.toAddress.numberOfFloors <= 0)) {
						errors.toAddress_numberOfFloors = t("orderSteps.validation.floorsRequired") || "Number of floors is required";
					}
					if (!formData.toAddress.numberOfRooms || formData.toAddress.numberOfRooms <= 0) {
						errors.toAddress_numberOfRooms = t("orderSteps.validation.roomsRequired") || "Number of rooms is required";
					}
					if (!formData.toAddress.area || formData.toAddress.area <= 0) {
						errors.toAddress_area = t("orderSteps.validation.areaRequired") || "Area is required";
					}
				}
				break;
			}
			case 3: {
				// Step 3: Room configuration - must configure all rooms
				const expectedRoomCount = formData.fromAddress.numberOfRooms || 0;
				const configuredRoomCount = formData.roomConfigurations.reduce((sum, room) => sum + (room.quantity || 0), 0);
				
				if (configuredRoomCount !== expectedRoomCount) {
					errors.roomConfigurations = t("orderSteps.validation.allRoomsRequired", { count: expectedRoomCount }) || `Please configure all ${expectedRoomCount} room(s)`;
				}
				// Validate each room configuration has roomType
				formData.roomConfigurations.forEach((room, index) => {
					if (!room.roomType) {
						errors[`roomConfigurations_${index}_roomType`] = t("orderSteps.validation.roomTypeRequired") || "Room type is required";
					}
					if (!room.quantity || room.quantity <= 0) {
						errors[`roomConfigurations_${index}_quantity`] = t("orderSteps.validation.roomQuantityRequired") || "Room quantity must be greater than 0";
					}
				});
				break;
			}
			case 4: {
				// Step 4: Schedule validation - date and time required
				if (!formData.scheduledDate || !formData.scheduledDate.trim()) {
					errors.scheduledDate = t("orderSteps.validation.dateRequired") || "Date is required";
				} else {
					const selectedDate = new Date(formData.scheduledDate);
					const tomorrow = new Date();
					tomorrow.setDate(tomorrow.getDate() + 1);
					tomorrow.setHours(0, 0, 0, 0);
					
					if (selectedDate < tomorrow) {
						errors.scheduledDate = t("orderSteps.validation.dateMustBeFuture") || "Date must be at least tomorrow";
					}
				}
				
				if (!formData.scheduledTime || !formData.scheduledTime.trim()) {
					errors.scheduledTime = t("orderSteps.validation.timeRequired") || "Time is required";
				}
				break;
			}
		}
		return errors;
	};

	const handleSubmit = async () => {
		// Format location object for API - matches endpoint structure
		const formatLocation = (addressData) => {
			if (!addressData.fullAddress || !addressData.fullAddress.trim()) {
				return null;
			}
			
			// Build address string - use fullAddress from OSM or combine manual fields
			let addressString = addressData.fullAddress.trim();
			if (addressData.useManualAddress) {
				const parts = [
					addressData.buildingNumber,
					addressData.streetName,
					addressData.city,
					addressData.country
				].filter(part => part && part.trim());
				addressString = parts.join(", ");
			}
			
			const location = {
				address: addressString,
				type: addressData.locationType || "",
				floor: Number(addressData.floor) || 0,
				area: addressData.area !== null && addressData.area !== undefined && addressData.area > 0 
					? Number(addressData.area) 
					: 0,
				num_of_floors: addressData.numberOfFloors !== null && addressData.numberOfFloors !== undefined && addressData.numberOfFloors > 0
					? Number(addressData.numberOfFloors)
					: 0,
				has_elevator: addressData.hasElevator || false,
				latitude: addressData.useManualAddress ? "-" : (addressData.lat !== null && addressData.lat !== undefined 
					? Number(addressData.lat) 
					: 0),
				longitude: addressData.useManualAddress ? "-" : (addressData.lon !== null && addressData.lon !== undefined 
					? Number(addressData.lon) 
					: 0),
				notes: (addressData.notes && addressData.notes.trim()) || "-",
			};
			
			return location;
		};

		// Convert scheduledTime to format expected by API (HH:MM:SS)
		// If it's a time range like "08:00-10:00", extract the start time
		// If it's "flexible", use a default time or handle as needed
		let preferredTime = formData.scheduledTime || "09:00";
		if (preferredTime.includes("-")) {
			// Extract start time from range (e.g., "08:00-10:00" -> "08:00")
			preferredTime = preferredTime.split("-")[0].trim();
		} else if (preferredTime === "flexible") {
			preferredTime = "09:00"; // Default time for flexible
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

		// Format data to match endpoint requirements
		const hasFurnitureMoving = formData.services.some(serviceId => {
			const metadata = formData.servicesMetadata?.[serviceId];
			return metadata?.internalId === "furniture_moving" || metadata?.name === "Moving";
		});
		
		// For moving service: fromAddress -> location, toAddress -> destination_location
		// For other services: fromAddress -> location
		const location = formatLocation(formData.fromAddress);
		const destinationLocation = hasFurnitureMoving 
			? formatLocation(formData.toAddress)
			: null;
		
		// Combine room configurations into notes format
		// Get translated room type names
		const getTranslatedRoomTypes = (t) => {
			return [
				{ id: "bedroom", name: t("roomTypes.bedroom") || "Bedroom" },
				{ id: "living_room", name: t("roomTypes.livingRoom") || "Living Room" },
				{ id: "kitchen", name: t("roomTypes.kitchen") || "Kitchen" },
				{ id: "bathroom", name: t("roomTypes.bathroom") || "Bathroom" },
				{ id: "dining_room", name: t("roomTypes.diningRoom") || "Dining Room" },
				{ id: "office", name: t("roomTypes.office") || "Office" },
				{ id: "storage_room", name: t("roomTypes.storageRoom") || "Storage Room" },
				{ id: "balcony", name: t("roomTypes.balcony") || "Balcony" },
				{ id: "garage", name: t("roomTypes.garage") || "Garage" },
				{ id: "other", name: t("roomTypes.other") || "Other" },
			];
		};
		
		const ROOM_TYPES = getTranslatedRoomTypes(t);
		const roomConfigNotes = formData.roomConfigurations && formData.roomConfigurations.length > 0
			? formData.roomConfigurations
				.filter(room => room.roomType && room.quantity)
				.map(room => {
					const roomTypeName = ROOM_TYPES.find(rt => rt.id === room.roomType)?.name || room.roomType;
					return `${room.quantity} ${roomTypeName}`;
				})
				.join(", ")
			: "";
		
		// Combine room configuration with existing notes
		const combinedNotes = [
			roomConfigNotes,
			formData.notes && formData.notes.trim() ? formData.notes.trim() : null
		].filter(Boolean).join("\n") || "-";
		
		// Build order data object - matches endpoint structure exactly
		// Note: Images are File objects and will be sent in FormData (req.files), not in req.body
		const orderData = {
			preferred_date: formData.scheduledDate,
			preferred_time: preferredTime,
			number_of_rooms: (formData.fromAddress.numberOfRooms && formData.fromAddress.numberOfRooms > 0) 
				? Number(formData.fromAddress.numberOfRooms)
				: 1,
			location: location,
			services: formatServices(),
			notes: combinedNotes,
		};
		
		// Only include destination_location if it's not null (for moving service)
		if (destinationLocation) {
			orderData.destination_location = destinationLocation;
		}
		
		// Handle images: File objects will be sent in FormData (req.files), not in req.body
		// Images are stored as objects with { id, name, url, size, file } structure
		// Extract File objects from image objects
		if (formData.images && formData.images.length > 0) {
			// Extract File objects from image objects (images have .file property)
			const fileImages = formData.images
				.map(img => {
					// If it's already a File object, use it directly
					if (img instanceof File) {
						return img;
					}
					// If it's an object with a .file property (from CustomerRoomConfigStep), use that
					if (img && typeof img === 'object' && img.file instanceof File) {
						return img.file;
					}
					return null;
				})
				.filter(Boolean); // Remove null values
			
			// Store File objects separately - api.js will send them in FormData as 'images[]'
			// DO NOT include images in req.body - backend doesn't allow it
			if (fileImages.length > 0) {
				orderData._imageFiles = fileImages;
			}
			// Do not include images array in body - backend validation rejects it
		}


		setError(null);
		setIsSubmitting(true);

		try {
			const orderData = formatOrderPayload(formData);
			const result = await dispatch(createCustomerOrder(orderData));
			
			if (createCustomerOrder.fulfilled.match(result)) {
				if (onOrderCreated) {
					onOrderCreated(result.payload);
				}
				handleClose();
			} else {
				const errorData = result.payload || {};
				setError(errorData.message || "Failed to create order. Please try again.");
			}
		} catch (error) {
			console.error("Error creating order:", error);
			setError(error.message || "Failed to create order. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderStepContent = () => {
		const stepProps = {
			formData,
			setFormData,
			validationErrors,
		};

		switch (currentStep) {
			case 1:
				return <CustomerServiceStep {...stepProps} />;
			case 2:
				return <CustomerAddressStep {...stepProps} />;
			case 3:
				return <CustomerRoomConfigStep {...stepProps} />;
			case 4:
				return <CustomerScheduleStep {...stepProps} />;
			default:
				return null;
		}
	};

	// Buttons are always enabled - validation happens on click
	const canProceed = true;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
			<div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
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
					<div className="flex items-center justify-between mb-2 gap-1 sm:gap-2">
						{STEP_TITLES.map((title, index) => (
							<div
								key={index}
								className={`text-[10px] sm:text-xs font-medium truncate ${
									index + 1 === currentStep
										? "text-orange-600"
										: index + 1 < currentStep
										? "text-green-600"
										: "text-gray-400"
								}`}
							>
								<span className="hidden sm:inline">{index + 1}. </span>
								<span className="sm:hidden">{index + 1}</span>
								<span className="hidden lg:inline"> {title}</span>
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
				<div className="p-4 sm:p-5 lg:p-6 overflow-y-auto max-h-[calc(95vh-240px)] sm:max-h-[calc(90vh-280px)]">
					{renderStepContent()}
					{error && (
						<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-5 lg:p-6 border-t border-orange-100 bg-orange-50/30">
					<button
						onClick={handleBack}
						disabled={currentStep === 1}
						className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2"
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

					<div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
						<button
							onClick={handleClose}
							className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors"
						>
							{t("common.buttons.cancel")}
						</button>
							{currentStep < TOTAL_STEPS ? (
								<button
									onClick={handleNext}
									className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
								>
									<span className="hidden sm:inline">{t("common.buttons.next")}</span>
									<span className="sm:hidden">Next</span>
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
									onClick={handleSubmit}
									disabled={isSubmitting}
									className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
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
	);
}

