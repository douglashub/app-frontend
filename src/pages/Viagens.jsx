import React, { useState, useEffect } from 'react';
import { ViagemService, RotaService, OnibusService, MotoristaService, MonitorService, HorarioService } from '../api/services';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import FormModal from '../components/common/FormModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import { useNotification } from '../contexts/NotificationContext';
import { MASKS } from '../utils/masks/constants';
import MaskedInput from '../utils/masks/components/MaskedInput';
import PlacaInput from '../utils/masks/components/PlacaInput';

const Viagens = () => {
  const { showError, showSuccess } = useNotification();

  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentViagem, setCurrentViagem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Related data for dropdown selects
  const [rotas, setRotas] = useState([]);
  const [onibus, setOnibus] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [monitores, setMonitores] = useState([]);
  const [relatedDataLoading, setRelatedDataLoading] = useState(false);
  const [horarios, setHorarios] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    data_viagem: '',
    rota_id: '',
    onibus_id: '',
    motorista_id: '',
    monitor_id: '',
    horario_id: '', // Default value, will be replaced with actual data
    hora_saida_prevista: '',
    hora_chegada_prevista: '',
    hora_saida_real: '',
    hora_chegada_real: '',
    observacoes: '',
    status: true,
    telefone_motorista: '',
    telefone_monitor: ''
  });

  useEffect(() => {
    fetchViagens();
    fetchRelatedData();
  }, []);

  const fetchViagens = async () => {
    try {
      setLoading(true);
      const response = await ViagemService.getViagens();

      if (response?.data?.data && Array.isArray(response.data.data)) {
        // Convert status to match UI requirements
        const formattedData = response.data.data.map(viagem => ({
          ...viagem,
          status: viagem.status ? 'completed' : 'pending'
        }));
        setViagens(formattedData);
      } else {
        console.error('API returned unexpected data format');
        showError('Formato de dados inesperado. Contate o suporte.');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      showError('Erro ao carregar viagens: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    setRelatedDataLoading(true);
    try {
      const [rotasRes, onibusRes, motoristasRes, monitoresRes, horariosRes] = await Promise.all([
        RotaService.getRotas(),
        OnibusService.getOnibus(),
        MotoristaService.getMotoristas(),
        MonitorService.getMonitores(),
        HorarioService.getHorarios()
      ]);

      console.log("Resposta completa da API para horários:", horariosRes); // LOG COMPLETO

      // Correção: acessando corretamente os horários
      const horariosArray = horariosRes?.data?.data?.data ?? [];

      console.log("Horários extraídos corretamente:", horariosArray); // LOG PARA VERIFICAR OS DADOS

      const formattedHorarios = horariosArray.map(horario => ({
        ...horario,
        hora_inicio: formatTimeForDisplay(horario.hora_inicio),
        hora_fim: formatTimeForDisplay(horario.hora_fim)
      }));

      console.log("Horários processados:", formattedHorarios);

      setRotas(rotasRes?.data?.data ?? []);
      setOnibus(onibusRes?.data?.data ?? []);
      setMotoristas(motoristasRes?.data?.data ?? []);
      setMonitores(monitoresRes?.data?.data ?? []);
      setHorarios(formattedHorarios);

    } catch (err) {
      console.error("Erro ao buscar dados relacionados:", err);
      showError("Erro ao carregar dados relacionados: " + err.message);
    } finally {
      setRelatedDataLoading(false);
    }
  };




  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openModal = (viagem = null) => {
    if (viagem) {
      const motorista = motoristas.find(m => m.id === viagem.motorista_id);
      const monitor = monitores.find(m => m.id === viagem.monitor_id);

      setFormData({
        data_viagem: viagem.data_viagem || '',
        rota_id: viagem.rota_id || '',
        onibus_id: viagem.onibus_id || '',
        motorista_id: viagem.motorista_id || '',
        monitor_id: viagem.monitor_id || '',
        horario_id: viagem.horario_id || '', // Mantém vazio caso não exista

        hora_saida_prevista: formatTimeForDisplay(viagem.hora_saida_prevista),
        hora_chegada_prevista: formatTimeForDisplay(viagem.hora_chegada_prevista),
        hora_saida_real: formatTimeForDisplay(viagem.hora_saida_real),
        hora_chegada_real: formatTimeForDisplay(viagem.hora_chegada_real),

        observacoes: viagem.observacoes || '',
        status: viagem.status === 'concluida' || viagem.status === true,

        telefone_motorista: motorista ? motorista.telefone : '',
        telefone_monitor: monitor ? monitor.telefone : ''
      });

      setCurrentViagem(viagem);
    } else {
      setFormData({
        data_viagem: new Date().toISOString().split('T')[0],
        rota_id: '',
        onibus_id: '',
        motorista_id: '',
        monitor_id: '',
        horario_id: '', // Mantém vazio ao criar uma nova viagem
        hora_saida_prevista: '07:00',
        hora_chegada_prevista: '08:00',
        hora_saida_real: '',
        hora_chegada_real: '',
        observacoes: '',
        status: true,
        telefone_motorista: '',
        telefone_monitor: ''
      });

      setCurrentViagem(null);
    }
    setIsModalOpen(true);
  };


  // Format time values from API format (H:i) to HTML time input format (HH:mm)
  const formatTimeForDisplay = (time) => {
    if (!time) return '';
    try {
      console.log("Formatando horário:", time); // DEBUG
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Erro ao formatar horário para exibição:', error);
      return '';
    }
  };


  const formatTimeForApi = (time) => {
    if (!time) return null;
    try {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}:00`; // Mantém o formato correto "HH:mm:ss"
    } catch (error) {
      console.error('Erro ao formatar horário para API:', error);
      return null;
    }
  };

  // Atualizar os dados de telefone quando o motorista ou monitor é alterado
  const handleMotoristaChange = (e) => {
    const motoristaId = e.target.value;
    const motorista = motoristas.find(m => m.id === parseInt(motoristaId));

    setFormData({
      ...formData,
      motorista_id: motoristaId,
      telefone_motorista: motorista ? motorista.telefone : ''
    });
  };

  const handleMonitorChange = (e) => {
    const monitorId = e.target.value;
    const monitor = monitores.find(m => m.id === parseInt(monitorId));

    setFormData({
      ...formData,
      monitor_id: monitorId,
      telefone_monitor: monitor ? monitor.telefone : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiData = {
        ...formData,
        hora_saida_prevista: formData.hora_saida_prevista ? formatTimeForApi(formData.hora_saida_prevista) : null,
        hora_chegada_prevista: formData.hora_chegada_prevista ? formatTimeForApi(formData.hora_chegada_prevista) : null,
        hora_saida_real: formData.hora_saida_real ? formatTimeForApi(formData.hora_saida_real) : null,
        hora_chegada_real: formData.hora_chegada_real ? formatTimeForApi(formData.hora_chegada_real) : null,
        horario_id: formData.horario_id || null,
        status: formData.status ? 1 : 0
      };

      delete apiData.telefone_motorista;
      delete apiData.telefone_monitor;

      if (currentViagem) {
        await ViagemService.updateViagem(currentViagem.id, apiData);
        showSuccess('Viagem atualizada com sucesso!');
      } else {
        await ViagemService.createViagem(apiData);
        showSuccess('Viagem criada com sucesso!');
      }

      setIsModalOpen(false);
      fetchViagens();
    } catch (err) {
      console.error('Erro ao salvar viagem:', err);
      showError('Erro ao salvar viagem: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };



  // Get the name of a linked entity based on its ID
  const getRotaName = (id) => {
    const rota = rotas.find(r => r.id === id);
    return rota ? rota.nome : 'Desconhecida';
  };

  const getOnibusName = (id) => {
    const bus = onibus.find(o => o.id === id);
    return bus ? bus.placa : 'Desconhecido';
  };

  const getMotoristaName = (id) => {
    const motorista = motoristas.find(m => m.id === id);
    return motorista ? motorista.nome : 'Desconhecido';
  };

  // Format a date from ISO to local date format
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Format nested object or use ID to lookup name
  const formatNestedName = (item, field, nameFn) => {
    if (item[field] && typeof item[field] === 'object') {
      return item[field].nome || item[field].placa || 'Desconhecido';
    }
    return nameFn(item[`${field}_id`]);
  };

  const columns = [
    {
      key: 'data_viagem',
      header: 'Data',
      format: (item) => formatDate(item.data_viagem)
    },
    {
      key: 'rota',
      header: 'Rota',
      format: (item) => formatNestedName(item, 'rota', getRotaName)
    },
    {
      key: 'onibus',
      header: 'Ônibus',
      format: (item) => formatNestedName(item, 'onibus', getOnibusName)
    },
    {
      key: 'motorista',
      header: 'Motorista',
      format: (item) => formatNestedName(item, 'motorista', getMotoristaName)
    },
    {
      key: 'status',
      header: 'Status',
      format: (item) => {
        const statusText = item.status === 'concluida' || item.status === true || item.status === 1 ? 'Concluída' : 'Pendente';
        return <StatusBadge status={statusText} type="viagem" />;
      }
    }
  ];

  const handleEdit = (viagem) => {
    openModal(viagem);
  };

  const handleDelete = (viagem) => {
    setCurrentViagem(viagem);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await ViagemService.deleteViagem(currentViagem.id);
      showSuccess('Viagem excluída com sucesso!');
      setIsDeleteModalOpen(false);
      setCurrentViagem(null);
      fetchViagens();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError('Erro ao excluir viagem: ' + errorMsg);
      showError('Erro ao excluir viagem: ' + errorMsg);
    }
  };

  const filteredViagens = viagens.filter(viagem => {
    const searchLower = searchTerm.toLowerCase();
    return (
      viagem.data_viagem.toLowerCase().includes(searchLower) ||
      formatNestedName(viagem, 'rota', getRotaName).toLowerCase().includes(searchLower) ||
      formatNestedName(viagem, 'onibus', getOnibusName).toLowerCase().includes(searchLower) ||
      formatNestedName(viagem, 'motorista', getMotoristaName).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Viagens</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
          onClick={() => openModal()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Viagem
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-lg">Viagens Programadas</h2>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar viagens..."
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
            data={filteredViagens}
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
        title={currentViagem ? "Editar Viagem" : "Nova Viagem"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label htmlFor="data_viagem" className="block text-sm font-medium text-gray-700">Data da Viagem</label>
            <input
              type="date"
              name="data_viagem"
              id="data_viagem"
              required
              value={formData.data_viagem}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="horario_id" className="block text-sm font-medium text-gray-700">
              Horário (opcional)
            </label>
            <select
              name="horario_id"
              id="horario_id"
              value={formData.horario_id || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={relatedDataLoading || horarios.length === 0} // SOMENTE DESABILITA SE AMBOS FOREM VERDADEIROS
            >
              <option value="">Nenhum horário selecionado</option>
              {horarios.length > 0 ? (
                horarios.map(horario => (
                  <option key={horario.id} value={horario.id}>
                    {horario.hora_inicio} - {horario.hora_fim}
                  </option>
                ))
              ) : (
                <option disabled>Nenhum horário disponível</option>
              )}
            </select>

          </div>


          <div>
            <label htmlFor="rota_id" className="block text-sm font-medium text-gray-700">Rota</label>
            <select
              name="rota_id"
              id="rota_id"
              required
              value={formData.rota_id}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={relatedDataLoading}
            >
              <option value="">Selecione uma rota</option>
              {rotas.map(rota => (
                <option key={rota.id} value={rota.id}>{rota.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="onibus_id" className="block text-sm font-medium text-gray-700">Ônibus</label>
            <select
              name="onibus_id"
              id="onibus_id"
              required
              value={formData.onibus_id}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={relatedDataLoading}
            >
              <option value="">Selecione um ônibus</option>
              {onibus.map(bus => (
                <option key={bus.id} value={bus.id}>{bus.placa} - {bus.modelo}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="motorista_id" className="block text-sm font-medium text-gray-700">Motorista</label>
            <select
              name="motorista_id"
              id="motorista_id"
              required
              value={formData.motorista_id}
              onChange={handleMotoristaChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={relatedDataLoading}
            >
              <option value="">Selecione um motorista</option>
              {motoristas.map(motorista => (
                <option key={motorista.id} value={motorista.id}>{motorista.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="monitor_id" className="block text-sm font-medium text-gray-700">Monitor (opcional)</label>
            <select
              name="monitor_id"
              id="monitor_id"
              value={formData.monitor_id}
              onChange={handleMonitorChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={relatedDataLoading}
            >
              <option value="">Nenhum monitor</option>
              {monitores.map(monitor => (
                <option key={monitor.id} value={monitor.id}>{monitor.nome}</option>
              ))}
            </select>
          </div>

          {/* Hidden field for horario_id - required by API but handled separately */}
          <input type="hidden" name="horario_id" value={formData.horario_id} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hora_saida_prevista" className="block text-sm font-medium text-gray-700">Hora Saída Prevista</label>
              <input
                type="time"
                name="hora_saida_prevista"
                id="hora_saida_prevista"
                required
                value={formData.hora_saida_prevista}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="hora_chegada_prevista" className="block text-sm font-medium text-gray-700">Hora Chegada Prevista</label>
              <input
                type="time"
                name="hora_chegada_prevista"
                id="hora_chegada_prevista"
                required
                value={formData.hora_chegada_prevista}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="telefone_motorista" className="block text-sm font-medium text-gray-700">Telefone Motorista</label>
              <MaskedInput
                mask={MASKS.PHONE}
                name="telefone_motorista"
                id="telefone_motorista"
                value={formData.telefone_motorista}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    telefone_motorista: e.target.value
                  });
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={false}
              />
            </div>
            <div>
              <label htmlFor="telefone_monitor" className="block text-sm font-medium text-gray-700">Telefone Monitor</label>
              <MaskedInput
                mask={MASKS.PHONE}
                name="telefone_monitor"
                id="telefone_monitor"
                value={formData.telefone_monitor}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    telefone_monitor: e.target.value
                  });
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={false}
              />
            </div>
          </div>

          <div>
            <label htmlFor="hora_saida_real" className="block text-sm font-medium text-gray-700">Hora Saída Real</label>
            <input
              type="time"
              name="hora_saida_real"
              id="hora_saida_real"
              value={formData.hora_saida_real}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="hora_chegada_real" className="block text-sm font-medium text-gray-700">Hora Chegada Real</label>
            <input
              type="time"
              name="hora_chegada_real"
              id="hora_chegada_real"
              value={formData.hora_chegada_real}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              name="observacoes"
              id="observacoes"
              rows="2"
              value={formData.observacoes}
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
            <label htmlFor="status" className="ml-2 block text-sm text-gray-900">Ativa</label>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal - moved outside of FormModal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a viagem de ${currentViagem?.data_viagem}?`}
        isSubmitting={isSubmitting}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total de Viagens</div>
            <div className="text-xl font-bold">{viagens.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Viagens Concluídas</div>
            <div className="text-xl font-bold">
              {viagens.filter(viagem => viagem.status === 'completed').length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Viagens Pendentes</div>
            <div className="text-xl font-bold">
              {viagens.filter(viagem => viagem.status === 'pending').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Viagens;