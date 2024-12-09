// frontend/src/components/contracts/PieChartEstados.jsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import numeral from 'numeral'

const STATE_COLORS = {
  'Adjudicado 2024': '#2ecc71', 
  'Proceso pendiente 2024': '#f1c40f',
  'Otro estado X': '#e74c3c', // Agrega más colores según tus estados
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-white border rounded p-2 text-sm shadow-sm">
        <p className="font-semibold">Estado: {d.name}</p>
        <p>Contratos: {numeral(d.value).format('0,0')}</p>
      </div>
    )
  }
  return null
}

export default function PieChartEstados({ filters }) {
  const queryString = new URLSearchParams(filters).toString()

  const { data, isLoading, error } = useQuery({
    queryKey: ['estados-stats', filters],
    queryFn: async () => {
      const { data } = await api.get(`/contracts/estados-stats/?${queryString}`)
      return data
    }
  })

  if (isLoading) return <div>Cargando estados...</div>
  if (error) return <div className="text-red-500">Error al cargar estados</div>
  if (!data) return <div>Sin datos de estados</div>

  const chartData = Object.entries(data).map(([estado, count]) => ({
    name: estado,
    value: count
  }))

  return (
    <div className="border rounded p-6 bg-white shadow-sm">
      <h3 className="text-md font-semibold mb-4">Contratos por Estado</h3>
      <div className="w-full h-80 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie 
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%" cy="50%"
              outerRadius={100}
              label={({ name, value }) => `${name} (${value})`}
            >
              {chartData.map((entry, index) => {
                const color = STATE_COLORS[entry.name] || '#95a5a6'
                return <Cell key={`cell-${index}`} fill={color} />
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {Object.keys(STATE_COLORS).map((estado) => (
          <div key={estado} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: STATE_COLORS[estado] }}></div>
            <span className="text-sm">{estado}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
