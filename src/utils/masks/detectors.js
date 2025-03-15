/**
 * Funções para detectar formatos de dados
 */

/**
 * Detecta o tipo de placa baseado no formato
 * @param {string} value - Placa de veículo
 * @returns {string} - 'mercosul', 'tradicional' ou 'desconhecido'
 */
export const detectPlacaFormat = (value) => {
    if (!value) return 'desconhecido';
    
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (cleaned.length >= 4 && /\d/.test(cleaned[3])) {
      return 'mercosul';
    } else if (cleaned.length >= 3 && /[A-Z]{3}/.test(cleaned.substring(0, 3))) {
      return 'tradicional';
    }
    
    return 'desconhecido';
  };
  
  /**
   * Detecta o tipo de documento baseado no formato
   * @param {string} value - Documento (CPF ou CNPJ)
   * @returns {string} - 'cpf', 'cnpj' ou 'desconhecido'
   */
  export const detectDocumentType = (value) => {
    if (!value) return 'desconhecido';
    
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return 'cpf';
    } else if (cleaned.length === 14) {
      return 'cnpj';
    }
    
    return 'desconhecido';
  };
  
  /**
   * Detecta o tipo de telefone baseado no formato
   * @param {string} value - Número de telefone
   * @returns {string} - 'celular', 'fixo' ou 'desconhecido'
   */
  export const detectPhoneType = (value) => {
    if (!value) return 'desconhecido';
    
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return 'celular';
    } else if (cleaned.length === 10) {
      return 'fixo';
    }
    
    return 'desconhecido';
  };
  
  /**
   * Verifica se um texto contém apenas caracteres numéricos
   * @param {string} value - Texto a ser verificado
   * @returns {boolean} - true se contém apenas números, false caso contrário
   */
  export const isNumeric = (value) => {
    if (!value) return false;
    return /^\d+$/.test(value);
  };
  
  /**
   * Verifica se um texto contém apenas caracteres alfabéticos
   * @param {string} value - Texto a ser verificado
   * @returns {boolean} - true se contém apenas letras, false caso contrário
   */
  export const isAlphabetic = (value) => {
    if (!value) return false;
    return /^[a-zA-Z]+$/.test(value);
  };
  
  /**
   * Verifica se um texto contém apenas caracteres alfanuméricos
   * @param {string} value - Texto a ser verificado
   * @returns {boolean} - true se contém apenas letras e números, false caso contrário
   */
  export const isAlphanumeric = (value) => {
    if (!value) return false;
    return /^[a-zA-Z0-9]+$/.test(value);
  };
  
  /**
   * Verifica se uma placa é válida baseada no formato
   * @param {string} value - Placa a ser verificada
   * @returns {boolean} - true se a placa é válida, false caso contrário
   */
  export const isValidPlaca = (value) => {
    if (!value) return false;
    
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (cleaned.length !== 7) return false;
    
    // Verifica formato Mercosul (3 letras + 1 número + 1 letra + 2 números)
    const isMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(cleaned);
    
    // Verifica formato tradicional (3 letras + 4 números)
    const isTradicional = /^[A-Z]{3}[0-9]{4}$/.test(cleaned);
    
    return isMercosul || isTradicional;
  };
  
  export default {
    detectPlacaFormat,
    detectDocumentType,
    detectPhoneType,
    isNumeric,
    isAlphabetic,
    isAlphanumeric,
    isValidPlaca
  };