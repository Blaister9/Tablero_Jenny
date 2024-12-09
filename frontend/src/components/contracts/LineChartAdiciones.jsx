// frontend/src/components/contracts/LineChartAdiciones.jsx
import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import numeral from 'numeral'

const meses = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded p-2 text-sm shadow-sm">
        <p className="font-semibold">{meses[label] || label}</p>
        <p>Adiciones: {numeral(payload[0].value).format('0,0.00')}</p>
      </div>
    )
  }
  return null
}

const LineChartAdiciones = ({ data }) => {
  const formattedData = data.map(d => ({ ...d, mesLabel: meses[d.mes] || d.mes }))

  return (
    <div className="border rounded p-6 bg-white shadow-sm">
      <h3 className="text-md font-semibold mb-4">Distribución Mensual de Adiciones</h3>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 30, right: 30, bottom: 50, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="mesLabel" 
              tick={{ fontSize:12 }}
              height={50}
            />
            <YAxis tickFormatter={(value) => numeral(value).format('0,0')} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="total" stroke="#FF7F50" dot={true} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default LineChartAdiciones
