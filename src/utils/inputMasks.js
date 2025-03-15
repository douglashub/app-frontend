/**
 * Biblioteca de máscaras para inputs do sistema
 */

export const MASKS = {
    // Documentos
    CPF: '999.999.999-99',
    CNPJ: '99.999.999/9999-99',
    RG: '99.999.999-9',
    CNH: '999999999aa',
    
    // Contato
    PHONE: '(99) 99999-9999',
    PHONE_WITH_DDD: '(99) 99999-9999',
    LANDLINE: '(99) 9999-9999',
    
    // Veículos
    LICENSE_PLATE: 'aaa-9*999', // Formato atual brasileiro: 3 letras + 1 número + 1 letra + 3 números
    LICENSE_PLATE_OLD: 'aaa-9999', // Formato antigo brasileiro
    
    // Datas e horas
    DATE: '99/99/9999',
    TIME: '99:99',
    DATE_TIME: '99/99/9999 99:99',
    
    // Endereços
    CEP: '99999-999',
    
    // Valores
    MONEY: 'R$ 999.999.999,99',
    
    // Utilitários
    INTEGER: '9999999999',
    DECIMAL: '9999999999,99',
  }
  
  /**
   * Remover máscara de um valor (para envio ao backend)
   * @param {string} value - Valor com máscara
   * @returns {string} Valor sem máscara
   */
  export const unmask = (value) => {
    if (!value) return '';
    return value.replace(/[^0-9a-zA-Z]/g, '');
  };
  
  /**
   * Formatar um valor CPF/CNPJ baseado no tamanho
   * @param {string} value - Valor numérico do documento
   * @returns {string} Documento formatado ou vazio se inválido
   */
  export const formatDocument = (value) => {
    if (!value) return '';
    
    const numbers = unmask(value);
    
    // CPF
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    // CNPJ
    if (numbers.length === 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return value;
  };
  
  /**
   * Formatar um número de telefone
   * @param {string} value - Valor do telefone
   * @returns {string} Telefone formatado
   */
  export const formatPhone = (value) => {
    if (!value) return '';
    
    const numbers = unmask(value);
    
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return value;
  };
  
  export default MASKS;