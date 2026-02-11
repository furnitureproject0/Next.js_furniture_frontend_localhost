"use client";

import { useState, useEffect } from "react";
import { employeeApi } from "@/lib/api";

export function useAssignments() {
	const [assignments, setAssignments] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchAssignments = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await employeeApi.getAssignments();
			if (response?.success && response?.data?.assignments) {
				setAssignments(response.data.assignments);
			} else {
				setAssignments([]);
			}
		} catch (err) {
			console.error("Failed to fetch assignments:", err);
			setError(err);
			setAssignments([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAssignments();
	}, []);

	return {
		assignments,
		isLoading,
		error,
		refetch: fetchAssignments,
	};
}

