import { useState, useMemo } from "react";

export const useTransactionFilters = (transactions) => {
	const [selectedFilter, setSelectedFilter] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(10);

	// Apply all filters
	const filteredTransactions = useMemo(() => {
		return transactions.filter((transaction) => {
			const matchesType =
				selectedFilter === "all" || transaction.type === selectedFilter;
			const matchesStatus =
				selectedStatus === "all" ||
				transaction.status === selectedStatus;
			const matchesSearch =
				transaction.description
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				(transaction.orderRef &&
					transaction.orderRef
						.toLowerCase()
						.includes(searchQuery.toLowerCase()));

			return matchesType && matchesStatus && matchesSearch;
		});
	}, [transactions, selectedFilter, selectedStatus, searchQuery]);

	// Pagination
	const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
	const paginatedTransactions = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredTransactions.slice(
			startIndex,
			startIndex + itemsPerPage,
		);
	}, [filteredTransactions, currentPage, itemsPerPage]);

	// Reset pagination when filters change
	const handleFilterChange = (filterType, value) => {
		setCurrentPage(1);
		switch (filterType) {
			case "type":
				setSelectedFilter(value);
				break;
			case "status":
				setSelectedStatus(value);
				break;
			case "search":
				setSearchQuery(value);
				break;
		}
	};

	const clearAllFilters = () => {
		setSearchQuery("");
		setSelectedFilter("all");
		setSelectedStatus("all");
		setCurrentPage(1);
	};

	return {
		selectedFilter,
		selectedStatus,
		searchQuery,
		showFilters,
		setShowFilters,
		currentPage,
		setCurrentPage,
		totalPages,
		filteredTransactions,
		paginatedTransactions,
		handleFilterChange,
		clearAllFilters,
	};
};
