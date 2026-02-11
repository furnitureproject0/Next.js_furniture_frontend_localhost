"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { getTranslatedRoomTypes } from "@/utils/i18nUtils";
import {
	LOCATION_TYPES_WITH_BUILDING_FLOORS,
	LOCATION_TYPES_WITH_FLOOR,
} from "@/constants/orderConstants";

/**
 * Collapsible location details section with room configurations and image uploads
 * Shows floor, rooms, area, elevator, notes, room configuration, and images
 * Enhanced to match the room configuration step functionality
 */
export default function LocationDetailsCollapsible({
	address,
	addressType,
	updateAddress,
	required,
	errors,
	t
}) {
	const [isOpen, setIsOpen] = useState(false);
	const fileInputRef = useRef(null);
	const [uploadError, setUploadError] = useState("");

	const ROOM_TYPES = getTranslatedRoomTypes(t);
	const locationType = address.locationType || "";
	const showFloorNumber = LOCATION_TYPES_WITH_FLOOR.includes(locationType);
	const showNumberOfFloors = LOCATION_TYPES_WITH_BUILDING_FLOORS.includes(locationType);

	// Room configurations for this address
	const roomConfigurations = address.roomConfigurations || [];
	const expectedRoomCount = address.numberOfRooms || 0;

	// Calculate total configured room count
	const totalConfiguredRooms = useMemo(() => {
		return roomConfigurations.reduce((sum, room) => sum + (room.quantity || 0), 0);
	}, [roomConfigurations]);

	// Add a new room configuration entry
	const handleAddRoom = useCallback(() => {
		if (totalConfiguredRooms >= expectedRoomCount) {
			return;
		}
		const updatedRooms = [
			...roomConfigurations,
			{ roomType: "", quantity: 1 }
		];
		updateAddress(addressType, "roomConfigurations", updatedRooms);
	}, [addressType, updateAddress, roomConfigurations, totalConfiguredRooms, expectedRoomCount]);

	// Remove a room configuration entry
	const handleRemoveRoom = useCallback((index) => {
		const updatedRooms = roomConfigurations.filter((_, i) => i !== index);
		updateAddress(addressType, "roomConfigurations", updatedRooms);
	}, [addressType, updateAddress, roomConfigurations]);

	// Update room type
	const handleRoomTypeChange = useCallback((index, roomType) => {
		const updated = [...roomConfigurations];
		updated[index] = { ...updated[index], roomType };
		updateAddress(addressType, "roomConfigurations", updated);
	}, [addressType, updateAddress, roomConfigurations]);

	// Update room quantity
	const handleQuantityChange = useCallback((index, delta) => {
		const updated = [...roomConfigurations];
		const currentQuantity = updated[index]?.quantity || 1;
		const newQuantity = currentQuantity + delta;

		const currentTotal = updated.reduce((sum, room, i) => {
			if (i === index) {
				return sum + newQuantity;
			}
			return sum + (room.quantity || 0);
		}, 0);

		if (delta > 0 && currentTotal > expectedRoomCount) {
			return;
		}
		if (delta < 0 && newQuantity < 1) {
			return;
		}

		updated[index] = { ...updated[index], quantity: newQuantity };
		updateAddress(addressType, "roomConfigurations", updated);
	}, [addressType, updateAddress, roomConfigurations, expectedRoomCount]);

	// Handle image upload
	const handleImageUpload = useCallback((e) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		const currentImages = address.images || [];

		if (currentImages.length + files.length > 10) {
			setUploadError(t("orderSteps.maxImagesError") || "Maximum 10 images allowed");
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			return;
		}

		const MAX_SIZE = 10 * 1024 * 1024; // 10MB
		for (const file of files) {
			if (file.size > MAX_SIZE) {
				setUploadError(t("orderSteps.maxImageSizeError") || "Each image must be less than 10MB");
				if (fileInputRef.current) {
					fileInputRef.current.value = '';
				}
				return;
			}
			if (!file.type.startsWith('image/')) {
				setUploadError(t("orderSteps.invalidImageType") || "Only image files are allowed");
				if (fileInputRef.current) {
					fileInputRef.current.value = '';
				}
				return;
			}
		}

		setUploadError("");

		const newImages = [];
		let processedCount = 0;

		files.forEach((file) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				newImages.push({
					id: Date.now() + Math.random(),
					name: file.name,
					url: reader.result,
					size: file.size,
					file: file,
				});

				processedCount++;
				if (processedCount === files.length) {
					updateAddress(addressType, "images", [...currentImages, ...newImages]);
				}
			};
			reader.onerror = () => {
				setUploadError(t("orderSteps.imageReadError") || "Error reading image file");
			};
			reader.readAsDataURL(file);
		});

		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	}, [address.images, addressType, updateAddress, t]);

	// Remove image
	const removeImage = useCallback((imageId) => {
		const currentImages = address.images || [];
		const updatedImages = currentImages.filter((img) => img.id !== imageId);
		updateAddress(addressType, "images", updatedImages);
		setUploadError("");
	}, [address.images, addressType, updateAddress]);

	if (!locationType) return null;

	return (
		<div className="pt-2 sm:pt-3 border-t border-orange-200">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center justify-between text-xs sm:text-sm font-medium text-amber-800 hover:text-amber-900 transition-colors cursor-pointer"
			>
				<span>{t("orderSteps.locationDetails")}</span>
				<svg
					className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{isOpen && (
				<div className="mt-2.5 sm:mt-3 space-y-3 sm:space-y-4">
					{/* Show Floor Number for Apartment/Office */}
					{showFloorNumber && (
						<div>
							<label className="block text-xs sm:text-sm text-amber-700 mb-1">
								{t("orderSteps.floorNumber")} {required && <span className="text-red-500">*</span>}
							</label>
							<input
								type="number"
								min="0"
								value={address.floor || ""}
								onChange={(e) =>
									updateAddress(
										addressType,
										"floor",
										parseInt(e.target.value) || 0,
									)
								}
								placeholder={t("orderSteps.floorPlaceholder")}
								className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-400 ${errors?.floor ? "border-red-500 focus:ring-red-500" : "border-orange-200 focus:ring-orange-400"
									}`}
							/>
							{errors?.floor && (
								<p className="text-[10px] sm:text-xs text-red-500 mt-0.5 sm:mt-1">
									{errors.floor}
								</p>
							)}
						</div>
					)}

					{/* Show Number of Floors for Warehouse/House/Building */}
					{showNumberOfFloors && (
						<div>
							<label className="block text-xs sm:text-sm text-amber-700 mb-1">
								{t("orderSteps.numberOfFloors")} {required && <span className="text-red-500">*</span>}
							</label>
							<input
								type="number"
								min="1"
								value={address.numberOfFloors || ""}
								onChange={(e) =>
									updateAddress(
										addressType,
										"numberOfFloors",
										parseInt(e.target.value) || 0,
									)
								}
								placeholder={t("orderSteps.floorsPlaceholder")}
								className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-400 ${errors?.numberOfFloors ? "border-red-500 focus:ring-red-500" : "border-orange-200 focus:ring-orange-400"
									}`}
							/>
							{errors?.numberOfFloors && (
								<p className="text-[10px] sm:text-xs text-red-500 mt-0.5 sm:mt-1">
									{errors.numberOfFloors}
								</p>
							)}
						</div>
					)}

					{/* Number of Rooms - Always shown */}
					<div>
						<label className="block text-xs sm:text-sm text-amber-700 mb-1">
							{t("orderSteps.numberOfRooms")} {required && <span className="text-red-500">*</span>}
						</label>
						<input
							type="number"
							min="0.5"
							step="0.5"
							value={address.numberOfRooms || ""}
							onChange={(e) =>
								updateAddress(
									addressType,
									"numberOfRooms",
									parseFloat(e.target.value) || 0,
								)
							}
							placeholder={t("orderSteps.roomsPlaceholder")}
							className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-400 ${errors?.numberOfRooms ? "border-red-500 focus:ring-red-500" : "border-orange-200 focus:ring-orange-400"
								}`}
						/>
						{errors?.numberOfRooms && (
							<p className="text-[10px] sm:text-xs text-red-500 mt-0.5 sm:mt-1">
								{errors.numberOfRooms}
							</p>
						)}
					</div>

					{/* Area - Always shown */}
					<div>
						<label className="block text-xs sm:text-sm text-amber-700 mb-1">
							{t("orderSteps.areaM2")} {required && <span className="text-red-500">*</span>}
						</label>
						<input
							type="number"
							min="0"
							step="0.1"
							value={address.area || ""}
							onChange={(e) =>
								updateAddress(
									addressType,
									"area",
									parseFloat(e.target.value) || 0,
								)
							}
							placeholder={t("orderSteps.areaPlaceholder")}
							className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-400 ${errors?.area ? "border-red-500 focus:ring-red-500" : "border-orange-200 focus:ring-orange-400"
								}`}
						/>
						{errors?.area && (
							<p className="text-[10px] sm:text-xs text-red-500 mt-0.5 sm:mt-1">
								{errors.area}
							</p>
						)}
					</div>

					{/* Has Elevator - Always shown */}
					<div className="flex items-center gap-4 sm:gap-6">
						<label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={address.hasElevator || false}
								onChange={(e) =>
									updateAddress(
										addressType,
										"hasElevator",
										e.target.checked,
									)
								}
								className="w-4 h-4 text-orange-600 border-orange-300 rounded focus:ring-orange-500 flex-shrink-0"
							/>
							<span className="text-xs sm:text-sm text-amber-800">
								{t("orderSteps.hasElevator")}
							</span>
						</label>
					</div>

					{/* Notes field - Always shown, optional */}
					<div>
						<label className="block text-xs sm:text-sm text-amber-700 mb-1">
							{t("orderSteps.additionalNotes")}
						</label>
						<textarea
							value={address.notes || ""}
							onChange={(e) =>
								updateAddress(addressType, "notes", e.target.value)
							}
							placeholder={t("orderSteps.additionalInfoPlaceholder")}
							rows="2"
							className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 resize-none"
						/>
					</div>

					{/* Room Configuration Section */}
					{expectedRoomCount > 0 && (
						<div className="pt-3 border-t border-orange-200/60">
							<h5 className="text-xs sm:text-sm font-semibold text-amber-900 mb-2">
								{t("orderSteps.roomConfiguration")}
							</h5>

							{roomConfigurations.length > 0 && (
								<div className="space-y-2 mb-3">
									{roomConfigurations.map((room, index) => {
										const otherRoomsTotal = roomConfigurations.reduce((sum, r, i) => {
											if (i !== index) {
												return sum + (r.quantity || 0);
											}
											return sum;
										}, 0);
										const canIncrement = (otherRoomsTotal + (room.quantity || 1) + 1) <= expectedRoomCount;
										const isAtLimit = totalConfiguredRooms >= expectedRoomCount;

										return (
											<div
												key={index}
												className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-2.5 sm:p-3 bg-white border border-orange-100 rounded-lg"
											>
												{/* Room Type Dropdown */}
												<div className="flex-1 w-full sm:w-auto min-w-0">
													<select
														value={room.roomType || ""}
														onChange={(e) => handleRoomTypeChange(index, e.target.value)}
														className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white cursor-pointer"
													>
														<option value="">{t("orderSteps.selectRoomType") || "Select room type..."}</option>
														{ROOM_TYPES.map((type) => (
															<option key={type.id} value={type.id}>
																{type.name}
															</option>
														))}
													</select>
												</div>

												{/* Quantity Selector */}
												<div className="flex items-center gap-1.5">
													<button
														type="button"
														onClick={() => handleQuantityChange(index, -1)}
														disabled={room.quantity <= 1}
														className="w-7 h-7 flex items-center justify-center border border-orange-300 rounded-md bg-white hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-orange-600 font-semibold text-sm"
													>
														−
													</button>
													<span className="w-8 text-center text-xs sm:text-sm font-medium text-amber-900">
														{room.quantity || 1}
													</span>
													<button
														type="button"
														onClick={() => handleQuantityChange(index, 1)}
														disabled={isAtLimit || !canIncrement}
														className="w-7 h-7 flex items-center justify-center border border-orange-300 rounded-md bg-white hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-orange-600 font-semibold text-sm"
													>
														+
													</button>
												</div>

												{/* Remove Button */}
												<button
													type="button"
													onClick={() => handleRemoveRoom(index)}
													className="px-2 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors text-xs font-medium flex items-center gap-1"
												>
													<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
													</svg>
													{t("common.buttons.remove") || "Remove"}
												</button>
											</div>
										);
									})}
								</div>
							)}

							{/* Add Room Button */}
							{totalConfiguredRooms < expectedRoomCount && (
								<button
									type="button"
									onClick={handleAddRoom}
									disabled={totalConfiguredRooms >= expectedRoomCount}
									className="w-full px-3 py-2 text-xs sm:text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-2 border-dashed border-orange-300 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
									{t("orderSteps.addRoom") || "+ Add Room"}
								</button>
							)}

							{/* Room Summary */}
							{roomConfigurations.length > 0 && (
								<div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
									<p className="text-[10px] sm:text-xs text-blue-800">
										{t("orderSteps.configured") || "Configured"}: {totalConfiguredRooms} / {expectedRoomCount} {t("orderSteps.rooms") || "rooms"}
									</p>
								</div>
							)}
						</div>
					)}

					{/* Image Upload Section */}
					<div className="pt-3 border-t border-orange-200/60">
						<label className="block text-xs sm:text-sm font-semibold text-amber-900 mb-2">
							{t("orderSteps.uploadImages") || "Upload Images (Optional)"}
						</label>

						<div className="border-2 border-dashed border-orange-300 rounded-lg p-3 sm:p-4 text-center hover:border-orange-400 transition-colors">
							<input
								ref={fileInputRef}
								type="file"
								id={`image-upload-${addressType}`}
								multiple
								accept="image/jpeg,image/png,image/jpg"
								onChange={handleImageUpload}
								className="hidden"
							/>
							<label
								htmlFor={`image-upload-${addressType}`}
								className="cursor-pointer flex flex-col items-center"
							>
								<svg
									className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 mb-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
								<span className="text-[10px] sm:text-xs font-medium text-amber-900 mb-1">
									{t("orderSteps.clickToUpload") || "Click to upload images"}
								</span>
								<span className="text-[9px] sm:text-[10px] text-amber-600/70">
									{(address.images?.length || 0)} / 10 {t("orderSteps.images") || "images"}
								</span>
							</label>
						</div>

						{uploadError && (
							<div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-[10px] sm:text-xs text-red-600">{uploadError}</p>
							</div>
						)}

						{/* Image Preview */}
						{address.images && address.images.length > 0 && (
							<div className="mt-3">
								<h6 className="text-[10px] sm:text-xs font-medium text-amber-800 mb-2">
									{t("orderSteps.uploadedImages") || "Uploaded Images"}
								</h6>
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
									{address.images.map((image) => (
										<div
											key={image.id}
											className="relative group rounded-lg overflow-hidden border border-orange-200"
										>
											<img
												src={image.url}
												alt={image.name}
												className="w-full h-20 sm:h-24 object-cover"
											/>
											<button
												type="button"
												onClick={() => removeImage(image.id)}
												className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
											>
												<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
											<div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] sm:text-[10px] p-1 truncate">
												{image.name}
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
