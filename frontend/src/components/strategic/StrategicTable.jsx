import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useStrategicData } from '../../hooks/useStrategicData';

const StrategicTable = () => {
  const [filters, setFilters] = useState({
    year: 2024,
    line: 'all',
    status: 'all',
  });

  // Extrae tanto las tareas como las líneas estratégicas desde el hook
  const { tasks, lines, isLoading, error, updateTask } = useStrategicData(filters);
  console.log("Datos de tareas:", tasks);
  const [selectedTask, setSelectedTask] = useState(null);

  const statusColors = {
    Pendiente: 'bg-yellow-100 text-yellow-800',
    Cumplido: 'bg-green-100 text-green-800',
    'En proceso': 'bg-blue-100 text-blue-800',
    Retrasado: 'bg-red-100 text-red-800',
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
  };

  const handleSave = async () => {
    if (selectedTask) {
      await updateTask.mutateAsync({ id: selectedTask.id, ...selectedTask });
      setSelectedTask(null);
    }
  };

  if (isLoading) return <div>Cargando datos de seguimiento...</div>;
  if (error) return <div>Error al cargar los datos: {error.message}</div>;

  return (
    <div className="flex flex-col">
      {/* Filtros */}
      <div className="mb-4 flex gap-4">
        <select
          className="rounded-md border-gray-300 shadow-sm"
          value={filters.line}
          onChange={(e) => setFilters({ ...filters, line: e.target.value })}
        >
          <option value="all">Todas las líneas</option>
          {lines.map((line) => (
            <option key={line.id} value={line.name}>
              {line.name}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border-gray-300 shadow-sm"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Cumplido">Cumplido</option>
          <option value="En proceso">En proceso</option>
          <option value="Retrasado">Retrasado</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Línea
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Meta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha límite
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Área
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lidera
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(tasks) &&
              tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.strategic_line}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{task.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[task.status]}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.area}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.leader}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleEditClick(task)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Edición */}
      {selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-96">
            <h2 className="text-xl font-bold mb-4">Editar Tarea</h2>
            <input
              type="text"
              className="w-full mb-4 p-2 border"
              value={selectedTask.title}
              onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
            />
            <button className="bg-indigo-600 text-white p-2 rounded" onClick={handleSave}>
              Guardar
            </button>
            <button
              className="bg-gray-500 text-white p-2 rounded ml-2"
              onClick={() => setSelectedTask(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategicTable;
