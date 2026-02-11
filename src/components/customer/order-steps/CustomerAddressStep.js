"use client";

import AddressInput from "@/components/common/AddressInput/AddressInput";
import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedLocationTypes } from "@/utils/i18nUtils";
import { useCallback, useState, useEffect } from "react";
import LocationDetailsCollapsible from "./LocationDetailsCollapsible";

function AddressSection({ 
	title, 
	addressType, 
	required, 
	address, 
	updateAddress, 
	LOCATION_TYPES, 
	t, 
	errors 
}) {
	const locationType = address.locationType || "";
	
	// State for autocomplete search value
	const [searchValue, setSearchValue] = useState(address.fullAddress || "");
	const [showManualAddress, setShowManualAddress] = useState(address.useManualAddress || false);
	const [osmError, setOsmError] = useState(false);
	
	// Sync searchValue when address.fullAddress changes
	useEffect(() => {
		setSearchValue(address.fullAddress || "");
		setShowManualAddress(address.useManualAddress || false);
	}, [address.fullAddress, address.useManualAddress]);
	
	// Rebuild fullAddress when manual address fields change
	useEffect(() => {
		if (showManualAddress && address.useManualAddress) {
			const parts = [
				address.buildingNumber,
				address.streetName,
				address.city,
				address.country
			].filter(part => part && part.trim());
			const manualAddress = parts.join(", ");
			if (manualAddress && manualAddress !== address.fullAddress) {
				updateAddress(addressType, "fullAddress", manualAddress);
			}
		}
	}, [address.buildingNumber, address.streetName, address.city, address.country, showManualAddress, address.useManualAddress, address.fullAddress, addressType, updateAddress]);
	
	// Handle autocomplete selection
	const handleAddressSelect = useCallback((displayName, place) => {
		if (place) {
			// Store the full address string from autocomplete
			updateAddress(addressType, "fullAddress", displayName);
			
			// Extract and store latitude and longitude from place object
			if (place.lat && place.lon) {
				updateAddress(addressType, "lat", parseFloat(place.lat));
				updateAddress(addressType, "lon", parseFloat(place.lon));
				updateAddress(addressType, "useManualAddress", false);
				setOsmError(false);
			}
			
			// Store place_id if available
			if (place.place_id) {
				updateAddress(addressType, "place_id", place.place_id);
			}
			
			// Update search value to show selection
			setSearchValue(displayName);
		}
	}, [addressType, updateAddress]);
	
	// Handle OSM search error - show manual address button
	const handleOsmError = useCallback(() => {
		setOsmError(true);
	}, []);
	
	// Handle manual address button click
	const handleShowManualAddress = useCallback(() => {
		setShowManualAddress(true);
		updateAddress(addressType, "useManualAddress", true);
		updateAddress(addressType, "lat", null);
		updateAddress(addressType, "lon", null);
		updateAddress(addressType, "fullAddress", "");
		setSearchValue("");
	}, [addressType, updateAddress]);
	
	// Handle manual field changes
	const handleFieldChange = useCallback((field, value) => {
		updateAddress(addressType, field, value);
	}, [addressType, updateAddress]);
	
	// Handle manual field changes
	const handleManualFieldChange = useCallback((fieldName, value) => {
		updateAddress(addressType, fieldName, value);
	}, [addressType, updateAddress]);

	return (
		<div className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-5 bg-orange-50/30 rounded-lg border border-orange-200/50">
			<h4 className="text-sm sm:text-base font-semibold text-amber-900">
				{title} {required && <span className="text-red-500">*</span>}
			</h4>

			<div className="space-y-2.5 sm:space-y-3">
				{/* Address Autocomplete Search */}
				{!showManualAddress && (
					<div>
						<label className="block text-xs sm:text-sm font-medium text-amber-800 mb-1">
							{t("orderSteps.searchAddress") || "Search Address"} {required && <span className="text-red-500">*</span>}
						</label>
						<AddressInput
							value={searchValue}
							onChange={handleAddressSelect}
							placeholder={t("orderSteps.addressSearchPlaceholder")}
							className="w-full"
							error={errors?.fullAddress || errors?.coordinates}
						/>
						{(errors?.fullAddress || errors?.coordinates) && (
							<p className="text-[10px] sm:text-xs text-red-500 mt-0.5 sm:mt-1">
								{errors.fullAddress || errors.coordinates}
							</p>
						)}
						{!errors?.fullAddress && !errors?.coordinates && (
							<div className="mt-1 flex items-center gap-2">
								<p className="text-[10px] sm:text-xs text-amber-600/70 flex-1">
									{t("orderSteps.addressSearchHint")}
								</p>
								<button
									type="button"
									onClick={handleShowManualAddress}
									className="text-[10px] sm:text-xs text-orange-600 hover:text-orange-700 underline"
								>
									{t("orderSteps.useManualAddress") || "Enter manually"}
								</button>
							</div>
						)}
					</div>
				)}

				{/* Manual Address Inputs */}
				{showManualAddress && (
					<div className="space-y-2.5 sm:space-y-3 p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
						<div className="flex items-center justify-between mb-2">
							<label className="block text-xs sm:text-sm font-medium text-amber-800">
								{t("orderSteps.manualAddress") || "Manual Address Entry"} {required && <span className="text-red-500">*</span>}
							</label>
							<button
								type="button"
								onClick={() => {
									setShowManualAddress(false);
									updateAddress(addressType, "useManualAddress", false);
								}}
								className="text-[10px] sm:text-xs text-orange-600 hover:text-orange-700 underline"
							>
								{t("orderSteps.useSearch") || "Use search instead"}
							</button>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
							<div>
								<label className="block text-xs sm:text-sm text-amber-700 mb-1">
									{t("orderSteps.buildingNumber") || "Building Number"} {required && <span className="text-red-500">*</span>}
								</label>
								<input
									type="text"
									value={address.buildingNumber || ""}
									onChange={(e) => handleManualFieldChange("buildingNumber", e.target.value)}
									placeholder={t("orderSteps.buildingNumberPlaceholder") || "e.g., 123"}
									className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-400 ${
										errors?.buildingNumber ? "border-red-500 focus:ring-red-500" : "border-orange-200 focus:ring-orange-400"
									}`}
								/>
								{errors?.buildingNumber && (
									<p className="text-[10px] sm:text-xs text-red-500 mt-0.5 sm:mt-1">
										{errors.buildingNumber}
									</p>
								)}
							</div>
							<div>
								<label className="block text-xs sm:text-sm text-amber-700 mb-1">
									{t("orderSteps.streetName") || "Street Name"} {required && <span className="text-red-500">*</span>}
								</label>
								<input
									type="text"
									value={address.streetName || ""}
									onChange={(e) => handleManualFieldChange("streetName", e.target.value)}
									placeholder={t("orderSteps.streetNamePlaceholder") || "e.g., Main Street"}
									className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-400 ${
										errors?.streetName ? "border-red-500 focus:ring-red-500" : "border-orange-200 focus:ring-orange-400"
									}`}
								/>
								{errors?.streetName && (
									<p className="text-[10px] sm:text-xs text-red-500 mt-0.5 sm:mt-1">
										{errors.streetName}
									</p>
								)}
							</div>
							<div>
								<label className="block text-xs sm:text-sm text-amber-700 mb-1">
									{t("orderSteps.city") || "City"} {required && <span className="text-red-500">*</span>}
								</label>
								<input
									type="text"
									value={address.city || ""}
									onChange={(e) => handleManualFieldChange("city", e.target.value)}
									placeholder={t("orderSteps.cityPlaceholder") || "e.g., Zürich"}
									className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-400 ${
										errors?.city ? "border-red-500 focus:ring-red-500" : "border-orange-200 focus:ring-orange-400"
									}`}
								/>
								{errors?.city && (
									<p className="text-[10px] sm:text-xs text-red-500 mt-0.5 sm:mt-1">
										{errors.city}
									</p>
								)}
							</div>
							<div>
								<label className="block text-xs sm:text-sm text-amber-700 mb-1">
									{t("orderSteps.country") || "Country"} {required && <span className="text-red-500">*</span>}
								</label>
								<input
									type="text"
									value={address.country || ""}
									onChange={(e) => handleManualFieldChange("country", e.target.value)}
									placeholder={t("orderSteps.countryPlaceholder") || "e.g., Switzerland"}
									className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-400 ${
										errors?.country ? "border-red-500 focus:ring-red-500" : "border-orange-200 focus:ring-orange-400"
									}`}
								/>
								{errors?.country && (
									<p className="text-[10px] sm:text-xs text-red-500 mt-0.5 sm:mt-1">
										{errors.country}
									</p>
								)}
							</div>
						</div>
					</div>
				)}
				
				{/* Location Type Selection */}
				<div>
					<label className="block text-xs sm:text-sm font-medium text-amber-800 mb-1">
						{t("orderSteps.locationType")} {required && <span className="text-red-500">*</span>}
					</label>
					<select
						value={locationType}
						onChange={(e) =>
							updateAddress(addressType, "locationType", e.target.value)
						}
						className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-400 bg-white cursor-pointer ${
							errors?.locationType ? "border-red-500 focus:ring-red-500" : "border-orange-200 focus:ring-orange-400"
						}`}
					>
						<option value="">{t("orderSteps.selectLocationType")}</option>
						{LOCATION_TYPES.map((type) => (
							<option key={type.id} value={type.id}>
								{type.icon} {type.name}
							</option>
						))}
					</select>
					{errors?.locationType && (
						<p className="text-[10px] sm:text-xs text-red-500 mt-0.5 sm:mt-1">
							{errors.locationType}
						</p>
					)}
				</div>

				{/* Conditional Fields Based on Location Type - Collapsible */}
				<LocationDetailsCollapsible
					address={address}
					addressType={addressType}
					updateAddress={updateAddress}
					required={required}
					errors={errors}
					t={t}
				/>
			</div>
		</div>
	);
}

export default function CustomerAddressStep({ formData, setFormData, validationErrors = {} }) {
	const { t } = useTranslation();
	const LOCATION_TYPES = getTranslatedLocationTypes(t);
	
	const updateAddress = useCallback(
		(addressType, field, value) => {
			setFormData((prev) => ({
				...prev,
				[addressType]: {
					...prev[addressType],
					[field]: value,
				},
			}));
		},
		[setFormData]
	);

	// Check if furniture_moving service is selected
	const hasFurnitureMoving = formData.services?.some(serviceId => {
		const metadata = formData.servicesMetadata?.[serviceId];
		return metadata?.internalId === "furniture_moving" || 
			metadata?.name === "Moving";
	}) || false;

	// Extract errors for each address section
	const fromAddressErrors = {
		fullAddress: validationErrors.fromAddress_fullAddress,
		coordinates: validationErrors.fromAddress_coordinates,
		locationType: validationErrors.fromAddress_locationType,
		floor: validationErrors.fromAddress_floor,
		numberOfFloors: validationErrors.fromAddress_numberOfFloors,
		numberOfRooms: validationErrors.fromAddress_numberOfRooms,
		area: validationErrors.fromAddress_area,
	};

	const toAddressErrors = {
		fullAddress: validationErrors.toAddress_fullAddress,
		coordinates: validationErrors.toAddress_coordinates,
		locationType: validationErrors.toAddress_locationType,
		floor: validationErrors.toAddress_floor,
		numberOfFloors: validationErrors.toAddress_numberOfFloors,
		numberOfRooms: validationErrors.toAddress_numberOfRooms,
		area: validationErrors.toAddress_area,
	};

	return (
		<div className="space-y-4 sm:space-y-5 lg:space-y-6">
			<div>
				<h3 className="text-base sm:text-lg font-semibold text-amber-900 mb-1.5 sm:mb-2">
					{t("orderSteps.enterAddressDetails")}
				</h3>
				<p className="text-xs sm:text-sm text-amber-700/70">
					{hasFurnitureMoving 
						? t("orderSteps.providePickupDelivery") 
						: t("orderSteps.provideServiceLocation")}
				</p>
			</div>

			{/* Main Location (Always Required) - for moving: fromAddress, for others: fromAddress */}
			<AddressSection
				title={hasFurnitureMoving ? t("orderSteps.fromAddressPickup") : t("orderSteps.serviceLocation")}
				addressType="fromAddress"
				required={true}
				address={formData.fromAddress}
				updateAddress={updateAddress}
				LOCATION_TYPES={LOCATION_TYPES}
				t={t}
				errors={fromAddressErrors}
			/>

			{/* Destination Location (Only shown for furniture_moving) */}
			{hasFurnitureMoving && (
				<AddressSection
					title={t("orderSteps.toAddressDelivery")}
					addressType="toAddress"
					required={true}
					address={formData.toAddress}
					updateAddress={updateAddress}
					LOCATION_TYPES={LOCATION_TYPES}
					t={t}
					errors={toAddressErrors}
				/>
			)}
		</div>
	);
}
