import React, { useState, useEffect } from 'react';
import { ParadaService } from '../api/services';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import FormModal from '../components/common/FormModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import { useNotification } from '../contexts/NotificationContext';
import { processStatus } from '../utils/statusProcessor';

const Paradas = () => {
  const [paradas, setParadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentParada, setCurrentParada] = useState(null);
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
    ponto_referencia: '',
    latitude: '',
    longitude: '',
    endereco: '',
    tipo: 'Intermediaria', // Default value
    status: true
  });

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState({
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchParadas();
  }, []);

  const fetchParadas = async () => {
    try {
      setLoading(true);
      const response = await ParadaService.getParadas();
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        // Process data - ensure status is standardized
        const formattedData = response.data.data.map(parada => ({
          ...parada,
          status: processStatus(parada.status, 'parada')
        }));
        setParadas(formattedData);
      } else if (Array.isArray(response?.data)) {
        // Alternative API response format
        const formattedData = response.data.map(parada => ({
          ...parada,
          status: processStatus(parada.status, 'parada')
        }));
        setParadas(formattedData);
      } else {
        console.error('API returned unexpected data format');
        setError('Formato de dados inesperado. Contate o suporte.');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erro ao carregar paradas: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Validate coordinate inputs
  const validateCoordinates = () => {
    let errors = {
      latitude: '',
      longitude: ''
    };
    let isValid = true;

    // Validate latitude
    if (formData.latitude) {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat)) {
        errors.latitude = 'Latitude deve ser um número';
        isValid = false;
      } else if (lat < -90 || lat > 90) {
        errors.latitude = 'Latitude deve estar entre -90 e 90';
        isValid = false;
      }
    }

    // Validate longitude
    if (formData.longitude) {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng)) {
        errors.longitude = 'Longitude deve ser um número';
        isValid = false;
      } else if (lng < -180 || lng > 180) {
        errors.longitude = 'Longitude deve estar entre -180 e 180';
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For checkboxes, use the checked property
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
      return;
    }
    
    // For coordinates, perform validation
    if (name === 'latitude' || name === 'longitude') {
      // Allow empty string or valid decimal input with . or ,
      const isValidInput = value === '' || /^-?\d*[.,]?\d*$/.test(value);
      
      if (isValidInput) {
        // Normalize decimal separators
        const normalizedValue = value.replace(',', '.');
        
        setFormData({
          ...formData,
          [name]: normalizedValue
        });
        
        // Clear validation error if the field is now valid
        if (validationErrors[name]) {
          setValidationErrors({
            ...validationErrors,
            [name]: ''
          });
        }
      }
      return;
    }
    
    // For all other inputs
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const openModal = (parada = null) => {
    // Reset validation errors
    setValidationErrors({
      latitude: '',
      longitude: ''
    });
    
    if (parada) {
      // Edit mode
      setFormData({
        nome: parada.nome || '',
        descricao: parada.descricao || '',
        ponto_referencia: parada.ponto_referencia || '',
        latitude: parada.latitude?.toString() || '',
        longitude: parada.longitude?.toString() || '',
        endereco: parada.endereco || '',
        tipo: parada.tipo || 'Intermediaria',
        status: parada.status === 'active' || parada.status === true || parada.status === 1
      });
      setCurrentParada(parada);
    } else {
      // Create mode
      setFormData({
        nome: '',
        descricao: '',
        ponto_referencia: '',
        latitude: '',
        longitude: '',
        endereco: '',
        tipo: 'Intermediaria',
        status: true
      });
      setCurrentParada(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate coordinates before submission
    if (!validateCoordinates()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        // Convert coordinates to numbers if present
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };
      
      if (currentParada) {
        // Update
        await ParadaService.updateParada(currentParada.id, apiData);
        showSuccess('Parada atualizada com sucesso!');
      } else {
        // Create
        await ParadaService.createParada(apiData);
        showSuccess('Parada criada com sucesso!');
      }
      setIsModalOpen(false);
      fetchParadas();
    } catch (err) {
      console.error('Error saving parada:', err);
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ') 
        : (err.response?.data?.message || err.message);
      
      showError('Erro ao salvar parada: ' + errorMsg);
      setError('Erro ao salvar parada: ' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search and filter function
  const filteredParadas = paradas.filter(parada => 
    parada.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parada.endereco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parada.ponto_referencia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'endereco', header: 'Endereço' },
    { key: 'ponto_referencia', header: 'Ponto de Referência' },
    { key: 'tipo', header: 'Tipo' },
    { 
      key: 'status', 
      header: 'Status',
      format: (item) => <StatusBadge status={item.status} type="parada" />
    }
  ];

  const handleEdit = (parada) => {
    openModal(parada);
  };

  const handleDelete = (parada) => {
    setCurrentParada(parada);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await ParadaService.deleteParada(currentParada.id);
      showSuccess('Parada excluída com sucesso!');
      setIsDeleteModalOpen(false);
      setCurrentParada(null);
      fetchParadas();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      showError('Erro ao excluir parada: ' + errorMsg);
      setError('Erro ao excluir parada: ' + errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Paradas</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
          onClick={() => openModal()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Parada
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-lg">Paradas Cadastradas</h2>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar paradas..."
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
            data={filteredParadas}
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
        title={currentParada ? "Editar Parada" : "Nova Parada"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome da Parada</label>
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
              placeholder="Ex: Em frente ao supermercado"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
              <input
                type="text"
                name="latitude"
                id="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                className={`mt-1 block w-full border ${validationErrors.latitude ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Ex: -23.550520"
              />
              {validationErrors.latitude && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.latitude}</p>
              )}
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
              <input
                type="text"
                name="longitude"
                id="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                className={`mt-1 block w-full border ${validationErrors.longitude ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Ex: -46.633309"
              />
              {validationErrors.longitude && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.longitude}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo de Parada</label>
            <select
              name="tipo"
              id="tipo"
              required
              value={formData.tipo}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Inicio">Início</option>
              <option value="Intermediaria">Intermediária</option>
              <option value="Final">Final</option>
            </select>
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
              placeholder="Informações adicionais sobre a parada..."
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
            <label htmlFor="status" className="ml-2 block text-sm text-gray-900">Ativa</label>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a parada "${currentParada?.nome}"?`}
        isSubmitting={isSubmitting}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total de Paradas</div>
            <div className="text-xl font-bold">{paradas.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Paradas Ativas</div>
            <div className="text-xl font-bold">
              {paradas.filter(parada => parada.status === 'active').length}
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
            <div className="text-sm text-gray-500">Paradas Inativas</div>
            <div className="text-xl font-bold">
              {paradas.filter(parada => parada.status === 'inactive').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paradas;