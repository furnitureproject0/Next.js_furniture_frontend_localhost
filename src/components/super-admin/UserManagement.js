"use client";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectAllUsers } from "@/store/selectors";
import { fetchAllUsers } from "@/store/slices/usersSlice";
import { useTranslation } from "@/hooks/useTranslation";
import UsersList from "./UsersList";
import UserFilters from "./UserFilters";
import AddUserModal from "./modals/AddUserModal";

export default function UserManagement() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const allUsers = useAppSelector(selectAllUsers);
	const isLoading = useAppSelector((state) => state.users.isLoading);
	const error = useAppSelector((state) => state.users.error);
	
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			dispatch(fetchAllUsers({ 
				search: searchQuery || undefined,
				role: roleFilter !== "all" ? roleFilter : undefined
			}));
		}, 500);

		return () => clearTimeout(delayDebounceFn);
	}, [dispatch, searchQuery, roleFilter]);

	// Filter users based on search and role filter - keeping for frontend polish if needed, 
	// but the primary data now comes from the API filtered
	const filteredUsers = allUsers;

	return (
		<div className="p-4 sm:p-6 lg:p-8">
			{/* Header Section */}
			<div className="mb-4 sm:mb-5 lg:mb-6">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
					<div className="flex-1 min-w-0">
						<h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-0.5 sm:mb-1">
							{t("superAdmin.userManagement.title")}
						</h2>
						<p className="text-xs sm:text-sm text-slate-600/70">
							{t("superAdmin.userManagement.subtitle")}
						</p>
					</div>
					<button
						onClick={() => setIsAddUserModalOpen(true)}
						className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2.5 text-xs sm:text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
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
								d="M12 4v16m8-8H4"
							/>
						</svg>
						{t("superAdmin.userManagement.addUser")}
					</button>
				</div>

				{/* Search and Filters */}
				<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
					<div className="flex-1 relative">
						<svg
							className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-primary-600/50"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<input
							type="text"
							placeholder={t("superAdmin.userManagement.searchPlaceholder")}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm bg-white border border-primary-200/60 rounded-lg sm:rounded-xl text-slate-800 placeholder-primary-600/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-300"
						/>
					</div>
					<UserFilters
						roleFilter={roleFilter}
						setRoleFilter={setRoleFilter}
					/>
				</div>
			</div>

			{/* Loading/Error State */}
			{(isLoading && allUsers.length === 0) ? (
				<div className="flex items-center justify-center py-20">
					<div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
				</div>
			) : error ? (
				<div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center">
					{error}
				</div>
			) : (
				<>
					{/* Users Count */}
					<div className="mb-3 sm:mb-4">
						<h3 className="text-base sm:text-lg font-semibold text-slate-800">
							{t("superAdmin.userManagement.usersCount", { filtered: filteredUsers.length, total: allUsers.length })}
						</h3>
					</div>

					{/* Users List */}
					<UsersList users={filteredUsers} />
				</>
			)}

			{/* Add User Modal */}
			<AddUserModal
				isOpen={isAddUserModalOpen}
				onClose={() => setIsAddUserModalOpen(false)}
			/>
		</div>
	);
}

