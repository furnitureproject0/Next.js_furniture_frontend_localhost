"use client";

import { useTranslation } from "@/hooks/useTranslation";

const LoadingSpinner = ({ size = "md", className = "" }) => {
	const { t } = useTranslation();
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-6 h-6",
		lg: "w-8 h-8",
	};

	return (
		<div className={`${sizeClasses[size]} ${className}`}>
			<div className="animate-spin rounded-full border-2 border-current border-t-transparent">
				<span className="sr-only">{t("common.labels.loading")}</span>
			</div>
		</div>
	);
};

export default LoadingSpinner;
