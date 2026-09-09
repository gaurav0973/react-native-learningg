import { useEffect, useState } from 'react';


// useDebounce(searchText, 300)
//  => returns a delayed version of value
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
        setDebouncedValue(value);
        }, delay);

        return () => {
        clearTimeout(timer);
        };
    }, [value, delay]);
    return debouncedValue;
}
