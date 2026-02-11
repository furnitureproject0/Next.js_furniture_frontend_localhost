import { useState } from "react";

const INITIAL_FORM_DATA = {
	services: [],
	fromAddress: "",
	toAddress: "",
	address: "",
	propertyType: "",
	floorNumber: 1,
	floorCount: 1,
	sizeInMeters: 0,
	roomsCount: 1,
	hasElevator: false,
	furnitureCrane: false,
	rooms: [],
	date: null,
	time: "",
	description: "",
	specialRequirements: "",
};

export function useOrderForm() {
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);

	const resetForm = () => {
		setFormData(INITIAL_FORM_DATA);
	};

	const updateField = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const validateStep = (step) => {
		switch (step) {
			case 1:
				return formData.services.length > 0;
			case 2:
				return (
					formData.propertyType.trim() !== "" &&
					formData.sizeInMeters > 0 &&
					formData.roomsCount > 0 &&
					formData.address.trim() !== "" &&
					(!formData.services.includes("furniture_moving") ||
						(formData.fromAddress.trim() !== "" &&
							formData.toAddress.trim() !== ""))
				);
			case 3:
				return true; // Additions are optional
			case 4:
				return formData.date && formData.time !== "";
			default:
				return false;
		}
	};

	return {
		formData,
		setFormData,
		resetForm,
		updateField,
		validateStep,
	};
}
