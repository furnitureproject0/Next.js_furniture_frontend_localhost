"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectUser, selectDisplayUsers } from "@/store/selectors";
import { fetchAllUsers } from "@/store/slices/usersSlice";
import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalToast } from "@/hooks/useGlobalToast";

export default function CompanyAdminUsersPage() {
	const { t } = useTranslation();
	const { toast } = useGlobalToast();
	const dispatch = useAppDispatch();
	const user = useAppSelector(selectUser);
	const users = useAppSelector(selectDisplayUsers);

	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRole, setSelectedRole] = useState("all");

	// Fetch all users on mount
	useEffect(() => {
		setIsLoading(true);
		const timeoutId = setTimeout(() => {
			setIsLoading(false);
		}, 10000); // 10 second timeout
		
		dispatch(fetchAllUsers())
			.then((result) => {
				setIsLoading(false);
				clearTimeout(timeoutId);
			})
			.catch((error) => {
				console.log("[Users Page] fetchAllUsers rejected:", error);
				setIsLoading(false);
				clearTimeout(timeoutId);
			});
		
		return () => clearTimeout(timeoutId);
	}, [dispatch]);

	// Filter users based on search term and role
	const filteredUsers = users.filter((userItem) => {
		const matchesSearch = 
			userItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			userItem.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			userItem.company?.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesRole = selectedRole === "all" || userItem.role === selectedRole;
		
		return matchesSearch && matchesRole;
	});

	if (isLoading && users?.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 border-b-2 border-primary-500"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
								All Users
							</h1>
							<p className="text-gray-600 mt-1">
								View all users in the system
							</p>
						</div>
					</div>
				</div>

				{/* Search and Filter Bar */}
				<div className="mb-6">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<input
								type="text"
								placeholder="Search by name, role, or company..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
							/>
						</div>
						<div className="sm:w-48">
							<select
								value={selectedRole}
								onChange={(e) => setSelectedRole(e.target.value)}
								className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
							>
								<option value="all">All Roles</option>
								<option value="client">Client</option>
								<option value="driver">Driver</option>
								<option value="worker">Worker</option>
								<option value="company_secretary">Company Secretary</option>
							</select>
						</div>
					</div>
				</div>

				{/* Users List */}
				<div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
					{filteredUsers.length === 0 ? (
						<div className="p-8 text-center">
							<svg
								className="w-16 h-16 text-gray-400 mx-auto mb-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a3 3 0 003-3v-2a3 3 0 00-3-3H3a3 3 0 00-3 3v2a3 3 0 003 3h3z"
								/>
							</svg>
							<h3 className="text-lg font-semibold text-gray-900 mb-1">
								No users found
							</h3>
							<p className="text-gray-600 mb-4">
								Try adjusting your search criteria
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 border-b border-gray-200">
									<tr>
										<th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Name
										</th>
										<th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Role
										</th>
										<th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Company
										</th>
										<th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Date Added
										</th>
										<th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{filteredUsers.map((userItem) => (
										<tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
											<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
														<span className="text-sm font-semibold text-primary-700">
															{userItem.name?.charAt(0).toUpperCase() || 'U'}
														</span>
													</div>
													<div className="text-sm font-medium text-gray-900">
														{userItem.name || "Unknown"}
													</div>
												</div>
											</td>
											<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
													userItem.role === 'driver' ? 'bg-purple-100 text-purple-800' :
													userItem.role === 'worker' ? 'bg-green-100 text-green-800' :
													userItem.role === 'company_secretary' ? 'bg-yellow-100 text-yellow-800' :
													userItem.role === 'client' ? 'bg-blue-100 text-blue-800' :
													'bg-gray-100 text-gray-800'
												}`}>
													{userItem.role ? 
														userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1).replace('_', ' ') : 
														'Unknown'
													}
												</span>
											</td>
											<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
												<span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
													{userItem.company || "No Company"}
												</span>
											</td>
											<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
												{userItem.created ? new Date(userItem.created).toLocaleDateString() : "-"}
											</td>
											<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
												<span className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 rounded-lg">
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
															d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
														/>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
														/>
													</svg>
													{t("common.buttons.view") || "View"}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Stats */}
				{filteredUsers.length > 0 && (
					<div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
						<div className="bg-white rounded-lg p-4 sm:p-6 text-center">
							<div className="text-2xl sm:text-3xl font-bold text-primary-600">
								{filteredUsers.length}
							</div>
							<div className="text-xs sm:text-sm text-gray-600 mt-1">
								Total Users
							</div>
						</div>
						<div className="bg-white rounded-lg p-4 sm:p-6 text-center">
							<div className="text-2xl sm:text-3xl font-bold text-green-600">
								{filteredUsers.filter((u) => u.company).length}
							</div>
							<div className="text-xs sm:text-sm text-gray-600 mt-1">
								With Company
							</div>
						</div>
						<div className="bg-white rounded-lg p-4 sm:p-6 text-center">
							<div className="text-2xl sm:text-3xl font-bold text-blue-600">
								{filteredUsers.filter((u) => !u.company).length}
							</div>
							<div className="text-xs sm:text-sm text-gray-600 mt-1">
								Without Company
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
