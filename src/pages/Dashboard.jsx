import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Mock data for dashboard
  const stats = {
    onibusAtivos: 2,
    totalAlunos: 5,
    rotasAtivas: 4,
    viagensHoje: 2
  };

  // Mock data for tables
  const viagensData = [
    {
      id: 8,
      data_viagem: '2025-03-12',
      rota: 'Rota Escalvados - Manhã',
      status: 'Programada'
    },
    {
      id: 9,
      data_viagem: '2025-03-12',
      rota: 'Rota Pedreiras - Manhã',
      status: 'Programada'
    }
  ];

  const rotasData = [
    {
      id: 1,
      nome: 'Rota Escalvados - Manhã',
      tipo: 'Escalvados e Escalvadinhos',
      status: 'Ativa'
    },
    {
      id: 2,
      nome: 'Rota Pedreiras - Manhã',
      tipo: 'Pedreiras',
      status: 'Ativa'
    },
    {
      id: 3,
      nome: 'Rota Volta Grande - Manhã',
      tipo: 'Volta Grande',
      status: 'Ativa'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao sistema de transporte Coracao. Acompanhe as principais informações do sistema.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Ônibus Ativos */}
        <div className="bg-white p-6 border-b border-r border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats.onibusAtivos}</div>
              <div className="text-gray-500 mt-1">Ônibus Ativos</div>
            </div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Alunos Cadastrados */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalAlunos}</div>
              <div className="text-gray-500 mt-1">Alunos Cadastrados</div>
            </div>
            <div className="bg-green-100 text-green-600 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Rotas Ativas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats.rotasAtivas}</div>
              <div className="text-gray-500 mt-1">Rotas Ativas</div>
            </div>
            <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Viagens Programadas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats.viagensHoje}</div>
              <div className="text-gray-500 mt-1">Viagens Programadas</div>
            </div>
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Próximas Viagens */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="font-bold text-lg">Próximas Viagens</h2>
            <Link to="/viagens" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
              Ver todas
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Rota</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {viagensData.map((viagem, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4 whitespace-nowrap">{viagem.data_viagem}</td>
                    <td className="py-3 px-4">{viagem.rota}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {viagem.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile view for Próximas Viagens */}
          <div className="md:hidden px-4 pb-4 pt-2">
            <div className="text-sm text-gray-500 mb-2 font-medium">Visualização mobile</div>
            {viagensData.map((viagem, index) => (
              <div key={index} className="mb-3 bg-gray-50 p-3 rounded-lg">
                <div className="font-medium mb-1">{viagem.rota}</div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Data:</span>
                  <span>{viagem.data_viagem}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Status:</span>
                  <span className="px-2 py-0.5 text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {viagem.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Rotas Ativas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="font-bold text-lg">Rotas Ativas</h2>
            <Link to="/rotas" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
              Ver todas
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rotasData.map((rota, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{rota.nome}</td>
                    <td className="py-3 px-4">{rota.tipo}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {rota.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile view for Rotas Ativas */}
          <div className="md:hidden px-4 pb-4 pt-2">
            <div className="text-sm text-gray-500 mb-2 font-medium">Visualização mobile</div>
            {rotasData.map((rota, index) => (
              <div key={index} className="mb-3 bg-gray-50 p-3 rounded-lg">
                <div className="font-medium mb-1">{rota.nome}</div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tipo:</span>
                  <span>{rota.tipo}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Status:</span>
                  <span className="px-2 py-0.5 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {rota.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};