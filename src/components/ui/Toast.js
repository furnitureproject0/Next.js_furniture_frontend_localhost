"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const Toast = ({ message, type = "info", duration = 4000, onClose }) => {
	const { t } = useTranslation();
	const [isVisible, setIsVisible] = useState(true);
	const [isLeaving, setIsLeaving] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLeaving(true);
			setTimeout(() => {
				setIsVisible(false);
				onClose?.();
			}, 300);
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, onClose]);

	if (!isVisible) return null;

	const getToastStyles = () => {
		const baseStyles =
			"max-w-[calc(100vw-2rem)] sm:max-w-sm w-full bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 p-3 sm:p-4 transition-all duration-300 transform";

		if (isLeaving) {
			return `${baseStyles} translate-x-full opacity-0`;
		}

		return `${baseStyles} translate-x-0 opacity-100`;
	};

	const getIconAndColor = () => {
		switch (type) {
			case "success":
				return {
					icon: (
						<svg
							className="w-4 h-4 sm:w-5 sm:h-5 text-green-500"
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
					),
					bgColor: "bg-green-50/80",
					borderColor: "border-green-200/50",
				};
			case "error":
				return {
					icon: (
						<svg
							className="w-4 h-4 sm:w-5 sm:h-5 text-red-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					),
					bgColor: "bg-red-50/80",
					borderColor: "border-red-200/50",
				};
			case "warning":
				return {
					icon: (
						<svg
							className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
					),
					bgColor: "bg-yellow-50/80",
					borderColor: "border-yellow-200/50",
				};
			default:
				return {
					icon: (
						<svg
							className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					),
					bgColor: "bg-blue-50/80",
					borderColor: "border-blue-200/50",
				};
		}
	};

	const { icon, bgColor, borderColor } = getIconAndColor();

	return (
		<div className={getToastStyles()}>
			<div
				className={`absolute inset-0 ${bgColor} ${borderColor} rounded-2xl border`}
			></div>
			<div className="relative flex items-start space-x-2 sm:space-x-3">
				<div className="flex-shrink-0 mt-0.5">{icon}</div>
				<div className="flex-1 min-w-0">
					<p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">
						{message}
					</p>
				</div>
				<button
					onClick={() => {
						setIsLeaving(true);
						setTimeout(() => {
							setIsVisible(false);
							onClose?.();
						}, 300);
					}}
					className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-0.5"
					aria-label={t("common.buttons.close")}
				>
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
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
};

export default Toast;
