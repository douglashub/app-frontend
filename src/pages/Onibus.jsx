import React, { useState, useEffect } from 'react';
import { OnibusService } from '../api/services';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';

const Onibus = () => {
  const [onibus, setOnibus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for when API fails
  const mockOnibusData = [
    {
      id: 1,
      placa: 'ABC-1234',
      capacidade: 48,
      modelo: 'Mercedes-Benz OF-1721',
      ano_fabricacao: 2018,
      status: 'active'
    },
    {
      id: 2,
      placa: 'DEF-5678',
      capacidade: 52,
      modelo: 'Volkswagen 17.230 OD',
      ano_fabricacao: 2019,
      status: 'active'
    },
    {
      id: 3,
      placa: 'GHI-9012',
      capacidade: 44,
      modelo: 'Volvo B270F',
      ano_fabricacao: 2017,
      status: 'inactive'
    }
  ];

  useEffect(() => {
    fetchOnibus();
  }, []);

  const fetchOnibus = async () => {
    try {
      setLoading(true);
      const response = await OnibusService.getOnibus();
      setOnibus(response.data.data);
    } catch (err) {
      console.error('Error fetching data, using mock data instead:', err);
      setOnibus(mockOnibusData);
      setError('Erro ao carregar ônibus: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'placa', header: 'Placa' },
    { key: 'modelo', header: 'Modelo' },
    { key: 'ano_fabricacao', header: 'Ano' },
    { key: 'capacidade', header: 'Capacidade', format: (item) => `${item.capacidade} passageiros` },
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
          {item.status === 'active' ? 'Ativo' : item.status === 'inactive' ? 'Manutenção' : 'Inativo'}
        </span>
      )
    }
  ];

  const handleEdit = (onibus) => {
    console.log('Editar ônibus:', onibus);
  };

  const handleDelete = async (onibus) => {
    if(window.confirm(`Deseja excluir o ônibus de placa ${onibus.placa}?`)) {
      try {
        await OnibusService.deleteOnibus(onibus.id);
        fetchOnibus();
      } catch (err) {
        setError('Erro ao excluir ônibus: ' + err.message);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Ônibus</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Ônibus
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b px-6 py-4">
          <h2 className="font-bold text-lg">Frota de Ônibus</h2>
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={onibus}
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

export default Onibus;