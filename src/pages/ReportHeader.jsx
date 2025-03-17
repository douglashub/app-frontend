import React from 'react';

const ReportHeader = ({ activeTab, currentReportLength }) => {
  const getTitle = () => {
    switch(activeTab) {
      case 'motoristas': return 'Relatório de Motoristas';
      case 'monitores': return 'Relatório de Monitores';
      case 'viagens': return 'Relatório de Viagens';
      default: return 'Relatórios';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">{getTitle()}</h2>
      <p className="text-sm text-gray-500 mt-1">
        {currentReportLength} registros encontrados
      </p>
    </div>
  );
};

export default ReportHeader;