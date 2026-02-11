"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedRoomTypes } from "@/utils/i18nUtils";
import { useMemo, useCallback, useRef, useState } from "react";

export default function CustomerRoomConfigStep({ formData, setFormData, validationErrors = {} }) {
	const { t } = useTranslation();
	const ROOM_TYPES = getTranslatedRoomTypes(t);
	const fileInputRef = useRef(null);
	const previewUrlsRef = useRef([]);
	
	// Get number of rooms from previous step
	const expectedRoomCount = formData.fromAddress?.numberOfRooms || 0;
	
	// Initialize room configurations if empty
	const roomConfigurations = formData.roomConfigurations || [];
	
	// Calculate total configured room count
	const totalConfiguredRooms = useMemo(() => {
		return roomConfigurations.reduce((sum, room) => sum + (room.quantity || 0), 0);
	}, [roomConfigurations]);
	
	// Add a new room configuration entry - only if total hasn't been reached
	const handleAddRoom = useCallback(() => {
		if (totalConfiguredRooms >= expectedRoomCount) {
			return; // Don't add if limit reached
		}
		setFormData((prev) => ({
			...prev,
			roomConfigurations: [
				...(prev.roomConfigurations || []),
				{ roomType: "", quantity: 1 }
			],
		}));
	}, [setFormData, totalConfiguredRooms, expectedRoomCount]);
	
	// Remove a room configuration entry
	const handleRemoveRoom = useCallback((index) => {
		setFormData((prev) => ({
			...prev,
			roomConfigurations: (prev.roomConfigurations || []).filter((_, i) => i !== index),
		}));
	}, [setFormData]);
	
	// Update room type
	const handleRoomTypeChange = useCallback((index, roomType) => {
		setFormData((prev) => {
			const updated = [...(prev.roomConfigurations || [])];
			updated[index] = { ...updated[index], roomType };
			return {
				...prev,
				roomConfigurations: updated,
			};
		});
	}, [setFormData]);
	
	// Update room quantity - prevent exceeding expected room count
	const handleQuantityChange = useCallback((index, delta) => {
		setFormData((prev) => {
			const updated = [...(prev.roomConfigurations || [])];
			const currentQuantity = updated[index]?.quantity || 1;
			const newQuantity = currentQuantity + delta;
			
			// Calculate total if we apply this change
			const currentTotal = updated.reduce((sum, room, i) => {
				if (i === index) {
					return sum + newQuantity;
				}
				return sum + (room.quantity || 0);
			}, 0);
			
			// Only allow change if:
			// - For increment (+1): total won't exceed expected count
			// - For decrement (-1): quantity stays >= 1
			if (delta > 0 && currentTotal > expectedRoomCount) {
				return prev; // Don't allow increment that exceeds limit
			}
			if (delta < 0 && newQuantity < 1) {
				return prev; // Don't allow decrement below 1
			}
			
			updated[index] = { ...updated[index], quantity: newQuantity };
			return {
				...prev,
				roomConfigurations: updated,
			};
		});
	}, [setFormData, expectedRoomCount]);
	
	// Set quantity directly - prevent exceeding expected room count
	const handleQuantityInput = useCallback((index, value) => {
		const numValue = parseInt(value) || 1;
		setFormData((prev) => {
			const updated = [...(prev.roomConfigurations || [])];
			const currentTotal = updated.reduce((sum, room, i) => {
				if (i === index) {
					return sum + numValue;
				}
				return sum + (room.quantity || 0);
			}, 0);
			
			// Don't allow input that exceeds expected room count
			const finalQuantity = currentTotal > expectedRoomCount 
				? updated[index]?.quantity || 1 
				: Math.max(1, numValue);
			
			updated[index] = { ...updated[index], quantity: finalQuantity };
			return {
				...prev,
				roomConfigurations: updated,
			};
		});
	}, [setFormData, expectedRoomCount]);
	
	// Generate room summary text
	const roomSummary = useMemo(() => {
		if (roomConfigurations.length === 0) return "";
		
		return roomConfigurations
			.filter(room => room.roomType)
			.map(room => {
				const roomTypeName = ROOM_TYPES.find(rt => rt.id === room.roomType)?.name || room.roomType;
				return `${room.quantity} ${roomTypeName}`;
			})
			.join(", ");
	}, [roomConfigurations, ROOM_TYPES]);

	// Image upload state
	const [uploadError, setUploadError] = useState("");

	// Handle image upload - convert to base64
	const handleImageUpload = useCallback((e) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		const currentImages = formData.images || [];

		if (currentImages.length + files.length > 10) {
			setUploadError(t("orderSteps.maxImagesError") || "Maximum 10 images allowed");
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			return;
		}

		// Validate all files first
		const MAX_SIZE = 10 * 1024 * 1024; // 10MB
		for (const file of files) {
			if (file.size > MAX_SIZE) {
				setUploadError(t("orderSteps.maxImageSizeError") || "Each image must be less than 10MB");
				// Reset file input
				if (fileInputRef.current) {
					fileInputRef.current.value = '';
				}
				return;
			}
			if (!file.type.startsWith('image/')) {
				setUploadError(t("orderSteps.invalidImageType") || "Only image files are allowed");
				// Reset file input
				if (fileInputRef.current) {
					fileInputRef.current.value = '';
				}
				return;
			}
		}

		setUploadError("");

		// Convert files to base64 for preview (in production, upload to server)
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
					file: file, // Keep original File object for upload
				});

				processedCount++;
				if (processedCount === files.length) {
					setFormData((prev) => ({
						...prev,
						images: [...(prev.images || []), ...newImages],
					}));
				}
			};
			reader.onerror = () => {
				setUploadError(t("orderSteps.imageReadError") || "Error reading image file");
			};
			reader.readAsDataURL(file);
		});

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	}, [formData.images, setFormData, t]);

	// Remove image
	const removeImage = useCallback((imageId) => {
		setFormData((prev) => ({
			...prev,
			images: (prev.images || []).filter((img) => img.id !== imageId),
		}));
		setUploadError(""); // Clear error when removing images
	}, [setFormData]);

	return (
		<div className="space-y-4 sm:space-y-5 lg:space-y-6">
			<div>
				<h3 className="text-base sm:text-lg font-semibold text-amber-900 mb-1.5 sm:mb-2">
					{t("orderSteps.roomConfiguration")}
				</h3>
				<p className="text-xs sm:text-sm text-amber-700/70">
					{t("orderSteps.roomConfigurationDesc") || "Specify the rooms that need service"}
				</p>
				{expectedRoomCount > 0 && (
					<p className="text-xs sm:text-sm text-amber-600 mt-1">
						{t("orderSteps.totalRoomsToConfigure", { count: expectedRoomCount }) || `Total rooms to configure: ${expectedRoomCount}`}
					</p>
				)}
			</div>

			{expectedRoomCount === 0 && (
				<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<p className="text-sm text-yellow-800">
						{t("orderSteps.noRoomsSpecified") || "Please go back and specify the number of rooms in the previous step."}
					</p>
				</div>
			)}

			{expectedRoomCount > 0 && (
				<>
					{/* Room Configuration Inputs */}
					<div className="space-y-3 sm:space-y-4">
						{roomConfigurations.map((room, index) => {
							// Calculate if incrementing this room would exceed limit
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
									className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center p-4 bg-white border border-orange-200 rounded-lg"
								>
									{/* Room Type Dropdown */}
									<div className="flex-1 w-full sm:w-auto min-w-0">
										<label className="block text-xs sm:text-sm font-medium text-amber-800 mb-1.5">
											{t("orderSteps.roomType") || "Room Type"} <span className="text-red-500">*</span>
										</label>
										<select
											value={room.roomType || ""}
											onChange={(e) => handleRoomTypeChange(index, e.target.value)}
											className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-400 bg-white cursor-pointer ${
												validationErrors[`roomConfigurations_${index}_roomType`] 
													? "border-red-500 focus:ring-red-500" 
													: "border-orange-200 focus:ring-orange-400"
											}`}
										>
											<option value="">{t("orderSteps.selectRoomType") || "Select room type..."}</option>
											{ROOM_TYPES.map((type) => (
												<option key={type.id} value={type.id}>
													{type.name}
												</option>
											))}
										</select>
										{validationErrors[`roomConfigurations_${index}_roomType`] && (
											<p className="text-[10px] sm:text-xs text-red-500 mt-1">
												{validationErrors[`roomConfigurations_${index}_roomType`]}
											</p>
										)}
									</div>

									{/* Quantity Selector */}
									<div className="w-full sm:w-auto">
										<label className="block text-xs sm:text-sm font-medium text-amber-800 mb-1.5">
											{t("orderSteps.quantity") || "Quantity"} <span className="text-red-500">*</span>
										</label>
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => handleQuantityChange(index, -1)}
												disabled={room.quantity <= 1}
												className="w-9 h-9 flex items-center justify-center border border-orange-300 rounded-lg bg-white hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-orange-600 font-semibold text-base"
											>
												−
											</button>
											<input
												type="number"
												min="1"
												max={expectedRoomCount}
												value={room.quantity || 1}
												onChange={(e) => handleQuantityInput(index, e.target.value)}
												className={`w-16 sm:w-20 px-2 py-2 text-sm sm:text-base border rounded-lg text-center focus:outline-none focus:ring-2 focus:border-orange-400 ${
													validationErrors[`roomConfigurations_${index}_quantity`] 
														? "border-red-500 focus:ring-red-500" 
														: "border-orange-200 focus:ring-orange-400"
												}`}
											/>
											<button
												type="button"
												onClick={() => handleQuantityChange(index, 1)}
												disabled={isAtLimit || !canIncrement}
												className="w-9 h-9 flex items-center justify-center border border-orange-300 rounded-lg bg-white hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-orange-600 font-semibold text-base"
											>
												+
											</button>
										</div>
										{validationErrors[`roomConfigurations_${index}_quantity`] && (
											<p className="text-[10px] sm:text-xs text-red-500 mt-1">
												{validationErrors[`roomConfigurations_${index}_quantity`]}
											</p>
										)}
									</div>

									{/* Remove Button */}
									<button
										type="button"
										onClick={() => handleRemoveRoom(index)}
										className="mt-6 sm:mt-0 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
									>
										<svg
											className="w-4 h-4"
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
										{t("common.buttons.remove") || "Remove"}
									</button>
								</div>
							);
						})}
					</div>

					{/* Add Room Button */}
					{totalConfiguredRooms < expectedRoomCount && (
						<div className="pt-2 border-t border-orange-200">
							<button
								type="button"
								onClick={handleAddRoom}
								disabled={totalConfiguredRooms >= expectedRoomCount}
								className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-2 border-dashed border-orange-300 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
								{t("orderSteps.addRoom") || "+ Add Room"}
							</button>
						</div>
					)}

					{/* Room Summary */}
					{roomSummary && (
						<div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
							<h4 className="text-xs sm:text-sm font-medium text-green-900 mb-1.5 sm:mb-2">
								{t("orderSteps.roomSummary") || "Room Summary:"}
							</h4>
							<p className="text-xs sm:text-sm text-green-800">
								{roomSummary}
							</p>
							{totalConfiguredRooms !== expectedRoomCount && (
								<p className="text-xs sm:text-sm text-red-600 mt-2">
									{t("orderSteps.roomsMismatch", { 
										configured: totalConfiguredRooms, 
										expected: expectedRoomCount 
									}) || `Configured: ${totalConfiguredRooms} / ${expectedRoomCount} rooms`}
								</p>
							)}
							{totalConfiguredRooms === expectedRoomCount && (
								<p className="text-xs sm:text-sm text-green-700 mt-2 font-medium">
									✓ {t("orderSteps.allRoomsConfigured") || "All rooms configured!"}
								</p>
							)}
						</div>
					)}

					{/* Validation Error */}
					{validationErrors.roomConfigurations && (
						<div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-sm text-red-600">{validationErrors.roomConfigurations}</p>
						</div>
					)}

					{/* Image Upload Section */}
					<div className="pt-4 border-t border-orange-200">
						<label className="block text-xs sm:text-sm font-medium text-amber-800 mb-1.5 sm:mb-2">
							{t("orderSteps.uploadImages") || "Upload Images (Optional)"}
						</label>
						<p className="text-[10px] sm:text-xs text-amber-600/70 mb-2 sm:mb-3">
							{t("orderSteps.uploadImagesHint") || "Upload up to 10 images (max 10MB each, jpg/png)"}
						</p>

						<div className="border-2 border-dashed border-orange-300 rounded-lg p-4 sm:p-6 text-center hover:border-orange-400 transition-colors">
							<input
								ref={fileInputRef}
								type="file"
								id="image-upload"
								multiple
								accept="image/jpeg,image/png,image/jpg"
								onChange={handleImageUpload}
								className="hidden"
							/>
							<label
								htmlFor="image-upload"
								className="cursor-pointer flex flex-col items-center"
							>
								<svg
									className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500 mb-2 sm:mb-3"
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
								<span className="text-xs sm:text-sm font-medium text-amber-900 mb-1">
									{t("orderSteps.clickToUpload") || "Click to upload images"}
								</span>
								<span className="text-[10px] sm:text-xs text-amber-600/70">
									{t("orderSteps.imagesUploaded", { 
										count: formData.images?.length || 0, 
										max: 10 
									}) || `${formData.images?.length || 0} / 10 images uploaded`}
								</span>
							</label>
						</div>

						{uploadError && (
							<div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-xs sm:text-sm text-red-600">{uploadError}</p>
							</div>
						)}

						{/* Image Preview */}
						{formData.images && formData.images.length > 0 && (
							<div className="mt-4">
								<h4 className="text-xs sm:text-sm font-medium text-amber-800 mb-3">
									{t("orderSteps.uploadedImages") || "Uploaded Images"}
								</h4>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
									{formData.images.map((image) => (
										<div
											key={image.id}
											className="relative group rounded-lg overflow-hidden border border-orange-200"
										>
											<img
												src={image.url}
												alt={image.name}
												className="w-full h-24 sm:h-32 object-cover"
											/>
											<button
												type="button"
												onClick={() => removeImage(image.id)}
												className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
											>
												<svg
													className="w-4 h-4"
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
											<div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] sm:text-xs p-1 truncate">
												{image.name}
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
