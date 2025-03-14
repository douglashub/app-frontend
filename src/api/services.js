import axios from 'axios';

// Axios configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000 // 15 seconds
});

// Request interceptor for logging
api.interceptors.request.use(request => {
  // console.log('API Request:', request.method, request.url);
  return request;
}, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

import { getErrorMessage, formatErrorForLogging } from '../utils/errorHandler';

// Response interceptor for error handling
api.interceptors.response.use(
  response => {
    // Success processing
    return response;
  },
  error => {
    // Log error details for debugging
    console.error('API Error:', formatErrorForLogging(error));
    
    // Handle specific errors
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    
    // Get user-friendly error message
    error.userMessage = getErrorMessage(error);
    
    return Promise.reject(error);
  }
);

/**
 * Format time values for API (HH:mm to H:i)
 * @param {string} time - Time in HH:mm format 
 * @returns {string} - Time in H:i format or null if input is empty
 */
function formatTimeForApi(time) {
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
}

/**
 * Format time values from API (H:i) to HTML time input format (HH:mm)
 * @param {string} time - Time in H:i format
 * @returns {string} - Time in HH:mm format
 */
function formatTimeForDisplay(time) {
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
}

// API Services with error handling and friendly messages
export const AlunoService = {
  getAlunos: () => api.get('/alunos').catch(error => {
    throw new Error('Erro ao buscar alunos: ' + getErrorMessage(error));
  }),
  
  getAlunoById: (id) => api.get(`/alunos/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes do aluno: ' + getErrorMessage(error));
  }),
  
  createAluno: (data) => api.post('/alunos', data).catch(error => {
    throw new Error('Erro ao criar aluno: ' + getErrorMessage(error));
  }),
  
  updateAluno: (id, data) => api.put(`/alunos/${id}`, data).catch(error => {
    throw new Error('Erro ao atualizar aluno: ' + getErrorMessage(error));
  }),
  
  deleteAluno: (id) => api.delete(`/alunos/${id}`).catch(error => {
    throw new Error('Erro ao excluir aluno: ' + getErrorMessage(error));
  }),
  
  getAlunoPresencas: (id) => api.get(`/alunos/${id}/presencas`).catch(error => {
    throw new Error('Erro ao buscar presenças do aluno: ' + getErrorMessage(error));
  })
};

export const OnibusService = {
  getOnibus: () => api.get('/onibus').catch(error => {
    throw new Error('Erro ao buscar ônibus: ' + getErrorMessage(error));
  }),
  
  getOnibusById: (id) => api.get(`/onibus/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes do ônibus: ' + getErrorMessage(error));
  }),
  
  createOnibus: (data) => api.post('/onibus', data).catch(error => {
    throw new Error('Erro ao criar ônibus: ' + getErrorMessage(error));
  }),
  
  updateOnibus: (id, data) => api.put(`/onibus/${id}`, data).catch(error => {
    throw new Error('Erro ao atualizar ônibus: ' + getErrorMessage(error));
  }),
  
  deleteOnibus: (id) => api.delete(`/onibus/${id}`).catch(error => {
    throw new Error('Erro ao excluir ônibus: ' + getErrorMessage(error));
  }),
  
  getOnibusViagens: (id) => api.get(`/onibus/${id}/viagens`).catch(error => {
    throw new Error('Erro ao buscar viagens do ônibus: ' + getErrorMessage(error));
  })
};

