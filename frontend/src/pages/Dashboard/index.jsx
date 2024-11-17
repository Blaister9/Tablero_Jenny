import React from 'react';
import useDashboardData from '../../hooks/useDashboardData';
import ChartsContainer from '../../components/dashboard/ChartsContainer';

const Dashboard = () => {
  const { data, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-4">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="p-6">
      <ChartsContainer data={data} />
    </div>
  );
};

export default Dashboard;