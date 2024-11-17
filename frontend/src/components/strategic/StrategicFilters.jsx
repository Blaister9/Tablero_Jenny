import React from 'react';
import { Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StrategicFilters = ({ 
  filters, 
  onFilterChange, 
  isFilterOpen, 
  setIsFilterOpen, 
  lines = [], 
  statusConfig = {} 
}) => {
  const handleSearch = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleLineChange = (e) => {
    onFilterChange({ ...filters, line: e.target.value });
  };

  const handleStatusChange = (e) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.search}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-4 w-full bg-gray-50 p-4 rounded-lg"
            >
              <select
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                value={filters.line}
                onChange={handleLineChange}
              >
                <option value="all">Todas las líneas</option>
                {lines.map((line) => (
                  <option key={line.id} value={line.name}>
                    {line.name}
                  </option>
                ))}
              </select>

              <select
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={handleStatusChange}
              >
                <option value="all">Todos los estados</option>
                {Object.keys(statusConfig).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StrategicFilters;