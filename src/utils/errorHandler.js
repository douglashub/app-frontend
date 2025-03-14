/**
 * Utility functions for handling API errors and providing user-friendly messages
 */

// Map of HTTP status codes to user-friendly messages
const HTTP_ERROR_MESSAGES = {
  400: 'Os dados fornecidos são inválidos',
  401: 'Sua sessão expirou. Por favor, faça login novamente',
  403: 'Você não tem permissão para realizar esta ação',
  404: 'O recurso solicitado não foi encontrado',
  422: 'Os dados fornecidos são inválidos',
  429: 'Muitas tentativas. Por favor, aguarde um momento',
  500: 'Ocorreu um erro no servidor. Tente novamente mais tarde',
  503: 'Serviço temporariamente indisponível. Tente novamente mais tarde'
};

// Map of validation error fields to user-friendly labels
const FIELD_LABELS = {
  nome: 'Nome',
  email: 'E-mail',
  telefone: 'Telefone',
  placa: 'Placa',
  modelo: 'Modelo',
  capacidade: 'Capacidade',
  ano_fabricacao: 'Ano de Fabricação',
  horario_inicio: 'Horário de Início',
  horario_fim: 'Horário de Fim',
  status: 'Status'
};

/**
 * Format validation errors into user-friendly messages
 * @param {Object} errors - Validation errors object from API
 * @returns {string} Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') return 'Dados inválidos fornecidos';

  return Object.entries(errors)
    .map(([field, messages]) => {
      const label = FIELD_LABELS[field] || field;
      const message = Array.isArray(messages) ? messages[0] : messages;
      return `${label}: ${message}`;
    })
    .join('\n');
};

/**
 * Get a user-friendly error message from an API error
 * @param {Error} error - The error object from API call
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'Ocorreu um erro desconhecido';

  // Handle network errors
  if (!error.response) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão';
  }

  const { status, data } = error.response;

  // Handle validation errors
  if (status === 422 && data.errors) {
    return formatValidationErrors(data.errors);
  }

  // Handle known HTTP status codes
  if (HTTP_ERROR_MESSAGES[status]) {
    return HTTP_ERROR_MESSAGES[status];
  }

  // Handle errors with message in response
  if (data.message) {
    return data.message;
  }

  // Default error message
  return 'Ocorreu um erro inesperado. Tente novamente mais tarde';
};

/**
 * Format error details for logging
 * @param {Error} error - The error object
 * @returns {Object} Formatted error details
 */
export const formatErrorForLogging = (error) => {
  return {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method,
    timestamp: new Date().toISOString()
  };
};