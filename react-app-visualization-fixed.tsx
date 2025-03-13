import React, { useState } from 'react';

const CoracaoSystemPreview = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [authenticated, setAuthenticated] = useState(false);
  
  // Dados mockados diretamente no componente
  // Ônibus
  const onibusData = [
    {
      id_onibus: 1,
      placa: 'ABC-1234',
      capacidade: 48,
      modelo: 'Mercedes-Benz OF-1721',
      ano_fabricacao: 2018,
      status: 'Ativo'
    },
    {
      id_onibus: 2,
      placa: 'DEF-5678',
      capacidade: 52,
      modelo: 'Volkswagen 17.230 OD',
      ano_fabricacao: 2019,
      status: 'Ativo'
    },
    {
      id_onibus: 3,
      placa: 'GHI-9012',
      capacidade: 44,
      modelo: 'Volvo B270F',
      ano_fabricacao: 2017,
      status: 'Manutenção'
    }
  ];

  // Motoristas
  const motoristasData = [
    {
      id_motorista: 1,
      nome: 'José da Silva',
      cpf: '123.456.789-00',
      status: 'Ativo'
    },
    {
      id_motorista: 2,
      nome: 'Maria Oliveira',
      cpf: '987.654.321-00',
      status: 'Ativo'
    },
    {
      id_motorista: 3,
      nome: 'Carlos Pereira',
      cpf: '456.789.123-00',
      status: 'Férias'
    }
  ];

  // Alunos
  const alunosData = [
    {
      id_aluno: 1,
      nome: 'Pedro Souza',
      responsavel: 'Marta Souza',
      endereco: 'Rua dos Lírios, 45 - Escalvados',
      status: 'Ativo'
    },
    {
      id_aluno: 2,
      nome: 'Mariana Costa',
      responsavel: 'Carlos Costa',
      endereco: 'Avenida das Pedras, 78 - Pedreiras',
      status: 'Ativo'
    },
    {
      id_aluno: 3,
      nome: 'Lucas Ferreira',
      responsavel: 'Fernanda Ferreira',
      endereco: 'Rua das Oliveiras, 123 - Volta Grande',
      status: 'Ativo'
    },
    {
      id_aluno: 4,
      nome: 'Julia Lima',
      responsavel: 'Marcos Lima',
      endereco: 'Travessa dos Ipês, 56 - Escalvados',
      status: 'Ativo'
    },
    {
      id_aluno: 5,
      nome: 'Gabriel Santos',
      responsavel: 'Patricia Santos',
      endereco: 'Alameda dos Cedros, 89 - Pedreiras',
      status: 'Ativo'
    }
  ];

  // Monitores
  const monitoresData = [
    {
      id_monitor: 1,
      nome: 'Fernanda Gomes',
      status: 'Ativo'
    },
    {
      id_monitor: 2,
      nome: 'Ricardo Melo',
      status: 'Ativo'
    }
  ];

  // Rotas
  const rotasData = [
    {
      id_rota: 1,
      nome: 'Rota Escalvados - Manhã',
      tipo: 'Escalvados e Escalvadinhos',
      distancia_km: 15.5,
      tempo_estimado_minutos: 45,
      status: 'Ativa'
    },
    {
      id_rota: 2,
      nome: 'Rota Pedreiras - Manhã',
      tipo: 'Pedreiras',
      distancia_km: 18.2,
      tempo_estimado_minutos: 55,
      status: 'Ativa'
    },
    {
      id_rota: 3,
      nome: 'Rota Volta Grande - Manhã',
      tipo: 'Volta Grande',
      distancia_km: 22.7,
      tempo_estimado_minutos: 65,
      status: 'Ativa'
    },
    {
      id_rota: 4,
      nome: 'Rota Escalvados - Tarde',
      tipo: 'Escalvados e Escalvadinhos',
      distancia_km: 15.5,
      tempo_estimado_minutos: 50,
      status: 'Ativa'
    },
    {
      id_rota: 5,
      nome: 'Rota Pedreiras - Tarde',
      tipo: 'Pedreiras',
      distancia_km: 18.2,
      tempo_estimado_minutos: 60,
      status: 'Temporária'
    }
  ];
  
  // Viagens
  const viagensData = [
    {
      id_viagem: 1,
      id_rota: 1,
      id_onibus: 1,
      id_motorista: 1,
      id_monitor: 1,
      data_viagem: '2025-03-10',
      status: 'Concluída'
    },
    {
      id_viagem: 2,
      id_rota: 2,
      id_onibus: 2,
      id_motorista: 2,
      id_monitor: 2,
      data_viagem: '2025-03-10',
      status: 'Concluída'
    },
    {
      id_viagem: 3,
      id_rota: 3,
      id_onibus: 3,
      id_motorista: 3,
      id_monitor: 1,
      data_viagem: '2025-03-10',
      status: 'Concluída'
    },
    {
      id_viagem: 8,
      id_rota: 1,
      id_onibus: 1,
      id_motorista: 1,
      id_monitor: 1,
      data_viagem: '2025-03-12',
      status: 'Programada'
    },
    {
      id_viagem: 9,
      id_rota: 2,
      id_onibus: 2,
      id_motorista: 2,
      id_monitor: 2,
      data_viagem: '2025-03-12',
      status: 'Programada'
    }
  ];

  // Dados para o dashboard
  const stats = {
    onibusAtivos: onibusData.filter(o => o.status === 'Ativo').length,
    motoristasAtivos: motoristasData.filter(m => m.status === 'Ativo').length,
    totalAlunos: alunosData.length,
    rotasAtivas: rotasData.filter(r => r.status === 'Ativa').length,
    viagensHoje: viagensData.filter(v => v.status === 'Programada').length,
    presencaMedia: 85
  };

  // Simulação de login
  const handleLogin = () => {
    setAuthenticated(true);
  };
  
  // Renderizar login
  if (!authenticated) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-500">Coracao</h1>
            <p className="text-gray-600">Sistema de Gerenciamento de Transporte</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuário</label>
              <input 
                type="text" 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                placeholder="Digite seu usuário"
                defaultValue="admin"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <input 
                type="password" 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                placeholder="Digite sua senha"
                defaultValue="admin123"
              />
            </div>
            
            <button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
              onClick={handleLogin}
            >
              Entrar
            </button>
          </div>
          
          <div className="mt-6 bg-gray-100 p-4 rounded-md text-sm">
            <p>Para demonstração, use:</p>
            <p>Usuário: <strong>admin</strong></p>
            <p>Senha: <strong>admin123</strong></p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white fixed h-full">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-blue-400">Coracao</h2>
          <p className="text-sm text-gray-400">Sistema de Transporte</p>
        </div>
        
        <nav className="mt-4">
          <ul>
            <li>
              <button 
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center px-4 py-3 w-full text-left ${activeView === 'dashboard' ? 'bg-gray-700 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <i className="fas fa-home mr-3"></i>
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveView('onibus')}
                className={`flex items-center px-4 py-3 w-full text-left ${activeView === 'onibus' ? 'bg-gray-700 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <i className="fas fa-bus mr-3"></i>
                <span>Ônibus</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveView('alunos')}
                className={`flex items-center px-4 py-3 w-full text-left ${activeView === 'alunos' ? 'bg-gray-700 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <i className="fas fa-user-graduate mr-3"></i>
                <span>Alunos</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveView('rotas')}
                className={`flex items-center px-4 py-3 w-full text-left ${activeView === 'rotas' ? 'bg-gray-700 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <i className="fas fa-route mr-3"></i>
                <span>Rotas</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveView('viagens')}
                className={`flex items-center px-4 py-3 w-full text-left ${activeView === 'viagens' ? 'bg-gray-700 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <i className="fas fa-clipboard-list mr-3"></i>
                <span>Viagens</span>
              </button>
            </li>
            <li className="mt-6 border-t border-gray-700 pt-4">
              <button 
                onClick={() => setAuthenticated(false)}
                className="flex items-center px-4 py-3 w-full text-left text-gray-300 hover:bg-gray-700"
              >
                <i className="fas fa-sign-out-alt mr-3"></i>
                <span>Sair</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="ml-64 flex-1 p-6">
        {activeView === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p className="text-gray-600 mb-6">Bem-vindo ao sistema de transporte Coracao. Acompanhe as principais informações do sistema.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-bold">{stats.onibusAtivos}</div>
                    <div className="text-gray-500">Ônibus Ativos</div>
                  </div>
                  <div className="bg-blue-100 text-blue-500 p-3 rounded-lg">
                    <i className="fas fa-bus text-xl"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-bold">{stats.totalAlunos}</div>
                    <div className="text-gray-500">Alunos Cadastrados</div>
                  </div>
                  <div className="bg-green-100 text-green-500 p-3 rounded-lg">
                    <i className="fas fa-user-graduate text-xl"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-bold">{stats.viagensHoje}</div>
                    <div className="text-gray-500">Viagens Programadas</div>
                  </div>
                  <div className="bg-purple-100 text-purple-500 p-3 rounded-lg">
                    <i className="fas fa-clipboard-list text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow">
                <div className="border-b px-6 py-4 flex justify-between items-center">
                  <h2 className="font-bold text-lg">Próximas Viagens</h2>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left bg-gray-50">
                        <th className="p-3">Data</th>
                        <th className="p-3">Rota</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viagensData.filter(v => v.status === 'Programada').slice(0, 3).map((viagem, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{viagem.data_viagem}</td>
                          <td className="p-3">{rotasData.find(r => r.id_rota === viagem.id_rota)?.nome}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              {viagem.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow">
                <div className="border-b px-6 py-4">
                  <h2 className="font-bold text-lg">Rotas Ativas</h2>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left bg-gray-50">
                        <th className="p-3">Nome</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rotasData.filter(r => r.status === 'Ativa').slice(0, 3).map((rota, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{rota.nome}</td>
                          <td className="p-3">{rota.tipo}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {rota.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'alunos' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gerenciamento de Alunos</h1>
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center">
                <i className="fas fa-plus mr-2"></i> Novo Aluno
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b px-6 py-4">
                <h2 className="font-bold text-lg">Alunos Cadastrados</h2>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-gray-50">
                      <th className="p-3">Nome</th>
                      <th className="p-3">Responsável</th>
                      <th className="p-3">Endereço</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunosData.map((aluno, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{aluno.nome}</td>
                          <td className="p-3">{aluno.responsavel}</td>
                          <td className="p-3">{aluno.endereco}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {aluno.status}
                            </span>
                          </td>
                          <td className="p-3 flex space-x-2">
                            <button className="text-blue-500 hover:text-blue-700">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="text-red-500 hover:text-red-700">
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'rotas' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gerenciamento de Rotas</h1>
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center">
                <i className="fas fa-plus mr-2"></i> Nova Rota
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b px-6 py-4">
                <h2 className="font-bold text-lg">Rotas Cadastradas</h2>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-gray-50">
                      <th className="p-3">Nome</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Distância</th>
                      <th className="p-3">Tempo Est.</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rotasData.map((rota, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{rota.nome}</td>
                          <td className="p-3">{rota.tipo}</td>
                          <td className="p-3">{rota.distancia_km} km</td>
                          <td className="p-3">{rota.tempo_estimado_minutos} min</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              rota.status === 'Ativa' 
                                ? 'bg-green-100 text-green-800' 
                                : rota.status === 'Temporária'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {rota.status}
                            </span>
                          </td>
                          <td className="p-3 flex space-x-2">
                            <button className="text-blue-500 hover:text-blue-700">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="text-red-500 hover:text-red-700">
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'viagens' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gerenciamento de Viagens</h1>
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center">
                <i className="fas fa-plus mr-2"></i> Nova Viagem
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b px-6 py-4">
                <h2 className="font-bold text-lg">Viagens Programadas</h2>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-gray-50">
                      <th className="p-3">Data</th>
                      <th className="p-3">Rota</th>
                      <th className="p-3">Motorista</th>
                      <th className="p-3">Ônibus</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viagensData.map((viagem, index) => {
                      const rota = rotasData.find(r => r.id_rota === viagem.id_rota);
                      const motorista = motoristasData.find(m => m.id_motorista === viagem.id_motorista);
                      const onibus = onibusData.find(o => o.id_onibus === viagem.id_onibus);
                      
                      return (
                        <tr key={index} className="border-t">
                          <td className="p-3">{viagem.data_viagem}</td>
                          <td className="p-3">{rota ? rota.nome : 'N/A'}</td>
                          <td className="p-3">{motorista ? motorista.nome : 'N/A'}</td>
                          <td className="p-3">{onibus ? onibus.placa : 'N/A'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              viagem.status === 'Concluída' 
                                ? 'bg-green-100 text-green-800' 
                                : viagem.status === 'Programada'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : viagem.status === 'Em andamento'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                              {viagem.status}
                            </span>
                          </td>
                          <td className="p-3 flex space-x-2">
                            <button className="text-blue-500 hover:text-blue-700">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="text-red-500 hover:text-red-700">
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'onibus' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gerenciamento de Ônibus</h1>
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center">
                <i className="fas fa-plus mr-2"></i> Novo Ônibus
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b px-6 py-4">
                <h2 className="font-bold text-lg">Frota de Ônibus</h2>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-gray-50">
                      <th className="p-3">Placa</th>
                      <th className="p-3">Modelo</th>
                      <th className="p-3">Ano</th>
                      <th className="p-3">Capacidade</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onibusData.map((onibus, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{onibus.placa}</td>
                        <td className="p-3">{onibus.modelo}</td>
                        <td className="p-3">{onibus.ano_fabricacao}</td>
                        <td className="p-3">{onibus.capacidade} passageiros</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            onibus.status === 'Ativo' 
                              ? 'bg-green-100 text-green-800' 
                              : onibus.status === 'Manutenção'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {onibus.status}
                          </span>
                        </td>
                        <td className="p-3 flex space-x-2">
                          <button className="text-blue-500 hover:text-blue-700">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="text-red-500 hover:text-red-700">
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoracaoSystemPreview;