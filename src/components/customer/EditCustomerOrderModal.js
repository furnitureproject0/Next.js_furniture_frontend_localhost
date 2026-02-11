"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors";
import { updateCustomerOrder } from "@/store/slices/ordersSlice";
import { customerApi } from "@/lib/api";
import { useEffect, useState } from "react";

// Import step components
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

// Helper function to get address string from order
const getAddressString = (orderAddress) => {
	if (!orderAddress) return "";
	return orderAddress.trim();
};

// Helper function to convert order data to form data
const orderToFormData = (order) => {
	if (!order) return INITIAL_FORM_DATA;
	
	// Get location objects - handle both backend format (location/destinationLocation) and frontend format
	const fromLocation = order.location || {};
	const toLocation = order.destinationLocation || order.destination_location || {};
	
	// Get address strings from various possible locations
	const fromAddressString = getAddressString(
		fromLocation.address || 
		order.fromAddress || 
		order.addresses?.from
	);
	
	const toAddressString = getAddressString(
		toLocation.address || 
		order.toAddress || 
		order.addresses?.to
	);
	
	// Convert services and additions
	// Handle both backend format (orderServices) and frontend format (services/servicesWithAdditions)
	const services = [];
	const serviceAdditions = {};
	const servicesMetadata = {};
	
	// Try to get services from orderServices (backend format)
	if (order.orderServices && Array.isArray(order.orderServices)) {
		order.orderServices.forEach(os => {
			const serviceId = os.service_id || os.service?.id;
			if (serviceId) {
				services.push(serviceId);
				servicesMetadata[serviceId] = {
					name: os.service?.name || "Unknown",
					internalId: (os.service?.name || "unknown").toLowerCase().replace(/\s+/g, "_")
				};
				
				// Get additions from orderServiceAdditions
				if (os.orderServiceAdditions && Array.isArray(os.orderServiceAdditions)) {
					serviceAdditions[serviceId] = {};
					os.orderServiceAdditions.forEach(osa => {
						const additionId = osa.addition_id || osa.addition?.id;
						if (additionId) {
							serviceAdditions[serviceId][additionId] = {
								note: osa.note || ""
							};
						}
					});
				}
			}
		});
	}
	// Fallback to frontend format
	else if (order.services && Array.isArray(order.services)) {
		order.services.forEach(serviceId => {
			services.push(serviceId);
		});
		
		if (order.servicesWithAdditions) {
			order.servicesWithAdditions.forEach(serviceGroup => {
				serviceAdditions[serviceGroup.serviceId] = {};
				servicesMetadata[serviceGroup.serviceId] = {
					name: serviceGroup.serviceName,
					internalId: serviceGroup.serviceName?.toLowerCase().replace(/\s+/g, "_") || ""
				};
				
				if (serviceGroup.additions && serviceGroup.additions.length > 0) {
					serviceGroup.additions.forEach(addition => {
						serviceAdditions[serviceGroup.serviceId][addition.id] = {
							note: addition.note || ""
						};
					});
				}
			});
		}
	}
	
	// Convert time from HH:MM:SS to HH:MM
	const preferredTime = order.preferred_time || "";
	const timeDisplay = preferredTime.length > 5 ? preferredTime.substring(0, 5) : preferredTime;
	
	return {
		services,
		serviceAdditions,
		servicesMetadata,
		fromAddress: {
			locationType: fromLocation.type || "",
			fullAddress: fromAddressString,
			floor: fromLocation.floor || 0,
			numberOfFloors: fromLocation.number_of_floors || fromLocation.num_of_floors || 0,
			numberOfRooms: order.number_of_rooms || 0,
			area: fromLocation.area || 0,
			hasElevator: fromLocation.has_elevator || false,
			notes: (fromLocation.notes && fromLocation.notes !== "N/A") ? fromLocation.notes : "",
			lat: fromLocation.latitude || fromLocation.lat || null,
			lon: fromLocation.longitude || fromLocation.lon || null,
			place_id: null
		},
		toAddress: (toLocation && Object.keys(toLocation).length > 0 && toAddressString) ? {
			locationType: toLocation.type || "",
			fullAddress: toAddressString,
			floor: toLocation.floor || 0,
			numberOfFloors: toLocation.number_of_floors || toLocation.num_of_floors || 0,
			numberOfRooms: 0,
			area: toLocation.area || 0,
			hasElevator: toLocation.has_elevator || false,
			notes: (toLocation.notes && toLocation.notes !== "N/A") ? toLocation.notes : "",
			lat: toLocation.latitude || toLocation.lat || null,
			lon: toLocation.longitude || toLocation.lon || null,
			place_id: null
		} : INITIAL_FORM_DATA.toAddress,
		roomDescription: "",
		images: order.images || [],
		scheduledDate: order.preferred_date || "",
		scheduledTime: timeDisplay,
		notes: (order.notes && order.notes !== "N/A") ? order.notes : "",
	};
};

export default function EditCustomerOrderModal({
	isOpen,
	onClose,
	order,
	onOrderUpdated,
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
	const [isLoading, setIsLoading] = useState(false);
	const user = useAppSelector(selectUser);

	// Load order data into form when modal opens or order changes
	useEffect(() => {
		const loadOrderData = async () => {
			if (isOpen && order && order.id) {
				setIsLoading(true);
				setError(null);
				
				try {
					// Fetch full order details from API
					const response = await customerApi.getOrderById(order.id);
					
					if (response?.success && response?.data?.order) {
						const fullOrder = response.data.order;
						const loadedFormData = orderToFormData(fullOrder);
						setFormData(loadedFormData);
						setCurrentStep(1);
					} else {
						// Fallback to using the order passed as prop
						const loadedFormData = orderToFormData(order);
						setFormData(loadedFormData);
						setCurrentStep(1);
					}
				} catch (err) {
					console.error("Error loading order data:", err);
					// Fallback to using the order passed as prop
					const loadedFormData = orderToFormData(order);
					setFormData(loadedFormData);
					setCurrentStep(1);
					setError("Failed to load order details. Using cached data.");
				} finally {
					setIsLoading(false);
				}
			}
		};
		
		loadOrderData();
	}, [isOpen, order]);

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
		setError(null);
		setIsSubmitting(false);
		onClose();
	};

	const resetForm = () => {
		if (order) {
			setFormData(orderToFormData(order));
		} else {
			setFormData(INITIAL_FORM_DATA);
		}
		setCurrentStep(1);
	};

	const validateStep = (step) => {
		switch (step) {
			case 1:
				return formData.services.length > 0;
			case 2: {
				const hasFurnitureMoving = formData.services.some(serviceId => {
					const metadata = formData.servicesMetadata?.[serviceId];
					return metadata?.internalId === "furniture_moving" || 
						metadata?.name === "Moving";
				});
				
				const fromAddressValid = 
					formData.fromAddress.locationType &&
					formData.fromAddress.fullAddress.trim();
				
				const toAddressValid = !hasFurnitureMoving ? true : (
					formData.toAddress.locationType &&
					formData.toAddress.fullAddress.trim()
				);
				
				return fromAddressValid && toAddressValid;
			}
			case 3:
				return true; // Room config is optional
			case 4:
				return formData.scheduledDate && formData.scheduledTime;
			default:
				return false;
		}
	};

	const handleSubmit = async () => {
		if (!order || !order.id) {
			setError("Invalid order data");
			return;
		}

		// Format location object for API - matches endpoint structure
		const formatLocation = (addressData) => {
			if (!addressData.fullAddress || !addressData.fullAddress.trim()) {
				return null;
			}
			
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
				latitude: addressData.lat !== null && addressData.lat !== undefined 
					? Number(addressData.lat) 
					: 0,
				longitude: addressData.lon !== null && addressData.lon !== undefined 
					? Number(addressData.lon) 
					: 0,
				notes: (addressData.notes && addressData.notes.trim() && addressData.notes !== "N/A") 
					? addressData.notes.trim() 
					: "N/A", // Send "N/A" if empty (backend requires non-empty string)
			};
			
			return location;
		};

		// Convert scheduledTime to format expected by API (HH:MM:SS)
		let preferredTime = formData.scheduledTime || "09:00";
		if (preferredTime.includes("-")) {
			preferredTime = preferredTime.split("-")[0].trim();
		} else if (preferredTime === "flexible") {
			preferredTime = "09:00";
		}
		
		if (preferredTime && preferredTime.length === 5 && preferredTime.includes(":")) {
			preferredTime = `${preferredTime}:00`;
		}

		// Format services array with additions - matches endpoint structure
		const formatServices = () => {
			return formData.services.map(serviceId => {
				const selectedAdditions = formData.serviceAdditions?.[serviceId] || {};
				
				const additions = Object.entries(selectedAdditions).map(([additionId, additionData]) => ({
					addition_id: Number(additionId),
					note: (additionData?.note?.trim() && additionData.note !== "N/A") 
						? additionData.note.trim() 
						: "N/A", // Send "N/A" if empty (backend requires non-empty string)
				}));

				return {
					service_id: serviceId,
					additions: additions,
				};
			});
		};

		// Format data to match endpoint requirements
		const location = formatLocation(formData.fromAddress);
		const destinationLocation = formatLocation(formData.toAddress);
		
		// Build order data object - matches endpoint structure exactly
		const orderData = {
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


		setError(null);
		setIsSubmitting(true);

		try {
			// Use Redux thunk to update order
			const result = await dispatch(updateCustomerOrder({ orderId: order.id, orderInput: orderData }));
			
			if (updateCustomerOrder.fulfilled.match(result)) {
				if (onOrderUpdated) {
					onOrderUpdated(result.payload);
				}
				handleClose();
			} else {
				const errorData = result.payload || {};
				const errorMessage = errorData.message || "Failed to update order. Please try again.";
				setError(errorMessage);
			}
		} catch (error) {
			console.error("Error updating order:", error);
			setError(error.message || "Failed to update order. Please try again.");
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

	const canProceed = validateStep(currentStep);

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
			<div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 border-b border-orange-100">
					<div className="flex-1 min-w-0 pr-2">
						<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 truncate">
							{t("orderSteps.editOrder") || "Edit Order"}
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

				{/* Error Message */}
				{error && (
					<div className="mx-4 sm:mx-5 lg:mx-6 mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-xs sm:text-sm text-red-800">{error}</p>
					</div>
				)}

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
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
							<span className="ml-3 text-sm text-amber-700">Loading order data...</span>
						</div>
					) : (
						renderStepContent()
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
								disabled={!canProceed}
								className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
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
								disabled={!canProceed || isSubmitting}
								className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
							>
								{isSubmitting ? (
									<>
										<div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
										<span className="hidden sm:inline">{t("common.buttons.updating") || "Updating..."}</span>
										<span className="sm:hidden">...</span>
									</>
								) : (
									t("common.buttons.update") || "Update Order"
								)}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

