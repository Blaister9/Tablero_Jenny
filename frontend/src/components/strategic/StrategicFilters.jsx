import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

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

  const clearFilters = () => {
    onFilterChange({
      ...filters,
      line: 'all',
      status: 'all',
      search: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Barra de búsqueda */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <input
              type="text"
              placeholder="Buscar tareas..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-shadow duration-200"
              value={filters.search}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Botón de filtros con badge */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`
              p-2 rounded-lg border transition-all duration-200
              ${isFilterOpen 
                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                : 'border-gray-200 hover:bg-gray-50 text-gray-600'}
              ${(filters.line !== 'all' || filters.status !== 'all') && !isFilterOpen
                ? 'bg-blue-50 border-blue-200'
                : ''}
            `}
          >
            <Filter className="w-5 h-5" />
          </button>

          {/* Botón para limpiar filtros */}
          {(filters.line !== 'all' || filters.status !== 'all' || filters.search) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Filtros expandibles */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full lg:w-auto"
            >
              <div className="flex flex-col lg:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
                {/* Filtro de línea */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Línea Estratégica
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm bg-white"
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
                </div>

                {/* Filtro de estado */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm bg-white"
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
                </div>

                {/* Filtros aplicados */}
                {(filters.line !== 'all' || filters.status !== 'all') && (
                  <div className="flex items-end">
                    <div className="flex gap-2 flex-wrap">
                      {filters.line !== 'all' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Línea: {filters.line}
                          <button
                            onClick={() => onFilterChange({ ...filters, line: 'all' })}
                            className="ml-1 hover:text-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.status !== 'all' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Estado: {filters.status}
                          <button
                            onClick={() => onFilterChange({ ...filters, status: 'all' })}
                            className="ml-1 hover:text-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StrategicFilters;