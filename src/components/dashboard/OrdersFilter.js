"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSelectedFilter } from "@/store/selectors";
import { setSelectedFilter } from "@/store/slices/ordersSlice";
import { useTranslation } from "@/hooks/useTranslation";

const FilterButton = ({ filter, currentFilter, onClick, children }) => (
	<button
		onClick={() => onClick(filter)}
		className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
			currentFilter === filter
				? "text-white bg-orange-500"
				: "text-amber-700 hover:text-amber-900"
		}`}
	>
		{children}
	</button>
);

export default function OrdersFilter() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const selectedFilter = useAppSelector(selectSelectedFilter);

	const handleFilterChange = (filter) => {
		dispatch(setSelectedFilter(filter));
	};

	return (
		<div className="flex flex-wrap sm:flex-nowrap bg-orange-100/60 rounded-lg p-1 gap-1">
			<FilterButton
				filter="all"
				currentFilter={selectedFilter}
				onClick={handleFilterChange}
			>
				{t("orders.filter.allOrders")}
			</FilterButton>
			<FilterButton
				filter="pending"
				currentFilter={selectedFilter}
				onClick={handleFilterChange}
			>
				{t("orders.filter.pending")}
			</FilterButton>
			<FilterButton
				filter="assigned"
				currentFilter={selectedFilter}
				onClick={handleFilterChange}
			>
				{t("orders.filter.active")}
			</FilterButton>
		</div>
	);
}
