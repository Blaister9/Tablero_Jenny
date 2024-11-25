import React, { useState } from 'react';

const Tooltip = ({ content, children, placement = 'right' }) => {
    const [isVisible, setIsVisible] = useState(false);
  
    if (!content) return children;
  
    return (
      <>
        <div className="relative"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          {children}
          {isVisible && (
            <div 
              className={`absolute z-[60] w-64 p-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg -top-2 ${
                placement === 'right' ? 'left-full ml-2' : 'right-full mr-2'
              }`}
            >
              {content}
              <div 
                className={`absolute top-3 w-2 h-2 bg-gray-900 transform rotate-45 ${
                  placement === 'right' ? '-left-1' : '-right-1'
                }`} 
              />
            </div>
          )}
        </div>
      </>
    );
  };

export default Tooltip