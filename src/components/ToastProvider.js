"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import Toast from "./ui/Toast";
import { setToastHandler } from "@/store/middleware/toastMiddleware";

const ToastContext = createContext(null);

export const useToastContext = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToastContext must be used within ToastProvider");
	}
	return context;
};

export default function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);

	const addToast = useCallback((message, type = "info", duration = 4000) => {
		const id = Date.now() + Math.random();
		const newToast = { id, message, type, duration };

		setToasts((prev) => [...prev, newToast]);

		return id;
	}, []);

	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const toast = {
		success: (message, duration) => addToast(message, "success", duration),
		error: (message, duration) => addToast(message, "error", duration),
		warning: (message, duration) => addToast(message, "warning", duration),
		info: (message, duration) => addToast(message, "info", duration),
	};

	// Register toast handler for Redux middleware
	useEffect(() => {
		setToastHandler(toast);
		return () => {
			setToastHandler(null);
		};
	}, [toast]);

	const value = {
		toast,
		toasts,
		removeToast,
	};

	return (
		<ToastContext.Provider value={value}>
			{children}
			{/* Render toasts */}
			<div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
				{toasts.map((toastItem) => (
					<div key={toastItem.id} className="pointer-events-auto">
						<Toast
							message={toastItem.message}
							type={toastItem.type}
							duration={toastItem.duration}
							onClose={() => removeToast(toastItem.id)}
						/>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

