import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const StrategicTable = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    year: 2024,
    line: 'all',
    status: 'all'
  });

  const statusColors = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'Cumplido': 'bg-green-100 text-green-800',
    'En proceso': 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="flex flex-col">
      {/* Filtros */}
      <div className="mb-4 flex gap-4">
        <select 
          className="rounded-md border-gray-300 shadow-sm"
          value={filters.line}
          onChange={(e) => setFilters({...filters, line: e.target.value})}
        >
          <option value="all">Todas las líneas</option>
          <option value="U&A-PETI">U&A-PETI</option>
          <option value="PAI">PAI</option>
        </select>

        <select 
          className="rounded-md border-gray-300 shadow-sm"
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="all">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Cumplido">Cumplido</option>
          <option value="En proceso">En proceso</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Línea
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Meta
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha límite
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Área
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lidera
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.strategic_line}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {task.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[task.status]}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(task.due_date), 'dd/MM/yyyy', {locale: es})}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.area}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.leader}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StrategicTable;