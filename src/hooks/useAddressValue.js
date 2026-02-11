import { useState, useEffect, useRef } from 'react';

/**
 * Hook for managing address input value and user interaction states
 * Handles the difference between user typing and programmatic updates
 */
export const useAddressValue = ({ value, onChange }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [userIsTyping, setUserIsTyping] = useState(false);
    const [isSelectingResult, setIsSelectingResult] = useState(false);
    const lastSelectedValue = useRef('');

    useEffect(() => {
        if (!userIsTyping && value !== displayValue) {
            setDisplayValue(value);
            lastSelectedValue.current = value;
        }
    }, [value, userIsTyping, displayValue]);

    const handleInputChange = (newValue) => {
        setDisplayValue(newValue);
        setUserIsTyping(true);
        setIsSelectingResult(false);
    };

    const handleResultSelect = (place) => {
        setIsSelectingResult(true);
        const selectedAddress = place.display_name;
        setDisplayValue(selectedAddress);
        lastSelectedValue.current = selectedAddress;
        onChange(selectedAddress, place);
        setUserIsTyping(false);
        setTimeout(() => setIsSelectingResult(false), 100);
    };

    const handleBlur = () => {
        if (userIsTyping && !isSelectingResult) {
            setDisplayValue(lastSelectedValue.current || value);
        }
        setUserIsTyping(false);
    };

    return {
        displayValue,
        userIsTyping,
        isSelectingResult,
        handleInputChange,
        handleResultSelect,
        handleBlur,
    };
};

