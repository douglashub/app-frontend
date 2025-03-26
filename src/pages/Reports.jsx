import React, { useState, useEffect } from 'react';
import { ReportService } from '../api/services';
import DataTable from '../components/common/DataTable';
import PageHeader from '../components/common/PageHeader';
import ReportTabs from './ReportTabs';
import ReportHeader from './ReportHeader';
import ReportStats from './ReportStats';
import { useNotification } from '../contexts/NotificationContext';
import StatusBadge from '../components/common/StatusBadge';

export default function Reports() {
    const [motoristasReport, setMotoristasReport] = useState([]);
    const [monitoresReport, setMonitoresReport] = useState([]);
    const [viagensReport, setViagensReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('motoristas');
    const [exportFormat, setExportFormat] = useState('excel');
    const [exporting, setExporting] = useState(false);
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        status: '',
        cargo: ''
    });

    const { showSuccess, showError } = useNotification ? useNotification() : {
        showSuccess: () => { },
        showError: () => { }
    };

    useEffect(() => {
        fetchReportData();
    }, [activeTab, JSON.stringify(filters)]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            setError(null);

            const commonParams = {
                data_inicio: filters.startDate,
                data_fim: filters.endDate,
                status: filters.status,
                cargo: filters.cargo
            };

            switch (activeTab) {
                case 'motoristas':
                    const motoristasData = await ReportService.getMotoristaReport(commonParams);
                    console.log('Dados completos do relatório de motoristas:', motoristasData);

                    // Extraindo os dados corretamente da estrutura aninhada
                    if (motoristasData.data?.data?.data && Array.isArray(motoristasData.data.data.data)) {
                        setMotoristasReport(motoristasData.data.data.data);
                    } else {
                        console.error('Estrutura de dados inesperada:', motoristasData);
                        setMotoristasReport([]);
                    }
                    break;

                case 'monitores':
                    const monitoresData = await ReportService.getMonitorReport(commonParams);
                    console.log('Dados completos do relatório de monitores:', monitoresData);

                    // Mesma estrutura para monitores
                    if (monitoresData.data?.data?.data && Array.isArray(monitoresData.data.data.data)) {
                        setMonitoresReport(monitoresData.data.data.data);
                    } else {
                        console.error('Estrutura de dados inesperada:', monitoresData);
                        setMonitoresReport([]);
                    }
                    break;

                case 'viagens':
                    const viagensData = await ReportService.getViagemReport(commonParams);
                    console.log('Dados completos do relatório de viagens:', viagensData);

                    // Mesma estrutura para viagens
                    if (viagensData.data?.data?.data && Array.isArray(viagensData.data.data.data)) {
                        setViagensReport(viagensData.data.data.data);
                    } else {
                        console.error('Estrutura de dados inesperada:', viagensData);
                        setViagensReport([]);
                    }
                    break;
            }
        } catch (err) {
            console.error('Error fetching report data:', err);
            const errorMsg = err.response?.data?.message || err.message;
            setError(`Erro ao carregar relatório: ${errorMsg}`);
            showError(`Erro ao carregar relatório: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);

            const commonParams = {
                data_inicio: filters.startDate,
                data_fim: filters.endDate,
                status: filters.status,
                cargo: filters.cargo
            };

            const reportBlob = await ReportService.exportReport(
                activeTab,
                exportFormat,
                commonParams
            );

            const filename = `relatorio_${activeTab}_${new Date().toISOString().split('T')[0]}.${exportFormat}`;

            // Create a blob from the response data
            const blob = new Blob([reportBlob], {
                type: exportFormat === 'excel'
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : 'application/pdf'
            });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary anchor element and trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showSuccess(`Relatório exportado com sucesso!`);
        } catch (err) {
            console.error('Error exporting report:', err);
            showError('Erro ao exportar relatório: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setExporting(false);
        }
    };

    // Columns definitions
    const motoristasColumns = [
        { key: 'nome', header: 'Nome' },
        { key: 'cpf', header: 'CPF' },
        {
            key: 'cnh',
            header: 'CNH',
            format: (item) => item.cnh || 'N/A'
        },
        {
            key: 'telefone',
            header: 'Telefone',
            format: (item) => item.telefone || 'N/A'
        },
        {
            key: 'status',
            header: 'Status',
            format: (item) => <StatusBadge status={item.status} type="motorista" />
        },
        {
            key: 'total_viagens',
            header: 'Viagens Realizadas',
            format: (item) => item.total_viagens || '0'
        }
    ];

    const monitoresColumns = [
        { key: 'nome', header: 'Nome' },
        { key: 'cpf', header: 'CPF' },
        { key: 'telefone', header: 'Telefone' },
        {
            key: 'status',
            header: 'Status',
            format: (item) => <StatusBadge status={item.status} type="monitor" />
        },
        {
            key: 'viagens_realizadas',
            header: 'Viagens Realizadas',
            format: (item) => item.viagens_count || '0'
        }
    ];

    const viagensColumns = [
        {
            key: 'data_viagem',
            header: 'Data',
            format: (item) => {
                if (!item.data_viagem) return '-';
                const date = new Date(item.data_viagem);
                return date.toLocaleDateString('pt-BR');
            }
        },
        {
            key: 'rota',
            header: 'Rota',
            format: (item) => item.rota?.nome || 'N/A'
        },
        {
            key: 'motorista',
            header: 'Motorista',
            format: (item) => item.motorista?.nome || 'N/A'
        },
        {
            key: 'onibus',
            header: 'Ônibus',
            format: (item) => item.onibus?.placa || 'N/A'
        },
        {
            key: 'status',
            header: 'Status',
            format: (item) => <StatusBadge status={item.status} type="viagem" />
        }
    ];

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'motoristas':
                return (
                    <DataTable
                        columns={motoristasColumns}
                        data={motoristasReport}
                        loading={loading}
                        error={error}
                    />
                );
            case 'monitores':
                return (
                    <DataTable
                        columns={monitoresColumns}
                        data={monitoresReport}
                        loading={loading}
                        error={error}
                    />
                );
            case 'viagens':
                return (
                    <DataTable
                        columns={viagensColumns}
                        data={viagensReport}
                        loading={loading}
                        error={error}
                    />
                );
            default:
                return <div>Selecione um tipo de relatório</div>;
        }
    };

    const reportCounts = {
        motoristas: motoristasReport.length,
        monitores: monitoresReport.length,
        viagens: viagensReport.length
    };

    const getCurrentReportLength = () => {
        switch (activeTab) {
            case 'motoristas': return motoristasReport.length;
            case 'monitores': return monitoresReport.length;
            case 'viagens': return viagensReport.length;
            default: return 0;
        }
    };

    const getActiveCounts = () => {
        switch (activeTab) {
            case 'motoristas':
                return motoristasReport.filter(m =>
                    m.status === 'Ativo' || m.status === true
                ).length;
            case 'monitores':
                return monitoresReport.filter(m =>
                    m.status === 'Ativo' || m.status === true
                ).length;
            case 'viagens':
                return viagensReport.filter(v =>
                    v.status === 'Ativo' || v.status === true || v.status === 'completed'
                ).length;
            default:
                return 0;
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Relatórios"
                description="Visualize e exporte relatórios do sistema"
            />

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Date Range Inputs */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data Inicial
                        </label>
                        <input
                            type="date"
                            value={filters.startDate || ''}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                startDate: e.target.value
                            }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data Final
                        </label>
                        <input
                            type="date"
                            value={filters.endDate || ''}
                            min={filters.startDate || undefined}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                endDate: e.target.value
                            }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                status: e.target.value
                            }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        >
                            <option value="">Todos os Status</option>
                            <option value="Ativo">Ativos</option>
                            <option value="Inativo">Inativos</option>
                        </select>
                    </div>

                    {/* Cargo Filter */}
                    {(activeTab === 'motoristas' || activeTab === 'monitores') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cargo
                            </label>
                            <select
                                value={filters.cargo}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    cargo: e.target.value
                                }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            >
                                <option value="">Todos os Cargos</option>
                                <option value="Efetivo">Efetivo</option>
                                <option value="ACT">ACT</option>
                                <option value="Temporário">Temporário</option>
                            </select>
                        </div>
                    )}

                    {/* Clear Filters Button */}
                    <div className="self-end">
                        <button
                            onClick={() => setFilters({
                                startDate: null,
                                endDate: null,
                                status: '',
                                cargo: ''
                            })}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-md transition-colors"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </div>
            </div>

            <ReportTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                reportCounts={reportCounts}
            />

            <div className="bg-white rounded-lg shadow">
                <div className="border-b px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <ReportHeader
                        activeTab={activeTab}
                        currentReportLength={getCurrentReportLength()}
                    />

                    {/* Export Controls */}
                    <div className="flex items-center gap-2">
                        <select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            disabled={loading || exporting || getCurrentReportLength() === 0}
                        >
                            <option value="excel">Excel</option>
                            <option value="pdf">PDF</option>
                        </select>

                        <button
                            onClick={handleExport}
                            disabled={loading || exporting || getCurrentReportLength() === 0}
                            className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${loading || exporting || getCurrentReportLength() === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : exportFormat === 'excel'
                                    ? 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:outline-none'
                                    : 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:outline-none'
                                }`}
                        >
                            {exporting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Exportando...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    {exportFormat === 'excel' ? 'Exportar para Excel' : 'Exportar para PDF'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {renderActiveTabContent()}
                </div>
            </div>

            {!loading && !error && getCurrentReportLength() > 0 && (
                <ReportStats
                    activeTab={activeTab}
                    totalRecords={getCurrentReportLength()}
                    activeCounts={getActiveCounts()}
                />
            )}
        </div>
    );
}