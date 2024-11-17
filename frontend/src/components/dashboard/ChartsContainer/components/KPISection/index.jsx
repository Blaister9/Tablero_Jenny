import React from 'react';

const KPISection = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Total Tareas</h3>
        <p className="text-2xl font-semibold text-gray-900">{kpis.total}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Completadas</h3>
        <p className="text-2xl font-semibold text-green-600">{kpis.completed}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">En Proceso</h3>
        <p className="text-2xl font-semibold text-blue-600">{kpis.inProgress}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Pendientes</h3>
        <p className="text-2xl font-semibold text-yellow-600">{kpis.pending}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500">Próximas a vencer</h3>
        <p className="text-2xl font-semibold text-red-600">{kpis.nearDeadline}</p>
      </div>
    </div>
  );
};

export default KPISection;