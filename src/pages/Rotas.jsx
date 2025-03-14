import React, { useState, useEffect } from 'react';
import { RotaService } from '../api/services';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import FormModal from '../components/common/FormModal';
import { useNotification } from '../contexts/NotificationContext';

const Rotas = () => {
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRota, setCurrentRota] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { showSuccess, showError } = useNotification ? useNotification() : { 
    showSuccess: () => {}, 
    showError: () => {} 
  };
  
  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'Escolar',
    origem: '',
    destino: '',
    horario_inicio: '',
    horario_fim: '',
    distancia_km: '',
    tempo_estimado_minutos: '',
    status: true
  });

  useEffect(() => {
    fetchRotas();
  }, []);

  const fetchRotas = async () => {
    try {
      setLoading(true);
      const response = await RotaService.getRotas();
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        // Process data - ensure status is standardized
        const formattedData = response.data.data.map(rota => ({
          ...rota,
          status: convertStatus(rota.status)
        }));
        setRotas(formattedData);
      } else if (Array.isArray(response?.data)) {
        // Alternative API response format
        const formattedData = response.data.map(rota => ({
          ...rota,
          status: convertStatus(rota.status)
        }));
        setRotas(formattedData);
      } else {
        console.error('API returned unexpected data format');
        setError('Formato de dados inesperado. Contate o suporte.');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erro ao carregar rotas: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Convert various status formats to a standardized format
  const convertStatus = (status) => {
    if (typeof status === 'boolean') {
      return status ? 'active' : 'inactive';
    } else if (typeof status === 'number') {
      return status === 1 ? 'active' : 'inactive';
    } else if (typeof status === 'string') {
      const statusLower = status.toLowerCase();
      if (statusLower === 'true' || statusLower === 'ativo' || statusLower === '1' || statusLower === 'active' || statusLower === 'ativa') {
        return 'active';
      } else if (statusLower === 'false' || statusLower === 'inativo' || statusLower === '0' || statusLower === 'inactive' || statusLower === 'inativa') {
        return 'inactive';
      }
      return status; // Keep original if no match
    }
    return 'inactive'; // Default value
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openModal = (rota = null) => {
    if (rota) {
      // Edit mode
      setFormData({
        nome: rota.nome || '',
        descricao: rota.descricao || '',
        tipo: rota.tipo || 'Escolar',
        origem: rota.origem || '',
        destino: rota.destino || '',
        horario_inicio: rota.horario_inicio || '',
        horario_fim: rota.horario_fim || '',
        distancia_km: rota.distancia_km || '',
        tempo_estimado_minutos: rota.tempo_estimado_minutos || '',
        status: rota.status === 'active' || rota.status === true || rota.status === 1
      });
      setCurrentRota(rota);
    } else {
      // Create mode
      setFormData({
        nome: '',
        descricao: '',
        tipo: 'Escolar',
        origem: '',
        destino: '',
        horario_inicio: '',
        horario_fim: '',
        distancia_km: '',
        tempo_estimado_minutos: '',
        status: true
      });
      setCurrentRota(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare data for API - converting to expected format
      const apiData = {
        ...formData,
        distancia_km: formData.distancia_km ? parseFloat(formData.distancia_km) : null,
        tempo_estimado_minutos: formData.tempo_estimado_minutos ? parseInt(formData.tempo_estimado_minutos) : null
      };
      
      if (currentRota) {
        // Update
        await RotaService.updateRota(currentRota.id, apiData);
        showSuccess('Rota atualizada com sucesso!');
      } else {
        // Create
        await RotaService.createRota(apiData);
        showSuccess('Rota criada com sucesso!');
      }
      setIsModalOpen(false);
      fetchRotas();
    } catch (err) {
      console.error('Error saving rota:', err);
      const errorMsg = err.response?.data?.message || err.message;
      setError('Erro ao salvar rota: ' + errorMsg);
      showError('Erro ao salvar rota: ' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search and filter function
  const filteredRotas = rotas.filter(rota => 
    rota.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rota.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rota.origem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rota.destino?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'tipo', header: 'Tipo' },
    { 
      key: 'origem_destino', 
      header: 'Origem / Destino',
      format: (item) => `${item.origem || '-'} → ${item.destino || '-'}`
    },
    { 
      key: 'distancia', 
      header: 'Distância', 
      format: (item) => item.distancia_km ? `${item.distancia_km} km` : '-' 
    },
    { 
      key: 'status', 
      header: 'Status',
      format: (item) => <StatusBadge status={item.status} type="rota" />
    }
  ];

  const handleEdit = (rota) => {
    openModal(rota);
  };

  const handleDelete = async (rota) => {
    if(window.confirm(`Deseja excluir a rota ${rota.nome}?`)) {
      try {
        await RotaService.deleteRota(rota.id);
        showSuccess('Rota excluída com sucesso!');
        fetchRotas();
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        setError('Erro ao excluir rota: ' + errorMsg);
        showError('Erro ao excluir rota: ' + errorMsg);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Rotas</h1>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
          onClick={() => openModal()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Rota
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-lg">Rotas Cadastradas</h2>
          
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar rotas..."
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
            data={filteredRotas}
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
        title={currentRota ? "Editar Rota" : "Nova Rota"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome da Rota</label>
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
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              name="descricao"
              id="descricao"
              rows="2"
              value={formData.descricao}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo de Rota</label>
            <select
              name="tipo"
              id="tipo"
              required
              value={formData.tipo}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Escolar">Escolar</option>
              <option value="Regular">Regular</option>
              <option value="Especial">Especial</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="origem" className="block text-sm font-medium text-gray-700">Origem</label>
              <input
                type="text"
                name="origem"
                id="origem"
                value={formData.origem}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="destino" className="block text-sm font-medium text-gray-700">Destino</label>
              <input
                type="text"
                name="destino"
                id="destino"
                value={formData.destino}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="horario_inicio" className="block text-sm font-medium text-gray-700">Horário de Início</label>
              <input
                type="time"
                name="horario_inicio"
                id="horario_inicio"
                value={formData.horario_inicio}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="horario_fim" className="block text-sm font-medium text-gray-700">Horário de Fim</label>
              <input
                type="time"
                name="horario_fim"
                id="horario_fim"
                value={formData.horario_fim}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="distancia_km" className="block text-sm font-medium text-gray-700">Distância (km)</label>
              <input
                type="number"
                name="distancia_km"
                id="distancia_km"
                min="0"
                step="0.1"
                value={formData.distancia_km}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="tempo_estimado_minutos" className="block text-sm font-medium text-gray-700">Tempo Estimado (minutos)</label>
              <input
                type="number"
                name="tempo_estimado_minutos"
                id="tempo_estimado_minutos"
                min="0"
                value={formData.tempo_estimado_minutos}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
            <label htmlFor="status" className="ml-2 block text-sm text-gray-900">Ativa</label>
          </div>
        </div>
      </FormModal>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total de Rotas</div>
            <div className="text-xl font-bold">{rotas.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Rotas Ativas</div>
            <div className="text-xl font-bold">
              {rotas.filter(rota => rota.status === 'active').length}
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
            <div className="text-sm text-gray-500">Rotas Inativas</div>
            <div className="text-xl font-bold">
              {rotas.filter(rota => rota.status === 'inactive').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rotas;