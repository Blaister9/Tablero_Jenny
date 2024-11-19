// components/strategic/ColumnsConfig.jsx
import React from 'react';
import Button from '../common/Button';
import Checkbox from '../common/Checkbox';
import Dropdown, { DropdownItem } from '../common/Dropdown';
import { Settings2 } from 'lucide-react';

const ColumnsConfig = ({ allColumns, visibleColumns, toggleColumn, resetToDefault }) => {
  return (
    <Dropdown
      trigger={
        <Button variant="outline" size="sm" className="ml-auto">
          <Settings2 className="h-4 w-4 mr-2" />
          Configurar Columnas
        </Button>
      }
      align="right"
      className="w-56"
    >
      <div className="py-2">
        <div className="px-3 py-2 text-sm font-medium">Columnas Visibles</div>
        <div className="border-t border-gray-200" />
        {allColumns.map((column) => (
          <DropdownItem key={column.id} onClick={(e) => e.preventDefault()}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`column-${column.id}`}
                checked={visibleColumns.includes(column.id)}
                onCheckedChange={() => toggleColumn(column.id)}
              />
              <label htmlFor={`column-${column.id}`} className="text-sm">
                {column.header}
              </label>
            </div>
          </DropdownItem>
        ))}
        <div className="border-t border-gray-200" />
        <DropdownItem onClick={resetToDefault}>
          Restaurar por defecto
        </DropdownItem>
      </div>
    </Dropdown>
  );
};

export default ColumnsConfig;