import React, { useState, useEffect } from 'react';

const PerformanceMonitor = ({ itemsCount, renderTime }) => {
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(performance.now());

  useEffect(() => {
    let animationId;
    
    const measureFPS = (currentTime) => {
      setFrameCount(prev => prev + 1);
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        setFrameCount(0);
        setLastTime(currentTime);
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    animationId = requestAnimationFrame(measureFPS);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [frameCount, lastTime]);

  const getPerformanceStatus = () => {
    if (fps >= 55) return { status: 'Excellent', color: '#28a745' };
    if (fps >= 45) return { status: 'Good', color: '#17a2b8' };
    if (fps >= 30) return { status: 'Fair', color: '#ffc107' };
    return { status: 'Poor', color: '#dc3545' };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="performance-monitor">
      <h3>Performance Metrics</h3>
      <div className="metrics-grid">
        <div className="metric">
          <span className="metric-label">Items Rendered:</span>
          <span className="metric-value">{itemsCount}</span>
        </div>
        <div className="metric">
          <span className="metric-label">FPS:</span>
          <span className="metric-value" style={{ color: performanceStatus.color }}>
            {fps}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Performance:</span>
          <span className="metric-value" style={{ color: performanceStatus.color }}>
            {performanceStatus.status}
          </span>
        </div>
        {renderTime && (
          <div className="metric">
            <span className="metric-label">Render Time:</span>
            <span className="metric-value">{renderTime}ms</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor; 