"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function Pagination({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	onPageChange,
}) {
	const { t } = useTranslation();
	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);

	return (
		<div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t border-primary-100/50 bg-gradient-to-r from-primary-50/30 to-primary-50/20">
			<div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
				<div className="text-xs sm:text-sm text-slate-600/70 text-center sm:text-left">
					{t("finance.pagination.showing", { start: startItem, end: endItem, total: totalItems })}
				</div>
				<div className="flex items-center gap-1.5 sm:gap-2">
					<button
						onClick={() =>
							onPageChange(Math.max(currentPage - 1, 1))
						}
						disabled={currentPage === 1}
						className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 bg-white/80 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
					>
						<span className="hidden sm:inline">{t("finance.pagination.previous")}</span>
						<span className="sm:hidden">Prev</span>
					</button>

					<div className="flex items-center gap-0.5 sm:gap-1">
						{Array.from(
							{ length: Math.min(5, totalPages) },
							(_, i) => {
								const pageNum = i + 1;
								return (
									<button
										key={pageNum}
										onClick={() => onPageChange(pageNum)}
										className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
											currentPage === pageNum
												? "bg-primary-100 text-primary-700 border border-primary-300"
												: "text-slate-600/70 hover:bg-primary-50/50"
										}`}
									>
										{pageNum}
									</button>
								);
							},
						)}
						{totalPages > 5 && (
							<>
								<span className="text-slate-600/50 px-1">...</span>
								<button
									onClick={() => onPageChange(totalPages)}
									className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
										currentPage === totalPages
											? "bg-primary-100 text-primary-700 border border-primary-300"
											: "text-slate-600/70 hover:bg-primary-50/50"
									}`}
								>
									{totalPages}
								</button>
							</>
						)}
					</div>

					<button
						onClick={() =>
							onPageChange(Math.min(currentPage + 1, totalPages))
						}
						disabled={currentPage === totalPages}
						className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 bg-white/80 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
					>
						<span className="hidden sm:inline">{t("finance.pagination.next")}</span>
						<span className="sm:hidden">Next</span>
					</button>
				</div>
			</div>
		</div>
	);
}
