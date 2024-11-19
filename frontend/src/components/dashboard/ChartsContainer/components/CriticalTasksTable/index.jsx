import React, { useState, useMemo } from 'react';

const CriticalTasksTable = ({ data = [] }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'daysUntilDue', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Función para determinar el color de la prioridad
  const getPriorityColor = (daysUntilDue) => {
    if (daysUntilDue < 0) return 'text-red-600 font-bold';
    if (daysUntilDue <= 7) return 'text-orange-500 font-semibold';
    return 'text-yellow-600';
  };

  // Función para formatear los días restantes
  const formatDaysRemaining = (days) => {
    if (days < 0) return `Vencida hace ${Math.abs(days)} días`;
    if (days === 0) return 'Vence hoy';
    if (days === 1) return 'Vence mañana';
    return `${days} días restantes`;
  };

  // Ordenamiento y filtrado de datos
  const sortedAndFilteredData = useMemo(() => {
    let filteredData = [...data].filter(task => {
      const searchFields = [
        task.deliverable?.toLowerCase(),
        task.title?.toLowerCase(),
        task.area?.toLowerCase(),
        task.leader?.toLowerCase(),
        formatDate(task.dueDate)
      ].join(' ');
      
      return searchFields.includes(searchTerm.toLowerCase());
    });

    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [data, sortConfig, searchTerm]);

  // Manejador de ordenamiento
  const requestSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: 
        prevConfig.key === key && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc',
    }));
  };

  // Obtener el ícono de ordenamiento
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Tareas Críticas y Próximas a Vencer</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar tarea..."
              className="px-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('deliverable')}
                >
                  <div className="flex items-center gap-2">
                    Entregable {getSortIcon('deliverable')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('title')}
                >
                  <div className="flex items-center gap-2">
                    Tarea {getSortIcon('title')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('daysUntilDue')}
                >
                  <div className="flex items-center gap-2">
                    Tiempo Restante {getSortIcon('daysUntilDue')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('area')}
                >
                  <div className="flex items-center gap-2">
                    Área {getSortIcon('area')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('leader')}
                >
                  <div className="flex items-center gap-2">
                    Responsable {getSortIcon('leader')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('dueDate')}
                >
                  <div className="flex items-center gap-2">
                    Fecha Límite {getSortIcon('dueDate')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredData.length > 0 ? (
                sortedAndFilteredData.map((task, index) => (
                  <tr 
                    key={task.id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-sm font-medium text-gray-900">
                        {task.deliverable || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-sm text-gray-500">
                        {task.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${getPriorityColor(task.daysUntilDue)}`}>
                        {formatDaysRemaining(task.daysUntilDue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.area || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.leader || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(task.dueDate)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron tareas críticas que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Leyenda de estados */}
        <div className="mt-4 flex gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-red-600 rounded-full"></span>
            <span>Vencidas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-orange-500 rounded-full"></span>
            <span>Críticas (≤ 7 días)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-yellow-600 rounded-full"></span>
            <span>Próximas a vencer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriticalTasksTable;