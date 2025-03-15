/**
 * Exporta todos os componentes e utilitários de máscaras
 * Esse arquivo funciona como ponto de entrada para as máscaras
 * e mantém compatibilidade com o código existente
 */

// Importar itens de outros arquivos
import MASKS, { MASK_CHARS, PLACEHOLDERS } from './constants';
import * as processors from './processors';
import * as formatters from './formatters';
import * as detectors from './detectors';
import MaskedInput from './components/MaskedInput';
import PlacaInput from './components/PlacaInput';
import DocumentInput from './components/DocumentInput';
import PhoneInput from './components/PhoneInput';

// Re-exportar constantes
export { MASKS, MASK_CHARS, PLACEHOLDERS };
export { default as MASKS } from './constants';

// Re-exportar processadores
export const {
  unmask,
  unmaskAlphanumeric,
  unmaskPlaca,
  processInputValue,
  processFormData
} = processors;

// Re-exportar formatadores
export const {
  formatDocument,
  formatPhone,
  formatPlaca,
  formatDate,
  formatCurrency,
  formatTimeForDisplay,
  formatTimeForApi
} = formatters;

// Re-exportar detectores
export const {
  detectPlacaFormat,
  detectDocumentType,
  detectPhoneType,
  isNumeric,
  isAlphabetic,
  isAlphanumeric,
  isValidPlaca
} = detectors;

// Re-exportar componentes
export { MaskedInput, PlacaInput, DocumentInput, PhoneInput };

// Exportar o objeto principal (compatível com o import default do arquivo antigo)
const MaskUtils = {
  // Constantes
  ...MASKS,
  MASKS,
  MASK_CHARS,
  PLACEHOLDERS,

  // Processadores
  ...processors,

  // Formatadores
  ...formatters,

  // Detectores
  ...detectors,

  // Componentes
  Components: {
    MaskedInput,
    PlacaInput,
    DocumentInput,
    PhoneInput
  }
};

// Exportação padrão para manter compatibilidade com código existente
export default MASKS;