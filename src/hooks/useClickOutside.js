import { useEffect } from 'react';

/**
 * Hook for detecting clicks outside of specified elements
 * Useful for closing dropdowns/modals when clicking outside
 */
export const useClickOutside = (refs, handler, enabled = true) => {
    useEffect(() => {
        if (!enabled) return;

        const handleClickOutside = (event) => {
            const clickedOutside = refs.every(
                (ref) => ref.current && !ref.current.contains(event.target)
            );

            if (clickedOutside) {
                handler();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [refs, handler, enabled]);
};

