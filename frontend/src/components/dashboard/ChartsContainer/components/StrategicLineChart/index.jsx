import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StrategicLineChart = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Estado por Línea Estratégica</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Pendiente" stackId="a" fill="#EAB308" />
            <Bar dataKey="En proceso" stackId="a" fill="#2563EB" />
            <Bar dataKey="Cumplido" stackId="a" fill="#16A34A" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StrategicLineChart;