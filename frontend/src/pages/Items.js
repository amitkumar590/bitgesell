import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import VirtualizedItemList from '../components/VirtualizedItemList';
import PerformanceMonitor from '../components/PerformanceMonitor';
import '../styles/Items.css';

function Items() {
  const { 
    items, 
    pagination, 
    searchQuery, 
    loading,
    fetchItems, 
    searchItems, 
    goToPage 
  } = useData();
  
  const [searchInput, setSearchInput] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [renderTime, setRenderTime] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchItems(controller.signal).catch(err => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchItems]);

  // Initialize search input with current search query
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Measure render time when items change
  useEffect(() => {
    if (items.length > 0) {
      const startTime = performance.now();
      
      // Use requestAnimationFrame to measure after render
      requestAnimationFrame(() => {
        const endTime = performance.now();
        setRenderTime(Math.round(endTime - startTime));
      });
    }
  }, [items]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      searchItems(value, controller.signal).catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    }, 300);
    
    setSearchTimeout(timeout);
  };

  const handlePageChange = (page) => {
    const controller = new AbortController();
    goToPage(page, controller.signal).catch(err => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const controller = new AbortController();
      searchItems(searchInput, controller.signal).catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    }
  };

  return (
    <div className="items-container">

      {/* Search Section */}
      <section className="search-section" aria-label="Search items">
        <div className="search-input-container">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            placeholder="Search items by name, category, or price..."
            value={searchInput}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="search-input"
            aria-label="Search items"
            aria-describedby="search-description"
          />
        </div>
        <div id="search-description" className="sr-only">
          Search through items by name, category, or price. Press Enter to search immediately.
        </div>
      </section>

      {/* Virtualized Items List */}
      <VirtualizedItemList 
        items={items}
        loading={loading}
        height={600}
        itemHeight={80}
      />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <nav className="pagination-container" aria-label="Pagination navigation">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
            className="pagination-button"
            aria-label={`Go to previous page, page ${pagination.page - 1}`}
          >
            ← Previous
          </button>
          
          <span className="pagination-info" role="status" aria-live="polite">
            Page {pagination.page} of {pagination.totalPages} 
            ({pagination.totalItems} total items)
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="pagination-button"
            aria-label={`Go to next page, page ${pagination.page + 1}`}
          >
            Next →
          </button>
        </nav>
      )}

      {/* Performance Monitor */}
      <PerformanceMonitor 
        itemsCount={items.length} 
        renderTime={renderTime}
      />

    </div>
  );
}

export default Items;