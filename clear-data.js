/**
 * Clears all data from localStorage
 */
function clearAllData() {
  try {
    // Clear all localStorage data
    localStorage.clear();
    console.log('All localStorage data has been cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing localStorage data:', error);
    return false;
  }
}

// Export the function if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { clearAllData };
} 