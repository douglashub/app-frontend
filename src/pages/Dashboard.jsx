import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OnibusService, AlunoService, RotaService, ViagemService } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';
import StatusBadge from '../components/common/StatusBadge';
import { processStatus } from '../utils/statusProcessor';

export default function Dashboard() {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    onibusAtivos: 0,
    totalAlunos: 0,
    rotasAtivas: 0,
    viagensHoje: 0
  });
  const [viagensData, setViagensData] = useState([]);
  const [rotasData, setRotasData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [onibusResponse, alunosResponse, rotasResponse, viagensResponse] = await Promise.all([
        OnibusService.getOnibus(),
        AlunoService.getAlunos(),
        RotaService.getRotas(),
        ViagemService.getViagens()
      ]);

      // Process onibus data
      const onibusData = onibusResponse.data?.data || [];
      const onibusAtivos = onibusData.filter(onibus => 
        processStatus(onibus.status) === 'active'
      ).length;

      // Process alunos data
      const alunosData = alunosResponse.data?.data || [];
      const totalAlunos = alunosData.length;

      // Process rotas data
      const rotasData = rotasResponse.data?.data || [];
      const rotasAtivas = rotasData.filter(rota => 
        processStatus(rota.status) === 'active'
      ).length;
      
      // Process viagens data
      const viagensData = viagensResponse.data?.data || [];
      const today = new Date().toISOString().split('T')[0];
      const viagensHoje = viagensData.filter(viagem => 
        viagem.data_viagem === today
      ).length;

      // Format and enhance data for display
      const formattedRotasData = rotasData.slice(0, 5).map(rota => ({
        ...rota,
        status: processStatus(rota.status)
      }));

      const formattedViagensData = viagensData.slice(0, 5).map(viagem => {
        const date = new Date(viagem.data_viagem);
        const data_formatada = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        
        // Find the corresponding route name
        const rota = rotasData.find(r => r.id === viagem.rota_id);
        
        return {
          ...viagem,
          data_formatada,
          rota: rota ? rota.nome : 'Rota não encontrada',
          status: processStatus(viagem.status, 'viagem')
        };
      });

      // Update stats
      setStats({
        onibusAtivos,
        totalAlunos,
        rotasAtivas,
        viagensHoje
      });

      // Update tables data with formatted data
      setRotasData(formattedRotasData);
      setViagensData(formattedViagensData);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = 'Erro ao carregar dados do dashboard: ' + (err.response?.data?.message || err.message);
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700">{error}</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao sistema de gerenciamento de transporte escolar Coracao. Acompanhe as principais informações do sistema.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Ônibus Ativos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats.onibusAtivos}</div>
              <div className="text-gray-500 mt-1">Ônibus em Operação</div>
            </div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/onibus" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
              Ver todos os ônibus
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Alunos Cadastrados */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
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
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/alunos" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
              Ver todos os alunos
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Rotas Ativas */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
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
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/rotas" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
              Ver todas as rotas
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Viagens Programadas */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats.viagensHoje}</div>
              <div className="text-gray-500 mt-1">Viagens Hoje</div>
            </div>
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/viagens" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
              Ver todas as viagens
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
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
          
          {viagensData.length > 0 ? (
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
                      <td className="py-3 px-4 whitespace-nowrap">{viagem.data_formatada}</td>
                      <td className="py-3 px-4">{viagem.rota}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={viagem.status} type="viagem" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">Nenhuma viagem programada</p>
              <Link to="/viagens/novo" className="mt-3 text-blue-600 hover:text-blue-800 text-sm">
                Programar uma viagem
              </Link>
            </div>
          )}
          
          {/* Mobile view for Próximas Viagens */}
          <div className="md:hidden px-4 pb-4 pt-2">
            <div className="text-sm text-gray-500 mb-2 font-medium">Visualização mobile</div>
            {viagensData.length > 0 ? viagensData.map((viagem, index) => (
              <div key={index} className="mb-3 bg-gray-50 p-3 rounded-lg">
                <div className="font-medium mb-1">{viagem.rota}</div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Data:</span>
                  <span>{viagem.data_formatada}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Status:</span>
                  <StatusBadge status={viagem.status} type="viagem" size="sm" />
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-gray-500">
                Nenhuma viagem encontrada
              </div>
            )}
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
          
          {rotasData.length > 0 ? (
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
                        <StatusBadge status={rota.status} type="rota" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-gray-500">Nenhuma rota cadastrada</p>
              <Link to="/rotas/nova" className="mt-3 text-blue-600 hover:text-blue-800 text-sm">
                Criar uma rota
              </Link>
            </div>
          )}
          
          {/* Mobile view for Rotas Ativas */}
          <div className="md:hidden px-4 pb-4 pt-2">
            <div className="text-sm text-gray-500 mb-2 font-medium">Visualização mobile</div>
            {rotasData.length > 0 ? rotasData.map((rota, index) => (
              <div key={index} className="mb-3 bg-gray-50 p-3 rounded-lg">
                <div className="font-medium mb-1">{rota.nome}</div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tipo:</span>
                  <span>{rota.tipo}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Status:</span>
                  <StatusBadge status={rota.status} type="rota" size="sm" />
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-gray-500">
                Nenhuma rota encontrada
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Acesso Rápido */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="font-bold text-lg">Acesso Rápido</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          <Link to="/alunos/novo" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Novo Aluno</span>
          </Link>
          
          <Link to="/viagens/nova" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Nova Viagem</span>
          </Link>
          
          <Link to="/rotas/nova" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-600 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Nova Rota</span>
          </Link>
          
          <Link to="/onibus/novo" className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-yellow-600 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Novo Ônibus</span>
          </Link>
        </div>
      </div>
    </div>
  );
}