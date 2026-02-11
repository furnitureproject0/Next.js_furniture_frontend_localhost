"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch } from "@/store/hooks";
import { updateCompany } from "@/store/slices/companiesSlice";
import { getTranslatedServiceTypes } from "@/utils/i18nUtils";
import { useState } from "react";

export default function EditCompanyModal({ isOpen, onClose, company }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [formData, setFormData] = useState({
		name: company?.name || "",
		email: company?.email || "",
		phone: company?.phone || "",
		url: company?.url || "",
		type: company?.type || "Furniture Moving",
		services: company?.services || "",
		available: company?.available ?? true,
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		dispatch(
			updateCompany({
				id: company.id,
				updates: {
					...formData,
					lastActivity: new Date().toLocaleDateString("en-US"),
				},
			}),
		);
		onClose();
	};

	if (!isOpen || !company) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
			<div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="sticky top-0 bg-white border-b border-orange-200/40 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 rounded-t-xl sm:rounded-t-2xl">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 truncate">
							{t("superAdmin.modals.editCompany.title")}
						</h2>
						<button
							onClick={onClose}
							className="p-1.5 sm:p-2 hover:bg-orange-50 rounded-lg transition-colors flex-shrink-0"
						>
							<svg
								className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700"
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
						<label className="block text-sm font-medium text-amber-900 mb-2">
							{t("superAdmin.modals.addCompany.companyName")}
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-orange-200/60 rounded-xl text-amber-900 placeholder-amber-600/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
							placeholder="Company Name AG"
						/>
					</div>

					{/* Email */}
					<div>
						<label className="block text-sm font-medium text-amber-900 mb-2">
							{t("superAdmin.modals.addCompany.email")}
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-orange-200/60 rounded-xl text-amber-900 placeholder-amber-600/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
							placeholder="info@company.ch"
						/>
					</div>

					{/* Phone */}
					<div>
						<label className="block text-sm font-medium text-amber-900 mb-2">
							{t("superAdmin.modals.addCompany.phone")}
						</label>
						<input
							type="tel"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							className="w-full px-4 py-3 bg-white border border-orange-200/60 rounded-xl text-amber-900 placeholder-amber-600/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
							placeholder="+41-44-234-5678"
						/>
					</div>

					{/* Website URL */}
					<div>
						<label className="block text-sm font-medium text-amber-900 mb-2">
							{t("superAdmin.modals.addCompany.websiteUrl")}
						</label>
						<input
							type="text"
							name="url"
							value={formData.url}
							onChange={handleChange}
							className="w-full px-4 py-3 bg-white border border-orange-200/60 rounded-xl text-amber-900 placeholder-amber-600/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
							placeholder="angebotprofi.com/company"
						/>
					</div>

					{/* Type */}
					<div>
						<label className="block text-sm font-medium text-amber-900 mb-2">
							{t("superAdmin.modals.addCompany.companyType")}
						</label>
						<select
							name="type"
							value={formData.type}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-orange-200/60 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
						>
							<option value="Furniture Moving">
								{getTranslatedServiceTypes(t).find(s => s.id === "furniture_moving")?.name || "Furniture Moving"}
							</option>
							<option value="Cleaning">{getTranslatedServiceTypes(t).find(s => s.id === "cleaning_service")?.name || "Cleaning"}</option>
							<option value="Painting">{getTranslatedServiceTypes(t).find(s => s.id === "painting")?.name || "Painting"}</option>
						</select>
					</div>

					{/* Services */}
					<div>
						<label className="block text-sm font-medium text-amber-900 mb-2">
							{t("superAdmin.modals.addCompany.services")}
						</label>
						<input
							type="text"
							name="services"
							value={formData.services}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-orange-200/60 rounded-xl text-amber-900 placeholder-amber-600/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
							placeholder="moving, packing, assembly"
						/>
						<p className="text-xs text-amber-600/60 mt-1">
							{t("superAdmin.modals.addCompany.servicesHint")}
						</p>
					</div>

					{/* Status */}
					<div className="flex items-center gap-3">
						<input
							type="checkbox"
							id="available"
							name="available"
							checked={formData.available}
							onChange={handleChange}
							className="w-5 h-5 text-orange-600 bg-white border-orange-200/60 rounded focus:ring-2 focus:ring-orange-500/40"
						/>
						<label
							htmlFor="available"
							className="text-sm font-medium text-amber-900 cursor-pointer"
						>
							{t("superAdmin.modals.addCompany.companyIsActive")}
						</label>
					</div>

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm bg-white border border-orange-200/60 text-amber-900 rounded-lg sm:rounded-xl font-medium hover:bg-orange-50 transition-colors"
						>
							{t("common.buttons.cancel")}
						</button>
						<button
							type="submit"
							className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg sm:rounded-xl font-medium shadow-md hover:shadow-lg hover:from-orange-600 hover:to-amber-700 transition-all"
						>
							{t("superAdmin.modals.editCompany.updateCompanyButton")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

