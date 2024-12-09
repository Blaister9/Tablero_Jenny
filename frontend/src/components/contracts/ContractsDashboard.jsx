// frontend/src/components/contracts/ContractsDashboard.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useContractsKPIs } from '../../hooks/useContractsKPIs'
import ContractsFilters from './ContractsFilters'
import KpiCard from './KpiCard'
import BarChartRubro from './BarChartRubro'
import LineChartMes from './LineChartMes'
import PieChartProceso from './PieChartProceso'
import BarChartContratistas from './BarChartContratistas'
import { useAdicionesStats } from '../../hooks/useAdicionesStats'
import { useSupervisoresStats } from '../../hooks/useSupervisoresStats'
import { useSistemasInfoStats } from '../../hooks/useSistemasInfoStats'
import LineChartAdiciones from './LineChartAdiciones'
import BarChartSupervisores from './BarChartSupervisores'
import PieChartSistemas from './PieChartSistemas'
import PieChartEstados from './PieChartEstados' // Nuevo gráfico para estados
import ContractFormModal from './ContractFormModal'
import { useQueryClient } from '@tanstack/react-query'
import ContractsTable from './ContractsTable'



const ContractsDashboard = () => {
  const [filters, setFilters] = useState({})
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  // Cada vez que cambien filters, volvemos a hacer fetch
  const { data, isLoading, error } = useContractsKPIs(filters)
  const { data: adicionesData, isLoading: adLoading, error: adError } = useAdicionesStats(filters)
  const { data: supervisoresData, isLoading: supLoading, error: supError } = useSupervisoresStats(filters)
  const { data: sistemasData, isLoading: sisLoading, error: sisError } = useSistemasInfoStats(filters)
  

  if (isLoading) return <div className="p-4">Cargando KPIs...</div>
  if (error) return <div className="p-4 text-red-500">Error al cargar KPIs</div>
  if (!data) return <div className="p-4">Sin datos</div>

  const { kpis_generales, top_rubros_valor_2024, valor_por_mes_2024, contratos_por_proceso, top_contratistas_valor } = data

  const porcentajeAdjudicados = (kpis_generales && kpis_generales.total_contratos > 0)
    ? (kpis_generales.contratos_adjudicados / kpis_generales.total_contratos) * 100
    : 0
  const porcentajeEjecucion = (kpis_generales && kpis_generales.valor_total_asignado_2024 > 0)
    ? (kpis_generales.valor_ejecutado_2024 / kpis_generales.valor_total_asignado_2024) * 100
    : 0

  const adCount = adicionesData?.count_adiciones || 0
  const adTotal = adicionesData?.total_adiciones || 0
  const adPromedio = adicionesData?.promedio_adiciones || 0
  const adDist = adicionesData?.distribucion_mensual || []
  const supervisores = supervisoresData || []
  const sistemas = sistemasData || []

  // Funcion para actualizar filtros desde ContractsFilters
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  // Para mostrar chips de filtros activos
  // Mostraremos solo los filtros que no estén vacíos o "todos"
  const activeFilters = Object.entries(filters).filter(([key, val]) => val && val !== '' && val !== 'todos' && val !== 'N/A')

  const removeFilter = (filterKey) => {
    const updated = { ...filters }
    delete updated[filterKey]
    setFilters(updated)
  }

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-10 bg-gray-50 space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard de Contratos</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-green-600 text-white px-4 py-2 rounded shadow font-medium hover:bg-green-700"
          >
            Nuevo Contrato
          </button>
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-4 py-2 rounded shadow font-medium hover:bg-blue-700"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>

      {showModal && (
        <ContractFormModal 
          onClose={() => setShowModal(false)} 
          onSuccess={() => { 
            queryClient.invalidateQueries('contracts-kpis')
            queryClient.invalidateQueries('adiciones-stats')
            queryClient.invalidateQueries('supervisores-stats')
            queryClient.invalidateQueries('sistemas-info-stats')
            queryClient.invalidateQueries('estados-stats')
          }}
        />
      )}      
      
      <ContractsFilters onChange={handleFiltersChange} />

      {/* Mostrar filtros activos como chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(([key, val]) => (
            <div key={key} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <span>{key}: {val}</span>
              <button 
                onClick={() => removeFilter(key)} 
                className="text-blue-800 hover:text-blue-900 font-bold"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-8">
        <KpiCard title="Total Contratos" value={kpis_generales?.total_contratos} />
        <KpiCard title="Valor Total Asignado 2024" value={kpis_generales?.valor_total_asignado_2024} isCurrency />
        <KpiCard title="% Adjudicados" value={porcentajeAdjudicados} isPercentage />
        <KpiCard title="% Ejecución 2024" value={porcentajeEjecucion} isPercentage />
      </div>

      <div className="grid grid-cols-4 gap-8">
        <KpiCard title="Valor Total Final" value={kpis_generales?.valor_total_final} isCurrency />
        <KpiCard title="Valor Promedio Final" value={kpis_generales?.valor_promedio_final} isCurrency />
        <KpiCard title="Contratos Adjudicados" value={kpis_generales?.contratos_adjudicados} />
        <KpiCard title="Valor Ejecutado 2024" value={kpis_generales?.valor_ejecutado_2024} isCurrency />
      </div>

      <div className="grid grid-cols-2 gap-12">
        <BarChartRubro data={top_rubros_valor_2024 || []} />
        <LineChartMes data={valor_por_mes_2024 || []} />
      </div>

      <div className="grid grid-cols-2 gap-12">
        <PieChartProceso data={contratos_por_proceso || []} />
        <BarChartContratistas data={top_contratistas_valor || []} />
      </div>

      <h2 className="text-2xl font-bold">Adiciones (Prórrogas)</h2>
      {adLoading ? (
        <div className="text-gray-500 mt-4">Cargando datos de adiciones...</div>
      ) : adError ? (
        <div className="text-red-500 mt-4">Error al cargar adiciones</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-8 mt-4">
            <KpiCard title="Contratos con Adiciones" value={adCount} />
            <KpiCard title="Total Adiciones" value={adTotal} isCurrency />
            <KpiCard title="Promedio Adiciones" value={adPromedio} isCurrency />
          </div>
          <div className="mt-8">
            <LineChartAdiciones data={adDist} />
          </div>
        </>
      )}

      <h2 className="text-2xl font-bold">Supervisores</h2>
      {supLoading ? (
        <div className="text-gray-500 mt-4">Cargando datos de supervisores...</div>
      ) : supError ? (
        <div className="text-red-500 mt-4">Error al cargar supervisores</div>
      ) : (
        <div className="mt-8">
          <BarChartSupervisores data={supervisores} />
        </div>
      )}

      <h2 className="text-2xl font-bold">Sistemas de Información</h2>
      {sisLoading ? (
        <div className="text-gray-500 mt-4">Cargando datos de sistemas...</div>
      ) : sisError ? (
        <div className="text-red-500 mt-4">Error al cargar sistemas</div>
      ) : (
        <div className="mt-8">
          <PieChartSistemas data={sistemas} />
        </div>
      )}

      <h2 className="text-2xl font-bold">Estados del Contrato</h2>
      {/* Aquí mostramos un nuevo gráfico de estados con leyenda de colores */}
      <PieChartEstados filters={filters} />
      <ContractsTable filters={filters} />
    </div>
  )
}

export default ContractsDashboard
