import React from 'react';

const ComplianceRateKPI = ({ rate, completedTasks, totalTasks }) => {
  // Usamos directamente la tasa proporcionada por el hook
  const complianceRate = parseFloat(rate || 0).toFixed(1);
  
  // Determinar el color basado en la tasa de cumplimiento
  const getStatusColor = (rate) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Determinar el mensaje de estado
  const getStatusMessage = (rate) => {
    if (rate >= 90) return 'Excelente cumplimiento';
    if (rate >= 70) return 'Buen cumplimiento';
    if (rate >= 50) return 'Cumplimiento regular';
    return 'Necesita atención';
  };

  // Calcular el ángulo para el indicador circular
  const angle = (complianceRate / 100) * 360;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4">Tasa de Cumplimiento</h3>
        
        {/* Indicador circular */}
        <div className="relative w-40 h-40 mb-4">
          {/* Círculo de fondo */}
          <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>
          
          {/* Círculo de progreso */}
          <div 
            className="absolute inset-0 rounded-full border-8 border-transparent"
            style={{
              borderTopColor: complianceRate >= 70 ? '#10B981' : complianceRate >= 50 ? '#F59E0B' : '#EF4444',
              transform: `rotate(${angle}deg)`,
              transition: 'transform 1s ease-in-out',
              clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)',
            }}
          ></div>
          
          {/* Valor central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold ${getStatusColor(complianceRate)}`}>
              {complianceRate}%
            </span>
          </div>
        </div>

        {/* Estadísticas detalladas */}
        <div className="text-center space-y-2 mb-4">
          <p className={`text-sm font-medium ${getStatusColor(complianceRate)}`}>
            {getStatusMessage(complianceRate)}
          </p>
          <p className="text-sm text-gray-600">
            {completedTasks} de {totalTasks} tareas completadas
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-500 ease-in-out"
            style={{
              width: `${complianceRate}%`,
              backgroundColor: complianceRate >= 70 ? '#10B981' : complianceRate >= 50 ? '#F59E0B' : '#EF4444'
            }}
          ></div>
        </div>

        {/* Leyenda */}
        <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
          <div>
            <span className="block font-semibold text-green-600">≥ 90%</span>
            <span className="text-gray-500">Excelente</span>
          </div>
          <div>
            <span className="block font-semibold text-yellow-500">70-89%</span>
            <span className="text-gray-500">Bueno</span>
          </div>
          <div>
            <span className="block font-semibold text-red-500">≤ 69%</span>
            <span className="text-gray-500">Atención</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceRateKPI;