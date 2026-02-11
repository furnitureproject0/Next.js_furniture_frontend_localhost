"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useCallback, useRef, useState } from "react";

/**
 * Image Upload Section
 * Allows users to upload images for a specific location
 * Separated for reusability across different address sections
 */
export default function ImageUploadSection({ 
	addressType,
	images = [],
	onUpdate,
	maxImages = 10,
	t 
}) {
	const fileInputRef = useRef(null);
	const [uploadError, setUploadError] = useState("");

	// Handle image upload
	const handleImageUpload = useCallback((e) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		if (images.length + files.length > maxImages) {
			setUploadError(t("orderSteps.maxImagesError") || `Maximum ${maxImages} images allowed`);
			if (fileInputRef.current) fileInputRef.current.value = '';
			return;
		}

		// Validate all files first
		const MAX_SIZE = 10 * 1024 * 1024; // 10MB
		for (const file of files) {
			if (file.size > MAX_SIZE) {
				setUploadError(t("orderSteps.maxImageSizeError") || "Each image must be less than 10MB");
				if (fileInputRef.current) fileInputRef.current.value = '';
				return;
			}
			if (!file.type.startsWith('image/')) {
				setUploadError(t("orderSteps.invalidImageType") || "Only image files are allowed");
				if (fileInputRef.current) fileInputRef.current.value = '';
				return;
			}
		}

		setUploadError("");

		// Convert files to base64 for preview
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
					onUpdate([...images, ...newImages]);
				}
			};
			reader.onerror = () => {
				setUploadError(t("orderSteps.imageReadError") || "Error reading image file");
			};
			reader.readAsDataURL(file);
		});

		if (fileInputRef.current) fileInputRef.current.value = '';
	}, [images, onUpdate, maxImages, t]);

	// Remove image
	const removeImage = useCallback((imageId) => {
		onUpdate(images.filter((img) => img.id !== imageId));
		setUploadError("");
	}, [images, onUpdate]);

	return (
		<div className="space-y-3">
			<label className="block text-xs sm:text-sm font-medium text-amber-800">
				{t("orderSteps.uploadImages")} ({images.length}/{maxImages})
			</label>

			<div className="border-2 border-dashed border-orange-300 rounded-lg p-3 text-center hover:border-orange-400 transition-colors">
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
						className="w-8 h-8 text-orange-500 mb-2"
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
					<span className="text-xs font-medium text-amber-900">
						{t("orderSteps.clickToUpload")}
					</span>
				</label>
			</div>

			{uploadError && (
				<div className="p-2 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-xs text-red-600">{uploadError}</p>
				</div>
			)}

			{/* Image Preview */}
			{images.length > 0 && (
				<div className="grid grid-cols-3 gap-2">
					{images.map((image) => (
						<div
							key={image.id}
							className="relative group rounded-lg overflow-hidden border border-orange-200"
						>
							<img
								src={image.url}
								alt={image.name}
								className="w-full h-20 object-cover"
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
						</div>
					))}
				</div>
			)}
		</div>
	);
}
