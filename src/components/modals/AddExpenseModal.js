"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const EXPENSE_CATEGORY_KEYS = [
	"operations",
	"maintenance",
	"administration",
	"marketing",
	"hr",
	"legal",
	"facilities",
];

const getExpenseCategories = (t) => EXPENSE_CATEGORY_KEYS.map(key => ({
	value: key,
	label: t(`modals.addExpense.categories.${key}`)
}));

export default function AddExpenseModal({ isOpen, onClose, onSubmit }) {
	const { t } = useTranslation();
	const [expenseForm, setExpenseForm] = useState({
		description: "",
		amount: "",
		category: "",
		orderRef: "",
	});

	const handleSubmit = () => {
		if (expenseForm.description && expenseForm.amount) {
			onSubmit(expenseForm);
			setExpenseForm({
				description: "",
				amount: "",
				category: "",
				orderRef: "",
			});
		}
	};

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4"
			onClick={handleBackdropClick}
		>
			<div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-md">
				<div className="flex items-center justify-between mb-4 sm:mb-6">
					<h3 className="text-lg sm:text-xl font-semibold text-amber-900">
						{t("modals.addExpense.title")}
					</h3>
					<button
						onClick={onClose}
						className="text-amber-700/70 hover:text-amber-900 transition-colors cursor-pointer p-1"
					>
						<svg
							className="w-5 h-5 sm:w-6 sm:h-6"
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

				<div className="space-y-3 sm:space-y-4">
					<div>
						<label className="block text-xs sm:text-sm font-medium text-amber-900 mb-1.5 sm:mb-2">
							{t("modals.addExpense.description")} *
						</label>
						<input
							type="text"
							value={expenseForm.description}
							onChange={(e) =>
								setExpenseForm({
									...expenseForm,
									description: e.target.value,
								})
							}
							placeholder={t("modals.addExpense.descriptionPlaceholder")}
							className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border border-orange-200/60 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
						/>
					</div>

					<div>
						<label className="block text-xs sm:text-sm font-medium text-amber-900 mb-1.5 sm:mb-2">
							{t("modals.addExpense.amount")} *
						</label>
						<input
							type="number"
							value={expenseForm.amount}
							onChange={(e) =>
								setExpenseForm({
									...expenseForm,
									amount: e.target.value,
								})
							}
							placeholder="0.00"
							className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border border-orange-200/60 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
						/>
					</div>

					<div>
						<label className="block text-xs sm:text-sm font-medium text-amber-900 mb-1.5 sm:mb-2">
							{t("modals.addExpense.category")}
						</label>
						<select
							value={expenseForm.category}
							onChange={(e) =>
								setExpenseForm({
									...expenseForm,
									category: e.target.value,
								})
							}
							className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border border-orange-200/60 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
						>
							<option value="">{t("modals.addExpense.selectCategory")}</option>
							{getExpenseCategories(t).map((category) => (
								<option key={category.value} value={category.value}>
									{category.label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-xs sm:text-sm font-medium text-amber-900 mb-1.5 sm:mb-2">
							{t("modals.addExpense.orderReference")}
						</label>
						<input
							type="text"
							value={expenseForm.orderRef}
							onChange={(e) =>
								setExpenseForm({
									...expenseForm,
									orderRef: e.target.value,
								})
							}
							placeholder="#FT-2024-001"
							className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border border-orange-200/60 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80"
						/>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6 sm:mt-8">
					<button
						onClick={onClose}
						className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-amber-700 bg-white/80 border border-orange-200 rounded-lg sm:rounded-xl hover:bg-orange-50 transition-colors cursor-pointer"
					>
						{t("common.buttons.cancel")}
					</button>
					<button
						onClick={handleSubmit}
						disabled={
							!expenseForm.description || !expenseForm.amount
						}
						className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white bg-orange-600 rounded-lg sm:rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						{t("modals.addExpense.addExpense")}
					</button>
				</div>
			</div>
		</div>
	);
}
