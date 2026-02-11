import { useState } from 'react';

/**
 * Hook for searching addresses using OpenStreetMap Nominatim API
 * Returns search results and manages loading state
 */
export const useAddressSearch = () => {
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const performSearch = async (query) => {
        if (!query || query.length < 3) {
            setResults([]);
            setShowResults(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
                {
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            );
            const data = await response.json();
            setResults(data);
            setShowResults(data.length > 0);
        } catch (error) {
            console.error('Address search error:', error);
            setResults([]);
            setShowResults(false);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        results,
        showResults,
        isLoading,
        setShowResults,
        performSearch,
    };
};

