"use client";

import { SUPPORTED_LANGUAGES } from "@/lib/i18n/config";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLanguage } from "@/store/slices/languageSlice";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function LanguageSwitcher() {
	const dispatch = useAppDispatch();
	const currentLanguage = useAppSelector((state) => state.language?.currentLanguage) || "de";
	const [isOpen, setIsOpen] = useState(false);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, right: 0 });
	const buttonRef = useRef(null);
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const buttonRect = buttonRef.current.getBoundingClientRect();
			const isRTL = currentLanguage === "ar";
			
			setDropdownPosition({
				top: buttonRect.bottom + 8,
				left: isRTL ? undefined : buttonRect.left,
				right: isRTL ? window.innerWidth - buttonRect.right : undefined,
			});
		}
	}, [isOpen, currentLanguage]);

	const handleLanguageChange = (langCode) => {
		dispatch(setLanguage(langCode));
		setIsOpen(false);
	};

	const handleToggle = () => {
		if (!isOpen && buttonRef.current) {
			const buttonRect = buttonRef.current.getBoundingClientRect();
			const isRTL = currentLanguage === "ar";
			
			setDropdownPosition({
				top: buttonRect.bottom + 8,
				left: isRTL ? undefined : buttonRect.left,
				right: isRTL ? window.innerWidth - buttonRect.right : undefined,
			});
		}
		setIsOpen(!isOpen);
	};

	const currentLang = SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES.de;
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const renderDropdown = () => {
		if (!isOpen || !mounted) return null;

		return createPortal(
			<>
				<div
					className="fixed inset-0 z-[9998]"
					onClick={() => setIsOpen(false)}
				/>
				<div
					ref={dropdownRef}
					className="fixed w-40 sm:w-44 bg-white rounded-lg shadow-xl border border-orange-200/60 overflow-hidden z-[9999]"
					style={{
						top: `${dropdownPosition.top}px`,
						left: dropdownPosition.left !== undefined ? `${dropdownPosition.left}px` : undefined,
						right: dropdownPosition.right !== undefined ? `${dropdownPosition.right}px` : undefined,
					}}
				>
					<div className="py-1">
						{Object.values(SUPPORTED_LANGUAGES).map((lang) => (
							<button
								key={lang.code}
								type="button"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									handleLanguageChange(lang.code);
								}}
								className={`w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-left flex items-center gap-2 sm:gap-3 hover:bg-orange-50/60 transition-colors cursor-pointer ${
									currentLanguage === lang.code
										? "bg-gradient-to-r from-orange-50/80 to-amber-50/80 text-orange-700 font-medium border-l-2 border-orange-500"
										: "text-amber-900"
								}`}
							>
								<span className="text-lg sm:text-xl">{lang.flag}</span>
								<div className="flex-1 min-w-0">
									<div className="text-xs sm:text-sm font-medium truncate">{lang.nativeName}</div>
									<div className="text-[10px] sm:text-xs text-amber-700/70 truncate">{lang.name}</div>
								</div>
								{currentLanguage === lang.code && (
									<svg
										className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								)}
							</button>
						))}
					</div>
				</div>
			</>,
			document.body
		);
	};

	return (
		<div className="relative">
			<button
				ref={buttonRef}
				onClick={handleToggle}
				className="flex items-center justify-center p-1.5 sm:p-2 rounded-lg transition-all duration-200 text-amber-700 hover:bg-orange-50/60 hover:text-orange-700 border border-orange-200/40 hover:border-orange-300/60 bg-gradient-to-br from-orange-50/60 to-amber-50/60 hover:from-orange-50/80 hover:to-amber-50/80 shadow-sm hover:shadow-md cursor-pointer"
				title={currentLang.name}
			>
				<span className="text-base sm:text-lg">{currentLang.flag}</span>
			</button>
			{renderDropdown()}
		</div>
	);
}

