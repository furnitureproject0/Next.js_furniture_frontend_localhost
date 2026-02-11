// i18n Configuration
export const SUPPORTED_LANGUAGES = {
	de: {
		code: "de",
		name: "Deutsch",
		nativeName: "Deutsch",
		flag: "🇩🇪",
		dir: "ltr",
	},
	en: {
		code: "en",
		name: "English",
		nativeName: "English",
		flag: "🇬🇧",
		dir: "ltr",
	},
	fr: {
		code: "fr",
		name: "Français",
		nativeName: "Français",
		flag: "🇫🇷",
		dir: "ltr",
	},
	it: {
		code: "it",
		name: "Italiano",
		nativeName: "Italiano",
		flag: "🇮🇹",
		dir: "ltr",
	},
	ar: {
		code: "ar",
		name: "Arabic",
		nativeName: "العربية",
		flag: "🇸🇦",
		dir: "rtl",
	},
};

export const DEFAULT_LANGUAGE = "en";

export const getLanguageFromStorage = () => {
	if (typeof window === "undefined") return DEFAULT_LANGUAGE;
	return localStorage.getItem("app_language") || DEFAULT_LANGUAGE;
};

export const setLanguageToStorage = (lang) => {
	if (typeof window === "undefined") return;
	localStorage.setItem("app_language", lang);
};

