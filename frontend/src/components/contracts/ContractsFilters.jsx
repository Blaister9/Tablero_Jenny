// frontend/src/components/contracts/ContractsFilters.jsx
import React, { useState } from 'react'
import { useAllFilterOptions } from '../../hooks/useAllFilterOptions'
import AutocompleteInput from '../ui/AutocompleteInput'
import DateRangePicker from '../ui/DateRangePicker'

const ContractsFilters = ({ onChange }) => {
  const { data, isLoading, error } = useAllFilterOptions()

  const [anio, setAnio] = useState('')
  const [rubroValue, setRubroValue] = useState('')
  const [contratistaValue, setContratistaValue] = useState('')
  const [fechaInicio, setFechaInicio] = useState(null)
  const [fechaFin, setFechaFin] = useState(null)
  const [grupoValue, setGrupoValue] = useState('')
  const [subgrupoValue, setSubgrupoValue] = useState('')
  const [areaValue, setAreaValue] = useState('')
  const [tipoProcesoValue, setTipoProcesoValue] = useState('')
  const [sistemaPubValue, setSistemaPubValue] = useState('')
  const [impactoValue, setImpactoValue] = useState('')
  const [supervisorValue, setSupervisorValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onChange({
      anio,
      rubro: rubroValue,
      contratista: contratistaValue,
      fecha_inicio_desde: fechaInicio ? fechaInicio.toISOString().split('T')[0] : '',
      fecha_inicio_hasta: fechaFin ? fechaFin.toISOString().split('T')[0] : '',
      grupo: grupoValue,
      subgrupo: subgrupoValue,
      area: areaValue,
      tipo_proceso: tipoProcesoValue,
      sistema_publicacion: sistemaPubValue,
      impacto: impactoValue,
      supervisor: supervisorValue
    })
  }

  const handleReset = () => {
    setAnio('')
    setRubroValue('')
    setContratistaValue('')
    setFechaInicio(null)
    setFechaFin(null)
    setGrupoValue('')
    setSubgrupoValue('')
    setAreaValue('')
    setTipoProcesoValue('')
    setSistemaPubValue('')
    setImpactoValue('')
    setSupervisorValue('')
    onChange({})
  }

  const handleDateRangeChange = ({ start, end }) => {
    setFechaInicio(start)
    setFechaFin(end)
  }

  if (isLoading) return <div>Cargando opciones de filtros...</div>
  if (error) return <div className="text-red-500">Error al cargar filtros</div>
  if (!data) return <div>Sin datos de filtros</div>

  const { anios, rubros, contratistas, grupos, subgrupos, areas, tipos_proceso, sistemas_publicacion, impactos, supervisores } = data

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-sm flex flex-wrap gap-6 items-end">
      <div className="flex flex-col w-32">
        <label className="text-sm font-medium mb-1">Año</label>
        <select value={anio} onChange={e => setAnio(e.target.value)} className="border p-1 rounded">
          <option value="">Todos</option>
          {anios.map((year, idx) => (
            <option key={idx} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col w-48">
        <label className="text-sm font-medium mb-1">Rubro</label>
        <AutocompleteInput
          options={rubros}
          value={rubroValue}
          onChange={() => {}}
          onSelect={(val) => setRubroValue(val)}
          placeholder="Rubro"
        />
      </div>

      <div className="flex flex-col w-48">
        <label className="text-sm font-medium mb-1">Contratista</label>
        <AutocompleteInput
          options={contratistas}
          value={contratistaValue}
          onChange={() => {}}
          onSelect={(val) => setContratistaValue(val)}
          placeholder="Contratista"
        />
      </div>

      <div className="flex flex-col w-48">
        <label className="text-sm font-medium mb-1">Grupo</label>
        <AutocompleteInput
          options={grupos}
          value={grupoValue}
          onChange={() => {}}
          onSelect={(val) => setGrupoValue(val)}
          placeholder="Grupo"
        />
      </div>

      <div className="flex flex-col w-48">
        <label className="text-sm font-medium mb-1">Subgrupo</label>
        <AutocompleteInput
          options={subgrupos}
          value={subgrupoValue}
          onChange={() => {}}
          onSelect={(val) => setSubgrupoValue(val)}
          placeholder="Subgrupo"
        />
      </div>

      <div className="flex flex-col w-48">
        <label className="text-sm font-medium mb-1">Área</label>
        <AutocompleteInput
          options={areas}
          value={areaValue}
          onChange={() => {}}
          onSelect={(val) => setAreaValue(val)}
          placeholder="Área"
        />
      </div>

      <div className="flex flex-col w-48">
        <label className="text-sm font-medium mb-1">Tipo Proceso</label>
        <AutocompleteInput
          options={tipos_proceso}
          value={tipoProcesoValue}
          onChange={() => {}}
          onSelect={(val) => setTipoProcesoValue(val)}
          placeholder="Tipo de Proceso"
        />
      </div>

      <div className="flex flex-col w-48">
        <label className="text-sm font-medium mb-1">Sistema Pub.</label>
        <AutocompleteInput
          options={sistemas_publicacion}
          value={sistemaPubValue}
          onChange={() => {}}
          onSelect={(val) => setSistemaPubValue(val)}
          placeholder="Sistema Publicación"
        />
      </div>

      <div className="flex flex-col w-48">
        <label className="text-sm font-medium mb-1">Impacto</label>
        <AutocompleteInput
          options={impactos}
          value={impactoValue}
          onChange={() => {}}
          onSelect={(val) => setImpactoValue(val)}
          placeholder="Impacto"
        />
      </div>

      <div className="flex flex-col w-48">
        <label className="text-sm font-medium mb-1">Supervisor</label>
        <AutocompleteInput
          options={supervisores}
          value={supervisorValue}
          onChange={() => {}}
          onSelect={(val) => setSupervisorValue(val)}
          placeholder="Supervisor"
        />
      </div>

      <div className="flex flex-col">
        <DateRangePicker startDate={fechaInicio} endDate={fechaFin} onChange={handleDateRangeChange} />
      </div>

      <div className="flex gap-4">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow font-medium">Aplicar</button>
        <button type="button" onClick={handleReset} className="bg-gray-300 px-4 py-2 rounded shadow font-medium">Reset</button>
      </div>
    </form>
  )
}

export default ContractsFilters
