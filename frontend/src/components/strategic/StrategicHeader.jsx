import React from 'react';
import { Plus } from 'lucide-react';

const StrategicHeader = ({ tasks = [], onNewTask }) => {
  // Cálculos de KPIs
  const pendingTasks = tasks.filter(t => t.status === 'Pendiente').length;
  const inProgressTasks = tasks.filter(t => t.status === 'En proceso').length;
  const completedTasks = tasks.filter(t => t.status === 'Cumplido').length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Seguimiento Estratégico</h1>
        <button
          onClick={onNewTask}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Tarea
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Tareas</h3>
          <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Pendientes</h3>
          <p className="text-2xl font-semibold text-yellow-600">{pendingTasks}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">En Proceso</h3>
          <p className="text-2xl font-semibold text-blue-600">{inProgressTasks}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Completadas</h3>
          <p className="text-2xl font-semibold text-green-600">{completedTasks}</p>
        </div>
      </div>
    </div>
  );
};

export default StrategicHeader;