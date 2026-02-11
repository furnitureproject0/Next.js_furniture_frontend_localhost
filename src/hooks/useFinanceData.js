import { useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectDisplayTransactions } from "@/store/selectors";

export const useFinanceData = () => {
	const [selectedPeriod, setSelectedPeriod] = useState("30d");
	const [customDateRange, setCustomDateRange] = useState({
		startDate: "",
		endDate: "",
	});

	const allTransactions = useAppSelector(selectDisplayTransactions);

	// Filter transactions by time period
	const periodFilteredTransactions = useMemo(() => {
		const now = new Date();
		let startDate, endDate;

		switch (selectedPeriod) {
			case "7d":
				startDate = new Date(now);
				startDate.setDate(now.getDate() - 7);
				endDate = now;
				break;
			case "30d":
				startDate = new Date(now);
				startDate.setDate(now.getDate() - 30);
				endDate = now;
				break;
			case "90d":
				startDate = new Date(now);
				startDate.setDate(now.getDate() - 90);
				endDate = now;
				break;
			case "1y":
				startDate = new Date(now);
				startDate.setFullYear(now.getFullYear() - 1);
				endDate = now;
				break;
			case "custom":
				if (customDateRange.startDate && customDateRange.endDate) {
					startDate = new Date(customDateRange.startDate);
					endDate = new Date(customDateRange.endDate);
				} else {
					startDate = new Date(now);
					startDate.setDate(now.getDate() - 30);
					endDate = now;
				}
				break;
			default:
				startDate = new Date(now);
				startDate.setDate(now.getDate() - 30);
				endDate = now;
		}

		return allTransactions.filter((transaction) => {
			const transactionDate = new Date(transaction.date);
			return transactionDate >= startDate && transactionDate <= endDate;
		});
	}, [allTransactions, selectedPeriod, customDateRange]);

	// Generate chart data for the selected period
	const chartData = useMemo(() => {
		const data = [];
		const now = new Date();
		let days = 30;

		switch (selectedPeriod) {
			case "7d":
				days = 7;
				break;
			case "30d":
				days = 30;
				break;
			case "90d":
				days = 90;
				break;
			case "1y":
				days = 365;
				break;
			case "custom":
				if (customDateRange.startDate && customDateRange.endDate) {
					const start = new Date(customDateRange.startDate);
					const end = new Date(customDateRange.endDate);
					days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
				}
				break;
		}

		// Generate data points for the chart
		for (let i = days - 1; i >= 0; i--) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split("T")[0];

			const dayTransactions = periodFilteredTransactions.filter(
				(t) => t.date === dateStr,
			);

			const revenue = dayTransactions
				.filter((t) => t.type === "income" && t.status === "completed")
				.reduce((sum, t) => sum + t.amount, 0);

			const expenses = dayTransactions
				.filter((t) => t.type === "expense" && t.status === "completed")
				.reduce((sum, t) => sum + t.amount, 0);

			data.push({
				date: dateStr,
				revenue,
				expenses,
				profit: revenue - expenses,
			});
		}

		return data;
	}, [periodFilteredTransactions, selectedPeriod, customDateRange]);

	return {
		selectedPeriod,
		setSelectedPeriod,
		customDateRange,
		setCustomDateRange,
		periodFilteredTransactions,
		chartData,
	};
};
