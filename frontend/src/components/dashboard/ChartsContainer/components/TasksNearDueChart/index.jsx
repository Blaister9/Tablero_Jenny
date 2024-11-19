import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TasksNearDueChart = ({ data }) => {
  // Validación de datos
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Entregables próximos a vencer</h2>
        <p className="text-gray-500">No hay entregables próximos a vencer o vencidos.</p>
      </div>
    );
  }

  // Función para formatear los días restantes
  const formatDaysRemaining = (days) => {
    if (days < 0) {
      return `Vencida hace ${Math.abs(days)} días`;
    } else if (days === 0) {
      return 'Vence hoy';
    } else if (days === 1) {
      return 'Vence mañana';
    }
    return `${days} días restantes`;
  };

  // Procesar datos para el gráfico
  const chartData = useMemo(() => {
    const groupedTasks = data.reduce((acc, task) => {
      // Determinar la etiqueta del grupo
      let weekLabel;
      if (task.daysUntilDue < 0) {
        weekLabel = 'Vencidas';
      } else {
        const weekKey = Math.floor(task.daysUntilDue / 7);
        weekLabel = weekKey === 0 ? 'Esta semana' : `En ${weekKey + 1} semanas`;
      }

      if (!acc[weekLabel]) {
        acc[weekLabel] = {
          label: weekLabel,
          total: 0,
          critical: 0,
          warning: 0,
          normal: 0,
          tasks: []
        };
      }

      acc[weekLabel].total++;
      // Si está vencida o es crítica, incrementar contador critical
      if (task.daysUntilDue < 0 || task.daysUntilDue <= 7) {
        acc[weekLabel].critical++;
      } else if (task.daysUntilDue <= 30) {
        acc[weekLabel].warning++;
      } else {
        acc[weekLabel].normal++;
      }

      acc[weekLabel].tasks.push({
        title: task.title,
        deliverable: task.deliverable || 'Sin entregable definido',
        daysLeft: task.daysUntilDue,
        priority: task.daysUntilDue < 0 ? 'critical' : task.priority,
        area: task.area,
        strategic_line: task.strategic_line
      });

      return acc;
    }, {});

    // Convertir a array y ordenar (Vencidas primero, luego por semanas)
    return Object.entries(groupedTasks)
      .map(([label, data]) => ({
        name: label,
        ...data
      }))
      .sort((a, b) => {
        if (a.name === 'Vencidas') return -1;
        if (b.name === 'Vencidas') return 1;
        if (a.name === 'Esta semana') return -1;
        if (b.name === 'Esta semana') return 1;
        return a.name.localeCompare(b.name);
      });
  }, [data]);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const weekData = chartData.find(item => item.name === label);
    if (!weekData) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200" style={{ maxWidth: '400px' }}>
        <h3 className="font-bold text-gray-900 mb-3 sticky top-0 bg-white">
          {label} - {weekData.total} entregables
        </h3>
        <div className="overflow-auto" style={{ maxHeight: '400px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {weekData.tasks.map((task, idx) => (
            <div 
              key={idx} 
              className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-b-0 border-gray-100"
            >
              <div className="flex items-start gap-2">
                <span className={`inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  task.daysLeft < 0 ? 'bg-red-600' :
                  task.daysLeft <= 7 ? 'bg-red-500' :
                  task.daysLeft <= 30 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 break-words">
                    {task.deliverable}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 break-words italic">
                    Meta: {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 mt-2 text-xs text-gray-500">
                    <span className="inline-flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                      {task.area}
                    </span>
                    <span className={`inline-flex items-center ${
                      task.daysLeft < 0 ? 'text-red-600 font-semibold' :
                      task.daysLeft <= 7 ? 'text-red-500' :
                      task.daysLeft <= 30 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {formatDaysRemaining(task.daysLeft)}
                    </span>
                    <span className="text-xs text-gray-400 block w-full mt-1">
                      Línea: {task.strategic_line}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Entregables próximos a vencer</h2>
        <div className="text-sm text-gray-500">
          Total: {data.length} entregables
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            barGap={0}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                value: 'Cantidad de entregables', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              wrapperStyle={{ zIndex: 1000 }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
            />
            <Legend />
            <Bar 
              dataKey="critical" 
              name="Críticos/Vencidos" 
              stackId="a" 
              fill="#EF4444"
            />
            <Bar 
              dataKey="warning" 
              name="Próximos" 
              stackId="a" 
              fill="#F59E0B"
            />
            <Bar 
              dataKey="normal" 
              name="A tiempo" 
              stackId="a" 
              fill="#10B981"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda detallada */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="font-medium text-red-700">Críticos/Vencidos</span>
          </div>
          <p className="text-xs text-red-600">
            Tareas vencidas o con 7 días o menos para vencer
          </p>
          <p className="text-lg font-bold text-red-700 mt-2">
            {data.filter(t => t.daysUntilDue < 0 || t.daysUntilDue <= 7).length}
          </p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="font-medium text-yellow-700">Próximos</span>
          </div>
          <p className="text-xs text-yellow-600">
            Entre 8 y 30 días para vencer
          </p>
          <p className="text-lg font-bold text-yellow-700 mt-2">
            {data.filter(t => t.daysUntilDue > 7 && t.daysUntilDue <= 30).length}
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="font-medium text-green-700">A tiempo</span>
          </div>
          <p className="text-xs text-green-600">
            Más de 30 días para vencer
          </p>
          <p className="text-lg font-bold text-green-700 mt-2">
            {data.filter(t => t.daysUntilDue > 30).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TasksNearDueChart;