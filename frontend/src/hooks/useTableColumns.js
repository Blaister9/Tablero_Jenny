// hooks/useTableColumns.js
import { useState, useEffect } from 'react';

export const TABLE_COLUMNS = [
  { id: 'year', header: 'AÑO', width: '70px', defaultVisible: true },
  { id: 'strategic_line', header: 'LÍNEA', width: '120px', defaultVisible: true },
  { id: 'title', header: 'META', width: '200px', defaultVisible: true },
  { id: 'daruma_code', header: 'CÓDIGO DARUMA', width: '120px', defaultVisible: true },
  { id: 'status', header: 'ESTADO', width: '120px', defaultVisible: true },
  { id: 'alert_date', header: 'FECHA ALARMA', width: '120px', defaultVisible: false },
  { id: 'limit_month', header: 'MES LÍMITE', width: '100px', defaultVisible: false },
  { id: 'due_date', header: 'FECHA LÍMITE', width: '120px', defaultVisible: true },
  { id: 'deliverable', header: 'ENTREGABLE', width: '150px', defaultVisible: true },
  { id: 'area', header: 'ÁREA', width: '100px', defaultVisible: true },
  { id: 'leaders', header: 'LIDERA', width: '150px', defaultVisible: true },
  { id: 'support_team', header: 'APOYA', width: '150px', defaultVisible: false },
  { id: 'evidence', header: 'EVIDENCIA', width: '150px', defaultVisible: false },
  { id: 'description', header: 'OBSERVACIONES', width: '200px', defaultVisible: true },
  { id: 'actions', header: 'ACCIONES', width: '80px', defaultVisible: true }
];

const STORAGE_KEY = 'strategicTable_visibleColumns';

export const useTableColumns = () => {
  // Inicializar con columnas por defecto
  const defaultColumns = TABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
  
  // Estado para columnas visibles
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultColumns;
  });

  // Persistir cambios
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Helpers
  const toggleColumn = (columnId) => {
    setVisibleColumns(current => 
      current.includes(columnId)
        ? current.filter(id => id !== columnId)
        : [...current, columnId]
    );
  };

  const resetToDefault = () => {
    setVisibleColumns(defaultColumns);
  };

  const isColumnVisible = (columnId) => {
    return visibleColumns.includes(columnId);
  };

  const getVisibleColumns = () => {
    return TABLE_COLUMNS.filter(col => isColumnVisible(col.id));
  };

  return {
    visibleColumns,
    toggleColumn,
    resetToDefault,
    isColumnVisible,
    getVisibleColumns,
    allColumns: TABLE_COLUMNS
  };
};