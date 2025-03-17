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
  getAlunos: (page = 1) => api.get('/alunos', { params: { page } }).catch(error => {
    throw new Error('Erro ao buscar alunos: ' + getErrorMessage(error));
  }),

  getAlunoById: (id) => api.get(`/alunos/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes do aluno: ' + getErrorMessage(error));
  }),

  createAluno: (data) => {
    // Create a copy of the data
    const apiData = { ...data };

    // Convert status to boolean if needed
    if (typeof apiData.status === 'string') {
      apiData.status = apiData.status === 'true' || apiData.status === 'on' || apiData.status === '1';
    }

    return api.post('/alunos', apiData).catch(error => {
      throw new Error('Erro ao criar aluno: ' + getErrorMessage(error));
    });
  },

  updateAluno: (id, data) => {
    // Create a copy of the data
    const apiData = { ...data };

    // Convert status to boolean if needed
    if (typeof apiData.status === 'string') {
      apiData.status = apiData.status === 'true' || apiData.status === 'on' || apiData.status === '1';
    }

    return api.put(`/alunos/${id}`, apiData).catch(error => {
      throw new Error('Erro ao atualizar aluno: ' + getErrorMessage(error));
    });
  },

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

  createOnibus: (data) => {
    // Create a copy of the data
    const apiData = { ...data };

    // Convert status to boolean for API
    if (typeof apiData.status === 'string') {
      apiData.status = apiData.status === 'true' || apiData.status === 'on' || apiData.status === '1';
    }

    return api.post('/onibus', apiData).catch(error => {
      throw new Error('Erro ao criar ônibus: ' + getErrorMessage(error));
    });
  },

  updateOnibus: (id, data) => {
    // Create a copy of the data
    const apiData = { ...data };

    // Convert status to boolean for API
    if (typeof apiData.status === 'string') {
      apiData.status = apiData.status === 'true' || apiData.status === 'on' || apiData.status === '1';
    }

    return api.put(`/onibus/${id}`, apiData).catch(error => {
      throw new Error('Erro ao atualizar ônibus: ' + getErrorMessage(error));
    });
  },

  deleteOnibus: (id) => api.delete(`/onibus/${id}`).catch(error => {
    console.error('Delete Error Details:', error.response?.data);

    // Handle constraint violation errors
    if (error.response?.data?.message?.includes('não pode ser excluído') ||
      error.response?.data?.message?.includes('viagens associadas') ||
      error.response?.status === 400) {
      throw new Error('Não é possível excluir o ônibus pois existem viagens associadas a ele.');
    }

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

    // Convert status to boolean for API
    if (typeof formattedData.status === 'string') {
      formattedData.status = formattedData.status === 'true' || formattedData.status === 'on' || formattedData.status === '1';
    }

    return api.post('/rotas', formattedData).catch(error => {
      console.error('Erro detalhado API:', error.response?.data);
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

    // Convert status to boolean for API
    if (typeof formattedData.status === 'string') {
      formattedData.status = formattedData.status === 'true' || formattedData.status === 'on' || formattedData.status === '1';
    }

    return api.put(`/rotas/${id}`, formattedData).catch(error => {
      console.error('Erro detalhado API:', error.response?.data);
      throw new Error('Erro ao atualizar rota: ' + getErrorMessage(error));
    });
  },

  deleteRota: (id) => api.delete(`/rotas/${id}`).catch(error => {
    // Handle constraint violation errors
    if (error.response?.data?.message?.includes('não pode ser excluída') ||
      error.response?.data?.message?.includes('viagens associadas') ||
      error.response?.data?.message?.includes('viagens vinculadas') ||
      error.response?.status === 400) {
      throw new Error('Não é possível excluir esta rota porque existem viagens associadas a ela.');
    }

    throw new Error('Erro ao excluir rota: ' + getErrorMessage(error));
  }),

  getRotaParadas: (id) => api.get(`/rotas/${id}/paradas`).catch(error => {
    throw new Error('Erro ao buscar paradas da rota: ' + getErrorMessage(error));
  }),

  getRotaViagens: (id) => api.get(`/rotas/${id}/viagens`).catch(error => {
    throw new Error('Erro ao buscar viagens da rota: ' + getErrorMessage(error));
  })
};

export const HorarioService = {
  getHorarios: () => api.get('/horarios').catch(error => {
    throw new Error('Erro ao buscar horários: ' + getErrorMessage(error));
  }),

  getHorarioById: (id) => api.get(`/horarios/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes do horário: ' + getErrorMessage(error));
  }),

  createHorario: (data) => {
    // Format time fields
    const formattedData = { ...data };

    if (formattedData.hora_inicio) {
      formattedData.hora_inicio = formatTimeForApi(formattedData.hora_inicio);
    }

    if (formattedData.hora_fim) {
      formattedData.hora_fim = formatTimeForApi(formattedData.hora_fim);
    }

    // Convert status to boolean for API
    if (typeof formattedData.status === 'string') {
      formattedData.status = formattedData.status === 'true' || formattedData.status === 'on' || formattedData.status === '1';
    }

    return api.post('/horarios', formattedData).catch(error => {
      throw new Error('Erro ao criar horário: ' + getErrorMessage(error));
    });
  },

  updateHorario: (id, data) => {
    // Format time fields
    const formattedData = { ...data };

    if (formattedData.hora_inicio) {
      formattedData.hora_inicio = formatTimeForApi(formattedData.hora_inicio);
    }

    if (formattedData.hora_fim) {
      formattedData.hora_fim = formatTimeForApi(formattedData.hora_fim);
    }

    // Convert status to boolean for API
    if (typeof formattedData.status === 'string') {
      formattedData.status = formattedData.status === 'true' || formattedData.status === 'on' || formattedData.status === '1';
    }

    return api.put(`/horarios/${id}`, formattedData).catch(error => {
      throw new Error('Erro ao atualizar horário: ' + getErrorMessage(error));
    });
  },

  deleteHorario: (id) => api.delete(`/horarios/${id}`).catch(error => {
    throw new Error('Erro ao excluir horário: ' + getErrorMessage(error));
  }),

  getHorarioViagens: (id) => api.get(`/horarios/${id}/viagens`).catch(error => {
    throw new Error('Erro ao buscar viagens do horário: ' + getErrorMessage(error));
  })
};

