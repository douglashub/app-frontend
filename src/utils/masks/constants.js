/**
 * Constantes de máscaras para inputs do sistema
 */

// Definição das máscaras de entrada
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
  
  // Caracteres para as máscaras
  export const MASK_CHARS = {
    '9': /[0-9]/,       // Apenas números
    'a': /[a-zA-Z]/,    // Apenas letras
    '*': /[0-9a-zA-Z]/, // Letras e números
    'S': /[a-zA-Z]/,    // Apenas letras (alternativo)
    '0': /[0-9]/,       // Apenas números (alternativo)
  };
  
  // Placeholders para os inputs
  export const PLACEHOLDERS = {
    CPF: '000.000.000-00',
    CNPJ: '00.000.000/0000-00',
    PHONE: '(00) 00000-0000',
    LICENSE_PLATE: 'AAA0A00',
    DATE: 'DD/MM/AAAA',
    CEP: '00000-000',
  };
  
  export default MASKS;