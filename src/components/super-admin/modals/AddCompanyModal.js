"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch } from "@/store/hooks";
import { createCompanyThunk } from "@/store/slices/companiesSlice";
import { getTranslatedServiceTypes } from "@/utils/i18nUtils";
import { servicesApi } from "@/lib/api";
import { useState, useEffect } from "react";
import { useGlobalToast } from "@/hooks/useGlobalToast";

export default function AddCompanyModal({ isOpen, onClose }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { showToast } = useGlobalToast();
	const [availableServices, setAvailableServices] = useState([]);
	const [loadingServices, setLoadingServices] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		description: "",
		address: "",
		website: "",
		type: "Furniture Moving",
		services: [],
		available: true,
	});

	// Fetch services on mount
	useEffect(() => {
		const fetchServices = async () => {
			try {
				setLoadingServices(true);
				const response = await servicesApi.getServices();
				if (response?.data) {
					setAvailableServices(Array.isArray(response.data) ? response.data : []);
				}
			} catch (error) {
				console.error("Failed to fetch services:", error);
				setAvailableServices([]);
			} finally {
				setLoadingServices(false);
			}
		};

		if (isOpen) {
			fetchServices();
		}
	}, [isOpen]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		if (name === "services") {
			// For services checkboxes, handle as array
			setFormData((prev) => ({
				...prev,
				services: checked
					? [...prev.services, parseInt(value)]
					: prev.services.filter(id => id !== parseInt(value))
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: type === "checkbox" ? checked : value,
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate services selection
		if (!formData.services || formData.services.length === 0) {
			showToast(t("superAdmin.modals.addCompany.selectServicesError"), "error");
			return;
		}

		try {
			// Ensure phone is in array format
			const phonesArray = formData.phone ? [formData.phone] : [];

			// Ensure website has protocol
			let websiteUrl = formData.website.trim();
			if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
				websiteUrl = 'https://' + websiteUrl;
			}

			const formattedData = {
				name: formData.name,
				email: formData.email,
				description: formData.description,
				address: formData.address,
				website: websiteUrl,
				phones: phonesArray,
				services: formData.services, // Already array of IDs
			};
			
			await dispatch(createCompanyThunk(formattedData)).unwrap();
			showToast(t("common.success"), "success");
			onClose();
			setFormData({
				name: "",
				email: "",
				phone: "",
				description: "",
				address: "",
				website: "",
				type: "Furniture Moving",
				services: [],
				available: true,
			});
		} catch (error) {
			showToast(error?.message || error || t("common.error"), "error");
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
			<div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="sticky top-0 bg-white border-b border-primary-200/40 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 rounded-t-xl sm:rounded-t-2xl">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">
							{t("superAdmin.modals.addCompany.title")}
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
				{loadingServices ? (
					<p className="text-sm text-slate-500">{t("common.labels.loading")}</p>
				) : availableServices.length > 0 ? (
					<div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-primary-100">
						{availableServices.map((service) => (
							<div key={service.id} className="flex items-center">
								<input
									type="checkbox"
									id={`service-${service.id}`}
									name="services"
									value={service.id}
									checked={formData.services.includes(service.id)}
									onChange={handleChange}
									className="w-4 h-4 text-primary-600 bg-white border-primary-200/60 rounded focus:ring-2 focus:ring-primary-500/40"
								/>
								<label
									htmlFor={`service-${service.id}`}
									className="ml-2 text-sm font-medium text-slate-700 cursor-pointer"
								>
									{service.name}
								</label>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-slate-500">{t("common.messages.noServices")}</p>
				)}
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
							className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl font-medium shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all"
						>
							{t("superAdmin.modals.addCompany.addCompanyButton")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

