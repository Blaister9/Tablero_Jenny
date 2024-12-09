// frontend/src/components/contracts/ContractsDashboard.jsx
import React, { useState } from 'react'
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

const ContractsDashboard = () => {
  const [filters, setFilters] = useState({})
  const { data, isLoading, error } = useContractsKPIs(filters)
  const { data: adicionesData, isLoading: adLoading, error: adError } = useAdicionesStats()
  const { data: supervisoresData, isLoading: supLoading, error: supError } = useSupervisoresStats()
  const { data: sistemasData, isLoading: sisLoading, error: sisError } = useSistemasInfoStats()

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

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-10 bg-gray-50 space-y-12">
      <h1 className="text-3xl font-bold">Dashboard de Contratos</h1>
      
      <ContractsFilters onChange={setFilters} />

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
    </div>
  )
}

export default ContractsDashboard
