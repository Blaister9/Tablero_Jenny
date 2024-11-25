import React from 'react';
import { Settings2, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '../ui/dropdown-menu';

const ColumnsConfig = ({ 
  allColumns, 
  visibleColumns, 
  toggleColumn, 
  resetToDefault 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
        <Settings2 className="h-4 w-4 mr-2" />
        Configurar Columnas
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">Columnas Visibles</span>
            <span className="text-xs text-muted-foreground">
              Selecciona las columnas que deseas ver
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {allColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            checked={visibleColumns.includes(column.id)}
            onCheckedChange={() => toggleColumn(column.id)}
          >
            {column.header}
          </DropdownMenuCheckboxItem>
        ))}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="flex cursor-pointer items-center text-sm"
          onClick={resetToDefault}
        >
          <Check className="mr-2 h-4 w-4" />
          Restaurar por defecto
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnsConfig;