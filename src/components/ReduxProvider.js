"use client";

import { Provider } from "react-redux";
import { useEffect, useRef } from "react";
import { store } from "@/store";
import { initializePersistedData } from "@/store/persistence";

export default function ReduxProvider({ children }) {
	const initialized = useRef(false);

	useEffect(() => {
		// Initialize persisted data only once
		if (!initialized.current) {
			initializePersistedData(store.dispatch);
			initialized.current = true;
		}
	}, []);

	return <Provider store={store}>{children}</Provider>;
}
