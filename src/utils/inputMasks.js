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
  LANDLINE: '(99) 9999-9999',

  // Veículos - formatos atualizados
  LICENSE_PLATE_MERCOSUL: 'aaa9a99', // Formato Mercosul
  LICENSE_PLATE_BRAZIL: 'aaa-9999', // Formato antigo brasileiro
  LICENSE_PLATE: '', // Dinâmico - será definido pelo componente PlacaInput

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
};

/**
 * Remover máscara de um valor (para envio ao backend)
 * @param {string} value - Valor com máscara
 * @returns {string} Valor sem máscara
 */
export const unmask = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
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
 * Formatar placa de veículo para exibição
 * @param {string} value - Placa sem formatação
 * @returns {string} Placa formatada para exibição
 */
export const formatPlaca = (value) => {
  if (!value) return '';
  
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (cleaned.length !== 7) return cleaned;
  
  const format = detectPlacaFormat(cleaned);
  
  if (format === 'mercosul') {
    // Formato Mercosul não tem hífen
    return cleaned;
  } else if (format === 'tradicional') {
    // Formato tradicional tem hífen após as 3 letras
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
  }
  
  return cleaned;
};

/**
 * Formatar documento CPF ou CNPJ baseado no tamanho
 * @param {string} value - Valor numérico do documento
 * @returns {string} Documento formatado ou vazio se inválido
 */
export const formatDocument = (value) => {
  if (!value) return '';
  const numbers = unmask(value);
  return numbers.length === 11
    ? numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : numbers.length === 14
    ? numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    : value;
};

/**
 * Formatar um número de telefone
 * @param {string} value - Valor do telefone
 * @returns {string} Telefone formatado
 */
export const formatPhone = (value) => {
  if (!value) return '';
  const numbers = unmask(value);
  return numbers.length === 11
    ? numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    : numbers.length === 10
    ? numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    : value;
};

export default MASKS;