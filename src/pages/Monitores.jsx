import React, { useState, useEffect } from 'react';
import DataTable from '../components/common/DataTable';
import { MonitorService } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';


export const Monitores = () => {
  const [monitores, setMonitores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    totalItems: 0
  });
  const { showNotification } = useNotification();

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'nome', header: 'Nome' },
    { key: 'email', header: 'Email' },
    { key: 'telefone', header: 'Telefone' },
    { key: 'disponivel', header: 'Disponível', format: (item) => item.disponivel ? 'Sim' : 'Não' },
    { key: 'actions', header: 'Ações' }
  ];

  const fetchMonitores = async (page = 1) => {
    try {
      setLoading(true);
      const response = await MonitorService.getMonitores(page);
      const { data, meta } = response.data;
      setMonitores(data);
      setPagination({
        currentPage: meta.current_page,
        totalPages: meta.last_page,
        perPage: meta.per_page,
        totalItems: meta.total
      });
    } catch (error) {
      console.error('Error fetching monitores:', error);
      showNotification('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitores();
  }, []);

  const handlePageChange = (newPage) => {
    fetchMonitores(newPage);
  };

  const handleCreate = async (formData) => {
    try {
      await MonitorService.createMonitor(formData);
      showNotification('success', 'Monitor criado com sucesso');
      fetchMonitores();
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await MonitorService.updateMonitor(id, formData);
      showNotification('success', 'Monitor atualizado com sucesso');
      fetchMonitores(pagination.currentPage);
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await MonitorService.deleteMonitor(id);
      showNotification('success', 'Monitor removido com sucesso');
      fetchMonitores(pagination.currentPage);
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Monitores</h1>
      <DataTable
        columns={columns}
        data={monitores}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        searchPlaceholder="Buscar monitores..."
      />
    </div>
  );
};

export default Monitores;