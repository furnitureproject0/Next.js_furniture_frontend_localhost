"use client";

/**
 * AddressResults - Dropdown showing address search results
 * Displays results from Nominatim search in a styled dropdown
 */
export default function AddressResults({
    results,
    showResults,
    isLoading,
    displayValue,
    onSelect,
    resultsRef,
}) {
    if (!showResults || (!isLoading && results.length === 0)) {
        return null;
    }

    return (
        <div
            ref={resultsRef}
            className="absolute z-50 w-full mt-1 sm:mt-2 bg-white border border-orange-200 rounded-lg shadow-lg max-h-48 sm:max-h-64 overflow-y-auto"
        >
            {isLoading ? (
                <div className="p-3 sm:p-4 text-center text-amber-700">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-orange-300 border-t-orange-600 mx-auto"></div>
                    <p className="mt-2 text-xs sm:text-sm">Searching...</p>
                </div>
            ) : results.length === 0 && displayValue.length >= 3 ? (
                <div className="p-3 sm:p-4 text-center text-amber-700">
                    <p className="text-xs sm:text-sm">No addresses found</p>
                </div>
            ) : (
                <ul className="divide-y divide-orange-100">
                    {results.map((place) => (
                        <li
                            key={place.place_id}
                            onClick={() => onSelect(place)}
                            className="p-2.5 sm:p-3 hover:bg-orange-50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-start gap-2 sm:gap-3">
                                <svg
                                    className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-0.5 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                        {place.display_name}
                                    </p>
                                    {place.address && (
                                        <p className="text-[10px] sm:text-xs text-amber-600 mt-0.5 sm:mt-1">
                                            {[
                                                place.address.city,
                                                place.address.state,
                                                place.address.country,
                                            ]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

