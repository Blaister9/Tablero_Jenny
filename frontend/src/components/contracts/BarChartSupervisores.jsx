// frontend/src/components/contracts/BarChartSupervisores.jsx
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import numeral from 'numeral'

function truncateLabel(label, maxLength = 10) {
  if (!label) return ''
  return label.length > maxLength ? label.substring(0, maxLength) + '…' : label
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const info = payload[0].payload
    return (
      <div className="bg-white border rounded p-2 text-sm shadow-sm">
        <p className="font-semibold">{info.supervisor_contrato}</p>
        <p>Contratos: {info.count}</p>
        <p>Valor Final: {numeral(info.valor).format('0,0.00')}</p>
      </div>
    )
  }
  return null
}

const BarChartSupervisores = ({ data }) => {
  const truncatedData = data.map(item => ({
    ...item,
    supervisor_contrato: truncateLabel(item.supervisor_contrato, 10)
  }))

  return (
    <div className="border rounded p-6 bg-white shadow-sm">
      <h3 className="text-md font-semibold mb-4">Supervisores y Valor de Contratos</h3>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={truncatedData} margin={{ top: 30, right: 30, bottom: 100, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="supervisor_contrato"
              tick={{ fontSize: 12 }}
              interval={0}
              height={100}
            />
            <YAxis tickFormatter={(val)=>numeral(val).format('0,0')} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="valor" fill="#8DD3C7" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BarChartSupervisores
