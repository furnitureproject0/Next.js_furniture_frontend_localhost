"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import AssignmentCard from "./AssignmentCard";
import AssignmentDetailModal from "./AssignmentDetailModal";

export default function AssignmentsList({ assignments, onStatusChange, role = "worker", openOrderId = null, onOrderModalClose }) {
	const { t } = useTranslation();
	const [selectedAssignment, setSelectedAssignment] = useState(null);
	
	// Open assignment modal if openOrderId matches any assignment's order
	useEffect(() => {
		if (openOrderId && assignments.length > 0) {
			const assignment = assignments.find(a => {
				const order = a.offer?.orderService?.order;
				return order && order.id === openOrderId;
			});
			if (assignment) {
				setSelectedAssignment(assignment);
			} else {
				// Clear selected assignment if openOrderId doesn't match any assignment
				setSelectedAssignment(null);
			}
		} else if (!openOrderId) {
			// Clear selected assignment if openOrderId is cleared
			setSelectedAssignment(null);
		}
	}, [openOrderId, assignments]);
	
	// Handle modal close
	const handleModalClose = () => {
		setSelectedAssignment(null);
		if (onOrderModalClose) {
			onOrderModalClose();
		}
	};

	// Use cream/orange theme to match project theme
	const themeColors = {
		primaryBorder: "border-orange-200/40",
		primaryText: "text-amber-900",
		secondaryText: "text-amber-700/70",
	};

	if (!assignments || assignments.length === 0) {
		return (
			<div className={`bg-white border ${themeColors.primaryBorder} rounded-xl p-8 sm:p-12 text-center`}>
				<div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
					<svg
						className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>
				<h3 className={`text-lg sm:text-xl font-semibold ${themeColors.primaryText} mb-1 sm:mb-2`}>
					{t("employee.assignments.noAssignments") || "No assignments yet"}
				</h3>
				<p className={`text-sm sm:text-base ${themeColors.secondaryText}`}>
					{t("employee.assignments.noAssignmentsDescription") || "You haven't been assigned any jobs yet. New assignments will appear here."}
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
				{assignments.map((assignment) => (
					<AssignmentCard
						key={assignment.id}
						assignment={assignment}
						onStatusChange={onStatusChange}
						onViewDetails={setSelectedAssignment}
						role={role}
					/>
				))}
			</div>

			{/* Assignment Detail Modal */}
			{selectedAssignment && (
				<AssignmentDetailModal
					isOpen={!!selectedAssignment}
					onClose={handleModalClose}
					assignment={selectedAssignment}
					role={role}
					onStatusChange={onStatusChange}
				/>
			)}
		</>
	);
}

