"use client";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateUserThunk, deleteUserThunk } from "@/store/slices/usersSlice";
import { useTranslation } from "@/hooks/useTranslation";
import EditUserModal from "./modals/EditUserModal";

const getRoleBadgeColor = (role) => {
	switch (role) {
		case "super_admin":
			return "bg-red-100 text-red-800 border-red-200";
		case "site_admin":
			return "bg-primary-100 text-primary-800 border-primary-200";
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
// ... (rest of the badge colors and UserRow component remain unchanged until handle functions)
const UserRow = ({ user, onEdit, onDelete, t, index }) => {
	const getInitials = (name) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	const roleKey = `superAdmin.roles.${user.role}`;
const roleLabel = t(roleKey);
	const roleText = roleLabel === roleKey ? user.role : roleLabel;

	return (
		<div 
			className="group/user bg-white border border-primary-100 hover:border-primary-400 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slide-in"
			style={{ animationDelay: `${index * 50}ms` }}
		>
			<div className="flex flex-col sm:flex-row items-start justify-between gap-4">
				{/* User Info */}
				<div className="flex items-start gap-4 flex-1 min-w-0">
					<div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover/user:scale-110 group-hover/user:rotate-3 transition-transform duration-500">
						<span className="text-white text-lg font-bold tracking-tighter">
							{getInitials(user.name)}
						</span>
						<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
							<div className={`w-2.5 h-2.5 rounded-full ${user.available || user.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
						</div>
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex flex-wrap items-center gap-2.5 mb-2">
							<h3 className="text-lg font-bold text-slate-800 group-hover/user:text-primary-600 transition-colors">
								{user.name}
							</h3>
							<span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${getRoleBadgeColor(user.role)}`}>
								{roleText}
							</span>
						</div>
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
								<svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
								{user.email}
							</div>
							{user.phone && (
								<div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
									<svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28m1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516" />
									</svg>
									{user.phone}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Right Side Info */}
				<div className="flex flex-col items-end gap-4 w-full sm:w-auto">
					<div className="flex items-center gap-4">
						{user.company && (
							<div className="text-right">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("superAdmin.modals.addUser.company").toUpperCase()}</p>
								<p className="text-sm font-bold text-slate-700">{user.company}</p>
							</div>
						)}
						<div className="text-right border-l border-slate-100 pl-4">
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("common.labels.joined").toUpperCase()}</p>
							<p className="text-sm font-bold text-slate-700">{user.created || "12/13/2025"}</p>
						</div>
					</div>

					<div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 opacity-0 group-hover/user:opacity-100 transition-all duration-300 translate-x-4 group-hover/user:translate-x-0">
						<button
							onClick={() => onEdit(user)}
							className="p-2 text-slate-500 hover:text-primary-600 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
							</svg>
						</button>
						<button
							onClick={() => onDelete(user)}
							className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
			dispatch(deleteUserThunk(user.id));
		}
	};

	if (users.length === 0) {
		return (
			<div className="bg-white border border-primary-200/40 rounded-lg sm:rounded-xl p-8 sm:p-10 lg:p-12 text-center">
				<svg
					className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-primary-600/30 mx-auto mb-3 sm:mb-4"
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
				<p className="text-slate-600/70 text-base sm:text-lg">
					{t("superAdmin.userManagement.noUsersFound")}
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-4">
				{users.map((user, index) => (
					<UserRow 
						key={user.id} 
						user={user} 
						onEdit={handleEdit} 
						onDelete={handleDelete} 
						t={t}
						index={index}
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

