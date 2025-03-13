import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { AlunoService } from '../api/services';

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Mock data for when API fails
  const mockAlunosData = [
    {
      id: 1,
      nome: 'Pedro Souza',
      responsavel: 'Marta Souza',
      endereco: 'Rua dos Lírios, 45 - Escalvados',
      status: 'active'
    },
    {
      id: 2,
      nome: 'Mariana Costa',
      responsavel: 'Carlos Costa',
      endereco: 'Avenida das Pedras, 78 - Pedreiras',
      status: 'active'
    },
    {
      id: 3,
      nome: 'Lucas Ferreira',
      responsavel: 'Fernanda Ferreira',
      endereco: 'Rua das Oliveiras, 123 - Volta Grande',
      status: 'active'
    },
    {
      id: 4,
      nome: 'Julia Lima',
      responsavel: 'Marcos Lima',
      endereco: 'Travessa dos Ipês, 56 - Escalvados',
      status: 'active'
    },
    {
      id: 5,
      nome: 'Gabriel Santos',
      responsavel: 'Patricia Santos',
      endereco: 'Alameda dos Cedros, 89 - Pedreiras',
      status: 'inactive'
    }
  ];

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const response = await AlunoService.getAlunos();
      
      // Check if response has the expected structure
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setAlunos(response.data.data);
      } else {
        console.log('API returned unexpected data format, using mock data');
        setAlunos(mockAlunosData);
      }
    } catch (err) {
      console.error('Error fetching data, using mock data instead:', err);
      setAlunos(mockAlunosData);
      setError('Erro ao carregar alunos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Search and filter function
  const filteredAlunos = alunos.filter(aluno => 
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'responsavel', header: 'Responsável' },
    { key: 'endereco', header: 'Endereço' },
    { 
      key: 'status', 
      header: 'Status',
      format: (item) => <StatusBadge status={item.status} type="aluno" />
    }
  ];

  const handleEdit = (aluno) => {
    console.log('Editar aluno:', aluno);
  };

  const handleDelete = async (aluno) => {
    if(window.confirm(`Deseja excluir ${aluno.nome}?`)) {
      try {
        await AlunoService.deleteAluno(aluno.id);
        fetchAlunos();
      } catch (err) {
        setError('Erro ao excluir aluno: ' + err.message);
      }
    }
  };

  return (
    <div className="max-w-screen-3xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 3xl:max-w-screen-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-[clamp(1.5rem,3vw,2.75rem)] font-bold leading-tight">Gerenciamento de Alunos</h1>
        <button
          onClick={() => navigate('/alunos/novo')}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Aluno
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="font-bold text-lg">Alunos Cadastrados</h2>
          
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar alunos..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="p-4 mb-4 text-red-600 bg-red-50 rounded-md flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <div className="px-4 max-w-full overflow-x-auto 3xl:overflow-visible">
            <DataTable
              columns={columns}
              data={filteredAlunos}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
              error={null}
            />
          </div>
        </div>
      </div>

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 gap-[min(1.5vw,1.5rem)] p-[clamp(1rem,2vw,2rem)]">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total de Alunos</div>
            <div className="text-xl font-bold">{alunos.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Alunos Ativos</div>
            <div className="text-xl font-bold">
              {alunos.filter(aluno => aluno.status === 'active').length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Alunos Inativos</div>
            <div className="text-xl font-bold">
              {alunos.filter(aluno => aluno.status === 'inactive').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}