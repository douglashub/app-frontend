import React, { useState, useEffect } from 'react';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import FormModal from '../components/common/FormModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import { MotoristaService } from '../api/services';
import { processStatus } from '../utils/statusProcessor'
import { useNotification } from '../contexts/NotificationContext';
import MaskedInput from '../utils/MaskedInput';
import { MASKS, unmask, formatDocument } from '../utils/inputMasks';

export default function Motoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentMotorista, setCurrentMotorista] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotification ? useNotification() : { 
    showSuccess: () => {}, 
    showError: () => {} 
  };
  
  // Form state - Ainda usando status como string para a interface, mas vamos converter para boolean na API
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    cnh: '',
    categoria_cnh: '',
    validade_cnh: '',
    telefone: '',
    endereco: '',
    data_contratacao: '',
    status: 'Ativo' // Isso será convertido para true na API
  });

  useEffect(() => {
    fetchMotoristas();
  }, []);

  const fetchMotoristas = async () => {
    try {
      setLoading(true);
      const response = await MotoristaService.getMotoristas();
      
      // Process the API response
      let motoristasData = [];
      
      if (response?.data) {
        // Case 1: Standard response with 'data' inside response.data (common in Laravel)
        if (response.data.data && Array.isArray(response.data.data)) {
          motoristasData = response.data.data;
        } 
        // Case 2: Response is a direct array (fallback)
        else if (Array.isArray(response.data)) {
          motoristasData = response.data;
        }
        // Case 3: Paginated Laravel response via items()
        else if (response.data.meta && Array.isArray(response.data.data)) {
          motoristasData = response.data.data;
        }
        
        // Format data for UI - convert status to a standardized format
        const formattedData = motoristasData.map(motorista => ({
          ...motorista,
          status: processStatus(motorista.status)
        }));
        
        setMotoristas(formattedData);
        setError(null);
      } else {
        // Case 4: No valid data from API
        console.warn('API returned unexpected format');
        setMotoristas([]);
        setError('Nenhum dado de motorista encontrado no servidor.');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erro ao carregar motoristas: ' + (err.response?.data?.message || err.message));
      setMotoristas([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to process different status formats
  const processStatus = (status) => {
    if (typeof status === 'boolean') {
      return status ? 'active' : 'inactive';
    } else if (typeof status === 'number') {
      return status === 1 ? 'active' : 'inactive';
    } else if (typeof status === 'string') {
      const lowercaseStatus = status.toLowerCase();
      if (lowercaseStatus === 'true' || lowercaseStatus === 'ativo' || lowercaseStatus === '1' || lowercaseStatus === 'active') {
        return 'active';
      } else if (lowercaseStatus === 'false' || lowercaseStatus === 'inativo' || lowercaseStatus === '0' || lowercaseStatus === 'inactive') {
        return 'inactive';
      } else if (lowercaseStatus === 'ferias') {
        return 'vacation';
      } else if (lowercaseStatus === 'licenca') {
        return 'leave';
      }
      return status;
    }
    return 'inactive'; // default value
  };

  // Search and filter function
  const filteredMotoristas = motoristas.filter(motorista => 
    motorista.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    motorista.cpf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    motorista.cnh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    motorista.telefone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'cpf', header: 'CPF', format: (item) => formatDocument(item.cpf) },
    { key: 'cnh', header: 'CNH' },
    { key: 'categoria_cnh', header: 'Categoria' },
    { key: 'telefone', header: 'Telefone' },
    { 
      key: 'validade_cnh', 
      header: 'Validade CNH',
      format: (item) => {
        if (!item.validade_cnh) return '-';
        const date = new Date(item.validade_cnh);
        return date.toLocaleDateString('pt-BR');
      }
    },
    { 
      key: 'status', 
      header: 'Status',
      format: (item) => <StatusBadge status={processStatus(item.status, 'motorista')} type="motorista" />
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const openModal = (motorista = null) => {
    if (motorista) {
      // Edit mode - convert any status to our enum values for display
      let statusValue = 'Ativo'; // default
      
      if (typeof motorista.status === 'string') {
        const statusLower = motorista.status.toLowerCase();
        if (statusLower === 'active' || statusLower === 'ativo') {
          statusValue = 'Ativo';
        } else if (statusLower === 'inactive' || statusLower === 'inativo') {
          statusValue = 'Inativo';
        } else if (statusLower === 'vacation' || statusLower === 'ferias') {
          statusValue = 'Ferias';
        } else if (statusLower === 'leave' || statusLower === 'licenca') {
          statusValue = 'Licenca';
        }
      } else if (motorista.status === true || motorista.status === 1) {
        statusValue = 'Ativo';
      } else if (motorista.status === false || motorista.status === 0) {
        statusValue = 'Inativo';
      }
      
      setFormData({
        nome: motorista.nome || '',
        cpf: motorista.cpf || '',
        cnh: motorista.cnh || '',
        categoria_cnh: motorista.categoria_cnh || '',
        validade_cnh: motorista.validade_cnh ? motorista.validade_cnh.split('T')[0] : '',
        telefone: motorista.telefone || '',
        endereco: motorista.endereco || '',
        data_contratacao: motorista.data_contratacao ? motorista.data_contratacao.split('T')[0] : '',
        status: statusValue
      });
      setCurrentMotorista(motorista);
    } else {
      // Create mode - reset form
      setFormData({
        nome: '',
        cpf: '',
        cnh: '',
        categoria_cnh: 'D',
        validade_cnh: '',
        telefone: '',
        endereco: '',
        data_contratacao: new Date().toISOString().split('T')[0],
        status: 'Ativo'  // Isso será convertido para true na API
      });
      setCurrentMotorista(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Limpar dados para API (a conversão de status para boolean será feita no MotoristaService)
      const apiData = {
        ...formData,
        cpf: unmask(formData.cpf),
        telefone: unmask(formData.telefone)
      };
      
      console.log('Dados a serem enviados:', apiData);
      
      if (currentMotorista) {
        // Update existing
        await MotoristaService.updateMotorista(currentMotorista.id, apiData);
        showSuccess('Motorista atualizado com sucesso!');
      } else {
        // Create new
        await MotoristaService.createMotorista(apiData);
        showSuccess('Motorista cadastrado com sucesso!');
      }
      setIsModalOpen(false);
      fetchMotoristas();
    } catch (err) {
      console.error('Error saving motorista:', err);
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : (err.response?.data?.message || err.message);
      
      showError('Erro ao salvar motorista: ' + errorMsg);
      setError('Erro ao salvar motorista: ' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (motorista) => {
    openModal(motorista);
  };

  const handleDelete = (motorista) => {
    setCurrentMotorista(motorista);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!currentMotorista || !currentMotorista.id) {
        throw new Error('ID do motorista não disponível para exclusão');
      }
      
      console.log('Tentando excluir motorista ID:', currentMotorista.id);
      await MotoristaService.deleteMotorista(currentMotorista.id);
      showSuccess('Motorista excluído com sucesso!');
      setIsDeleteModalOpen(false);
      setCurrentMotorista(null);
      fetchMotoristas();
    } catch (err) {
      console.error('Erro completo na exclusão:', err);
      const errorMsg = err.response?.data?.message || err.message;
      showError('Erro ao excluir motorista: ' + errorMsg);
      setError('Erro ao excluir motorista: ' + errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Motoristas</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Motorista
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-lg">Motoristas Cadastrados</h2>
          
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar motoristas..."
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
            data={filteredMotoristas}
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
        title={currentMotorista ? "Editar Motorista" : "Novo Motorista"}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
              <MaskedInput
                mask={MASKS.CPF}
                name="cpf"
                id="cpf"
                required
                value={formData.cpf}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Telefone</label>
              <MaskedInput
                mask={MASKS.PHONE}
                name="telefone"
                id="telefone"
                required
                value={formData.telefone}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="cnh" className="block text-sm font-medium text-gray-700">CNH</label>
              <input
                type="text"
                name="cnh"
                id="cnh"
                required
                value={formData.cnh}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="categoria_cnh" className="block text-sm font-medium text-gray-700">Categoria CNH</label>
              <select
                name="categoria_cnh"
                id="categoria_cnh"
                required
                value={formData.categoria_cnh}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="AB">AB</option>
                <option value="AC">AC</option>
                <option value="AD">AD</option>
                <option value="AE">AE</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="validade_cnh" className="block text-sm font-medium text-gray-700">Validade CNH</label>
              <input
                type="date"
                name="validade_cnh"
                id="validade_cnh"
                required
                value={formData.validade_cnh}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
            <label htmlFor="data_contratacao" className="block text-sm font-medium text-gray-700">Data de Contratação</label>
            <input
              type="date"
              name="data_contratacao"
              id="data_contratacao"
              required
              value={formData.data_contratacao}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Status como select */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              id="status"
              required
              value={formData.status}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Ferias">Férias</option>
              <option value="Licenca">Licença</option>
            </select>
          </div>
        </div>
      </FormModal>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o motorista ${currentMotorista?.nome}?`}
        isSubmitting={isSubmitting}
      />

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total de Motoristas</div>
            <div className="text-xl font-bold">{motoristas.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Motoristas Ativos</div>
            <div className="text-xl font-bold">
              {motoristas.filter(motorista => 
                motorista.status === 'active' || 
                motorista.status === true || 
                motorista.status === 1
              ).length}
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
            <div className="text-sm text-gray-500">Motoristas Inativos/Outras</div>
            <div className="text-xl font-bold">
              {motoristas.filter(motorista => 
                !(motorista.status === 'active' || 
                motorista.status === true || 
                motorista.status === 1)
              ).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};