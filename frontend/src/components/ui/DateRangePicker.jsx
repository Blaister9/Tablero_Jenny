// frontend/src/components/ui/DateRangePicker.jsx
import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const DateRangePicker = ({ startDate, endDate, onChange, className='' }) => {
  const [localStartDate, setLocalStartDate] = useState(startDate || null)
  const [localEndDate, setLocalEndDate] = useState(endDate || null)

  const handleStartChange = (date) => {
    setLocalStartDate(date)
    onChange && onChange({ start: date, end: localEndDate })
  }

  const handleEndChange = (date) => {
    setLocalEndDate(date)
    onChange && onChange({ start: localStartDate, end: date })
  }

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Inicio Desde</label>
        <DatePicker
          selected={localStartDate}
          onChange={handleStartChange}
          className="border p-1 rounded w-40"
          placeholderText="Seleccione fecha"
          dateFormat="yyyy-MM-dd"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Inicio Hasta</label>
        <DatePicker
          selected={localEndDate}
          onChange={handleEndChange}
          className="border p-1 rounded w-40"
          placeholderText="Seleccione fecha"
          dateFormat="yyyy-MM-dd"
        />
      </div>
    </div>
  )
}

export default DateRangePicker
