export default function CompanySelector({ 
	companies, 
	selectedCompanyId, 
	onChange, 
	isLoading, 
	error, 
	t 
}) {
	if (isLoading) {
		return (
			<div className="w-full px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
				<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
				Loading companies...
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
				{error}
			</div>
		);
	}

	return (
		<div className="relative">
			<select
				value={selectedCompanyId || ""}
				onChange={(e) => onChange(Number(e.target.value))}
				className="w-full px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none cursor-pointer"
			>
				<option value="">{t("siteAdmin.orderWizard.selectCompany") || "Select a company..."}</option>
				{companies.map(c => (
					<option key={c.id} value={c.id}>
						{c.name} {c.rating ? `(${c.rating}⭐)` : ''}
					</option>
				))}
			</select>
			<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-orange-400">
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</div>
		</div>
	);
}
