import { useState, useMemo } from 'react';
import { fuzzySearchCommands, flattenCommandGroups, groupFilteredCommands } from './fuzzySearch.js';

/**
 * Hook for managing fuzzy search functionality in slash command menu
 * @param {Array} commandGroups - Original command groups
 * @returns {Object} Search state and utilities
 */
export const useFuzzySearch = (commandGroups) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten commands for easy searching
  const flatCommands = useMemo(() => {
    return flattenCommandGroups(commandGroups);
  }, [commandGroups]);

  // Filter and sort commands based on search query
  const filteredCommands = useMemo(() => {
    return fuzzySearchCommands(flatCommands, searchQuery);
  }, [flatCommands, searchQuery]);

  // Group filtered commands back into group structure
  const filteredGroups = useMemo(() => {
    return groupFilteredCommands(filteredCommands, commandGroups);
  }, [filteredCommands, commandGroups]);

  // Reset search when needed
  const resetSearch = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredCommands,
    filteredGroups,
    resetSearch,
    hasResults: filteredCommands.length > 0,
    totalResults: filteredCommands.length,
  };
}; 