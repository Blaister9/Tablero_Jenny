// frontend/src/components/contracts/BarChartRubro.jsx
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import numeral from 'numeral'

function truncateLabel(label, maxLength = 10) {
  if (!label) return ''
  return label.length > maxLength ? label.substring(0, maxLength) + '…' : label
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-sm text-sm">
        <p className="font-semibold">{label}</p>
        <p>Valor: {numeral(payload[0].value).format('0,0.00')}</p>
      </div>
    )
  }
  return null
}

const BarChartRubro = ({ data }) => {
  const truncatedData = data.map(item => ({
    ...item,
    rubro: truncateLabel(item.rubro, 10)
  }))

  return (
    <div className="border rounded p-6 bg-white shadow-sm">
      <h3 className="text-md font-semibold mb-4">Top Rubros por Valor Asignado 2024</h3>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={truncatedData} margin={{ top: 30, right: 30, bottom: 100, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="rubro"
              tick={{ fontSize: 12 }}
              interval={0}
              height={100}
            />
            <YAxis tickFormatter={(value) => numeral(value).format('0,0')} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" fill="#8884d8" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BarChartRubro
