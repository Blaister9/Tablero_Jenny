// frontend/src/components/contracts/ContractFormModal.jsx
import React, { useState } from 'react'
import api from '../../api/axios'
import { useQueryClient } from '@tanstack/react-query'

export default function ContractFormModal({ onClose, onSuccess }) {
  const queryClient = useQueryClient()

  // Campos del contrato, ajusta según tu modelo
  const [numero_contrato, setNumeroContrato] = useState('')
  const [rubro, setRubro] = useState('')
  const [anio_paa, setAnioPaa] = useState('')
  const [nombre_contratista, setNombreContratista] = useState('')
  const [grupo, setGrupo] = useState('')
  const [subgrupo, setSubgrupo] = useState('')
  const [area_pertenece, setAreaPertenece] = useState('')
  const [tipo_proceso, setTipoProceso] = useState('')
  const [sistema_publicacion, setSistemaPublicacion] = useState('')
  const [impacto, setImpacto] = useState('')
  const [adjudicado, setAdjudicado] = useState('')
  const [valor_total_final_contrato, setValorTotalFinal] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        numero_contrato,
        rubro: rubro || null,
        anio_paa: anio_paa ? parseInt(anio_paa) : null,
        nombre_contratista: nombre_contratista || null,
        grupo: grupo || null,
        subgrupo: subgrupo || null,
        area_pertenece: area_pertenece || null,
        tipo_proceso: tipo_proceso || null,
        sistema_publicacion: sistema_publicacion || null,
        impacto: impacto || null,
        adjudicado: adjudicado || null,
        valor_total_final_contrato: valor_total_final_contrato ? parseFloat(valor_total_final_contrato) : null,
        // Agrega más campos si tu modelo los tiene
      }
      await api.post('/contracts/contracts/', payload)
      // Invalida la cache para refrescar datos
      queryClient.invalidateQueries('contracts-kpis')
      queryClient.invalidateQueries('adiciones-stats')
      queryClient.invalidateQueries('supervisores-stats')
      queryClient.invalidateQueries('sistemas-info-stats')
      queryClient.invalidateQueries('estados-stats')
      onSuccess && onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
      alert('Error al crear el contrato')
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">Crear Nuevo Contrato</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-auto">
          <div>
            <label className="text-sm font-medium block mb-1">Número de Contrato</label>
            <input
              type="text"
              value={numero_contrato}
              onChange={e => setNumeroContrato(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Rubro</label>
            <input
              type="text"
              value={rubro}
              onChange={e => setRubro(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Año PAA</label>
            <input
              type="number"
              value={anio_paa}
              onChange={e => setAnioPaa(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Contratista</label>
            <input
              type="text"
              value={nombre_contratista}
              onChange={e => setNombreContratista(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Grupo</label>
            <input
              type="text"
              value={grupo}
              onChange={e => setGrupo(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Subgrupo</label>
            <input
              type="text"
              value={subgrupo}
              onChange={e => setSubgrupo(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Área a la que pertenece</label>
            <input
              type="text"
              value={area_pertenece}
              onChange={e => setAreaPertenece(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Tipo de Proceso</label>
            <input
              type="text"
              value={tipo_proceso}
              onChange={e => setTipoProceso(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Sistema de Publicación</label>
            <input
              type="text"
              value={sistema_publicacion}
              onChange={e => setSistemaPublicacion(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Impacto</label>
            <input
              type="text"
              value={impacto}
              onChange={e => setImpacto(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Adjudicado</label>
            <input
              type="text"
              value={adjudicado}
              onChange={e => setAdjudicado(e.target.value)}
              className="border p-2 rounded w-full"
              placeholder="Ej: 'Adjudicado 2024', 'Proceso pendiente 2024'"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Valor Total Final Contrato</label>
            <input
              type="number"
              value={valor_total_final_contrato}
              onChange={e => setValorTotalFinal(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          {/* Agrega más campos según tu modelo */}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded font-medium">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-medium">Crear</button>
          </div>
        </form>
      </div>
    </div>
  )
}
