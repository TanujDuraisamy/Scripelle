import { matchSorter } from 'match-sorter';

/**
 * Fuzzy search utility for filtering and sorting commands
 * @param {Array} commands - Array of command objects with label property
 * @param {string} query - Search query string
 * @returns {Array} Filtered and sorted commands based on relevance
 */
export const fuzzySearchCommands = (commands, query) => {
  if (!query.trim()) {
    return commands;
  }

  // Use match-sorter for fuzzy matching on command labels
  return matchSorter(commands, query, {
    keys: ['label'],
    threshold: matchSorter.rankings.CONTAINS,
  });
};

/**
 * Flattens command groups into a single array while preserving group information
 * @param {Array} commandGroups - Array of command groups
 * @returns {Array} Flattened array of commands with group info
 */
export const flattenCommandGroups = (commandGroups) => {
  const flattened = [];
  commandGroups.forEach((group, groupIndex) => {
    group.commands.forEach((command, commandIndex) => {
      flattened.push({
        ...command,
        groupIndex,
        commandIndex,
        groupTitle: group.title,
      });
    });
  });
  return flattened;
};

/**
 * Groups filtered commands back into their original group structure
 * @param {Array} filteredCommands - Filtered commands array
 * @param {Array} originalGroups - Original command groups
 * @returns {Array} Restructured groups containing only filtered commands
 */
export const groupFilteredCommands = (filteredCommands, originalGroups) => {
  const groupMap = new Map();
  
  filteredCommands.forEach(command => {
    if (!groupMap.has(command.groupIndex)) {
      groupMap.set(command.groupIndex, {
        title: command.groupTitle,
        commands: [],
        originalIndex: command.groupIndex,
      });
    }
    groupMap.get(command.groupIndex).commands.push(command);
  });

  // Return groups in order of first occurrence in filtered results
  return Array.from(groupMap.values());
}; 