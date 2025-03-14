import React, { useState, useEffect } from 'react';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import FormModal from '../components/common/FormModal';
import { AlunoService } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAluno, setCurrentAluno] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotification ? useNotification() : { 
    showSuccess: () => {}, 
    showError: () => {} 
  };
  
  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data_nascimento: '',
    responsavel: '',
    telefone_responsavel: '',
    endereco: '',
    ponto_referencia: '',
    status: true
  });

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const response = await AlunoService.getAlunos();
      
      // Tratamento melhorado dos dados recebidos da API
      let alunosData = [];
      
      if (response?.data) {
        // Caso 1: Resposta padrão com 'data' dentro de response.data (formato comum no Laravel)
        if (response.data.data && Array.isArray(response.data.data)) {
          alunosData = response.data.data;
        } 
        // Caso 2: Resposta é um array diretamente (para fallback)
        else if (Array.isArray(response.data)) {
          alunosData = response.data;
        }
        // Caso 3: Resposta paginada do Laravel via items()
        else if (response.data.meta && Array.isArray(response.data.data)) {
          alunosData = response.data.data;
        }
        // Caso 4: Dados vazios mas com estrutura válida
        else if (response.data.meta && response.data.meta.total === 0) {
          alunosData = [];
        }
        
        // Formato final dos dados para a UI
        const formattedData = alunosData.map(aluno => ({
          ...aluno,
          status: processStatus(aluno.status)
        }));
        
        setAlunos(formattedData);
        setError(null);
      } else {
        // Caso 5: Sem dados - usar mock data como fallback
        console.warn('API returned unexpected format, using mock data');
        const mockData = getMockData();
        setAlunos(mockData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erro ao carregar alunos: ' + (err.response?.data?.message || err.message));
      // Fallback para mock data em caso de erro
      setAlunos(getMockData());
    } finally {
      setLoading(false);
    }
  };

  // Função para processar diferentes formatos de status
  const processStatus = (status) => {
    if (typeof status === 'boolean') {
      return status ? 'active' : 'inactive';
    } else if (typeof status === 'number') {
      return status === 1 ? 'active' : 'inactive';
    } else if (typeof status === 'string') {
      const lowercaseStatus = status.toLowerCase();
      return lowercaseStatus === 'true' || lowercaseStatus === 'ativo' || lowercaseStatus === '1' 
        ? 'active' : 'inactive';
    } else {
      return 'inactive'; // valor padrão
    }
  };

  // Mock data como fallback
  const getMockData = () => {
    return [
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
  };

  // Search and filter function
  const filteredAlunos = alunos.filter(aluno => 
    aluno.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.responsavel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.endereco?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openModal = (aluno = null) => {
    if (aluno) {
      // Converter status de string para boolean para o formulário
      const statusBool = aluno.status === 'active' || aluno.status === true || aluno.status === 1;
      
      // Setar dados do aluno para edição
      setFormData({
        nome: aluno.nome || '',
        descricao: aluno.descricao || '',
        data_nascimento: aluno.data_nascimento || '',
        responsavel: aluno.responsavel || '',
        telefone_responsavel: aluno.telefone_responsavel || '',
        endereco: aluno.endereco || '',
        ponto_referencia: aluno.ponto_referencia || '',
        status: statusBool
      });
      setCurrentAluno(aluno);
    } else {
      // Resetar formulário para um novo aluno
      setFormData({
        nome: '',
        descricao: '',
        data_nascimento: '',
        responsavel: '',
        telefone_responsavel: '',
        endereco: '',
        ponto_referencia: '',
        status: true
      });
      setCurrentAluno(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (currentAluno) {
        // Update
        await AlunoService.updateAluno(currentAluno.id, formData);
        showSuccess('Aluno atualizado com sucesso!');
      } else {
        // Create
        await AlunoService.createAluno(formData);
        showSuccess('Aluno criado com sucesso!');
      }
      setIsModalOpen(false);
      fetchAlunos();
    } catch (err) {
      console.error('Error saving aluno:', err);
      const errorMsg = err.response?.data?.errors ? 
        Object.values(err.response.data.errors).flat().join(', ') : 
        (err.response?.data?.message || err.message);
      
      showError('Erro ao salvar aluno: ' + errorMsg);
      setError('Erro ao salvar aluno: ' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (aluno) => {
    openModal(aluno);
  };

  const handleDelete = async (aluno) => {
    if(window.confirm(`Deseja excluir ${aluno.nome}?`)) {
      try {
        await AlunoService.deleteAluno(aluno.id);
        showSuccess('Aluno excluído com sucesso!');
        fetchAlunos();
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        showError('Erro ao excluir aluno: ' + errorMsg);
        setError('Erro ao excluir aluno: ' + errorMsg);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Alunos</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Aluno
        </button>
      </div>

      <div className="bg-white overflow-hidden rounded-lg shadow">
        <div className="px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 border-b">
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
          
          <DataTable
            columns={columns}
            data={filteredAlunos}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            error={null} // Error is already shown above
          />
        </div>
      </div>

      {/* Modal Form */}
      <FormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentAluno ? "Editar Aluno" : "Novo Aluno"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              name="nome"
              id="nome"
              required
              value={formData.nome}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700">Responsável</label>
            <input
              type="text"
              name="responsavel"
              id="responsavel"
              required
              value={formData.responsavel}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="telefone_responsavel" className="block text-sm font-medium text-gray-700">Telefone do Responsável</label>
            <input
              type="tel"
              name="telefone_responsavel"
              id="telefone_responsavel"
              required
              value={formData.telefone_responsavel}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="data_nascimento" className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
            <input
              type="date"
              name="data_nascimento"
              id="data_nascimento"
              required
              value={formData.data_nascimento}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">Endereço</label>
            <input
              type="text"
              name="endereco"
              id="endereco"
              required
              value={formData.endereco}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="ponto_referencia" className="block text-sm font-medium text-gray-700">Ponto de Referência</label>
            <input
              type="text"
              name="ponto_referencia"
              id="ponto_referencia"
              value={formData.ponto_referencia}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              name="descricao"
              id="descricao"
              rows="3"
              value={formData.descricao}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="status"
              id="status"
              checked={formData.status}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="status" className="ml-2 block text-sm text-gray-900">Ativo</label>
          </div>
        </div>
      </FormModal>

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {alunos.filter(aluno => aluno.status === 'active' || aluno.status === true).length}
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
              {alunos.filter(aluno => aluno.status === 'inactive' || aluno.status === false).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}