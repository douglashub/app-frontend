import React, { useState, useEffect } from 'react';
import { OnibusService } from '../api/services';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import FormModal from '../components/common/FormModal';

const Onibus = () => {
  const [onibus, setOnibus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOnibus, setCurrentOnibus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    capacidade: '',
    ano_fabricacao: '',
    status: true
  });

  useEffect(() => {
    fetchOnibus();
  }, []);

  const fetchOnibus = async () => {
    try {
      setLoading(true);
      const response = await OnibusService.getOnibus();
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        // Convert numeric or string status to string representation for the UI
        const formattedData = response.data.data.map(bus => ({
          ...bus,
          status: typeof bus.status === 'boolean' ? (bus.status ? 'active' : 'inactive') :
                 typeof bus.status === 'number' ? (bus.status === 1 ? 'active' : 'inactive') :
                 bus.status === 'Ativo' ? 'active' : 'inactive'
        }));
        setOnibus(formattedData);
      } else {
        console.error('API returned unexpected data format');
        setError('Formato de dados inesperado. Contate o suporte.');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erro ao carregar ônibus: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openModal = (bus = null) => {
    if (bus) {
      // Edit mode
      setFormData({
        placa: bus.placa || '',
        modelo: bus.modelo || '',
        capacidade: bus.capacidade || '',
        ano_fabricacao: bus.ano_fabricacao || '',
        status: bus.status === 'active' || bus.status === true || bus.status === 1
      });
      setCurrentOnibus(bus);
    } else {
      // Create mode
      setFormData({
        placa: '',
        modelo: '',
        capacidade: '',
        ano_fabricacao: new Date().getFullYear(),
        status: true
      });
      setCurrentOnibus(null);
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
        capacidade: parseInt(formData.capacidade),
        ano_fabricacao: parseInt(formData.ano_fabricacao)
      };
      
      if (currentOnibus) {
        // Update
        await OnibusService.updateOnibus(currentOnibus.id, apiData);
      } else {
        // Create
        await OnibusService.createOnibus(apiData);
      }
      setIsModalOpen(false);
      fetchOnibus();
    } catch (err) {
      console.error('Error saving onibus:', err);
      setError('Erro ao salvar ônibus: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search and filter function
  const filteredOnibus = onibus.filter(bus => 
    bus.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'placa', header: 'Placa' },
    { key: 'modelo', header: 'Modelo' },
    { key: 'ano_fabricacao', header: 'Ano' },
    { key: 'capacidade', header: 'Capacidade', format: (item) => `${item.capacidade} passageiros` },
    { 
      key: 'status', 
      header: 'Status',
      format: (item) => <StatusBadge status={item.status} type="onibus" />
    }
  ];

  const handleEdit = (bus) => {
    openModal(bus);
  };

  const handleDelete = async (bus) => {
    if(window.confirm(`Deseja excluir o ônibus de placa ${bus.placa}?`)) {
      try {
        await OnibusService.deleteOnibus(bus.id);
        fetchOnibus();
      } catch (err) {
        setError('Erro ao excluir ônibus: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Ônibus</h1>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
          onClick={() => openModal()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Ônibus
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-lg">Frota de Ônibus</h2>
          
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar ônibus..."
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
            data={filteredOnibus}
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
        title={currentOnibus ? "Editar Ônibus" : "Novo Ônibus"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label htmlFor="placa" className="block text-sm font-medium text-gray-700">Placa</label>
            <input
              type="text"
              name="placa"
              id="placa"
              required
              value={formData.placa}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="modelo" className="block text-sm font-medium text-gray-700">Modelo</label>
            <input
              type="text"
              name="modelo"
              id="modelo"
              required
              value={formData.modelo}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="capacidade" className="block text-sm font-medium text-gray-700">Capacidade</label>
            <input
              type="number"
              name="capacidade"
              id="capacidade"
              required
              min="1"
              value={formData.capacidade}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="ano_fabricacao" className="block text-sm font-medium text-gray-700">Ano de Fabricação</label>
            <input
              type="number"
              name="ano_fabricacao"
              id="ano_fabricacao"
              required
              min="1990"
              max={new Date().getFullYear()}
              value={formData.ano_fabricacao}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
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
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total de Ônibus</div>
            <div className="text-xl font-bold">{onibus.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Ônibus Ativos</div>
            <div className="text-xl font-bold">
              {onibus.filter(bus => bus.status === 'active' || bus.status === true).length}
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
            <div className="text-sm text-gray-500">Ônibus Inativos</div>
            <div className="text-xl font-bold">
              {onibus.filter(bus => bus.status === 'inactive' || bus.status === false).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onibus;