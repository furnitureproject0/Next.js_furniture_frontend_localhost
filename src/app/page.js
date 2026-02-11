"use client";

import { useMainPageRedirect } from "@/hooks/useRoleRedirect";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
	const { isLoading } = useMainPageRedirect();

	if (isLoading) {
		return <LoadingSpinner />;
	}

	// This should not be reached as useEffect will redirect
	return null;
}
