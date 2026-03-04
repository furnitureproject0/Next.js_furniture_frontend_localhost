"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch } from "@/store/hooks";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { updateCompanyThunk } from "@/store/slices/companiesSlice";
import { getTranslatedServiceTypes } from "@/utils/i18nUtils";
import { useState } from "react";

export default function EditCompanyModal({ isOpen, onClose, company }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const showToast = useGlobalToast();
	const [formData, setFormData] = useState({
		name: company?.name || "",
		email: company?.email || "",
		phone: company?.phone || "",
		description: company?.description || "",
		address: company?.address || "",
		website: company?.website || company?.url || "",
		type: company?.type || "Furniture Moving",
		services: company?.serviceIds || [],
		available: company?.available ?? true,
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate services selection
		if (!formData.services || formData.services.length === 0) {
			showToast(t("superAdmin.modals.editCompany.selectServicesError"), "error");
			return;
		}

		try {
			// Ensure phone is in array format
			const phonesArray = typeof formData.phone === 'string' 
				? [formData.phone] 
				: formData.phone;

			// Ensure website has protocol
			let websiteUrl = formData.website.trim();
			if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
				websiteUrl = 'https://' + websiteUrl;
			}

			const updates = {
				name: formData.name,
				email: formData.email,
				description: formData.description,
				address: formData.address,
				website: websiteUrl,
				phones: phonesArray,
				services: formData.services, // Already array of IDs
			};

			await dispatch(
				updateCompanyThunk({
					id: company.id,
					updates,
				}),
			);
			showToast(t("common.messages.updateSuccess"), "success");
			onClose();
		} catch (error) {
			showToast(error?.message || error || t("common.error"), "error");
		}
	};

	if (!isOpen || !company) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
			<div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="sticky top-0 bg-white border-b border-primary-200/40 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 rounded-t-xl sm:rounded-t-2xl">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">
							{t("superAdmin.modals.editCompany.title")}
						</h2>
						<button
							onClick={onClose}
							className="p-1.5 sm:p-2 hover:bg-primary-50 rounded-lg transition-colors flex-shrink-0"
						>
							<svg
								className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600"
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
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 lg:space-y-6">
					{/* Company Name */}
					<div>
						<label className="block text-sm font-medium text-slate-800 mb-2">
							{t("superAdmin.modals.addCompany.companyName")}
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-primary-200/60 rounded-xl text-slate-800 placeholder-primary-600/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-300"
							placeholder={t("superAdmin.modals.addCompany.companyNamePlaceholder")}
						/>
					</div>

					{/* Email */}
					<div>
						<label className="block text-sm font-medium text-slate-800 mb-2">
							{t("superAdmin.modals.addCompany.email")}
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-primary-200/60 rounded-xl text-slate-800 placeholder-primary-600/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-300"
							placeholder={t("superAdmin.modals.addCompany.emailPlaceholder")}
						/>
					</div>

					{/* Description */}
					<div>
						<label className="block text-sm font-medium text-slate-800 mb-2">
							{t("superAdmin.modals.addCompany.description")}
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							required
							rows="3"
							className="w-full px-4 py-3 bg-white border border-primary-200/60 rounded-xl text-slate-800 placeholder-primary-600/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-300 resize-none"
							placeholder={t("superAdmin.modals.addCompany.descriptionPlaceholder")}
						/>
					</div>

					{/* Address */}
					<div>
						<label className="block text-sm font-medium text-slate-800 mb-2">
							{t("superAdmin.modals.addCompany.address")}
						</label>
						<input
							type="text"
							name="address"
							value={formData.address}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-primary-200/60 rounded-xl text-slate-800 placeholder-primary-600/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-300"
							placeholder={t("superAdmin.modals.addCompany.addressPlaceholder")}
						/>
					</div>

					{/* Phone */}
					<div>
						<label className="block text-sm font-medium text-slate-800 mb-2">
							{t("superAdmin.modals.addCompany.phone")}
						</label>
						<input
							type="tel"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							className="w-full px-4 py-3 bg-white border border-primary-200/60 rounded-xl text-slate-800 placeholder-primary-600/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-300"
							placeholder={t("superAdmin.modals.addCompany.phonePlaceholder")}
						/>
					</div>

					{/* Website URL */}
					<div>
						<label className="block text-sm font-medium text-slate-800 mb-2">
							{t("superAdmin.modals.addCompany.websiteUrl")}
						</label>
						<input
							type="text"
							name="website"
							value={formData.website}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-primary-200/60 rounded-xl text-slate-800 placeholder-primary-600/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-300"
							placeholder={t("superAdmin.modals.addCompany.websitePlaceholder")}
						/>
					<p className="text-xs text-primary-600/60 mt-1">
						{t("superAdmin.modals.addCompany.websiteHint")}
					</p>
				</div>

				{/* Type */}
				<div>
					<label className="block text-sm font-medium text-slate-800 mb-2">
						{t("superAdmin.modals.addCompany.companyType")}
					</label>
					<select
						name="type"
						value={formData.type}
						onChange={handleChange}
						required
						className="w-full px-4 py-3 bg-white border border-primary-200/60 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-300"
					>
						<option value="Furniture Moving">
							{getTranslatedServiceTypes(t).find(s => s.id === "furniture_moving")?.name}
						</option>
						<option value="Cleaning">{getTranslatedServiceTypes(t).find(s => s.id === "cleaning_service")?.name}</option>
						<option value="Painting">{getTranslatedServiceTypes(t).find(s => s.id === "painting")?.name}</option>
					</select>
				</div>

				{/* Services */}
				<div>
					<label className="block text-sm font-medium text-slate-800 mb-2">
						{t("superAdmin.modals.addCompany.services")}
					</label>
					<input
						type="number"
						name="services"
						value={formData.services.length > 0 ? formData.services[0] : ""}
						onChange={(e) => {
							const value = e.target.value;
							setFormData((prev) => ({
								...prev,
								services: value ? [parseInt(value)] : []
							}));
						}}
						min="1"
						required
						className="w-full px-4 py-3 bg-white border border-primary-200/60 rounded-xl text-slate-800 placeholder-primary-600/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-300"
						placeholder={t("superAdmin.modals.addCompany.servicesHint")}
					/>
				</div>

			{/* Status */}
			<div className="flex items-center gap-3">
				<input
					type="checkbox"
					id="available"
					name="available"
					checked={formData.available}
					onChange={handleChange}
					className="w-5 h-5 text-primary-600 bg-white border-primary-200/60 rounded focus:ring-2 focus:ring-primary-500/40"
				/>
						<label
							htmlFor="available"
							className="text-sm font-medium text-slate-800 cursor-pointer"
						>
							{t("superAdmin.modals.addCompany.companyIsActive")}
						</label>
					</div>

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm bg-white border border-primary-200/60 text-slate-800 rounded-lg sm:rounded-xl font-medium hover:bg-primary-50 transition-colors"
						>
							{t("common.buttons.cancel")}
						</button>
						<button
							type="submit"
							className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg sm:rounded-xl font-medium shadow-md hover:shadow-lg hover:from-primary-600 hover:to-slate-600 transition-all"
						>
							{t("superAdmin.modals.editCompany.updateCompanyButton")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

