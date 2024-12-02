import React, { useState } from "react";

export const Select = ({ children, className, ...props }) => (
  <div className={`relative ${className}`} {...props}>
    {children}
  </div>
);

export const SelectTrigger = ({ value, placeholder, onClick, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full px-3 py-2 border rounded text-sm bg-white text-left ${className}`}
  >
    {value || placeholder}
  </button>
);

export const SelectContent = ({ isOpen, children, className }) => (
  isOpen ? (
    <div
      className={`absolute z-10 mt-1 bg-white border rounded shadow-md w-full ${className}`}
    >
      {children}
    </div>
  ) : null
);

export const SelectItem = ({ value, onSelect, children, className }) => (
  <div
    onClick={() => onSelect(value)}
    className={`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${className}`}
  >
    {children}
  </div>
);

export const SelectValue = ({ value }) => <span>{value}</span>;

export const SelectGroup = ({ children }) => <div>{children}</div>;

export const SelectLabel = ({ children }) => (
  <div className="px-3 py-1 text-xs font-bold text-gray-500">{children}</div>
);
