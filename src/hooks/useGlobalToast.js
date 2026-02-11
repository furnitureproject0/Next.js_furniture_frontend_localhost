"use client";

import { useToastContext } from "@/components/ToastProvider";

/**
 * Hook to access global toast functionality
 * Use this hook in any component to show toast notifications
 * 
 * @returns {Object} Toast functions (success, error, warning, info)
 * 
 * @example
 * const { toast } = useGlobalToast();
 * toast.success("Operation completed!");
 * toast.error("Something went wrong!");
 */
export const useGlobalToast = () => {
	const { toast } = useToastContext();
	return { toast };
};

