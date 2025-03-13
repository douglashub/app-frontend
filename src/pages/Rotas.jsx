import React, { useState, useEffect } from 'react';
import { RotaService } from '../api/services';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';

const Rotas = () => {
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for when API fails
  const mockRotasData = [
    {
      id: 1,
      nome: 'Rota Escalvados - Manhã',
      tipo: 'Escalvados e Escalvadinhos',
      distancia_km: 15.5,
      tempo_estimado_minutos: 45,
      status: 'active'
    },
    {
      id: 2,
      nome: 'Rota Pedreiras - Manhã',
      tipo: 'Pedreiras',
      distancia_km: 18.2,
      tempo_estimado_minutos: 55,
      status: 'active'
    },
    {
      id: 3,
      nome: 'Rota Volta Grande - Manhã',
      tipo: 'Volta Grande',
      distancia_km: 22.7,
      tempo_estimado_minutos: 65,
      status: 'active'
    },
    {
      id: 4,
      nome: 'Rota Escalvados - Tarde',
      tipo: 'Escalvados e Escalvadinhos',
      distancia_km: 15.5,
      tempo_estimado_minutos: 50,
      status: 'active'
    },
    {
      id: 5,
      nome: 'Rota Pedreiras - Tarde',
      tipo: 'Pedreiras',
      distancia_km: 18.2,
      tempo_estimado_minutos: 60,
      status: 'inactive'
    }
  ];

  useEffect(() => {
    fetchRotas();
  }, []);

  const fetchRotas = async () => {
    try {
      setLoading(true);
      const response = await RotaService.getRotas();
      setRotas(response.data.data);
    } catch (err) {
      console.error('Error fetching data, using mock data instead:', err);
      setRotas(mockRotasData);
      setError('Erro ao carregar rotas: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'tipo', header: 'Tipo' },
    { key: 'distancia_km', header: 'Distância', format: (item) => `${item.distancia_km} km` },
    { key: 'tempo_estimado_minutos', header: 'Tempo Est.', format: (item) => `${item.tempo_estimado_minutos} min` },
    { 
      key: 'status', 
      header: 'Status',
      format: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : item.status === 'inactive'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
        }`}>
          {item.status === 'active' ? 'Ativa' : item.status === 'inactive' ? 'Temporária' : 'Inativa'}
        </span>
      )
    }
  ];

  const handleEdit = (rota) => {
    console.log('Editar rota:', rota);
  };

  const handleDelete = async (rota) => {
    if(window.confirm(`Deseja excluir a rota ${rota.nome}?`)) {
      try {
        await RotaService.deleteRota(rota.id);
        fetchRotas();
      } catch (err) {
        setError('Erro ao excluir rota: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6 flex-1 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Rotas</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Rota
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b px-6 py-4">
          <h2 className="font-bold text-lg">Rotas Cadastradas</h2>
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={rotas}
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

export default Rotas;