import React from 'react'

export default function StatusBadge({ status, type = 'default', size = 'md' }) {
  // Status types can be expanded for different contexts
  const statusMap = {
    // Generic statuses
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'active' },
    inactive: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'inactive' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Concluído' },
    canceled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
    
    // Ônibus specific
    maintenance: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Em Manutenção' },
    
    // Viagem specific
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Em Andamento' },
    scheduled: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Programada' },
    
    // Aluno specific
    enrolled: { bg: 'bg-green-100', text: 'text-green-800', label: 'Matriculado' },
    graduated: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Formado' },
    
    // Fallback
    default: { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
  };

  // For context-specific labels we can override based on type
  const contextMap = {
    aluno: {
      active: { label: 'Ativo' },
      inactive: { label: 'Inativo' }
    },
    onibus: {
      active: { label: 'Em Operação' },
      inactive: { label: 'Fora de Serviço' }
    },
    rota: {
      active: { label: 'Ativa' },
      inactive: { label: 'Temporária' }
    },
    viagem: {
      completed: { label: 'Concluída' },
      pending: { label: 'Programada' },
      in_progress: { label: 'Em andamento' },
      canceled: { label: 'Cancelada' }
    }
  };

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2 py-1 text-xs'
  };

  // Get base styling
  const baseStyle = statusMap[status] || statusMap.default;
  
  // Apply context override if applicable
  let label = baseStyle.label;
  if (contextMap[type] && contextMap[type][status]) {
    label = contextMap[type][status].label;
  }
  
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-normal ${baseStyle.bg} ${baseStyle.text} ${sizeClasses[size]}`}>
      {label}
    </span>
  )
}