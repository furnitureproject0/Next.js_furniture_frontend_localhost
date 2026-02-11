"use client";

import { useState, useEffect, useCallback } from "react";
import { employeeApi } from "@/lib/api";

export function useEmployments(page = 1, limit = 10) {
	const [employments, setEmployments] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		total: 0,
		page: 1,
		limit: 10,
		totalPages: 0,
	});

	const fetchEmployments = useCallback(async (pageNum = page, limitNum = limit) => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await employeeApi.getEmployments(pageNum, limitNum);
			if (response?.success && response?.data?.employments) {
				setEmployments(response.data.employments);
				if (response.pagination) {
					setPagination(response.pagination);
				}
			} else {
				setEmployments([]);
			}
		} catch (err) {
			console.error("Failed to fetch employments:", err);
			setError(err);
			setEmployments([]);
		} finally {
			setIsLoading(false);
		}
	}, [page, limit]);

	useEffect(() => {
		fetchEmployments(page, limit);
	}, [fetchEmployments, page, limit]);

	return {
		employments,
		isLoading,
		error,
		pagination,
		refetch: () => fetchEmployments(page, limit),
	};
}

