"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch } from "@/store/hooks";
import { addUser } from "@/store/slices/usersSlice";
import { useState } from "react";

export default function AddUserModal({ isOpen, onClose }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		role: "client",
		company: "",
		status: "active",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const newUser = {
			id: `user-${Date.now()}`,
			...formData,
			created: new Date().toLocaleDateString("en-US"),
			lastLogin: "Never",
		};

		dispatch(addUser(newUser));
		onClose();
		setFormData({
			name: "",
			email: "",
			phone: "",
			role: "client",
			company: "",
			status: "active",
		});
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
			<div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="sticky top-0 bg-white border-b border-orange-200/40 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 rounded-t-xl sm:rounded-t-2xl">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 truncate">
							{t("superAdmin.modals.addUser.title")}
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
					{/* Name */}
					<div>
						<label className="block text-sm font-medium text-amber-900 mb-2">
							{t("superAdmin.modals.addUser.fullName")}
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-orange-200/60 rounded-xl text-amber-900 placeholder-amber-600/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
							placeholder="John Doe"
						/>
					</div>

					{/* Email */}
					<div>
						<label className="block text-sm font-medium text-amber-900 mb-2">
							{t("superAdmin.modals.addUser.email")}
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-orange-200/60 rounded-xl text-amber-900 placeholder-amber-600/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
							placeholder="john@example.com"
						/>
					</div>

					{/* Phone */}
					<div>
						<label className="block text-sm font-medium text-amber-900 mb-2">
							{t("superAdmin.modals.addUser.phone")}
						</label>
						<input
							type="tel"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							className="w-full px-4 py-3 bg-white border border-orange-200/60 rounded-xl text-amber-900 placeholder-amber-600/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
							placeholder="+41 XX XXX XX XX"
						/>
					</div>

					{/* Role */}
					<div>
						<label className="block text-sm font-medium text-amber-900 mb-2">
							{t("superAdmin.modals.addUser.role")}
						</label>
						<select
							name="role"
							value={formData.role}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-orange-200/60 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
						>
							<option value="client">{t("superAdmin.roles.customer")}</option>
							<option value="super_admin">{t("superAdmin.roles.super_admin")}</option>
							<option value="site_admin">{t("superAdmin.roles.site_admin")}</option>
							<option value="company_admin">
								{t("superAdmin.roles.company_admin")}
							</option>
							<option value="driver">{t("superAdmin.roles.driver")}</option>
							<option value="worker">{t("superAdmin.roles.worker")}</option>
						</select>
					</div>

					{/* Company (conditional) */}
					{(formData.role === "company_admin" ||
						formData.role === "driver" ||
						formData.role === "worker") && (
						<div>
							<label className="block text-sm font-medium text-amber-900 mb-2">
								{t("superAdmin.modals.addUser.company")}
							</label>
							<input
								type="text"
								name="company"
								value={formData.company}
								onChange={handleChange}
								className="w-full px-4 py-3 bg-white border border-orange-200/60 rounded-xl text-amber-900 placeholder-amber-600/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
								placeholder={t("superAdmin.modals.addUser.company")}
							/>
						</div>
					)}

					{/* Status */}
					<div>
						<label className="block text-sm font-medium text-amber-900 mb-2">
							{t("superAdmin.modals.addUser.status")}
						</label>
						<select
							name="status"
							value={formData.status}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-orange-200/60 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
						>
							<option value="active">{t("superAdmin.status.active")}</option>
							<option value="inactive">{t("superAdmin.status.inactive")}</option>
							<option value="available">{t("superAdmin.status.available")}</option>
						</select>
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
							className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl font-medium shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all"
						>
							{t("superAdmin.modals.addUser.addUserButton")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

