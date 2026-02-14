import { useEffect, useState } from "react";

/**
 * useDebounce Hook
 * 
 * Delays updating a value until after a specified delay has passed since
 * the last change. Useful for preventing excessive API calls from rapid
 * user input or interactions.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 * 
 * @example
 * const SearchComponent = () => {
 *   const [searchTerm, setSearchTerm] = useState("");
 *   const debouncedSearch = useDebounce(searchTerm, 500);
 *   
 *   useEffect(() => {
 *     // This will only run 500ms after user stops typing
 *     if (debouncedSearch) {
 *       performSearch(debouncedSearch);
 *     }
 *   }, [debouncedSearch]);
 * }
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up the timeout
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup function - cancel the timeout if value changes
        // or component unmounts before delay expires
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
