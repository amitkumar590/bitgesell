import React, { createContext, useCallback, useContext, useState, useRef } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 10, 
    totalItems: 0, 
    totalPages: 0, 
    hasNextPage: false, 
    hasPrevPage: false 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Use refs to store current values to avoid dependency issues
  const paginationRef = useRef(pagination);
  const searchQueryRef = useRef(searchQuery);

  // Update refs when state changes
  paginationRef.current = pagination;
  searchQueryRef.current = searchQuery;

  const fetchItems = useCallback(async (signal, page = 1, limit = 10, query = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (query.trim()) {
        params.append('q', query.trim());
      }

      const res = await fetch(`http://localhost:3001/api/items?${params}`, { signal });
      if (!res.ok) {
        throw new Error(`Failed to fetch items: ${res.status}`);
      }
      const json = await res.json();
      setItems(json.items);
      setPagination(json.pagination);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching items:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const searchItems = useCallback(async (query, signal) => {
    setSearchQuery(query);
    await fetchItems(signal, 1, paginationRef.current.limit, query);
  }, [fetchItems]);

  const goToPage = useCallback(async (page, signal) => {
    await fetchItems(signal, page, paginationRef.current.limit, searchQueryRef.current);
  }, [fetchItems]);

  return (
    <DataContext.Provider value={{ 
      items, 
      pagination, 
      searchQuery, 
      loading,
      fetchItems, 
      searchItems, 
      goToPage 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);