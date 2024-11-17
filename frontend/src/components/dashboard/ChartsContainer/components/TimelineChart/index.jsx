import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TimelineChart = ({ data }) => {
  const formatData = data.map((task, index) => ({
    x: task.due_date.getTime(),
    y: index,
    name: task.title,
    status: task.status,
    line: task.strategic_line,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Línea: {data.line}</p>
          <p className="text-sm">Estado: {data.status}</p>
          <p className="text-sm">
            Fecha: {new Date(data.x).toLocaleDateString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Línea de Tiempo de Tareas</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              domain={['dataMin', 'dataMax']}
              type="number"
              tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
              name="Fecha"
            />
            <YAxis dataKey="y" hide />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Scatter
              name="Pendiente"
              data={formatData.filter(d => d.status === 'Pendiente')}
              fill="#EAB308"
            />
            <Scatter
              name="En proceso"
              data={formatData.filter(d => d.status === 'En proceso')}
              fill="#2563EB"
            />
            <Scatter
              name="Cumplido"
              data={formatData.filter(d => d.status === 'Cumplido')}
              fill="#16A34A"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimelineChart;