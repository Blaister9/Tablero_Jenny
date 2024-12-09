// frontend/src/components/contracts/PieChartSistemas.jsx
import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import numeral from 'numeral'

function truncateLabel(label, maxLength = 10) {
  if (!label) return ''
  return label.length > maxLength ? label.substring(0, maxLength) + '…' : label
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#F1C40F']

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-white border rounded p-2 text-sm shadow-sm">
        <p className="font-semibold">{d.name}</p>
        <p>Contratos: {numeral(d.count).format('0,0')}</p>
        <p>Valor: {numeral(d.valor).format('0,0.00')}</p>
      </div>
    )
  }
  return null
}

const PieChartSistemas = ({ data }) => {
  const chartData = data.map(d => {
    const shortName = truncateLabel(d.sistema_publicacion || 'N/D', 10)
    return { name: shortName, value: d.count, ...d }
  })

  return (
    <div className="border rounded p-6 bg-white shadow-sm">
      <h3 className="text-md font-semibold mb-4">Distribución por Sistema de Información</h3>
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
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PieChartSistemas
