import { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StrategicFilters = ({
  filters,
  onFilterChange,
  isFilterOpen,
  setIsFilterOpen,
  lines = [],
  statusConfig = {},
  leaders = [],
  areas = [],
}) => {
  const [isLeaderDropdownOpen, setIsLeaderDropdownOpen] = useState(false);
  const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false);
  const leaderDropdownRef = useRef(null);
  const supportDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        leaderDropdownRef.current &&
        !leaderDropdownRef.current.contains(event.target)
      ) {
        setIsLeaderDropdownOpen(false);
      }
      if (
        supportDropdownRef.current &&
        !supportDropdownRef.current.contains(event.target)
      ) {
        setIsSupportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleLineChange = (e) => {
    onFilterChange({ ...filters, line: e.target.value });
  };

  const handleStatusChange = (e) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const handleLeaderToggle = (leaderId) => {
    const currentLeaders = Array.isArray(filters.leaders) ? filters.leaders : [];
    const updatedLeaders = currentLeaders.includes(leaderId)
      ? currentLeaders.filter((id) => id !== leaderId)
      : [...currentLeaders, leaderId];
    onFilterChange({ ...filters, leaders: updatedLeaders });
  };

  const handleSupportToggle = (memberId) => {
    const currentSupport = Array.isArray(filters.supportTeam) ? filters.supportTeam : [];
    const updatedSupport = currentSupport.includes(memberId)
      ? currentSupport.filter((id) => id !== memberId)
      : [...currentSupport, memberId];
    onFilterChange({ ...filters, supportTeam: updatedSupport });
  };

  const clearFilters = () => {
    onFilterChange({
      ...filters,
      line: 'all',
      status: 'all',
      search: '',
      leaders: [],
      supportTeam: [],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative w-full lg:w-1/3">
          <input
            type="text"
            placeholder="Buscar tareas..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-shadow duration-200"
            value={filters.search || ''}
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

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center px-3 py-2 rounded-lg border transition-all duration-200 ${
            isFilterOpen
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-gray-200 hover:bg-gray-50 text-gray-600'
          }`}
        >
          <Filter className="w-5 h-5 mr-2" />
          Filtros
        </button>

        {(filters.line !== 'all' ||
          filters.status !== 'all' ||
          (filters.leaders?.length || 0) > 0 ||
          (filters.supportTeam?.length || 0) > 0 ||
          filters.search) && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-50 p-4 rounded-lg space-y-4 lg:space-y-0 lg:space-x-4 flex flex-col lg:flex-row"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Línea Estratégica
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                value={filters.line || 'all'}
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

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                value={filters.status || 'all'}
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

            <div className="flex-1 relative z-50" ref={leaderDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Líderes</label>
              <div
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white flex items-center justify-between cursor-pointer"
                onClick={() => setIsLeaderDropdownOpen(!isLeaderDropdownOpen)}
              >
                <span className="text-sm text-gray-600">
                  {(filters.leaders?.length || 0) > 0
                    ? `${filters.leaders.length} líder(es) seleccionado(s)`
                    : 'Seleccionar líderes'}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
              {isLeaderDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-40 overflow-auto">
                  {leaders.map((leader) => (
                    <div
                      key={leader.id}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                        filters.leaders?.includes(leader.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleLeaderToggle(leader.id)}
                    > 
                      {leader.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 relative z-50" ref={supportDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipo de Soporte
              </label>
              <div
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white flex items-center justify-between cursor-pointer"
                onClick={() => setIsSupportDropdownOpen(!isSupportDropdownOpen)}
              >
                <span className="text-sm text-gray-600">
                  {(filters.supportTeam?.length || 0) > 0
                    ? `${filters.supportTeam.length} miembro(s) seleccionado(s)`
                    : 'Seleccionar equipo'}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
              {isSupportDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-40 overflow-auto">
                  {leaders.map((member) => (
                    <div
                      key={member.id}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                        filters.supportTeam?.includes(member.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSupportToggle(member.id)}
                    >
                      {member.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StrategicFilters;