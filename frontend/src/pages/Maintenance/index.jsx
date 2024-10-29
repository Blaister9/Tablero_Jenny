import React from 'react';
import MaintenanceGrid from '../../components/maintenance/MaintenanceGrid';

const Maintenance = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Plan de Mantenimiento</h1>
          <p className="mt-2 text-sm text-gray-700">
            Seguimiento y control de actividades de mantenimiento
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex space-x-3">
            {/* Filtros */}
            <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option>Todos los subgrupos</option>
              <option>Equipos servidores y virtualización</option>
              <option>Equipos de red</option>
              <option>Equipos de seguridad</option>
            </select>
            <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option>2024</option>
              <option>2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center space-x-8 text-sm">
        <div className="flex items-center">
          <span className="w-4 h-4 rounded-full bg-gray-200 mr-2"></span>
          <span className="text-gray-700">No programado</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded-full bg-blue-200 mr-2"></span>
          <span className="text-gray-700">Programado</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded-full bg-green-200 mr-2"></span>
          <span className="text-gray-700">Completado</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded-full bg-red-200 mr-2"></span>
          <span className="text-gray-700">Retrasado</span>
        </div>
      </div>

      {/* Grid Principal */}
      <MaintenanceGrid />
    </div>
  );
};

export default Maintenance;