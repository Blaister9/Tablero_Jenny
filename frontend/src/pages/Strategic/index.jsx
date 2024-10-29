import React from 'react';
import StrategicTable from '../../components/strategic/StrategicTable';

const Strategic = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Seguimiento Estratégico</h1>
        <div className="mt-8">
          <StrategicTable />
        </div>
      </div>
    </div>
  );
};

export default Strategic;