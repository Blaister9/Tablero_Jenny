import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MonthlyProgressChart = ({ data }) => {
  const sortedData = data.sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Progreso Mensual</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Pendiente" stroke="#EAB308" />
            <Line type="monotone" dataKey="En proceso" stroke="#2563EB" />
            <Line type="monotone" dataKey="Cumplido" stroke="#16A34A" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyProgressChart;