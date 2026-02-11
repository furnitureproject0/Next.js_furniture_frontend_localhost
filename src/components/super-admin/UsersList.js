"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateUser, deleteUser } from "@/store/slices/usersSlice";
import { useTranslation } from "@/hooks/useTranslation";
import EditUserModal from "./modals/EditUserModal";

const getRoleBadgeColor = (role) => {
	switch (role) {
		case "super_admin":
			return "bg-red-100 text-red-800 border-red-200";
		case "site_admin":
			return "bg-orange-100 text-orange-800 border-orange-200";
		case "company_admin":
			return "bg-purple-100 text-purple-800 border-purple-200";
			case "client":
		case "customer":
			return "bg-blue-100 text-blue-800 border-blue-200";
		case "driver":
			return "bg-green-100 text-green-800 border-green-200";
		case "worker":
			return "bg-indigo-100 text-indigo-800 border-indigo-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
};

const getStatusBadgeColor = (status) => {
	switch (status) {
		case "active":
			return "bg-green-100 text-green-800 border-green-200";
		case "available":
			return "bg-green-100 text-green-800 border-green-200";
		case "inactive":
			return "bg-gray-100 text-gray-800 border-gray-200";
		default:
			return "bg-blue-100 text-blue-800 border-blue-200";
	}
};

const UserRow = ({ user, onEdit, onDelete, t }) => {
	const getInitials = (name) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	return (
		<div className="bg-white border border-orange-200/40 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow">
			<div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
				{/* User Info */}
				<div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
					<div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
						<span className="text-white text-xs sm:text-sm font-semibold">
							{getInitials(user.name)}
						</span>
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
							<h3 className="text-sm sm:text-base font-semibold text-amber-900 truncate">
								{user.name}
							</h3>
							<span
								className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full border ${getRoleBadgeColor(
									user.role,
								)}`}
							>
								{t(`superAdmin.roles.${user.role}`) || user.role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
							</span>
							<span
								className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full border ${getStatusBadgeColor(
									user.status,
								)}`}
							>
								{t(`superAdmin.status.${user.status}`) || user.status.charAt(0).toUpperCase() + user.status.slice(1)}
							</span>
						</div>
						<div className="space-y-0.5 sm:space-y-1">
							<div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-amber-700/70 truncate">
								<svg
									className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
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
								<span className="truncate">{user.email}</span>
							</div>
							{user.phone && (
								<div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-amber-700/70 truncate">
									<svg
										className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
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
									<span className="truncate">{user.phone}</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Right Side Info */}
				<div className="flex flex-wrap sm:flex-nowrap items-start gap-4 sm:gap-6 lg:gap-8 w-full sm:w-auto justify-between sm:justify-end">
					{/* Company */}
					{user.company && (
						<div className="text-left sm:text-right">
							<p className="text-[10px] sm:text-xs text-amber-600/60 mb-0.5 sm:mb-1">
								{t("superAdmin.userManagement.company")}
							</p>
							<p className="text-xs sm:text-sm font-medium text-amber-900 truncate">
								{user.company}
							</p>
						</div>
					)}

					{/* Created Date */}
					<div className="text-left sm:text-right">
						<p className="text-[10px] sm:text-xs text-amber-600/60 mb-0.5 sm:mb-1">
							{t("superAdmin.userManagement.created")}
						</p>
						<p className="text-xs sm:text-sm font-medium text-amber-900">
							{user.created || "12/13/2025"}
						</p>
					</div>

					{/* Last Login */}
					<div className="text-left sm:text-right">
						<p className="text-[10px] sm:text-xs text-amber-600/60 mb-0.5 sm:mb-1">
							{t("superAdmin.userManagement.lastLogin")}
						</p>
						<p className="text-xs sm:text-sm font-medium text-amber-900">
							{user.lastLogin || t("superAdmin.userManagement.never")}
						</p>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-1.5 sm:gap-2">
						<button
							onClick={() => onEdit(user)}
							className="p-1.5 sm:p-2 text-amber-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
							title={t("superAdmin.userManagement.editUser")}
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
									d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
								/>
							</svg>
						</button>
						<button
							onClick={() => onDelete(user)}
							className="p-1.5 sm:p-2 text-amber-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
							title={t("superAdmin.userManagement.deleteUser")}
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
									d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default function UsersList({ users }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [editingUser, setEditingUser] = useState(null);

	const handleEdit = (user) => {
		setEditingUser(user);
	};

	const handleDelete = (user) => {
		if (
			window.confirm(
				t("superAdmin.userManagement.deleteConfirm", { name: user.name }),
			)
		) {
			dispatch(deleteUser(user.id));
		}
	};

	if (users.length === 0) {
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
						d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
				<p className="text-amber-700/70 text-base sm:text-lg">
					{t("superAdmin.userManagement.noUsersFound")}
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-3 sm:space-y-4">
				{users.map((user) => (
					<UserRow
						key={user.id}
						user={user}
						onEdit={handleEdit}
						onDelete={handleDelete}
						t={t}
					/>
				))}
			</div>

			{/* Edit User Modal */}
			{editingUser && (
				<EditUserModal
					isOpen={!!editingUser}
					onClose={() => setEditingUser(null)}
					user={editingUser}
				/>
			)}
		</>
	);
}

