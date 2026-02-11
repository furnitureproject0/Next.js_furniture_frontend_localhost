"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function VehicleStatus() {
	const { t } = useTranslation();
	const vehicles = [
		{
			id: "VH-001",
			type: "Large Truck",
			driver: "Marco Rossi",
			status: "in_transit",
			location: "Zürich → Basel",
			capacity: "12 tons",
			nextMaintenance: "2024-02-15",
		},
		{
			id: "VH-002",
			type: "Medium Van",
			driver: null,
			status: "available",
			location: "Depot - Bern",
			capacity: "3.5 tons",
			nextMaintenance: "2024-01-28",
		},
		{
			id: "VH-003",
			type: "Small Van",
			driver: "Klaus Mueller",
			status: "maintenance",
			location: "Service Center",
			capacity: "1.5 tons",
			nextMaintenance: "2024-01-20",
		},
		{
			id: "VH-004",
			type: "Large Truck",
			driver: null,
			status: "available",
			location: "Depot - Geneva",
			capacity: "12 tons",
			nextMaintenance: "2024-02-10",
		},
	];

	const getStatusColor = (status) => {
		switch (status) {
			case "in_transit":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "available":
				return "bg-green-100 text-green-800 border-green-200";
			case "maintenance":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "out_of_service":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "in_transit":
				return (
					<svg
						className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
				);
			case "available":
				return (
					<svg
						className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				);
			case "maintenance":
				return (
					<svg
						className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
				);
			default:
				return null;
		}
	};

	const getVehicleIcon = (type) => {
		if (type.includes("Truck")) {
			return (
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
						d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
					/>
				</svg>
			);
		}
		return (
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
					d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
				/>
			</svg>
		);
	};

	return (
		<div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/60 shadow-lg">
			<div className="p-4 sm:p-5 lg:p-6 border-b border-orange-100/50">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
					<h2 className="text-base sm:text-lg font-semibold text-amber-900">
						{t("vehicles.fleet")}
					</h2>
					<button className="text-orange-600 hover:text-orange-700 text-xs sm:text-sm font-medium transition-colors">
						{t("vehicles.fleetManagement")}
					</button>
				</div>
			</div>

			<div className="p-4 sm:p-5 lg:p-6">
				<div className="space-y-3 sm:space-y-4">
					{vehicles.map((vehicle) => (
						<div
							key={vehicle.id}
							className="border border-orange-200/60 rounded-lg p-3 sm:p-4 hover:shadow-lg transition-all duration-200 bg-white/60 backdrop-blur-sm"
						>
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
								<div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
									<div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100/60 rounded-lg flex items-center justify-center text-orange-600 flex-shrink-0">
										{getVehicleIcon(vehicle.type)}
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="text-sm sm:text-base font-medium text-amber-900">
											{vehicle.id}
										</h3>
										<p className="text-xs sm:text-sm text-amber-700/70">
											{vehicle.type}
										</p>
									</div>
								</div>
								<div
									className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium border flex-shrink-0 ${getStatusColor(
										vehicle.status,
									)}`}
								>
									{getStatusIcon(vehicle.status)}
									{vehicle.status.replace("_", " ")}
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
								<div>
									<p className="text-amber-700/70">{t("vehicles.driver")}:</p>
									<p className="font-medium text-amber-900">
										{vehicle.driver || t("vehicles.unassigned")}
									</p>
								</div>
								<div>
									<p className="text-amber-700/70">
										{t("vehicles.capacity")}:
									</p>
									<p className="font-medium text-amber-900">
										{vehicle.capacity}
									</p>
								</div>
								<div>
									<p className="text-amber-700/70">
										{t("vehicles.location")}:
									</p>
									<p className="font-medium text-amber-900">
										{vehicle.location}
									</p>
								</div>
								<div>
									<p className="text-amber-700/70">
										{t("vehicles.nextService")}:
									</p>
									<p className="font-medium text-amber-900">
										{vehicle.nextMaintenance}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="mt-4 sm:mt-5 lg:mt-6 flex justify-center">
					<button className="px-3 sm:px-4 py-1.5 sm:py-2 text-orange-600 hover:text-orange-700 text-xs sm:text-sm font-medium transition-colors">
						{t("vehicles.viewAllVehicles")} →
					</button>
				</div>
			</div>
		</div>
	);
}
