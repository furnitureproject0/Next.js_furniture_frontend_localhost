"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function StaffOverview() {
	const { t } = useTranslation();
	const staff = [
		{
			id: 1,
			name: "Marco Rossi",
			role: "driver",
			status: "active",
			currentMission: "Zürich → Basel",
			rating: 4.8,
			completedMissions: 156,
		},
		{
			id: 2,
			name: "Klaus Mueller",
			role: "driver",
			status: "available",
			currentMission: null,
			rating: 4.9,
			completedMissions: 203,
		},
		{
			id: 3,
			name: "Stefan Weber",
			role: "worker",
			status: "active",
			currentMission: "Geneva Office Move",
			rating: 4.7,
			completedMissions: 89,
		},
		{
			id: 4,
			name: "Thomas Keller",
			role: "worker",
			status: "available",
			currentMission: null,
			rating: 4.6,
			completedMissions: 134,
		},
		{
			id: 5,
			name: "Anna Weber",
			role: "worker",
			status: "off_duty",
			currentMission: null,
			rating: 4.8,
			completedMissions: 98,
		},
	];

	// Calculate total missions
	const totalMissions = staff.reduce(
		(sum, member) => sum + member.completedMissions,
		0,
	);
	const activeStaff = staff.filter(
		(member) => member.status === "active",
	).length;
	const availableStaff = staff.filter(
		(member) => member.status === "available",
	).length;

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800 border-green-200";
			case "available":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "off_duty":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getRoleIcon = (role) => {
		if (role === "driver") {
			return (
				<svg
					className="w-3.5 h-3.5 sm:w-4 sm:h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
					/>
				</svg>
			);
		}
		return (
			<svg
				className="w-3.5 h-3.5 sm:w-4 sm:h-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
				/>
			</svg>
		);
	};

	return (
		<div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-xl">
			{/* Header with Mission Count */}
			<div className="p-4 sm:p-5 lg:p-6 border-b border-orange-100/50">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
					<h2 className="text-lg sm:text-xl font-bold text-amber-900">
						{t("staff.overview.title")}
					</h2>
					<button className="cursor-pointer px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 hover:text-orange-800 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 w-full sm:w-auto">
						{t("staff.overview.manageStaff")}
					</button>
				</div>

				{/* Mission Count Stats */}
				<div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
					<div className="text-center p-2 sm:p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg sm:rounded-xl border border-orange-100">
						<div className="text-xl sm:text-2xl font-bold text-orange-600">
							{totalMissions}
						</div>
						<div className="text-[10px] sm:text-xs text-amber-700 font-medium">
							{t("staff.overview.totalMissions")}
						</div>
					</div>
					<div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl border border-green-100">
						<div className="text-xl sm:text-2xl font-bold text-green-600">
							{activeStaff}
						</div>
						<div className="text-[10px] sm:text-xs text-green-700 font-medium">
							{t("staff.overview.activeNow")}
						</div>
					</div>
					<div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg sm:rounded-xl border border-blue-100">
						<div className="text-xl sm:text-2xl font-bold text-blue-600">
							{availableStaff}
						</div>
						<div className="text-[10px] sm:text-xs text-blue-700 font-medium">
							{t("staff.overview.available")}
						</div>
					</div>
				</div>
			</div>

			<div className="p-4 sm:p-5 lg:p-6">
				<div className="space-y-2 sm:space-y-3">
					{staff.slice(0, 4).map((member) => (
						<div
							key={member.id}
							className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-amber-50/80 transition-all duration-200 border border-transparent hover:border-orange-100/60 hover:shadow-md gap-3 sm:gap-0"
						>
							<div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
								<div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center text-orange-600 shadow-sm flex-shrink-0">
									{getRoleIcon(member.role)}
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-amber-900 text-xs sm:text-sm">
										{member.name}
									</h3>
									<p className="text-[10px] sm:text-xs text-amber-700/70 capitalize font-medium">
										{member.role}
									</p>
									{member.currentMission && (
										<p className="text-[10px] sm:text-xs text-orange-600 font-medium mt-0.5 sm:mt-1">
											📍 {member.currentMission}
										</p>
									)}
								</div>
							</div>

							<div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
								<div className="text-left sm:text-right">
									<div className="flex items-center gap-1">
										<span className="text-base sm:text-lg font-bold text-amber-900">
											{member.completedMissions}
										</span>
										<span className="text-[10px] sm:text-xs text-amber-700/70 font-medium">
											{t("staff.overview.missions")}
										</span>
									</div>
									<div className="flex items-center gap-1 mt-0.5 sm:mt-1">
										<span className="text-yellow-500">
											⭐
										</span>
										<span className="text-[10px] sm:text-xs text-amber-700 font-medium">
											{member.rating}
										</span>
									</div>
								</div>

								<div
									className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border shadow-sm flex-shrink-0 ${getStatusColor(
										member.status,
									)}`}
								>
									{member.status.replace("_", " ")}
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="mt-4 sm:mt-5 lg:mt-6 flex justify-center">
					<button className="cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center gap-2">
						<span>{t("staff.overview.viewAllStaff")}</span>
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17 8l4 4m0 0l-4 4m4-4H3"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}
