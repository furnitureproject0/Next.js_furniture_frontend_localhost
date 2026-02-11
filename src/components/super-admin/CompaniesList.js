"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
	updateCompany,
	removeCompany,
	toggleCompanyAvailability,
} from "@/store/slices/companiesSlice";
import { useTranslation } from "@/hooks/useTranslation";
import EditCompanyModal from "./modals/EditCompanyModal";

const getCompanyIcon = (type) => {
	switch (type?.toLowerCase()) {
		case "furniture moving":
			return "🚚";
		case "cleaning":
			return "🧹";
		case "painting":
			return "🎨";
		default:
			return "🏢";
	}
};

const CompanyCard = ({ company, onEdit, onDelete, onToggleStatus, t }) => {
	return (
		<div className="bg-white border border-orange-200/40 rounded-xl p-6 hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between">
				{/* Company Info */}
				<div className="flex items-start gap-4 flex-1">
					<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 text-3xl">
						{getCompanyIcon(company.type)}
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-3 mb-2">
							<h3 className="text-lg font-semibold text-amber-900">
								{company.name}
							</h3>
							<span
								className={`px-3 py-1 text-xs font-medium rounded-full border ${
									company.available
										? "bg-red-100 text-red-800 border-red-200"
										: "bg-gray-100 text-gray-800 border-gray-200"
								}`}
							>
								{company.available ? t("superAdmin.companyDetails.active") : t("superAdmin.companyDetails.inactive")}
							</span>
						</div>
						<div className="space-y-2 mb-3">
							{company.url && (
								<a
									href={
										company.url.startsWith("http")
											? company.url
											: `https://${company.url}`
									}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
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
											d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
										/>
									</svg>
									{company.url}
								</a>
							)}
							<div className="flex items-center gap-2 text-sm text-amber-700/70">
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
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								{company.email}
							</div>
							{company.phone && (
								<div className="flex items-center gap-2 text-sm text-amber-700/70">
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
											d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
										/>
									</svg>
									{company.phone}
								</div>
							)}
						</div>
						<div className="text-sm">
							<span className="text-amber-600/60">{t("superAdmin.companyDetails.type")}: </span>
							<span className="font-medium text-amber-900">
								{company.type || t("common.nA")}
							</span>
						</div>
						<div className="text-sm">
							<span className="text-amber-600/60">
								{t("superAdmin.companyDetails.services")}:{" "}
							</span>
							<span className="font-medium text-amber-900">
								{company.services || t("common.nA")}
							</span>
						</div>
					</div>
				</div>

				{/* Right Side Info */}
				<div className="flex items-start gap-8">
					{/* Joined Date */}
					<div className="text-right">
						<p className="text-xs text-amber-600/60 mb-1">
							{t("superAdmin.companyDetails.joined")}
						</p>
						<p className="text-sm font-medium text-amber-900">
							{company.joined || "12/13/2025"}
						</p>
					</div>

					{/* Last Activity */}
					<div className="text-right">
						<p className="text-xs text-amber-600/60 mb-1">
							{t("superAdmin.companyDetails.lastActivity")}
						</p>
						<p className="text-sm font-medium text-amber-900">
							{company.lastActivity || "12/13/2025"}
						</p>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2">
						<button
							onClick={() => onToggleStatus(company)}
							className="p-2 text-amber-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
							title={
								company.available
									? t("superAdmin.companyDetails.deactivateCompany")
									: t("superAdmin.companyDetails.activateCompany")
							}
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
						</button>
						<button
							onClick={() => onEdit(company)}
							className="p-2 text-amber-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
							title={t("superAdmin.companyDetails.editCompany")}
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
								/>
							</svg>
						</button>
						<button
							onClick={() => onDelete(company)}
							className="p-1.5 sm:p-2 text-amber-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
							title={t("superAdmin.companyDetails.deleteCompany")}
						>
							<svg
								className="w-4 h-4 sm:w-5 sm:h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default function CompaniesList({ companies }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [editingCompany, setEditingCompany] = useState(null);

	const handleEdit = (company) => {
		setEditingCompany(company);
	};

	const handleDelete = (company) => {
		if (
			window.confirm(
				t("superAdmin.companyDetails.deleteConfirm", { name: company.name }),
			)
		) {
			dispatch(removeCompany(company.id));
		}
	};

	const handleToggleStatus = (company) => {
		dispatch(toggleCompanyAvailability(company.id));
	};

	if (companies.length === 0) {
		return (
			<div className="bg-white border border-orange-200/40 rounded-lg sm:rounded-xl p-8 sm:p-10 lg:p-12 text-center">
				<svg
					className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-amber-600/30 mx-auto mb-3 sm:mb-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
					/>
				</svg>
				<p className="text-amber-700/70 text-base sm:text-lg">
					{t("superAdmin.companyManagement.noCompaniesFound")}
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-3 sm:space-y-4">
				{companies.map((company) => (
					<CompanyCard
						key={company.id}
						company={company}
						onEdit={handleEdit}
						onDelete={handleDelete}
						onToggleStatus={handleToggleStatus}
						t={t}
					/>
				))}
			</div>

			{/* Edit Company Modal */}
			{editingCompany && (
				<EditCompanyModal
					isOpen={!!editingCompany}
					onClose={() => setEditingCompany(null)}
					company={editingCompany}
				/>
			)}
		</>
	);
}

