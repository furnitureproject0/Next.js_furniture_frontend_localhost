import { useState, useEffect, useMemo } from 'react';
import { ApiError, companiesApi } from '@/lib/api';

export function useCompanies(isOpen) {
	const [companies, setCompanies] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchCompanies = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const response = await companiesApi.getCompanies();
				
				if (response?.success && response?.data?.companies) {
					setCompanies(response.data.companies);
				} else {
					throw new Error("Failed to load companies");
				}
			} catch (err) {
				console.error("Error fetching companies:", err);
				setError(
					err instanceof ApiError 
						? err.message 
						: "Failed to load companies"
				);
			} finally {
				setIsLoading(false);
			}
		};

		if (isOpen) {
			fetchCompanies();
		}
	}, [isOpen]);

	const internalCompanies = useMemo(() => companies.slice(0, 2), [companies]);
	const externalCompanies = useMemo(() => companies.slice(2), [companies]);

	return {
		companies,
		internalCompanies,
		externalCompanies,
		isLoading,
		error
	};
}
