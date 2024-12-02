import React from 'react';

export const Badge = ({ children, variant = 'default', ...props }) => {
  const variantClasses = {
    default: 'bg-gray-200 text-gray-800',
    outline: 'border border-gray-800 text-gray-800',
    secondary: 'bg-blue-200 text-blue-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </span>
  );
};
