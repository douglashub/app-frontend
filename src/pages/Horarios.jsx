import React, { useState, useEffect } from 'react';
import { HorarioService, RotaService, formatTimeForApi } from '../api/services';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import FormModal from '../components/common/FormModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import { useNotification } from '../contexts/NotificationContext';

const Horarios = () => {
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentHorario, setCurrentHorario] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { showSuccess, showError } = useNotification ? useNotification() : {
        showSuccess: () => { },
        showError: () => { }
    };

    // Form state
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        hora_inicio: '',
        hora_fim: '',
        tipo: 'regular',
        status: true,
        rota_id: '',
        dias_semana: []
    });

    // Estado para armazenar as rotas
    const [rotas, setRotas] = useState([]);

    // Dias da semana disponíveis
    const diasSemanaOptions = [
        { value: 'segunda', label: 'Segunda-feira' },
        { value: 'terca', label: 'Terça-feira' },
        { value: 'quarta', label: 'Quarta-feira' },
        { value: 'quinta', label: 'Quinta-feira' },
        { value: 'sexta', label: 'Sexta-feira' },
        { value: 'sabado', label: 'Sábado' },
        { value: 'domingo', label: 'Domingo' }
    ];

    useEffect(() => {
        fetchHorarios();
        fetchRotas();
    }, []);

    const fetchRotas = async () => {
        try {
            const response = await RotaService.getRotas();
            let rotasData = [];
            
            if (response?.data?.data && Array.isArray(response.data.data)) {
                rotasData = response.data.data;
            } else if (Array.isArray(response?.data)) {
                rotasData = response.data;
            }
            
            setRotas(rotasData);
        } catch (err) {
            console.error('Erro ao buscar rotas:', err);
            showError('Erro ao carregar rotas: ' + (err.response?.data?.message || err.message));
        }
    };

    const fetchHorarios = async () => {
        try {
            setLoading(true);
            const response = await HorarioService.getHorarios();

            console.log('API Response:', response); // Log completo da resposta

            let horarioData = [];

            // Extrair dados da resposta da API
            if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
                horarioData = response.data.data.data;
            } else if (response?.data?.data && Array.isArray(response.data.data)) {
                horarioData = response.data.data;
            } else if (Array.isArray(response?.data)) {
                horarioData = response.data;
            } else {
                console.error('Estrutura de resposta inesperada:', response);
                horarioData = [];
            }

            if (horarioData.length === 0) {
                setError('Nenhum horário encontrado');
            }

            // Formatar os dados independentemente do tamanho da lista
            console.log('Dados antes da formatação:', horarioData);
            const formattedData = horarioData.map(horario => {
                // Converter os dias da semana para nomes
                const diasFormatados = Array.isArray(horario.dias_semana) 
                    ? horario.dias_semana.map(dia => diasSemanaOptions[dia]?.label || '').join(', ')
                    : '';
            
                return {
                    ...horario,
                    nome: horario.nome || 'Sem nome',
                    tipo: horario.tipo || 'regular',
                    descricao: horario.descricao || 'Sem descrição',
                    hora_inicio: horario.hora_inicio ? horario.hora_inicio.substring(0, 5) : '',
                    hora_fim: horario.hora_fim ? horario.hora_fim.substring(0, 5) : '',
                    status: convertStatus(horario.status),
                    dias_semana_formatado: diasFormatados,
                    rota_id: horario.rota_id || ''
                };
            });
            console.log('Dados após formatação:', formattedData);
            console.log('Dados após formatação:', formattedData);
            setHorarios(formattedData);
        } catch (err) {
            console.error('Erro ao buscar horários:', err);
            console.error('Detalhes do erro:', {
                message: err.message,
                response: err.response,
                stack: err.stack
            });
            setError('Erro ao carregar horários: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const convertStatus = (status) => {
        if (typeof status === 'boolean') {
            return status ? 'active' : 'inactive';
        } else if (typeof status === 'number') {
            return status === 1 ? 'active' : 'inactive';
        } else if (typeof status === 'string') {
            const statusLower = status.toLowerCase();
            if (statusLower === 'true' || statusLower === 'ativo' || statusLower === '1' || statusLower === 'active') {
                return 'active';
            } else if (statusLower === 'false' || statusLower === 'inativo' || statusLower === '0' || statusLower === 'inactive') {
                return 'inactive';
            }
        }
        return 'inactive';
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const openModal = (horario = null) => {
        if (horario) {
            setFormData({
                nome: horario.nome || '',
                descricao: horario.descricao || '',
                hora_inicio: formatTimeForDisplay(horario.hora_inicio) || '',
                hora_fim: formatTimeForDisplay(horario.hora_fim) || '',
                tipo: horario.tipo || 'regular',
                status: horario.status === 'active' || horario.status === true,
                rota_id: horario.rota_id || '',
                dias_semana: Array.isArray(horario.dias_semana) ? horario.dias_semana.map(dia => diasSemanaOptions[dia]?.value || '') : []
            });
            setCurrentHorario(horario);
        } else {
            setFormData({
                nome: '',
                descricao: '',
                hora_inicio: '',
                hora_fim: '',
                tipo: 'regular',
                status: true,
                rota_id: '',
                dias_semana: []
            });
            setCurrentHorario(null);
        }
        setIsModalOpen(true);
    };



    // Format time values from API format (H:i) to HTML time input format (HH:mm)
    const formatTimeForDisplay = (time) => {
        if (!time) return '';
        try {
            const [hours, minutes] = time.split(':');
            return `${hours.padStart(2, '0')}:${minutes}`;
        } catch (error) {
            console.error('Erro ao formatar horário para exibição:', error);
            return '';
        }
    };

    // Mapeamento dos dias da semana para os valores esperados pela API
    const diasSemanaMap = {
        'segunda': 0,
        'terca': 1,
        'quarta': 2,
        'quinta': 3,
        'sexta': 4,
        'sabado': 5,
        'domingo': 6
      };
      

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
    
        try {
            const apiData = {
                ...formData,
                status: Boolean(formData.status),
                tipo: formData.tipo.toUpperCase(),
                hora_inicio: formatTimeForApi(formData.hora_inicio),
                hora_fim: formatTimeForApi(formData.hora_fim),
                dias_semana: formData.dias_semana.map(dia => diasSemanaMap[dia])
            };
            
            console.log('Dados enviados para API:', apiData);
    
            if (currentHorario) {
                await HorarioService.updateHorario(currentHorario.id, apiData);
                showSuccess('Horário atualizado com sucesso!');
            } else {
                await HorarioService.createHorario(apiData);
                showSuccess('Horário cadastrado com sucesso!');
            }
            setIsModalOpen(false);
            fetchHorarios();
        } catch (err) {
            console.error('Error saving horario:', err);
            const errorMsg = err.response?.data?.message || err.message;
            showError('Erro ao salvar horário: ' + errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!currentHorario) return;

        try {
            await HorarioService.deleteHorario(currentHorario.id);
            showSuccess('Horário excluído com sucesso!');
            setIsDeleteModalOpen(false);
            fetchHorarios();
        } catch (err) {
            console.error('Error deleting horario:', err);
            const errorMsg = err.response?.data?.message || err.message;
            showError('Erro ao excluir horário: ' + errorMsg);
        }
    };

    console.log('→ Dados antes da filtragem:', horarios);
    const filteredHorarios = horarios.filter(horario =>
        (horario.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (horario.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log('→ Dados finais no DataTable:', filteredHorarios);

    const columns = [
        { 
            key: 'nome', 
            header: 'Nome',
            format: (item) => item.nome
        },
        { 
            key: 'descricao', 
            header: 'Descrição',
            format: (item) => item.descricao
        },
        { key: 'hora_inicio', header: 'Hora Início' },
        { key: 'hora_fim', header: 'Hora Fim' },
        { 
            key: 'dias_semana',
            header: 'Dias da Semana',
            format: (item) => {
                if (!Array.isArray(item.dias_semana)) return '—';
                return item.dias_semana
                    .map(dia => diasSemanaOptions[dia]?.label || '')
                    .filter(Boolean)
                    .join(', ') || '—';
            }
        },
        { 
            key: 'tipo',
            header: 'Tipo',
            format: (item) => {
                if (!item.tipo) return '—';
                const tipoLower = item.tipo.toString().toLowerCase();
                if (tipoLower === 'especial') return 'Especial';
                if (tipoLower === 'regular') return 'Regular';
                return tipoLower.charAt(0).toUpperCase() + tipoLower.slice(1);
            }
        },
        {
            key: 'status',
            header: 'Status',
            format: (item) => <StatusBadge status={item.status} type="horario" />
        }
    ];

    const formFields = [
        {
            name: 'nome',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Digite o nome do horário'
        },
        {
            name: 'descricao',
            label: 'Descrição',
            type: 'text',
            required: true,
            placeholder: 'Digite a descrição do horário'
        },
        {
            name: 'rota_id',
            label: 'Rota',
            type: 'select',
            required: true,
            options: rotas.map(rota => ({
                value: rota.id,
                label: rota.nome
            }))
        },
        {
            name: 'dias_semana',
            label: 'Dias da Semana',
            type: 'multiselect',
            required: true,
            options: diasSemanaOptions
        },
        {
            name: 'hora_inicio',
            label: 'Hora Início',
            type: 'time',
            required: true
        },
        {
            name: 'hora_fim',
            label: 'Hora Fim',
            type: 'time',
            required: true
        },
        {
            name: 'tipo',
            label: 'Tipo',
            type: 'select',
            required: true,
            options: [
                { value: 'regular', label: 'Regular' },
                { value: 'especial', label: 'Especial' }
            ]
        },
        {
            name: 'status',
            label: 'Ativo',
            type: 'checkbox'
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Horários</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Novo Horário
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Pesquisar horários..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <DataTable
                data={filteredHorarios || []}
                columns={columns}
                loading={loading}
                error={error}
                onEdit={(horario) => openModal(horario)}
                onDelete={(horario) => {
                    setCurrentHorario(horario);
                    setIsDeleteModalOpen(true);
                }}
            />

            <FormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentHorario ? 'Editar Horário' : 'Novo Horário'}
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            >
                {formFields.map((field) => (
                    <div key={field.name} className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={field.name}>
                            {field.label}
                        </label>
                        {field.type === 'multiselect' ? (
                            <div className="flex flex-wrap gap-2">
                                {field.options.map((option) => (
                                    <label key={option.value} className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            name={field.name}
                                            value={option.value}
                                            checked={formData[field.name]?.includes(option.value) || false}
                                            onChange={(e) => {
                                                const value = option.value;
                                                const isChecked = e.target.checked;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    [field.name]: isChecked
                                                        ? [...(prev[field.name] || []), value]
                                                        : (prev[field.name] || []).filter(day => day !== value)
                                                }));
                                            }}
                                            className="form-checkbox h-5 w-5 text-blue-600"
                                        />
                                        <span className="ml-2">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        ) : field.type === 'select' ? (
                            <select
                                id={field.name}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required={field.required}
                            >
                                <option value="">Selecione...</option>
                                {field.options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : field.type === 'checkbox' ? (
                            <input
                                type="checkbox"
                                id={field.name}
                                name={field.name}
                                checked={formData[field.name] || false}
                                onChange={handleInputChange}
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                        ) : (
                            <input
                                type={field.type}
                                id={field.name}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleInputChange}
                                placeholder={field.placeholder}
                                required={field.required}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        )}
                    </div>
                ))}
            </FormModal>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Horário"
                message="Tem certeza que deseja excluir este horário? Esta ação não pode ser desfeita."
            />
        </div>
    );
};

export default Horarios;