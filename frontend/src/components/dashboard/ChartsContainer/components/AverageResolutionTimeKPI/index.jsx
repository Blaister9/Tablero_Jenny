import React from 'react';

const AverageResolutionTimeKPI = ({ averageTime = 0 }) => {
  // Para debug
  console.log('Average Time recibido:', averageTime);

  // Validar y formatear el tiempo promedio
  const isValidTime = typeof averageTime === 'number' && !isNaN(averageTime);
  const formattedTime = isValidTime ? parseFloat(averageTime).toFixed(1) : '0.0';

  // Función para determinar el estado basado en el tiempo promedio
  const getTimeStatus = (time) => {
    const numTime = parseFloat(time);
    if (!isValidTime || isNaN(numTime)) return { color: 'text-gray-400', message: 'Sin datos suficientes' };
    if (numTime <= 15) return { color: 'text-green-600', message: 'Excelente tiempo de respuesta' };
    if (numTime <= 30) return { color: 'text-yellow-500', message: 'Tiempo de respuesta aceptable' };
    return { color: 'text-red-500', message: 'Requiere optimización' };
  };

  const timeStatus = getTimeStatus(formattedTime);

  // Convertir días a una representación más legible
  const getTimeBreakdown = (days) => {
    if (!isValidTime || isNaN(days)) return 'Sin datos';
    
    const numDays = parseFloat(days);
    const weeks = Math.floor(numDays / 7);
    const remainingDays = Math.round(numDays % 7);
    
    if (weeks === 0) return `${remainingDays} días`;
    if (weeks === 1) return remainingDays > 0 ? `1 semana y ${remainingDays} días` : '1 semana';
    return remainingDays > 0 ? `${weeks} semanas y ${remainingDays} días` : `${weeks} semanas`;
  };

  // Calcular el porcentaje para la barra de progreso
  const getProgressPercent = (time) => {
    if (!isValidTime || isNaN(time)) return 0;
    return Math.min((parseFloat(time) / 45) * 100, 100);
  };

  const getProgressColor = () => {
    if (!isValidTime) return '#CBD5E0'; // gray-400 para datos no válidos
    return timeStatus.color === 'text-green-600' ? '#10B981' : 
           timeStatus.color === 'text-yellow-500' ? '#F59E0B' : '#EF4444';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4">Tiempo Promedio de Resolución</h3>

        {/* Visualización principal */}
        <div className="relative w-40 h-40 mb-4">
          {/* Círculo de fondo */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
          
          {/* Indicador de tiempo */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-bold ${timeStatus.color}`}>
              {formattedTime}
            </span>
            <span className="text-sm text-gray-500">días</span>
          </div>

          {/* Decoración circular animada */}
          <div 
            className="absolute inset-0 rounded-full border-4 border-transparent animate-pulse"
            style={{ borderTopColor: getProgressColor() }}
          ></div>
        </div>

        {/* Mensaje de estado */}
        <p className={`text-sm font-medium ${timeStatus.color} mb-4`}>
          {timeStatus.message}
        </p>

        {/* Tiempo desglosado */}
        <p className="text-sm text-gray-600 mb-4">
          {getTimeBreakdown(formattedTime)}
        </p>

        {/* Barra de progreso */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full transition-all duration-500 ease-in-out"
            style={{
              width: `${getProgressPercent(formattedTime)}%`,
              backgroundColor: getProgressColor()
            }}
          ></div>
        </div>

        {/* Leyenda de métricas */}
        <div className="grid grid-cols-3 gap-4 w-full text-center text-sm">
          <div>
            <span className="block font-semibold text-green-600">≤ 15 días</span>
            <span className="text-gray-500">Óptimo</span>
          </div>
          <div>
            <span className="block font-semibold text-yellow-500">16-30 días</span>
            <span className="text-gray-500">Aceptable</span>
          </div>
          <div>
            <span className="block font-semibold text-red-500"> 30 días</span>
            <span className="text-gray-500">Demorado</span>
          </div>
        </div>

        {/* Tip o recomendación */}
        {isValidTime && parseFloat(formattedTime) > 30 && (
          <div className="mt-4 text-sm text-gray-600 bg-red-50 p-3 rounded-lg">
            <span className="font-medium">Sugerencia:</span> Considerar revisar los procesos para reducir el tiempo de resolución.
          </div>
        )}

        {/* Mensaje cuando no hay datos */}
        {!isValidTime && (
          <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            No hay suficientes datos para calcular el tiempo promedio de resolución.
          </div>
        )}
      </div>
    </div>
  );
};

export default AverageResolutionTimeKPI;