/**
 * Utilitário para padronizar o processamento de status entre diferentes formatos
 * vindos do backend para o formato padrão usado no frontend
 */

/**
 * Converte diferentes formatos de status para um formato padrão do frontend
 * 
 * @param {any} status - O status que pode vir em diversos formatos (boolean, number, string)
 * @param {string} entityType - Tipo de entidade para ajustar o processamento
 * @returns {string} - Status padronizado para uso no frontend
 */
export const processStatus = (status, entityType = 'default') => {
    // Processa status em formato booleano
    if (typeof status === 'boolean') {
      return status ? 'active' : 'inactive';
    }
    
    // Processa status em formato numérico
    if (typeof status === 'number') {
      return status === 1 ? 'active' : 'inactive';
    }
    
    // Processa status em formato string
    if (typeof status === 'string') {
      const statusLower = status.toLowerCase();
      
      // Status comuns a todas entidades
      if (['true', 'ativo', 'ativa', '1', 'active'].includes(statusLower)) {
        return 'active';
      }
      
      if (['false', 'inativo', 'inativa', '0', 'inactive'].includes(statusLower)) {
        return 'inactive';
      }
      
      // Status específicos para motoristas e monitores
      if (['vacation', 'ferias', 'férias'].includes(statusLower)) {
        return 'vacation';
      }
      
      if (['leave', 'licenca', 'licença'].includes(statusLower)) {
        return 'leave';
      }
      
      // Status específicos para ônibus
      if (['manutenção', 'manutencao', 'em manutenção', 'em manutencao', 'maintenance'].includes(statusLower)) {
        return 'maintenance';
      }
      
      // Status específicos para viagens
      if (['completed', 'concluída', 'concluida', 'realizada'].includes(statusLower)) {
        return 'completed';
      }
      
      if (['pending', 'pendente'].includes(statusLower)) {
        return 'pending';
      }
      
      if (['in_progress', 'em andamento', 'andamento'].includes(statusLower)) {
        return 'in_progress';
      }
      
      if (['scheduled', 'programada', 'agendada'].includes(statusLower)) {
        return 'scheduled';
      }
      
      if (['canceled', 'cancelada', 'cancelado'].includes(statusLower)) {
        return 'canceled';
      }
      
      // Se chegarmos aqui, é um valor desconhecido - retorna o próprio valor para usar no fallback
      return statusLower;
    }
    
    // Fallback para undefined ou outros tipos
    return 'inactive';
  };