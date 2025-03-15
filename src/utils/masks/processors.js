/**
 * Funções de processamento para máscaras
 * Estas funções removem ou processam valores mascarados
 */

/**
 * Remover qualquer máscara de um valor (para envio ao backend)
 * @param {string} value - Valor com máscara
 * @returns {string} Valor sem máscara
 */
export const unmask = (value) => {
    if (!value) return '';
    return value.replace(/\D/g, '');
  };
  
  /**
   * Remover caracteres especiais mantendo letras e números
   * @param {string} value - Valor com caracteres especiais
   * @returns {string} Valor com apenas letras e números
   */
  export const unmaskAlphanumeric = (value) => {
    if (!value) return '';
    return value.replace(/[^\w]/g, '');
  };
  
  /**
   * Remover máscara e formatar placa de veículo para envio ao backend
   * @param {string} value - Placa com ou sem máscara
   * @returns {string} Placa formatada para envio ao backend
   */
  export const unmaskPlaca = (value) => {
    if (!value) return '';
    
    // Remove caracteres especiais e converte para maiúsculo
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Se não tiver 7 caracteres, retorna o valor limpo como está
    if (cleaned.length !== 7) return cleaned;
  
    // Verifica se é formato Mercosul (3 letras + 1 número + 1 letra + 2 números)
    const isMercosul = /[A-Z]{3}[0-9][A-Z][0-9]{2}/.test(cleaned);
    
    // Verifica se é formato antigo (3 letras + 4 números)
    const isOldFormat = /[A-Z]{3}[0-9]{4}/.test(cleaned);
    
    // Se for um dos formatos válidos, retorna como está
    if (isMercosul || isOldFormat) {
      return cleaned;
    }
    
    // Caso contrário, tenta verificar se é próximo de algum formato conhecido
    // Verifica se o 4º caractere é numérico (formato Mercosul potencial)
    if (/\d/.test(cleaned[3])) {
      // Potencialmente formato Mercosul
      return cleaned;
    }
    
    // Em outros casos, retorna o valor limpo
    return cleaned;
  };
  
  /**
   * Processa valor de entrada para formulários/APIs
   * Converte string para número e trata valores vazios
   * @param {string} value - Valor a ser processado
   * @param {string} type - Tipo de dado ('int', 'float', ou vazio para string)
   * @returns {number|string|null} Valor processado
   */
  export const processInputValue = (value, type) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    
    if (type === 'int') {
      return parseInt(unmask(value), 10) || null;
    }
    
    if (type === 'float') {
      // Convert comma to dot for JS float parsing
      const numStr = value.toString().replace(',', '.');
      return parseFloat(numStr) || null;
    }
    
    return value; // return as string
  };
  
  /**
   * Processa um array de valores para submissão ao backend
   * @param {Object} data - Objeto com dados a serem processados
   * @param {Object} config - Configuração de campos {campo: tipo}
   * @returns {Object} Dados processados
   */
  export const processFormData = (data, config = {}) => {
    const result = { ...data };
    
    Object.entries(config).forEach(([field, type]) => {
      if (data[field] !== undefined) {
        result[field] = processInputValue(data[field], type);
      }
    });
    
    return result;
  };
  
  export default {
    unmask,
    unmaskAlphanumeric,
    unmaskPlaca,
    processInputValue,
    processFormData
  };