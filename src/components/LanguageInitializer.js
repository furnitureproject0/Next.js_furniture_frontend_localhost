"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLanguage } from "@/store/slices/languageSlice";
import { getLanguageFromStorage, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "@/lib/i18n/config";

export default function LanguageInitializer({ children }) {
	const dispatch = useAppDispatch();
	const currentLanguage = useAppSelector((state) => state.language?.currentLanguage);

	useEffect(() => {
		// Initialize language from storage or default (only on client side)
		// This runs after hydration, so it won't cause hydration mismatch
		if (typeof window === "undefined") return;
		
		const savedLanguage = getLanguageFromStorage();
		if (!currentLanguage || currentLanguage !== savedLanguage) {
			dispatch(setLanguage(savedLanguage));
		}

		// Set initial HTML attributes
		const lang = savedLanguage || DEFAULT_LANGUAGE;
		const langConfig = SUPPORTED_LANGUAGES[lang];
		
		if (typeof document !== "undefined") {
			document.documentElement.lang = lang;
			if (langConfig) {
				document.documentElement.dir = langConfig.dir;
				// Also set dir on body for better compatibility
				document.body.dir = langConfig.dir;
			}
		}
	}, [dispatch, currentLanguage]);

	// Update HTML attributes when language changes
	useEffect(() => {
		if (!currentLanguage) return;
		
		const langConfig = SUPPORTED_LANGUAGES[currentLanguage];
		if (typeof document !== "undefined" && langConfig) {
			document.documentElement.lang = currentLanguage;
			document.documentElement.dir = langConfig.dir;
			document.body.dir = langConfig.dir;
		}
	}, [currentLanguage]);

	return <>{children}</>;
}

