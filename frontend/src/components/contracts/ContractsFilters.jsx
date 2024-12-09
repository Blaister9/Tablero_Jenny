// frontend/src/components/contracts/ContractsFilters.jsx
import React, { useState } from 'react'
import { useContratistaOptions } from '../../hooks/useContratistaOptions'
import { useRubroOptions } from '../../hooks/useRubroOptions'
import { useAniosDisponibles } from '../../hooks/useAniosDisponibles'
import AutocompleteInput from '../ui/AutocompleteInput'
import DateRangePicker from '../ui/DateRangePicker'

const ContractsFilters = ({ onChange }) => {
  const { data: contratistas, isLoading: loadingContratistas } = useContratistaOptions()
  const { data: rubros, isLoading: loadingRubros } = useRubroOptions()
  const { data: anios, isLoading: loadingAnios } = useAniosDisponibles()

  const [anio, setAnio] = useState('')
  const [rubroValue, setRubroValue] = useState('')
  const [contratistaValue, setContratistaValue] = useState('')
  const [fechaInicio, setFechaInicio] = useState(null)
  const [fechaFin, setFechaFin] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    onChange({
      anio,
      rubro: rubroValue,
      contratista: contratistaValue,
      fecha_inicio_desde: fechaInicio ? fechaInicio.toISOString().split('T')[0] : '',
      fecha_inicio_hasta: fechaFin ? fechaFin.toISOString().split('T')[0] : ''
    })
  }

  const handleReset = () => {
    setAnio('')
    setRubroValue('')
    setContratistaValue('')
    setFechaInicio(null)
    setFechaFin(null)
    onChange({})
  }

  const handleDateRangeChange = ({ start, end }) => {
    setFechaInicio(start)
    setFechaFin(end)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-sm flex flex-wrap items-end gap-6">
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Año</label>
        {loadingAnios ? (
          <div className="text-sm text-gray-500">Cargando...</div>
        ) : (
          <select
            value={anio}
            onChange={e => setAnio(e.target.value)}
            className="border p-1 rounded w-32"
          >
            <option value="">Todos</option>
            {anios.map((year, idx) => (
              <option key={idx} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col w-48">
        <label className="text-sm font-medium mb-1">Rubro</label>
        {loadingRubros ? (
          <div className="text-sm text-gray-500 mt-2">Cargando...</div>
        ) : (
          <AutocompleteInput
            options={rubros}
            value={rubroValue}
            onChange={() => {}}
            onSelect={(val) => setRubroValue(val)}
            placeholder="Seleccione Rubro"
          />
        )}
      </div>

      <div className="flex flex-col w-48">
        <label className="text-sm font-medium mb-1">Contratista</label>
        {loadingContratistas ? (
          <div className="text-sm text-gray-500 mt-2">Cargando...</div>
        ) : (
          <AutocompleteInput
            options={contratistas}
            value={contratistaValue}
            onChange={() => {}}
            onSelect={(val) => setContratistaValue(val)}
            placeholder="Seleccione Contratista"
          />
        )}
      </div>

      <div className="flex flex-col">
        <DateRangePicker
          startDate={fechaInicio}
          endDate={fechaFin}
          onChange={handleDateRangeChange}
        />
      </div>

      <div className="flex gap-4">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow font-medium">Aplicar</button>
        <button type="button" onClick={handleReset} className="bg-gray-300 px-4 py-2 rounded shadow font-medium">Reset</button>
      </div>
    </form>
  )
}

export default ContractsFilters