export const ReportService = {
  // Opções para configuração de relatórios
  getReportOptions: () => api.get('/relatorios/opcoes').catch(error => {
    throw new Error('Erro ao buscar opções de relatório: ' + getErrorMessage(error));
  }),

  // Relatórios de Motoristas
  getMotoristaReport: (filters = {}) => {
    // Adicione um console.log para depuração
    console.log('Enviando filtros para relatório de motoristas:', filters);

    return api.get('/relatorios/motoristas', { params: filters })
      .then(response => {
        // Adicione este log para ver a estrutura de dados recebida
        console.log('Resposta do relatório de motoristas:', response);
        return response;
      })
      .catch(error => {
        throw new Error('Erro ao gerar relatório de motoristas: ' + getErrorMessage(error));
      });
  },

  getMotoristaReportExcel: (filters = {}) => api.get('/relatorios/motoristas/excel', {
    params: filters,
    responseType: 'blob'
  }).catch(error => {
    throw new Error('Erro ao gerar relatório de motoristas em Excel: ' + getErrorMessage(error));
  }),

  getMotoristaReportPdf: (filters = {}) => api.get('/relatorios/motoristas/pdf', {
    params: filters,
    responseType: 'blob'
  }).catch(error => {
    throw new Error('Erro ao gerar relatório de motoristas em PDF: ' + getErrorMessage(error));
  }),

  // Relatórios de Monitores
  getMonitorReport: (filters = {}) => api.get('/relatorios/monitores', { params: filters }).catch(error => {
    throw new Error('Erro ao gerar relatório de monitores: ' + getErrorMessage(error));
  }),

  getMonitorReportExcel: (filters = {}) => api.get('/relatorios/monitores/excel', {
    params: filters,
    responseType: 'blob'
  }).catch(error => {
    throw new Error('Erro ao gerar relatório de monitores em Excel: ' + getErrorMessage(error));
  }),

  getMonitorReportPdf: (filters = {}) => api.get('/relatorios/monitores/pdf', {
    params: filters,
    responseType: 'blob'
  }).catch(error => {
    throw new Error('Erro ao gerar relatório de monitores em PDF: ' + getErrorMessage(error));
  }),

  // Relatórios de Viagens
  getViagemReport: (filters = {}) => {
    // Remove empty string filters and null/undefined values
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) =>
        v !== '' && v !== null && v !== undefined
      )
    );

    // Normalize status filter
    if (cleanedFilters.status !== undefined) {
      const statusMap = {
        'Ativo': true,
        'Inativo': false,
        'true': true,
        'false': false,
        '1': true,
        '0': false
      };

      cleanedFilters.status = statusMap[cleanedFilters.status] ?? cleanedFilters.status;
    }

    // Add additional logging for debugging
    console.log('Cleaned Filters for Viagem Report:', cleanedFilters);

    return api.get('/relatorios/viagens', {
      params: cleanedFilters
    }).catch(error => {
      // Log detailed error information
      console.error('Detailed Viagem Report Error:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });

      // Throw a more informative error message
      throw new Error('Erro ao gerar relatório de viagens: ' +
        (error.response?.data?.message || error.message || 'Erro desconhecido')
      );
    });
  },

  getViagemReportExcel: (filters = {}) => {
    // Remove empty string filters and null/undefined values
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) =>
        v !== '' && v !== null && v !== undefined
      )
    );

    console.log('Cleaned Filters for Viagem Report Excel:', cleanedFilters);

    return api.get('/relatorios/viagens/excel', {
      params: cleanedFilters,
      responseType: 'blob'
    }).catch(error => {
      console.error('Detailed Viagem Report Excel Error:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });

      throw new Error('Erro ao gerar relatório de viagens em Excel: ' +
        (error.response?.data?.message || error.message || 'Erro desconhecido')
      );
    });
  },

  // Relatórios de Viagens
  getViagemReportPdf: (filters = {}) => {
    // Create a clean copy of the filters
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) =>
        v !== '' && v !== null && v !== undefined
      )
    );

    // Normalize the status value for the API
    if (cleanedFilters.status !== undefined) {
      if (typeof cleanedFilters.status === 'string') {
        const statusLower = cleanedFilters.status.toLowerCase();
        cleanedFilters.status = ['true', '1', 'on', 'yes', 'ativo'].includes(statusLower);
      } else {
        cleanedFilters.status = Boolean(cleanedFilters.status);
      }
    }

    // Log for debugging
    console.log('Sending filters to viagem PDF endpoint:', cleanedFilters);

    return api.get('/relatorios/viagens/pdf', {
      params: cleanedFilters,
      responseType: 'blob'
    }).catch(error => {
      console.error('Detailed Viagem Report PDF Error:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw new Error('Erro ao gerar relatório de viagens em PDF: ' + getErrorMessage(error));
    });
  },
  // Método genérico para exportação de relatórios
  exportReport: async (type, format, filters = {}) => {
    try {
      const exportMethods = {
        motoristas: {
          excel: ReportService.getMotoristaReportExcel,
          pdf: ReportService.getMotoristaReportPdf
        },
        monitores: {
          excel: ReportService.getMonitorReportExcel,
          pdf: ReportService.getMonitorReportPdf
        },
        viagens: {
          excel: ReportService.getViagemReportExcel,
          pdf: ReportService.getViagemReportPdf
        }
      };

      if (!exportMethods[type] || !exportMethods[type][format]) {
        throw new Error('Tipo de relatório ou formato inválido');
      }

      const response = await exportMethods[type][format](filters);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao exportar relatório: ${error.message}`);
    }
  },

  // Helper para download de relatórios
  downloadReport: (reportBlob, filename) => {
    try {
      const url = window.URL.createObjectURL(new Blob([reportBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao fazer download do relatório:', error);
      throw new Error('Não foi possível baixar o relatório');
    }
  }
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

    // Convert status to boolean
    if (typeof formattedData.status === 'string') {
      formattedData.status = formattedData.status === 'true' || formattedData.status === 'on' || formattedData.status === '1';
    }

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

    // Convert status to boolean
    if (typeof formattedData.status === 'string') {
      formattedData.status = formattedData.status === 'true' || formattedData.status === 'on' || formattedData.status === '1';
    }

    return api.put(`/viagens/${id}`, formattedData).catch(error => {
      throw new Error('Erro ao atualizar viagem: ' + getErrorMessage(error));
    });
  },

  deleteViagem: (id) => api.delete(`/viagens/${id}`).catch(error => {
    throw new Error('Erro ao excluir viagem: ' + getErrorMessage(error));
  })
};

export const PresencaService = {
  getPresencas: () => api.get('/presencas').catch(error => {
    throw new Error('Erro ao buscar presenças: ' + getErrorMessage(error));
  }),

  getPresencaById: (id) => api.get(`/presencas/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes da presença: ' + getErrorMessage(error));
  }),

  getPresencasByViagem: (viagemId) => api.get(`/presencas/viagem/${viagemId}`).catch(error => {
    throw new Error('Erro ao buscar presenças da viagem: ' + getErrorMessage(error));
  }),

  getPresencasByAluno: (alunoId) => api.get(`/presencas/aluno/${alunoId}`).catch(error => {
    throw new Error('Erro ao buscar presenças do aluno: ' + getErrorMessage(error));
  }),

  createPresenca: (data) => {
    const formattedData = { ...data };

    // Format hora_embarque
    if (formattedData.hora_embarque) {
      formattedData.hora_embarque = formatTimeForApi(formattedData.hora_embarque);
    }

    // Convert presente to boolean
    if (typeof formattedData.presente === 'string') {
      formattedData.presente = formattedData.presente === 'true' || formattedData.presente === 'on' || formattedData.presente === '1';
    }

    return api.post('/presencas', formattedData).catch(error => {
      throw new Error('Erro ao registrar presença: ' + getErrorMessage(error));
    });
  },

  updatePresenca: (id, data) => {
    const formattedData = { ...data };

    // Format hora_embarque
    if (formattedData.hora_embarque) {
      formattedData.hora_embarque = formatTimeForApi(formattedData.hora_embarque);
    }

    // Convert presente to boolean
    if (typeof formattedData.presente === 'string') {
      formattedData.presente = formattedData.presente === 'true' || formattedData.presente === 'on' || formattedData.presente === '1';
    }

    return api.put(`/presencas/${id}`, formattedData).catch(error => {
      throw new Error('Erro ao atualizar presença: ' + getErrorMessage(error));
    });
  },

  deletePresenca: (id) => api.delete(`/presencas/${id}`).catch(error => {
    throw new Error('Erro ao excluir presença: ' + getErrorMessage(error));
  })
};

export const MonitorService = {
  getMonitores: (page = 1) => api.get('/monitores', { params: { page } }).catch(error => {
    throw new Error('Erro ao buscar monitores: ' + getErrorMessage(error));
  }),

  getMonitorById: (id) => api.get(`/monitores/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes do monitor: ' + getErrorMessage(error));
  }),

  createMonitor: (data) => {
    const apiData = { ...data };

    // Ensure status is in the correct format for the backend
    // The backend expects an enum value: 'Ativo', 'Inativo', 'Ferias', 'Licenca'
    if (apiData.status) {
      if (typeof apiData.status === 'boolean') {
        apiData.status = apiData.status ? 'Ativo' : 'Inativo';
      } else if (typeof apiData.status === 'string') {
        const statusLower = apiData.status.toLowerCase();
        if (['true', 'on', '1', 'active', 'ativo'].includes(statusLower)) {
          apiData.status = 'Ativo';
        } else if (['false', 'off', '0', 'inactive', 'inativo'].includes(statusLower)) {
          apiData.status = 'Inativo';
        } else if (['vacation', 'férias', 'ferias'].includes(statusLower)) {
          apiData.status = 'Ferias';
        } else if (['leave', 'licença', 'licenca'].includes(statusLower)) {
          apiData.status = 'Licenca';
        }
      }
    }

    return api.post('/monitores', apiData).catch(error => {
      throw new Error('Erro ao criar monitor: ' + getErrorMessage(error));
    });
  },

  updateMonitor: (id, data) => {
    const apiData = { ...data };

    // Ensure status is in the correct format for the backend
    // The backend expects an enum value: 'Ativo', 'Inativo', 'Ferias', 'Licenca'
    if (apiData.status) {
      if (typeof apiData.status === 'boolean') {
        apiData.status = apiData.status ? 'Ativo' : 'Inativo';
      } else if (typeof apiData.status === 'string') {
        const statusLower = apiData.status.toLowerCase();
        if (['true', 'on', '1', 'active', 'ativo'].includes(statusLower)) {
          apiData.status = 'Ativo';
        } else if (['false', 'off', '0', 'inactive', 'inativo'].includes(statusLower)) {
          apiData.status = 'Inativo';
        } else if (['vacation', 'férias', 'ferias'].includes(statusLower)) {
          apiData.status = 'Ferias';
        } else if (['leave', 'licença', 'licenca'].includes(statusLower)) {
          apiData.status = 'Licenca';
        }
      }
    }

    return api.put(`/monitores/${id}`, apiData).catch(error => {
      throw new Error('Erro ao atualizar monitor: ' + getErrorMessage(error));
    });
  },

  deleteMonitor: (id) => api.delete(`/monitores/${id}`).catch(error => {
    throw new Error('Erro ao excluir monitor: ' + getErrorMessage(error));
  }),

  getMonitorViagens: (id) => api.get(`/monitores/${id}/viagens`).catch(error => {
    throw new Error('Erro ao buscar viagens do monitor: ' + getErrorMessage(error));
  })
};

export const MotoristaService = {
  getMotoristas: () => api.get('/motoristas').catch(error => {
    throw new Error('Erro ao buscar motoristas: ' + getErrorMessage(error));
  }),

  getMotoristaById: (id) => api.get(`/motoristas/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes do motorista: ' + getErrorMessage(error));
  }),

  createMotorista: (data) => {
    // Criar uma cópia dos dados
    const apiData = { ...data };

    // Ensure status is in the correct format for the backend
    // The backend expects an enum value: 'Ativo', 'Inativo', 'Ferias', 'Licenca'
    if (apiData.status) {
      if (typeof apiData.status === 'boolean') {
        apiData.status = apiData.status ? 'Ativo' : 'Inativo';
      } else if (typeof apiData.status === 'string') {
        const statusLower = apiData.status.toLowerCase();
        if (['true', 'on', '1', 'active', 'ativo'].includes(statusLower)) {
          apiData.status = 'Ativo';
        } else if (['false', 'off', '0', 'inactive', 'inativo'].includes(statusLower)) {
          apiData.status = 'Inativo';
        } else if (['vacation', 'férias', 'ferias'].includes(statusLower)) {
          apiData.status = 'Ferias';
        } else if (['leave', 'licença', 'licenca'].includes(statusLower)) {
          apiData.status = 'Licenca';
        }
      }
    }

    return api.post('/motoristas', apiData).catch(error => {
      console.error('Erro detalhado:', error.response?.data);
      throw new Error('Erro ao criar motorista: ' + getErrorMessage(error));
    });
  },

  updateMotorista: (id, data) => {
    // Criar uma cópia dos dados
    const apiData = { ...data };

    // Ensure status is in the correct format for the backend
    // The backend expects an enum value: 'Ativo', 'Inativo', 'Ferias', 'Licenca'
    if (apiData.status) {
      if (typeof apiData.status === 'boolean') {
        apiData.status = apiData.status ? 'Ativo' : 'Inativo';
      } else if (typeof apiData.status === 'string') {
        const statusLower = apiData.status.toLowerCase();
        if (['true', 'on', '1', 'active', 'ativo'].includes(statusLower)) {
          apiData.status = 'Ativo';
        } else if (['false', 'off', '0', 'inactive', 'inativo'].includes(statusLower)) {
          apiData.status = 'Inativo';
        } else if (['vacation', 'férias', 'ferias'].includes(statusLower)) {
          apiData.status = 'Ferias';
        } else if (['leave', 'licença', 'licenca'].includes(statusLower)) {
          apiData.status = 'Licenca';
        }
      }
    }

    return api.put(`/motoristas/${id}`, apiData).catch(error => {
      console.error('Erro detalhado:', error.response?.data);
      throw new Error('Erro ao atualizar motorista: ' + getErrorMessage(error));
    });
  },

  deleteMotorista: (id) => api.delete(`/motoristas/${id}`).catch(error => {
    console.error('Erro detalhado ao excluir:', error.response?.data);
    throw new Error('Erro ao excluir motorista: ' + getErrorMessage(error));
  }),

  getMotoristaViagens: (id) => api.get(`/motoristas/${id}/viagens`).catch(error => {
    throw new Error('Erro ao buscar viagens do motorista: ' + getErrorMessage(error));
  })
};

