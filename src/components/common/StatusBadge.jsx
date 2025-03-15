import React from 'react'

export default function StatusBadge({ status, type = 'default', size = 'md' }) {
  // Mapeia os status do backend para exibição frontend
  const getStatusConfig = () => {
    // Status base que funcionam para qualquer entidade
    const baseStatus = {
      'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativo' },
      'inactive': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Inativo' },
      'pending': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pendente' },
      'completed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Concluído' },
      'canceled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
      
      // Status específicos
      'maintenance': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Em Manutenção' },
      'vacation': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Férias' },
      'leave': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Licença' },
      'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Em Andamento' },
      'scheduled': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Programada' },
      
      // Fallback
      'default': { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
    };

    // Mapeamentos específicos por tipo de entidade
    const typeSpecificMappings = {
      'aluno': {
        'active': { label: 'Ativo' },
        'inactive': { label: 'Inativo' }
      },
      'onibus': {
        'active': { label: 'Em Operação' },
        'inactive': { label: 'Fora de Serviço' },
        'maintenance': { label: 'Em Manutenção' }
      },
      'rota': {
        'active': { label: 'Ativa' },
        'inactive': { label: 'Inativa' }
      },
      'viagem': {
        'completed': { label: 'Concluída' },
        'pending': { label: 'Pendente' },
        'in_progress': { label: 'Em Andamento' },
        'scheduled': { label: 'Programada' },
        'canceled': { label: 'Cancelada' }
      },
      'motorista': {
        'active': { label: 'Ativo' },
        'inactive': { label: 'Inativo' },
        'vacation': { label: 'Férias' },
        'leave': { label: 'Licença' }
      },
      'monitor': {
        'active': { label: 'Ativo' },
        'inactive': { label: 'Inativo' },
        'vacation': { label: 'Férias' },
        'leave': { label: 'Licença' }
      }
    };

    // Obter status base
    const baseConfig = baseStatus[status] || baseStatus.default;
    
    // Aplicar sobrescrita específica do tipo se existir
    if (typeSpecificMappings[type] && typeSpecificMappings[type][status]) {
      return {
        ...baseConfig,
        ...typeSpecificMappings[type][status]
      };
    }
    
    return baseConfig;
  };

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2.5 py-1 text-sm'
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center justify-center rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size]}`}>
      {config.label}
    </span>
  );
}