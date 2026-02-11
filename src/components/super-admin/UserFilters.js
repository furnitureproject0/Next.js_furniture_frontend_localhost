"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function UserFilters({ roleFilter, setRoleFilter }) {
	const { t } = useTranslation();
	const roles = [
		{ value: "all", label: t("superAdmin.filters.allRoles") },
		{ value: "super_admin", label: t("superAdmin.roles.super_admin") },
		{ value: "site_admin", label: t("superAdmin.roles.site_admin") },
		{ value: "company_admin", label: t("superAdmin.roles.company_admin") },
		{ value: "client", label: t("superAdmin.roles.customer") },
		{ value: "driver", label: t("superAdmin.roles.driver") },
		{ value: "worker", label: t("superAdmin.roles.worker") },
	];

	return (
		<div className="relative">
			<select
				value={roleFilter}
				onChange={(e) => setRoleFilter(e.target.value)}
				className="appearance-none px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 bg-white border border-orange-200/60 rounded-lg sm:rounded-xl text-sm sm:text-base text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 cursor-pointer w-full sm:w-auto min-w-[140px] sm:min-w-[180px]"
			>
				{roles.map((role) => (
					<option key={role.value} value={role.value}>
						{role.label}
					</option>
				))}
			</select>
			<svg
				className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-amber-600/50 pointer-events-none"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M19 9l-7 7-7-7"
				/>
			</svg>
		</div>
	);
}

