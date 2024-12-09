// frontend/src/components/contracts/ContractsTable.jsx
import React, { useState } from 'react'
import { useContractsList } from '../../hooks/useContractsList'
import api from '../../api/axios'
import { useQueryClient } from '@tanstack/react-query'
import ContractFormModal from './ContractFormModal'

export default function ContractsTable({ filters }) {
  const { data, isLoading, error } = useContractsList(filters)
  const queryClient = useQueryClient()
  const [editContract, setEditContract] = useState(null)

  if (isLoading) return <div>Cargando contratos...</div>
  if (error) return <div className="text-red-500">Error al cargar contratos</div>
  if (data.length === 0) return <div>No hay contratos</div>

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este contrato?")) return
    try {
      await api.delete(`/contracts/contracts/${id}/`)
      queryClient.invalidateQueries('contracts-list')
      queryClient.invalidateQueries('contracts-kpis')
    } catch (e) {
      console.error(e)
      alert('Error al eliminar contrato')
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow-sm overflow-auto">
      <h3 className="text-md font-semibold mb-4">Lista de Contratos</h3>
      <table className="min-w-full text-sm border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Número</th>
            <th className="border px-2 py-1">Rubro</th>
            <th className="border px-2 py-1">Contratista</th>
            <th className="border px-2 py-1">Año PAA</th>
            <th className="border px-2 py-1">Valor Final</th>
            <th className="border px-2 py-1">Adjudicado</th>
            <th className="border px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map(contrato => (
            <tr key={contrato.id}>
              <td className="border px-2 py-1">{contrato.numero_contrato}</td>
              <td className="border px-2 py-1">{contrato.rubro}</td>
              <td className="border px-2 py-1">{contrato.nombre_contratista}</td>
              <td className="border px-2 py-1">{contrato.anio_paa}</td>
              <td className="border px-2 py-1">{contrato.valor_total_final_contrato}</td>
              <td className="border px-2 py-1">{contrato.adjudicado}</td>
              <td className="border px-2 py-1 flex gap-2">
                <button 
                  onClick={() => setEditContract(contrato)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(contrato.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editContract && (
        <EditContractModal 
          contract={editContract} 
          onClose={() => setEditContract(null)} 
          onSuccess={() => {
            setEditContract(null)
            queryClient.invalidateQueries('contracts-list')
            queryClient.invalidateQueries('contracts-kpis')
          }}
        />
      )}
    </div>
  )
}

function EditContractModal({ contract, onClose, onSuccess }) {
  const [formData, setFormData] = useState({...contract})
  const queryClient = useQueryClient()

  const handleChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.patch(`/contracts/contracts/${contract.id}/`, formData)
      onSuccess && onSuccess()
    } catch (error) {
      console.error(error)
      alert('Error al editar contrato')
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">Editar Contrato</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-auto">
          {/* Campos igual que en ContractFormModal, pero con values de formData */}
          <div>
            <label className="text-sm font-medium block mb-1">Número de Contrato</label>
            <input
              type="text"
              value={formData.numero_contrato || ''}
              onChange={e => handleChange('numero_contrato', e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          {/* Agrega los demás campos igual que ContractFormModal, reemplazando setX por handleChange */}
          <div>
            <label className="text-sm font-medium block mb-1">Rubro</label>
            <input
              type="text"
              value={formData.rubro || ''}
              onChange={e => handleChange('rubro', e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          {/* ... Repite para todos los campos */}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded font-medium">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-medium">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
