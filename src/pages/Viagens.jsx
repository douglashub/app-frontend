import React, { useState, useEffect } from 'react';
import { ViagemService } from '../api/services';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';

const Viagens = () => {
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for when API fails
  const mockViagensData = [
    {
      id: 1,
      data_viagem: '2025-03-10',
      rota: 'Rota Escalvados - Manhã',
      motorista: 'José da Silva',
      onibus: 'ABC-1234',
      status: 'completed'
    },
    {
      id: 2,
      data_viagem: '2025-03-10',
      rota: 'Rota Pedreiras - Manhã',
      motorista: 'Maria Oliveira',
      onibus: 'DEF-5678',
      status: 'completed'
    },
    {
      id: 3,
      data_viagem: '2025-03-10',
      rota: 'Rota Volta Grande - Manhã',
      motorista: 'Carlos Pereira',
      onibus: 'GHI-9012',
      status: 'completed'
    },
    {
      id: 8,
      data_viagem: '2025-03-12',
      rota: 'Rota Escalvados - Manhã',
      motorista: 'José da Silva',
      onibus: 'ABC-1234',
      status: 'pending'
    },
    {
      id: 9,
      data_viagem: '2025-03-12',
      rota: 'Rota Pedreiras - Manhã',
      motorista: 'Maria Oliveira',
      onibus: 'DEF-5678',
      status: 'pending'
    }
  ];

  useEffect(() => {
    fetchViagens();
  }, []);

  const fetchViagens = async () => {
    try {
      setLoading(true);
      const response = await ViagemService.getViagens();
      setViagens(response.data.data);
    } catch (err) {
      console.error('Error fetching data, using mock data instead:', err);
      setViagens(mockViagensData);
      setError('Erro ao carregar viagens: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'data_viagem', header: 'Data' },
    { key: 'rota', header: 'Rota' },
    { key: 'motorista', header: 'Motorista' },
    { key: 'onibus', header: 'Ônibus' },
    { 
      key: 'status', 
      header: 'Status',
      format: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.status === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : item.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : item.status === 'in_progress'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
        }`}>
          {
            item.status === 'completed' ? 'Concluída' : 
            item.status === 'pending' ? 'Programada' : 
            item.status === 'in_progress' ? 'Em andamento' : 
            'Cancelada'
          }
        </span>
      )
    }
  ];

  const handleEdit = (viagem) => {
    console.log('Editar viagem:', viagem);
  };

  const handleDelete = async (viagem) => {
    if(window.confirm(`Deseja excluir a viagem de ${viagem.data_viagem}?`)) {
      try {
        await ViagemService.deleteViagem(viagem.id);
        fetchViagens();
      } catch (err) {
        setError('Erro ao excluir viagem: ' + err.message);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Viagens</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Viagem
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b px-6 py-4">
          <h2 className="font-bold text-lg">Viagens Programadas</h2>
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={viagens}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default Viagens;