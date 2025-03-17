import React from 'react';

const ReportStats = ({ activeTab, totalRecords, activeCounts }) => {
  const getActiveLabel = () => {
    return activeTab === 'viagens' 
      ? 'Viagens Concluídas' 
      : 'Registros Ativos';
  };

  const getInactiveLabel = () => {
    return activeTab === 'viagens' 
      ? 'Viagens Pendentes/Outras' 
      : 'Registros Inativos/Outros';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Estatísticas</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="text-sm text-gray-500">Total de Registros</div>
          <div className="text-2xl font-bold mt-1">{totalRecords}</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="text-sm text-gray-500">{getActiveLabel()}</div>
          <div className="text-2xl font-bold mt-1 text-green-700">{activeCounts}</div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <div className="text-sm text-gray-500">{getInactiveLabel()}</div>
          <div className="text-2xl font-bold mt-1 text-yellow-700">
            {totalRecords - activeCounts}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportStats;