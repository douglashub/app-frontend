/**
 * Funções de formatação para exibição de dados
 */

import { unmask } from './processors';
import { detectPlacaFormat } from './detectors';

/**
 * Formatar documento CPF ou CNPJ baseado no tamanho
 * @param {string} value - Valor numérico do documento
 * @returns {string} Documento formatado ou vazio se inválido
 */
export const formatDocument = (value) => {
  if (!value) return '';
  const numbers = unmask(value);
  
  if (numbers.length === 11) {
    // CPF
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (numbers.length === 14) {
    // CNPJ
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return value; // Retorna o valor original se não for CPF nem CNPJ
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
    // Celular
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 10) {
    // Telefone fixo
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return value; // Retorna o valor original se não for telefone válido
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
 * Formatar uma data no formato ISO para exibição
 * @param {string} dateString - Data em formato ISO ou string
 * @param {string} format - Formato de saída (default: 'dd/mm/yyyy')
 * @returns {string} Data formatada ou vazio se inválida
 */
export const formatDate = (dateString, format = 'dd/mm/yyyy') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    if (format === 'dd/mm/yyyy') {
      return `${day}/${month}/${year}`;
    } else if (format === 'mm/dd/yyyy') {
      return `${month}/${day}/${year}`;
    } else if (format === 'yyyy-mm-dd') {
      return `${year}-${month}-${day}`;
    }
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString || '';
  }
};

/**
 * Formatar um valor monetário
 * @param {number|string} value - Valor numérico
 * @param {string} currency - Símbolo da moeda (default: 'R$')
 * @returns {string} Valor formatado como moeda
 */
export const formatCurrency = (value, currency = 'R$') => {
  if (value === undefined || value === null) return '';
  
  try {
    // Converte para número se for string
    const numValue = typeof value === 'string' ? 
      parseFloat(value.replace(',', '.')) : value;
    
    if (isNaN(numValue)) return value;
    
    // Formata com 2 casas decimais, separador de milhares e separador decimal
    return `${currency} ${numValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return value.toString();
  }
};

/**
 * Formatar time values from API format (H:i) to HTML time input format (HH:mm)
 * @param {string} time - Time in H:i format
 * @returns {string} - Time in HH:mm format
 */
export const formatTimeForDisplay = (time) => {
  if (!time) return '';

  try {
    // Handle different time formats from API
    const timeParts = time.split(':');

    if (timeParts.length < 2) return time; // Return as is if not valid

    const hours = timeParts[0].padStart(2, '0');
    const minutes = timeParts[1].substring(0, 2).padStart(2, '0');

    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time for display:', error);
    return time || '';
  }
};

/**
 * Format time values for API (HH:mm to H:i)
 * @param {string} time - Time in HH:mm format 
 * @returns {string} - Time in H:i format or null if input is empty
 */
export const formatTimeForApi = (time) => {
  if (!time) return null;

  try {
    // Split time into hours and minutes
    const [hours, minutes] = time.split(':');

    // Convert hours to integer to remove leading zeros
    const hour = parseInt(hours, 10);

    // Return formatted time (H:i format as Laravel expects)
    return `${hour}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return null;
  }
};

export default {
  formatDocument,
  formatPhone,
  formatPlaca,
  formatDate,
  formatCurrency,
  formatTimeForDisplay,
  formatTimeForApi
};