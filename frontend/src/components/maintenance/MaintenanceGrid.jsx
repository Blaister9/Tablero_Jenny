// src/components/maintenance/MaintenanceGrid.jsx

import React, { useState } from 'react';
import { useMaintenanceData } from '../../hooks/useMaintenanceData';

const MaintenanceGrid = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { subGroups, items, schedules, isLoading, isError, error, updateScheduleStatus } = useMaintenanceData();

  if (isLoading) {
    return <div>Cargando datos de mantenimiento...</div>;
  }

  if (isError) {
    return <div>Error al cargar datos: {error.message}</div>;
  }

  // Asociar items a sus subgrupos correspondientes
  const subGroupItems = subGroups.map((subGroup) => ({
    ...subGroup,
    items: items.filter((item) => item.sub_group === subGroup.id),
  }));

  // Generar las semanas del año (1-52)
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  const handleStatusToggle = (schedule) => {
    const updates = { is_completed: !schedule.is_completed };
    updateScheduleStatus({ scheduleId: schedule.id, updates });
  };

  return (
    <div className="maintenance-grid">
      <h1>Matriz de Mantenimiento - Año {selectedYear}</h1>

      {subGroupItems.map((subGroup) => (
        <div key={subGroup.id} className="subgroup">
          <h2>{subGroup.name}</h2>
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">Item</th>
                {weeks.map((week) => (
                  <th key={week} className="px-2 py-1 text-center">
                    S{week}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subGroup.items.map((item) => (
                <tr key={item.id}>
                  <td className="border px-4 py-2">{item.element}</td>
                  {weeks.map((week) => {
                    const schedule = schedules.find(
                      (s) => s.item === item.id && s.week === week && s.year === selectedYear
                    );

                    // Determinar el color según el estado
                    let bgColor = 'bg-gray-200'; // No programado
                    if (schedule) {
                      if (schedule.is_completed) {
                        bgColor = 'bg-green-400'; // Completado
                      } else if (schedule.is_scheduled) {
                        bgColor = 'bg-blue-400'; // Programado
                      } else {
                        const currentWeek = Math.ceil(
                          (new Date() - new Date(selectedYear, 0, 1)) / (7 * 24 * 60 * 60 * 1000)
                        );
                        if (week < currentWeek) {
                          bgColor = 'bg-red-400'; // Retrasado
                        }
                      }
                    }

                    return (
                      <td
                        key={week}
                        className={`border px-2 py-1 text-center cursor-pointer ${bgColor}`}
                        onClick={() => {
                          if (schedule) {
                            handleStatusToggle(schedule);
                          } else {
                            // Opcional: crear nuevo schedule si no existe
                          }
                        }}
                      >
                        {/* Opcional: Mostrar icono o estado */}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default MaintenanceGrid;
