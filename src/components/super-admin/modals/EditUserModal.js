"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUserThunk } from "@/store/slices/usersSlice";
import { useState, useEffect } from "react";

export default function EditUserModal({ isOpen, onClose, user }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const users = useAppSelector((state) => state.users.users);
	const currentUser = users.find((u) => u.id === user?.id);
	
	const [formData, setFormData] = useState({
		name: currentUser?.name || user?.name || "",
		email: currentUser?.email || user?.email || "",
	});

	// Update form data when currentUser changes (e.g., after update)
	useEffect(() => {
		if (currentUser) {
			setFormData({
				name: currentUser.name || "",
				email: currentUser.email || "",
			});
		}
	}, [currentUser]);

	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const result = await dispatch(
				updateUserThunk({
					id: user.id,
					updates: formData,
				}),
			);
			
			// Check if the update was successful
			if (result.payload) {
				onClose();
			}
		} catch (error) {
			console.error("Failed to update user:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen || !user) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
			<div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="sticky top-0 bg-white border-b border-primary-200/40 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 rounded-t-xl sm:rounded-t-2xl">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">
							{t("superAdmin.modals.editUser.title")}
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
					{/* Name */}
					<div>
						<label className="block text-sm font-medium text-slate-800 mb-2">
							{t("superAdmin.modals.addUser.fullName")}
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-primary-200/60 rounded-xl text-slate-800 placeholder-primary-600/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-300"
							placeholder="John Doe"
						/>
					</div>

					{/* Email */}
					<div>
						<label className="block text-sm font-medium text-slate-800 mb-2">
							{t("superAdmin.modals.addUser.email")}
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 bg-white border border-primary-200/60 rounded-xl text-slate-800 placeholder-primary-600/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-300"
							placeholder="john@example.com"
						/>
					</div>

					{/* Actions */}
					<div className="flex gap-4 pt-4">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="flex-1 px-6 py-3 bg-white border border-primary-200/60 text-slate-800 rounded-xl font-medium hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{t("common.buttons.cancel")}
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-primary-600 hover:to-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{isSubmitting ? (
								<>
									<svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									{t("common.buttons.saving") || "Saving..."}
								</>
							) : (
								t("superAdmin.modals.editUser.updateUserButton")
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

