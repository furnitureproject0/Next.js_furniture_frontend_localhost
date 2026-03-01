export default function CompanyScopeToggle({ companyScope, onChange, t }) {
	return (
		<div className="flex items-center gap-2">
			<button
				onClick={() => onChange("internal")}
				className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg border-2 transition-all cursor-pointer ${
					companyScope === "internal"
						? "bg-primary-500 border-primary-500 text-white shadow-md"
						: "bg-white border-primary-100 text-slate-600 hover:border-primary-200"
				}`}
			>
				{t("siteAdmin.orderWizard.internalCompanies") || "Internal"}
			</button>
			<button
				onClick={() => onChange("external")}
				className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg border-2 transition-all cursor-pointer ${
					companyScope === "external"
						? "bg-primary-500 border-primary-500 text-white shadow-md"
						: "bg-white border-primary-100 text-slate-600 hover:border-primary-200"
				}`}
			>
				{t("siteAdmin.orderWizard.externalCompanies") || "External"}
			</button>
		</div>
	);
}
