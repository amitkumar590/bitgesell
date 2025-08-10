import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';

const VirtualizedItemList = ({ items, loading, height = 600, itemHeight = 80 }) => {
  const ItemRow = ({ index, style }) => {
    const item = items[index];
    
    if (!item) {
      return (
        <div style={style} className="item-skeleton">
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
          </div>
        </div>
      );
    }

    return (
      <div style={style} className="item-row">
        <Link to={`/items/${item.id}`} className="item-link">
          <div className="item-content">
            <div className="item-header">
              <h3 className="item-title">{item.name}</h3>
              <span className="item-price">${item.price.toLocaleString()}</span>
            </div>
            <div className="item-category">
              <span className="category-badge">{item.category}</span>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  if (loading && items.length === 0) {
    return (
      <div className="loading-container" style={{ height }}>
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state" style={{ height }}>
        <div className="empty-icon">📦</div>
        <h3 className="empty-title">No items found</h3>
        <p className="empty-description">
          Try adjusting your search terms or browse all items.
        </p>
      </div>
    );
  }

  return (
    <div className="virtualized-list-container">
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        width="100%"
        className="virtualized-list"
      >
        {ItemRow}
      </List>
    </div>
  );
};

export default VirtualizedItemList; 