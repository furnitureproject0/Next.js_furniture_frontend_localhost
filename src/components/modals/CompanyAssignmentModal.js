"use client";

import { useAppSelector } from "@/store/hooks";
import { selectDisplayCompanies } from "@/store/selectors";
import { useTranslation } from "@/hooks/useTranslation";

const CompanyCard = ({ company, onSelect, t }) => (
	<div
		className={`border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-200 cursor-pointer ${
			company.available
				? "border-orange-200/60 hover:border-orange-300 hover:shadow-lg bg-white"
				: "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
		}`}
		onClick={() => company.available && onSelect(company.id)}
	>
		<div className="flex items-center justify-between gap-2 sm:gap-3">
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 flex-wrap">
					<h3 className="text-base sm:text-lg font-semibold text-amber-900 truncate">
						{company.name}
					</h3>
					<div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
						</svg>
						<span className="text-xs sm:text-sm font-medium text-amber-700">
							{company.rating}
						</span>
					</div>
					{!company.available && (
						<span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full whitespace-nowrap">
							{t("modals.companyAssignment.unavailable")}
						</span>
					)}
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-3">
					<div>
						<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-0.5 sm:mb-1">
							{t("modals.companyAssignment.location")}
						</p>
						<p className="text-xs sm:text-sm text-amber-900 font-medium">
							{company.location}
						</p>
					</div>
					<div>
						<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-0.5 sm:mb-1">
							{t("modals.companyAssignment.completedOrders")}
						</p>
						<p className="text-xs sm:text-sm text-amber-900 font-medium">
							{company.completedOrders}
						</p>
					</div>
				</div>

				<div>
					<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1.5 sm:mb-2">
						{t("modals.companyAssignment.specialties")}
					</p>
					<div className="flex flex-wrap gap-1.5 sm:gap-2">
						{company.specialties.map((specialty, index) => (
							<span
								key={index}
								className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full"
							>
								{specialty}
							</span>
						))}
					</div>
				</div>
			</div>

			{company.available && (
				<div className="ml-2 sm:ml-4 flex-shrink-0">
					<div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
						<svg
							className="w-3 h-3 sm:w-4 sm:h-4 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</div>
				</div>
			)}
		</div>
	</div>
);

export default function CompanyAssignmentModal({
	isOpen,
	onClose,
	order,
	onSubmit,
}) {
	const { t } = useTranslation();
	const companies = useAppSelector(selectDisplayCompanies);

	const handleCompanySelect = (companyId) => {
		const company = companies.find((c) => c.id === companyId);
		onSubmit(companyId, company?.name || "Unknown Company");
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] flex flex-col">
				{/* Header */}
				<div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 border-b border-orange-100/50">
					<div className="flex items-center justify-between gap-3">
						<div className="flex-1 min-w-0">
							<h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent truncate">
								{t("modals.companyAssignment.assignCompany")}
							</h2>
							<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1 truncate">
								{t("modals.companyAssignment.selectCompany", { id: order?.id })}
							</p>
						</div>
						<button
							onClick={onClose}
							className="p-1.5 sm:p-2 text-amber-600/60 hover:text-amber-700 hover:bg-orange-50/60 rounded-lg transition-colors flex-shrink-0"
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
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto">
					<div className="space-y-3 sm:space-y-4">
						{companies.map((company) => (
							<CompanyCard
								key={company.id}
								company={company}
								onSelect={handleCompanySelect}
								t={t}
							/>
						))}
					</div>
				</div>

				{/* Footer */}
				<div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 border-t border-orange-100/50 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
					<div className="flex justify-end">
						<button
							onClick={onClose}
							className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 border border-orange-200/60 rounded-lg hover:bg-white/80 transition-colors font-medium cursor-pointer"
						>
							{t("common.buttons.cancel")}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
