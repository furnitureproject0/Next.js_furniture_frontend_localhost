"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const EmployeeCard = ({ employee, isSelected, onToggle, t }) => (
	<div
		className={`border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-200 cursor-pointer ${
			employee.available
				? isSelected
					? "border-orange-400 bg-orange-50/60 shadow-md"
					: "border-orange-200/60 hover:border-orange-300 hover:shadow-lg bg-white"
				: "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
		}`}
		onClick={() => employee.available && onToggle(employee)}
	>
		<div className="flex items-center justify-between gap-2 sm:gap-3">
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
					<div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
						<span className="text-orange-600 font-bold text-xs sm:text-sm">
							{employee.name
								.split(" ")
								.map((n) => n[0])
								.join("")}
						</span>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-base sm:text-lg font-semibold text-amber-900 truncate">
							{employee.name}
						</h3>
						<div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mt-0.5">
							<span
								className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${
									employee.role === "Driver"
										? "bg-blue-100 text-blue-800"
										: "bg-green-100 text-green-800"
								}`}
							>
								{employee.role === "Driver" ? t("modals.teamAssignment.driver") : t("modals.teamAssignment.mover")}
							</span>
							<div className="flex items-center gap-0.5 sm:gap-1">
								<svg
									className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
								<span className="text-xs text-amber-700">
									{employee.rating}
								</span>
							</div>
							{!employee.available && (
								<span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full whitespace-nowrap">
									{t("modals.teamAssignment.unavailable")}
								</span>
							)}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-3">
					<div>
						<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1">
							{t("modals.teamAssignment.experience")}
						</p>
						<p className="text-sm text-amber-900 font-medium">
							{employee.experience}
						</p>
					</div>
					<div>
						<p className="text-xs font-medium text-amber-600/70 uppercase tracking-wide mb-1">
							{t("modals.teamAssignment.specialties")}
						</p>
						<div className="flex flex-wrap gap-1">
							{employee.specialties
								.slice(0, 2)
								.map((specialty, index) => (
									<span
										key={index}
										className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full"
									>
										{specialty}
									</span>
								))}
						</div>
					</div>
				</div>
			</div>

			{employee.available && (
				<div className="ml-2 sm:ml-4 flex-shrink-0">
					<div
						className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
							isSelected
								? "bg-orange-500 border-orange-500"
								: "border-orange-300 hover:border-orange-400"
						}`}
					>
						{isSelected && (
							<svg
								className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={3}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						)}
					</div>
				</div>
			)}
		</div>
	</div>
);

const TeamRequirements = ({ hasDriver, hasWorkers, t }) => (
	<div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3 sm:p-4 border border-orange-200/60 mb-4 sm:mb-6">
		<h3 className="text-sm sm:text-base font-semibold text-amber-900 mb-1.5 sm:mb-2">{t("modals.teamAssignment.teamRequirements")}</h3>
		<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
			<div
				className={`flex items-center gap-2 ${
					hasDriver ? "text-green-600" : "text-amber-700/70"
				}`}
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
						d={
							hasDriver
								? "M5 13l4 4L19 7"
								: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						}
					/>
				</svg>
				<span>{t("modals.teamAssignment.oneDriver")} {hasDriver ? "✓" : `(${t("modals.teamAssignment.required")})`}</span>
			</div>
			<div
				className={`flex items-center gap-2 ${
					hasWorkers ? "text-green-600" : "text-amber-700/70"
				}`}
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
						d={
							hasWorkers
								? "M5 13l4 4L19 7"
								: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						}
					/>
				</svg>
				<span>{t("modals.teamAssignment.onePlusMovers")} {hasWorkers ? "✓" : `(${t("modals.teamAssignment.required")})`}</span>
			</div>
		</div>
	</div>
);

