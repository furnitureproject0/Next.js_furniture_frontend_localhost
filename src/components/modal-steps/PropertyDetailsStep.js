"use client";

import {
	Building,
	Home,
	Car,
	Warehouse,
	Layers,
	Square,
	Users,
	ArrowUp,
	MapPin,
	Check,
} from "../icons/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedLocationTypes } from "@/utils/i18nUtils";

const getPropertyTypes = (t) => {
	const translatedLocations = getTranslatedLocationTypes(t);
	return [
		{
			id: "apartment",
			name: translatedLocations.find(l => l.id === "apartment")?.name || "Apartment",
			icon: Building,
			color: "from-blue-500 to-blue-600",
			description: t("modalSteps.propertyDetails.apartmentDesc"),
		},
		{
			id: "house",
			name: translatedLocations.find(l => l.id === "house")?.name || "House",
			icon: Home,
			color: "from-green-500 to-green-600",
			description: t("modalSteps.propertyDetails.houseDesc"),
		},
		{
			id: "garage",
			name: translatedLocations.find(l => l.id === "garage")?.name || "Garage",
			icon: Car,
			color: "from-orange-500 to-orange-600",
			description: t("modalSteps.propertyDetails.garageDesc"),
		},
		{
			id: "repository",
			name: translatedLocations.find(l => l.id === "warehouse")?.name || "Repository",
			icon: Warehouse,
			color: "from-purple-500 to-purple-600",
			description: t("modalSteps.propertyDetails.repositoryDesc"),
		},
	];
};

export function PropertyDetailsStep({ formData, setFormData }) {
	const { t } = useTranslation();
	const PROPERTY_TYPES = getPropertyTypes(t);
	const handlePropertyTypeSelect = (propertyId) => {
		setFormData((prev) => ({
			...prev,
			propertyType: propertyId,
		}));
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	return (
		<div className="space-y-4 sm:space-y-5 lg:space-y-6">
			{/* Property Type Selection */}
			<div className="space-y-3 sm:space-y-4">
				<h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
					{t("modalSteps.propertyDetails.selectPropertyType")}
				</h4>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
					{PROPERTY_TYPES.map((property) => {
						const isSelected =
							formData.propertyType === property.id;

						return (
							<button
								key={property.id}
								type="button"
								className={`relative px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm font-medium rounded-lg border transition-all duration-200 ${
									isSelected
										? "bg-orange-500 text-white border-orange-500 shadow-md"
										: "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
								}`}
								onClick={() =>
									handlePropertyTypeSelect(property.id)
								}
							>
								{property.name}
								{isSelected && (
									<div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full flex items-center justify-center">
										<Check className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-orange-500" />
									</div>
								)}
							</button>
						);
					})}
				</div>
			</div>

			{/* Property Details */}
			{formData.propertyType && (
				<div className="space-y-4 sm:space-y-5 lg:space-y-6">
					{/* Floor Information */}
					{(formData.propertyType === "apartment" ||
						formData.propertyType === "house") && (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
							{formData.propertyType === "apartment" && (
								<div>
									<label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
										{t("modalSteps.propertyDetails.floorNumber")} *
									</label>
									<input
										type="number"
										min="0"
										max="50"
										value={formData.floorNumber}
										onChange={(e) =>
											handleInputChange(
												"floorNumber",
												parseInt(e.target.value) || 0,
											)
										}
										className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-center"
										placeholder="0"
									/>
								</div>
							)}
							{formData.propertyType === "house" && (
								<div>
									<label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
										{t("modalSteps.propertyDetails.totalFloors")} *
									</label>
									<input
										type="number"
										min="1"
										max="10"
										value={formData.floorCount}
										onChange={(e) =>
											handleInputChange(
												"floorCount",
												parseInt(e.target.value) || 1,
											)
										}
										className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-center"
										placeholder="1"
									/>
								</div>
							)}
						</div>
					)}

					{/* Size and Rooms */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						<div>
							<label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
								{t("modalSteps.propertyDetails.size")} *
							</label>
							<input
								type="number"
								min="1"
								max="1000"
								value={formData.sizeInMeters || ""}
								onChange={(e) =>
									handleInputChange(
										"sizeInMeters",
										parseInt(e.target.value) || 0,
									)
								}
								className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-center"
								placeholder="0"
							/>
						</div>
						<div>
							<label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
								{t("modalSteps.propertyDetails.numberOfRooms")} *
							</label>
							<input
								type="number"
								min="1"
								max="20"
								value={formData.roomsCount}
								onChange={(e) =>
									handleInputChange(
										"roomsCount",
										parseInt(e.target.value) || 1,
									)
								}
								className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-center"
								placeholder="1"
							/>
						</div>
					</div>

					{/* Elevator Option */}
					{(formData.propertyType === "apartment" ||
						formData.propertyType === "house") && (
						<div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
							<input
								type="checkbox"
								id="hasElevator"
								checked={formData.hasElevator}
								onChange={(e) =>
									handleInputChange(
										"hasElevator",
										e.target.checked,
									)
								}
								className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 flex-shrink-0"
							/>
							<label
								htmlFor="hasElevator"
								className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer"
							>
								{t("modalSteps.propertyDetails.hasElevator")}
							</label>
						</div>
					)}
				</div>
			)}

			{/* Address Section */}
			{formData.services.includes("furniture_moving") && (
				<div className="space-y-3 sm:space-y-4">
					<div>
						<label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
							{t("modalSteps.propertyDetails.fromAddress")} *
						</label>
						<input
							type="text"
							placeholder={t("modalSteps.propertyDetails.currentFurnitureLocation")}
							value={formData.fromAddress}
							onChange={(e) =>
								handleInputChange("fromAddress", e.target.value)
							}
							className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
						/>
					</div>

					<div>
						<label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
							{t("modalSteps.propertyDetails.toAddress")} *
						</label>
						<input
							type="text"
							placeholder={t("modalSteps.propertyDetails.destinationAddress")}
							value={formData.toAddress}
							onChange={(e) =>
								handleInputChange("toAddress", e.target.value)
							}
							className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
						/>
					</div>
				</div>
			)}

			<div>
				<label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
					{formData.services.includes("furniture_moving")
						? t("modalSteps.propertyDetails.serviceAddress")
						: t("modalSteps.propertyDetails.address")}{" "}
					*
				</label>
				<input
					type="text"
					placeholder={t("modalSteps.propertyDetails.serviceLocationAddress")}
					value={formData.address}
					onChange={(e) =>
						handleInputChange("address", e.target.value)
					}
					className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
				/>
			</div>
		</div>
	);
}
