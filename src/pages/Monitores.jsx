import React, { useState, useEffect } from 'react';
import { MonitorService } from '../api/services';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import FormModal from '../components/common/FormModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import { useNotification } from '../contexts/NotificationContext';
import MaskedInput from '../utils/masks/components/MaskedInput';
import { MASKS } from '../utils/masks/constants';
import { processStatus } from '../utils/statusProcessor';

const Monitores = () => {
  const [monitores, setMonitores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentMonitor, setCurrentMonitor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotification ? useNotification() : { 
    showSuccess: () => {}, 
    showError: () => {} 
  };
  
  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    endereco: '',
    data_contratacao: '',
    status: 'Ativo'
  });

  useEffect(() => {
    fetchMonitores();
  }, []);

  const fetchMonitores = async () => {
    try {
      setLoading(true);
      const response = await MonitorService.getMonitores();
      
      // Process the API response
      let monitoresData = [];
      
      if (response?.data) {
        // Case 1: Standard response with 'data' inside response.data (common in Laravel)
        if (response.data.data && Array.isArray(response.data.data)) {
          monitoresData = response.data.data;
        } 
        // Case 2: Response is a direct array (fallback)
        else if (Array.isArray(response.data)) {
          monitoresData = response.data;
        }
        // Case 3: Paginated Laravel response via items()
        else if (response.data.meta && Array.isArray(response.data.data)) {
          monitoresData = response.data.data;
        }
        
        // Format data for UI - convert status to a standardized format
        const formattedData = monitoresData.map(monitor => ({
          ...monitor,
          status: processStatus(monitor.status, 'monitor')
        }));
        
        setMonitores(formattedData);
        setError(null);
      } else {
        // Case 4: No valid data from API
        console.warn('API returned unexpected format');
        setMonitores([]);
        setError('Nenhum dado de monitor encontrado no servidor.');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erro ao carregar monitores: ' + (err.response?.data?.message || err.message));
      setMonitores([]);
    } finally {
      setLoading(false);
    }
  };

  // Search and filter function
  const filteredMonitores = monitores.filter(monitor => 
    monitor.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    monitor.cpf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    monitor.telefone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'cpf', header: 'CPF' },
    { key: 'telefone', header: 'Telefone' },
    { 
      key: 'data_contratacao', 
      header: 'Data de Contratação',
      format: (item) => {
        if (!item.data_contratacao) return '-';
        const date = new Date(item.data_contratacao);
        return date.toLocaleDateString('pt-BR');
      }
    },
    { 
      key: 'status', 
      header: 'Status',
      format: (item) => <StatusBadge status={item.status} type="monitor" />
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openModal = (monitor = null) => {
    if (monitor) {
      // Edit mode - convert any status to our enum values for display
      let statusValue = 'Ativo'; // default
      
      if (typeof monitor.status === 'string') {
        const statusLower = monitor.status.toLowerCase();
        if (statusLower === 'active' || statusLower === 'ativo') {
          statusValue = 'Ativo';
        } else if (statusLower === 'inactive' || statusLower === 'inativo') {
          statusValue = 'Inativo';
        } else if (statusLower === 'vacation' || statusLower === 'ferias') {
          statusValue = 'Ferias';
        } else if (statusLower === 'leave' || statusLower === 'licenca') {
          statusValue = 'Licenca';
        }
      } else if (monitor.status === true || monitor.status === 1) {
        statusValue = 'Ativo';
      } else if (monitor.status === false || monitor.status === 0) {
        statusValue = 'Inativo';
      }
      
      setFormData({
        nome: monitor.nome || '',
        cpf: monitor.cpf || '',
        telefone: monitor.telefone || '',
        endereco: monitor.endereco || '',
        data_contratacao: monitor.data_contratacao ? monitor.data_contratacao.split('T')[0] : '',
        status: statusValue
      });
      setCurrentMonitor(monitor);
    } else {
      // Create mode - reset form
      setFormData({
        nome: '',
        cpf: '',
        telefone: '',
        endereco: '',
        data_contratacao: new Date().toISOString().split('T')[0],
        status: 'Ativo'
      });
      setCurrentMonitor(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create copy of data for API
      const apiData = {
        ...formData
      };
      
      if (currentMonitor) {
        // Update existing
        await MonitorService.updateMonitor(currentMonitor.id, apiData);
        showSuccess('Monitor atualizado com sucesso!');
      } else {
        // Create new
        await MonitorService.createMonitor(apiData);
        showSuccess('Monitor cadastrado com sucesso!');
      }
      setIsModalOpen(false);
      fetchMonitores();
    } catch (err) {
      console.error('Error saving monitor:', err);
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : (err.response?.data?.message || err.message);
      
      showError('Erro ao salvar monitor: ' + errorMsg);
      setError('Erro ao salvar monitor: ' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (monitor) => {
    openModal(monitor);
  };

  const handleDelete = (monitor) => {
    setCurrentMonitor(monitor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!currentMonitor || !currentMonitor.id) {
        throw new Error('ID do monitor não disponível para exclusão');
      }
      
      await MonitorService.deleteMonitor(currentMonitor.id);
      showSuccess('Monitor excluído com sucesso!');
      setIsDeleteModalOpen(false);
      setCurrentMonitor(null);
      fetchMonitores();
    } catch (err) {
      console.error('Erro completo na exclusão:', err);
      const errorMsg = err.response?.data?.message || err.message;
      showError('Erro ao excluir monitor: ' + errorMsg);
      setError('Erro ao excluir monitor: ' + errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Monitores</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Monitor
        </button>
      </div>

      <div className="bg-white overflow-hidden rounded-lg shadow">
        <div className="px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 border-b">
          <h2 className="font-bold text-lg">Monitores Cadastrados</h2>
          
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar monitores..."
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
            data={filteredMonitores}
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
        title={currentMonitor ? "Editar Monitor" : "Novo Monitor"}
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
        message={`Tem certeza que deseja excluir o monitor ${currentMonitor?.nome}?`}
        isSubmitting={isSubmitting}
      />

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total de Monitores</div>
            <div className="text-xl font-bold">{monitores.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Monitores Ativos</div>
            <div className="text-xl font-bold">
              {monitores.filter(monitor => 
                monitor.status === 'active' || 
                monitor.status === true || 
                monitor.status === 1
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
            <div className="text-sm text-gray-500">Monitores Inativos/Outras</div>
            <div className="text-xl font-bold">
              {monitores.filter(monitor => 
                !(monitor.status === 'active' || 
                monitor.status === true || 
                monitor.status === 1)
              ).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitores;