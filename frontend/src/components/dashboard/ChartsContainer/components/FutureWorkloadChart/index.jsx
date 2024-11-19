import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const FutureWorkloadChart = ({ data }) => {
  // Función para formatear la etiqueta del mes (movida arriba)
  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString('es', { month: 'short' }) + ' ' + year;
  };

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.map(month => ({
      name: formatMonthLabel(month.month),
      Críticas: month.critical,
      Advertencia: month.warning,
      Normales: month.normal,
      total: month.total
    }));
  }, [data]);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-2">{label}</h3>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="text-sm">{entry.name}:</span>
              </div>
              <span className="text-sm font-semibold ml-4">
                {entry.value} tareas
              </span>
            </div>
          ))}
          <div className="pt-1 mt-1 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total:</span>
              <span className="font-bold">
                {payload[0].payload.total} tareas
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!chartData.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Carga de Trabajo Futura</h2>
        <p className="text-gray-500">No hay datos disponibles para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Carga de Trabajo Futura</h2>
        <div className="text-sm text-gray-500">
          Total de tareas: {chartData.reduce((acc, month) => acc + month.total, 0)}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ 
                value: 'Cantidad de tareas', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="Críticas" 
              stackId="a" 
              fill="#EF4444" // Rojo para tareas críticas
            />
            <Bar 
              dataKey="Advertencia" 
              stackId="a" 
              fill="#F59E0B" // Naranja para advertencias
            />
            <Bar 
              dataKey="Normales" 
              stackId="a" 
              fill="#10B981" // Verde para normales
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen estadístico */}
      <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">
            {chartData.reduce((acc, month) => acc + month.Críticas, 0)}
          </p>
          <p className="text-sm text-gray-500">Críticas</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-500">
            {chartData.reduce((acc, month) => acc + month.Advertencia, 0)}
          </p>
          <p className="text-sm text-gray-500">Advertencia</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-500">
            {chartData.reduce((acc, month) => acc + month.Normales, 0)}
          </p>
          <p className="text-sm text-gray-500">Normales</p>
        </div>
      </div>
    </div>
  );
};

export default FutureWorkloadChart;