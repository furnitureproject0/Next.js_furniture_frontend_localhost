import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_LANGUAGE, getLanguageFromStorage, setLanguageToStorage } from "@/lib/i18n/config";

// Initialize with default language to avoid hydration mismatch
// Language will be set from storage in LanguageInitializer component
const initialState = {
	currentLanguage: DEFAULT_LANGUAGE,
};

const languageSlice = createSlice({
	name: "language",
	initialState,
	reducers: {
		setLanguage: (state, action) => {
			const newLanguage = action.payload;
			state.currentLanguage = newLanguage;
			setLanguageToStorage(newLanguage);
			
			// Update HTML lang and dir attributes
			if (typeof document !== "undefined") {
				document.documentElement.lang = newLanguage;
				const { SUPPORTED_LANGUAGES } = require("@/lib/i18n/config");
				const langConfig = SUPPORTED_LANGUAGES[newLanguage];
				if (langConfig) {
					document.documentElement.dir = langConfig.dir;
				}
			}
		},
	},
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;