export const ParadaService = {
  getParadas: () => api.get('/paradas').catch(error => {
    throw new Error('Erro ao buscar paradas: ' + getErrorMessage(error));
  }),

  getParadaById: (id) => api.get(`/paradas/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes da parada: ' + getErrorMessage(error));
  }),

  createParada: (data) => {
    // Create a copy of the data
    const apiData = { ...data };

    // Convert status to boolean for the backend
    if (typeof apiData.status === 'string') {
      apiData.status = apiData.status === 'true' || apiData.status === 'on' || apiData.status === '1';
    }

    return api.post('/paradas', apiData).catch(error => {
      console.error('Erro detalhado API:', error.response?.data);
      throw new Error('Erro ao criar parada: ' + getErrorMessage(error));
    });
  },

  updateParada: (id, data) => {
    // Create a copy of the data
    const apiData = { ...data };

    // Convert status to boolean for the backend
    if (typeof apiData.status === 'string') {
      apiData.status = apiData.status === 'true' || apiData.status === 'on' || apiData.status === '1';
    }

    return api.put(`/paradas/${id}`, apiData).catch(error => {
      console.error('Erro detalhado API:', error.response?.data);
      throw new Error('Erro ao atualizar parada: ' + getErrorMessage(error));
    });
  },

  deleteParada: (id) => api.delete(`/paradas/${id}`).catch(error => {
    // Handle constraint violation errors
    if (error.response?.data?.message?.includes('não pode ser excluída') ||
      error.response?.data?.message?.includes('sendo usada em rotas') ||
      error.response?.data?.message?.includes('Server error')) {
      throw new Error('Não é possível excluir esta parada pois ela está sendo usada em rotas. Remova as associações primeiro.');
    }
    throw new Error('Erro ao excluir parada: ' + getErrorMessage(error));
  })
};

export default api;