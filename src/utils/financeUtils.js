export const formatCurrency = (amount, currency = "CHF", locale = null) => {
	// Get locale from parameter, localStorage, or use default based on language
	if (!locale && typeof window !== "undefined") {
		const savedLanguage = localStorage.getItem("app_language") || "en";
		// Map language codes to locale codes for currency formatting
		const localeMap = {
			de: "de-CH",
			en: "en-US",
			fr: "fr-CH",
			it: "it-CH",
			ar: "ar-SA",
		};
		locale = localeMap[savedLanguage] || "en-US";
	} else if (!locale) {
		locale = "en-US"; // Default fallback
	}
	
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};

export const exportToExcel = (transactions, selectedPeriod) => {
	const csvContent = [
		[
			"Date",
			"Description",
			"Type",
			"Amount",
			"Status",
			"Order Ref",
			"Category",
		],
		...transactions.map((t) => [
			t.date,
			t.description,
			t.type,
			t.amount,
			t.status,
			t.orderRef || "",
			t.category || "",
		]),
	]
		.map((row) => row.join(","))
		.join("\n");

	const blob = new Blob([csvContent], { type: "text/csv" });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `transactions_${selectedPeriod}_${
		new Date().toISOString().split("T")[0]
	}.csv`;
	a.click();
	window.URL.revokeObjectURL(url);
};

export const calculatePeriodStats = (transactions) => {
	const income = transactions
		.filter((t) => t.type === "income" && t.status === "completed")
		.reduce((sum, t) => sum + t.amount, 0);
	const expenses = transactions
		.filter((t) => t.type === "expense" && t.status === "completed")
		.reduce((sum, t) => sum + t.amount, 0);

	return [
		{
			label: "Period Revenue",
			value: formatCurrency(income),
			trend: "+12.5%",
			positive: true,
		},
		{
			label: "Period Expenses",
			value: formatCurrency(expenses),
			trend: "-8.8%",
			positive: true,
		},
		{
			label: "Period Profit",
			value: formatCurrency(income - expenses),
			trend: "+87.4%",
			positive: true,
		},
		{
			label: "Transactions",
			value: transactions.length.toString(),
			trend: `${transactions.length} total`,
			positive: true,
		},
	];
};
