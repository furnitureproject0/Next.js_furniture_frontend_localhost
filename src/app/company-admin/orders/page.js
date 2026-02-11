"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function OrdersPage() {
	const { t } = useTranslation();
	return (
		<div className="min-h-screen" style={{ background: "#FFF8F3" }}>
			<div className="p-4 sm:p-6 lg:p-8">
				{/* Page Header */}
				<div className="mb-4 sm:mb-6 lg:mb-8">
					<h1 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">
						{t("companyAdmin.orders.title")}
					</h1>
					<p className="text-sm sm:text-base text-amber-700/70">
						{t("companyAdmin.orders.subtitle")}
					</p>
				</div>
			</div>
		</div>
	);
}
