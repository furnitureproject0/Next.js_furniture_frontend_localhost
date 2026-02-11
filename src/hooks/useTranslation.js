import { useAppSelector } from "@/store/hooks";
import { DEFAULT_LANGUAGE } from "@/lib/i18n/config";

// Import translation files
import deTranslations from "@/lib/i18n/locales/de.json";
import enTranslations from "@/lib/i18n/locales/en.json";
import frTranslations from "@/lib/i18n/locales/fr.json";
import itTranslations from "@/lib/i18n/locales/it.json";
import arTranslations from "@/lib/i18n/locales/ar.json";

const translations = {
	de: deTranslations,
	en: enTranslations,
	fr: frTranslations,
	it: itTranslations,
	ar: arTranslations,
};

export function useTranslation() {
	const currentLanguage = useAppSelector((state) => state.language?.currentLanguage) || DEFAULT_LANGUAGE;
	const t = translations[currentLanguage] || translations[DEFAULT_LANGUAGE];

	const translate = (key, params = {}) => {
		if (!key) return "";
		
		// Support nested keys like "common.buttons.save"
		const keys = key.split(".");
		let value = t;
		
		for (const k of keys) {
			if (value && typeof value === "object" && k in value) {
				value = value[k];
			} else {
				// Fallback to default language if key not found
				let fallbackValue = translations[DEFAULT_LANGUAGE];
				for (const fk of keys) {
					if (fallbackValue && typeof fallbackValue === "object" && fk in fallbackValue) {
						fallbackValue = fallbackValue[fk];
					} else {
						return key; // Return key if not found anywhere
					}
				}
				value = fallbackValue;
				break;
			}
		}
		
		// If value is a string, replace params
		if (typeof value === "string") {
			return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
				return params[paramKey] !== undefined ? params[paramKey] : match;
			});
		}
		
		return typeof value === "string" ? value : key;
	};

	return {
		t: translate,
		currentLanguage,
	};
}

