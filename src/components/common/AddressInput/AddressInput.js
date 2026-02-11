"use client";

import { useRef, useEffect } from 'react';
import { useAddressSearch } from '@/hooks/useAddressSearch';
import { useAddressValue } from '@/hooks/useAddressValue';
import { useClickOutside } from '@/hooks/useClickOutside';
import AddressResults from './AddressResults';

/**
 * AddressInput - Autocomplete address input with OpenStreetMap Nominatim
 * Provides type-ahead search for worldwide addresses
 */
export default function AddressInput({
    value = '',
    onChange,
    placeholder = 'Start typing address...',
    disabled = false,
    className = '',
    label,
    required = false,
    error,
    ...props
}) {
    const inputRef = useRef(null);
    const resultsRef = useRef(null);
    const debounceTimer = useRef(null);

    const { results, showResults, isLoading, setShowResults, performSearch } = useAddressSearch();
    
    const {
        displayValue,
        userIsTyping,
        isSelectingResult,
        handleInputChange: handleValueChange,
        handleResultSelect: handleSelect,
        handleBlur,
    } = useAddressValue({ value, onChange });

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        handleValueChange(newValue);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            performSearch(newValue);
        }, 300);
    };

    const handleResultSelect = (place) => {
        handleSelect(place);
        setShowResults(false);
    };

    const handleClickOutside = () => {
        setShowResults(false);
        if (userIsTyping && !isSelectingResult) {
            handleBlur();
        }
    };

    useClickOutside([inputRef, resultsRef], handleClickOutside, true);

    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    const baseInputClasses =
        'flex-grow bg-white border border-orange-200 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed w-full transition-all';

    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs sm:text-sm font-medium text-amber-800 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <div className="relative w-full">
                <input
                    ref={inputRef}
                    type="text"
                    value={displayValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`${baseInputClasses} ${className} ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                    autoComplete="off"
                    {...props}
                />

                {isLoading && (
                    <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-orange-300 border-t-orange-600"></div>
                    </div>
                )}

                <AddressResults
                    results={results}
                    showResults={showResults}
                    isLoading={isLoading}
                    displayValue={displayValue}
                    onSelect={handleResultSelect}
                    resultsRef={resultsRef}
                />
            </div>
            
            {error && (
                <p className="mt-1 text-xs sm:text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}

