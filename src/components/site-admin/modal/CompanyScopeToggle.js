export default function CompanyScopeToggle({ companyScope, onChange, t }) {
	return (
		<div className="flex items-center gap-2">
			<button
				onClick={() => onChange("internal")}
				className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg border-2 transition-all cursor-pointer ${
					companyScope === "internal"
						? "bg-orange-500 border-orange-500 text-white shadow-md"
						: "bg-white border-orange-100 text-amber-700 hover:border-orange-200"
				}`}
			>
				{t("siteAdmin.orderWizard.internalCompanies") || "Internal"}
			</button>
			<button
				onClick={() => onChange("external")}
				className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg border-2 transition-all cursor-pointer ${
					companyScope === "external"
						? "bg-orange-500 border-orange-500 text-white shadow-md"
						: "bg-white border-orange-100 text-amber-700 hover:border-orange-200"
				}`}
			>
				{t("siteAdmin.orderWizard.externalCompanies") || "External"}
			</button>
		</div>
	);
}
