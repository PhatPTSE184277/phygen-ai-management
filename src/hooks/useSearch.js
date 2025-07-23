import { useState, useMemo } from 'react';

export const useSearch = (data, searchFields = []) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const lowercaseSearchTerm = searchTerm.toLowerCase();

    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(lowercaseSearchTerm);
      });
    });
  }, [data, searchTerm, searchFields]);

  const reset = () => {
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    reset
  };
};