const LeaderSelection = ({ selectedEmployees, teamLeaderId, onSelectLeader, t }) => {
	if (selectedEmployees.length === 0) return null;

	return (
		<div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-purple-200/60 mb-4 sm:mb-6">
			<div className="flex items-center gap-2 mb-2 sm:mb-3">
				<svg
					className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
					/>
				</svg>
				<h3 className="text-sm sm:text-base font-semibold text-purple-900">
					{t("modals.teamAssignment.selectTeamLeader")}
				</h3>
			</div>
			<p className="text-xs sm:text-sm text-purple-700/70 mb-2 sm:mb-3">
				{t("modals.teamAssignment.selectTeamLeaderDesc")}
			</p>
			<div className="space-y-1.5 sm:space-y-2">
				<label className="flex items-center p-2 sm:p-3 bg-white/60 rounded-lg border border-purple-200/40 cursor-pointer hover:bg-white transition-colors">
					<input
						type="radio"
						name="teamLeader"
						value=""
						checked={teamLeaderId === null}
						onChange={() => onSelectLeader(null)}
						className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 border-purple-300 focus:ring-purple-500 flex-shrink-0"
					/>
					<span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-amber-800">
						{t("modals.teamAssignment.noLeaderAssigned")}
					</span>
				</label>
				{selectedEmployees.map((employee) => (
					<label
						key={employee.id}
						className={`flex items-center p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
							teamLeaderId === employee.id
								? "bg-purple-100 border-purple-400 shadow-sm"
								: "bg-white/60 border-purple-200/40 hover:bg-white"
						}`}
					>
						<input
							type="radio"
							name="teamLeader"
							value={employee.id}
							checked={teamLeaderId === employee.id}
							onChange={() => onSelectLeader(employee.id)}
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 border-purple-300 focus:ring-purple-500 flex-shrink-0"
						/>
						<div className="ml-2 sm:ml-3 flex-1 flex items-center justify-between gap-2 min-w-0">
							<div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
								<span className="font-medium text-amber-900 text-xs sm:text-sm truncate">
									{employee.name}
								</span>
								<span
									className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
										employee.role === "Driver"
											? "bg-blue-100 text-blue-800"
											: "bg-green-100 text-green-800"
									}`}
								>
									{employee.role === "Driver" ? t("modals.teamAssignment.driver") : t("modals.teamAssignment.mover")}
								</span>
							</div>
							{teamLeaderId === employee.id && (
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
									/>
								</svg>
							)}
						</div>
					</label>
				))}
			</div>
		</div>
	);
};

export default function TeamAssignmentModal({
	isOpen,
	onClose,
	order,
	employees,
	onSubmit,
}) {
	const { t } = useTranslation();
	const [selectedEmployees, setSelectedEmployees] = useState([]);
	const [teamLeaderId, setTeamLeaderId] = useState(null);

	const handleEmployeeToggle = (employee) => {
		setSelectedEmployees((prev) => {
			const isSelected = prev.find((emp) => emp.id === employee.id);
			if (isSelected) {
				// If removing the team leader, reset leader selection
				if (employee.id === teamLeaderId) {
					setTeamLeaderId(null);
				}
				return prev.filter((emp) => emp.id !== employee.id);
			} else {
				return [...prev, employee];
			}
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (selectedEmployees.length === 0) return;
		
		// Find the team leader from selected employees
		const leader = selectedEmployees.find((emp) => emp.id === teamLeaderId);
		
		onSubmit({
			employees: selectedEmployees,
			teamLeader: leader || null,
		});
	};

	const hasDriver = selectedEmployees.some((emp) => emp.role === "Driver");
	const hasWorkers = selectedEmployees.some((emp) => emp.role === "Mover");

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
								{t("modals.teamAssignment.assignTeam")}
							</h2>
							<p className="text-xs sm:text-sm text-amber-700/70 mt-0.5 sm:mt-1 truncate">
								{t("modals.teamAssignment.orderInfo", { id: order?.id, client: order?.client })}
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
						<TeamRequirements
							hasDriver={hasDriver}
							hasWorkers={hasWorkers}
							t={t}
						/>

						{/* Employee List */}
						<div className="space-y-2 sm:space-y-3">
							{employees.map((employee) => {
								const isSelected = selectedEmployees.find(
									(emp) => emp.id === employee.id,
								);
								return (
									<EmployeeCard
										key={employee.id}
										employee={employee}
										isSelected={isSelected}
										onToggle={handleEmployeeToggle}
										t={t}
									/>
								);
							})}
						</div>

						{/* Leader Selection */}
						<LeaderSelection
							selectedEmployees={selectedEmployees}
							teamLeaderId={teamLeaderId}
							onSelectLeader={setTeamLeaderId}
							t={t}
						/>
					</div>
				</div>

				{/* Footer */}
				<div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 border-t border-orange-100/50 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
					<div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
						<div className="text-xs sm:text-sm text-amber-700/70 text-center sm:text-left">
							{t("modals.teamAssignment.selected", { count: selectedEmployees.length })}
						</div>
						<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
							<button
								onClick={onClose}
								className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm text-amber-700 hover:text-amber-900 border border-orange-200/60 rounded-lg hover:bg-white/80 transition-colors font-medium"
							>
								{t("common.buttons.cancel")}
							</button>
							<button
								onClick={handleSubmit}
								disabled={!hasDriver || !hasWorkers}
								className={`w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
									hasDriver && hasWorkers
										? "btn-primary text-white cursor-pointer hover:shadow-lg"
										: "bg-gray-300 text-gray-500 cursor-not-allowed"
								}`}
							>
								{t("modals.teamAssignment.assignTeam")}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
