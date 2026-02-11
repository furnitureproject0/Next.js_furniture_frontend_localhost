"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function LoadingSpinner({ message }) {
	const { t } = useTranslation();
	const displayMessage = message || t("common.labels.loading");

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
				<p className="mt-4 text-gray-600">{displayMessage}</p>
			</div>
		</div>
	);
}
