import React from 'react';

const ReportTabs = ({ activeTab, onTabChange, reportCounts }) => {
  const tabs = [
    { 
      key: 'motoristas', 
      label: 'Motoristas', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    { 
      key: 'monitores', 
      label: 'Monitores', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    { 
      key: 'viagens', 
      label: 'Viagens', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tabs.map((tab) => (
        <div 
          key={tab.key}
          className={`bg-white rounded-xl shadow-sm border-l-4 p-5 cursor-pointer transition-all hover:shadow ${
            activeTab === tab.key ? 'border-blue-500' : 'border-gray-200'
          }`}
          onClick={() => onTabChange(tab.key)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">{tab.label}</h3>
              <p className="text-gray-500 text-sm">Relatório de {tab.label.toLowerCase()}</p>
              <div className="mt-2 text-2xl font-bold">{reportCounts[tab.key]}</div>
            </div>
            <div className={`${tab.bgColor} p-3 rounded-full ${tab.textColor}`}>
              {tab.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportTabs;