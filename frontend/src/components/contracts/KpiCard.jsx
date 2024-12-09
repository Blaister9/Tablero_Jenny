// frontend/src/components/contracts/KpiCard.jsx
import React from 'react'
import numeral from 'numeral'

const KpiCard = ({ title, value, isCurrency = false, isPercentage = false }) => {
  let displayValue = value
  if (typeof value === 'number') {
    if (isCurrency) {
      displayValue = numeral(value).format('0,0.00')
    } else if (isPercentage) {
      displayValue = numeral(value).format('0.00') + '%'
    } else {
      displayValue = numeral(value).format('0,0')
    }
  }

  if (value === undefined || value === null) {
    displayValue = 'N/A'
  }

  return (
    <div className="border rounded p-6 bg-white shadow-sm flex flex-col items-center justify-center h-32">
      <h3 className="text-sm font-medium text-gray-700 mb-2 text-center">{title}</h3>
      <p className="text-xl font-bold text-gray-900 text-center">{displayValue}</p>
    </div>
  )
}

export default KpiCard