export const RotaService = {
  getRotas: () => api.get('/rotas').catch(error => {
    throw new Error('Erro ao buscar rotas: ' + getErrorMessage(error));
  }),
  
  getRotaById: (id) => api.get(`/rotas/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes da rota: ' + getErrorMessage(error));
  }),
  
  createRota: (data) => {
    // Format time fields
    const formattedData = { ...data };
    if (formattedData.horario_inicio) {
      formattedData.horario_inicio = formatTimeForApi(formattedData.horario_inicio);
    }
    if (formattedData.horario_fim) {
      formattedData.horario_fim = formatTimeForApi(formattedData.horario_fim);
    }
    
    return api.post('/rotas', formattedData).catch(error => {
      throw new Error('Erro ao criar rota: ' + getErrorMessage(error));
    });
  },
  
  updateRota: (id, data) => {
    // Format time fields
    const formattedData = { ...data };
    if (formattedData.horario_inicio) {
      formattedData.horario_inicio = formatTimeForApi(formattedData.horario_inicio);
    }
    if (formattedData.horario_fim) {
      formattedData.horario_fim = formatTimeForApi(formattedData.horario_fim);
    }
    
    return api.put(`/rotas/${id}`, formattedData).catch(error => {
      throw new Error('Erro ao atualizar rota: ' + getErrorMessage(error));
    });
  },
  
  deleteRota: (id) => api.delete(`/rotas/${id}`).catch(error => {
    throw new Error('Erro ao excluir rota: ' + getErrorMessage(error));
  }),
  
  getRotaParadas: (id) => api.get(`/rotas/${id}/paradas`).catch(error => {
    throw new Error('Erro ao buscar paradas da rota: ' + getErrorMessage(error));
  }),
  
  getRotaViagens: (id) => api.get(`/rotas/${id}/viagens`).catch(error => {
    throw new Error('Erro ao buscar viagens da rota: ' + getErrorMessage(error));
  })
};

export const ViagemService = {
  getViagens: () => api.get('/viagens').catch(error => {
    throw new Error('Erro ao buscar viagens: ' + getErrorMessage(error));
  }),
  
  getViagemById: (id) => api.get(`/viagens/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes da viagem: ' + getErrorMessage(error));
  }),
  
  createViagem: (data) => {
    // Format time fields for API
    const formattedData = { ...data };
    
    // Handle all time fields
    const timeFields = ['hora_saida_prevista', 'hora_chegada_prevista', 'hora_saida_real', 'hora_chegada_real'];
    timeFields.forEach(field => {
      if (formattedData[field]) {
        formattedData[field] = formatTimeForApi(formattedData[field]);
      }
    });
    
    return api.post('/viagens', formattedData).catch(error => {
      throw new Error('Erro ao criar viagem: ' + getErrorMessage(error));
    });
  },
  
  updateViagem: (id, data) => {
    // Format time fields for API
    const formattedData = { ...data };
    
    // Handle all time fields
    const timeFields = ['hora_saida_prevista', 'hora_chegada_prevista', 'hora_saida_real', 'hora_chegada_real'];
    timeFields.forEach(field => {
      if (formattedData[field]) {
        formattedData[field] = formatTimeForApi(formattedData[field]);
      }
    });
    
    return api.put(`/viagens/${id}`, formattedData).catch(error => {
      throw new Error('Erro ao atualizar viagem: ' + getErrorMessage(error));
    });
  },
  
  deleteViagem: (id) => api.delete(`/viagens/${id}`).catch(error => {
    throw new Error('Erro ao excluir viagem: ' + getErrorMessage(error));
  })
};

export const MonitorService = {
  getMonitores: (page = 1) => api.get('/monitores', { params: { page } }).catch(error => {
    throw new Error('Erro ao buscar monitores: ' + getErrorMessage(error));
  }),
  
  getMonitorById: (id) => api.get(`/monitores/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes do monitor: ' + getErrorMessage(error));
  }),
  
  createMonitor: (data) => api.post('/monitores', data).catch(error => {
    throw new Error('Erro ao criar monitor: ' + getErrorMessage(error));
  }),
  
  updateMonitor: (id, data) => api.put(`/monitores/${id}`, data).catch(error => {
    throw new Error('Erro ao atualizar monitor: ' + getErrorMessage(error));
  }),
  
  deleteMonitor: (id) => api.delete(`/monitores/${id}`).catch(error => {
    throw new Error('Erro ao excluir monitor: ' + getErrorMessage(error));
  })
};

export const MotoristaService = {
  getMotoristas: () => api.get('/motoristas').catch(error => {
    throw new Error('Erro ao buscar motoristas: ' + getErrorMessage(error));
  }),
  
  getMotoristaById: (id) => api.get(`/motoristas/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes do motorista: ' + getErrorMessage(error));
  }),
  
  createMotorista: (data) => api.post('/motoristas', data).catch(error => {
    throw new Error('Erro ao criar motorista: ' + getErrorMessage(error));
  }),
  
  updateMotorista: (id, data) => api.put(`/motoristas/${id}`, data).catch(error => {
    throw new Error('Erro ao atualizar motorista: ' + getErrorMessage(error));
  }),
  
  deleteMotorista: (id) => api.delete(`/motoristas/${id}`).catch(error => {
    throw new Error('Erro ao excluir motorista: ' + getErrorMessage(error));
  })
};

export default api;