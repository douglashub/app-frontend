import axios from 'axios';

// Configuração do Axios
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000 // 15 segundos
});

// Interceptor para logs de requisição (debug)
api.interceptors.request.use(request => {
  console.log('API Request:', request.method, request.url);
  return request;
}, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  response => {
    // Processamento de sucesso
    return response;
  },
  error => {
    // Processamento de erro centralizado
    if (error.response) {
      // Servidor respondeu com status de erro
      console.error('API Error:', error.response.status, error.response.data);
      
      // Processar erros específicos
      if (error.response.status === 401) {
        // Redirecionar para login
        // window.location.href = '/login';
      }
      
      if (error.response.status === 422) {
        // Transformar erros de validação em formato amigável
        console.warn('Validation errors:', error.response.data.errors);
      }
    } else if (error.request) {
      // Sem resposta do servidor
      console.error('No response from server', error.request);
    } else {
      // Erro na configuração da requisição
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Formatação comum para horários em formato H:i (exigido pela API Laravel)
 * @param {string} time - Time in HH:mm format 
 * @returns {string} - Time in H:i format or null if input is empty
 */
function formatTimeForApi(time) {
  if (!time) return null;
  
  try {
    // Split the time string into hours and minutes
    const [hours, minutes] = time.split(':');
    
    // Convert hours to integer to remove leading zeros
    const hour = parseInt(hours, 10);
    
    // Return the formatted time string (H:i format exactly as Laravel expects)
    return `${hour}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return null;
  }
}

/**
 * Converte horários do formato da API (H:i) para o formato HTML (HH:mm)
 * @param {string} time - Time in H:i format
 * @returns {string} - Time in HH:mm format
 */
function formatTimeForDisplay(time) {
  if (!time) return '';
  
  try {
    // Handle different time formats that might come from the API
    const timeParts = time.split(':');
    
    if (timeParts.length < 2) return time; // Return as is if not a valid time format
    
    const hours = timeParts[0].padStart(2, '0');
    const minutes = timeParts[1].substring(0, 2).padStart(2, '0'); // Take only first 2 chars & ensure 2 digits
    
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time for display:', error);
    return time || '';
  }
}

// Serviços para API - com tratamentos de erros e mensagens amigáveis
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
    
    console.log('Formatted data for API:', formattedData);
    console.log('Time fields after formatting:', {
      hora_saida_prevista: formattedData.hora_saida_prevista,
      hora_chegada_prevista: formattedData.hora_chegada_prevista,
      hora_saida_real: formattedData.hora_saida_real,
      hora_chegada_real: formattedData.hora_chegada_real
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
    
    console.log('Formatted data for API update:', formattedData);
    console.log('Time fields after formatting:', {
      hora_saida_prevista: formattedData.hora_saida_prevista,
      hora_chegada_prevista: formattedData.hora_chegada_prevista,
      hora_saida_real: formattedData.hora_saida_real,
      hora_chegada_real: formattedData.hora_chegada_real
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
  
  createMotorista: (data) => api.post('/motoristas', data).catch(error => {
    throw new Error('Erro ao criar motorista: ' + getErrorMessage(error));
  }),
  
  updateMotorista: (id, data) => api.put(`/motoristas/${id}`, data).catch(error => {
    throw new Error('Erro ao atualizar motorista: ' + getErrorMessage(error));
  }),
  
  deleteMotorista: (id) => api.delete(`/motoristas/${id}`).catch(error => {
    throw new Error('Erro ao excluir motorista: ' + getErrorMessage(error));
  }),
  
  getMotoristaViagens: (id) => api.get(`/motoristas/${id}/viagens`).catch(error => {
    throw new Error('Erro ao buscar viagens do motorista: ' + getErrorMessage(error));
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
    // Format time fields for API
    const formattedData = { ...data };
    if (formattedData.hora_inicio) {
      formattedData.hora_inicio = formatTimeForApi(formattedData.hora_inicio);
    }
    if (formattedData.hora_fim) {
      formattedData.hora_fim = formatTimeForApi(formattedData.hora_fim);
    }
    
    return api.post('/horarios', formattedData).catch(error => {
      throw new Error('Erro ao criar horário: ' + getErrorMessage(error));
    });
  },
  
  updateHorario: (id, data) => {
    // Format time fields for API
    const formattedData = { ...data };
    if (formattedData.hora_inicio) {
      formattedData.hora_inicio = formatTimeForApi(formattedData.hora_inicio);
    }
    if (formattedData.hora_fim) {
      formattedData.hora_fim = formatTimeForApi(formattedData.hora_fim);
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

export const ParadaService = {
  getParadas: () => api.get('/paradas').catch(error => {
    throw new Error('Erro ao buscar paradas: ' + getErrorMessage(error));
  }),
  
  getParadaById: (id) => api.get(`/paradas/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes da parada: ' + getErrorMessage(error));
  }),
  
  createParada: (data) => api.post('/paradas', data).catch(error => {
    throw new Error('Erro ao criar parada: ' + getErrorMessage(error));
  }),
  
  updateParada: (id, data) => api.put(`/paradas/${id}`, data).catch(error => {
    throw new Error('Erro ao atualizar parada: ' + getErrorMessage(error));
  }),
  
  deleteParada: (id) => api.delete(`/paradas/${id}`).catch(error => {
    throw new Error('Erro ao excluir parada: ' + getErrorMessage(error));
  })
};

export const PresencaService = {
  getPresencas: () => api.get('/presencas').catch(error => {
    throw new Error('Erro ao buscar presenças: ' + getErrorMessage(error));
  }),
  
  getPresencaById: (id) => api.get(`/presencas/${id}`).catch(error => {
    throw new Error('Erro ao buscar detalhes da presença: ' + getErrorMessage(error));
  }),
  
  createPresenca: (data) => {
    // Format time field for API
    const formattedData = { ...data };
    if (formattedData.hora_registro) {
      formattedData.hora_registro = formatTimeForApi(formattedData.hora_registro);
    }
    
    return api.post('/presencas', formattedData).catch(error => {
      throw new Error('Erro ao criar presença: ' + getErrorMessage(error));
    });
  },
  
  updatePresenca: (id, data) => {
    // Format time field for API
    const formattedData = { ...data };
    if (formattedData.hora_registro) {
      formattedData.hora_registro = formatTimeForApi(formattedData.hora_registro);
    }
    
    return api.put(`/presencas/${id}`, formattedData).catch(error => {
      throw new Error('Erro ao atualizar presença: ' + getErrorMessage(error));
    });
  },
  
  deletePresenca: (id) => api.delete(`/presencas/${id}`).catch(error => {
    throw new Error('Erro ao excluir presença: ' + getErrorMessage(error));
  }),
  
  getPresencasByViagem: (viagemId) => api.get(`/presencas/viagem/${viagemId}`).catch(error => {
    throw new Error('Erro ao buscar presenças da viagem: ' + getErrorMessage(error));
  }),
  
  getPresencasByAluno: (alunoId) => api.get(`/presencas/aluno/${alunoId}`).catch(error => {
    throw new Error('Erro ao buscar presenças do aluno: ' + getErrorMessage(error));
  })
};

// Função auxiliar para extrair mensagens amigáveis de erros
function getErrorMessage(error) {
  if (error.response) {
    // Respostas do servidor com status de erro
    if (error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    
    // Tratamento específico para erros de validação do Laravel
    if (error.response.data && error.response.data.errors) {
      const errorMessages = Object.entries(error.response.data.errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ');
      
      return errorMessages;
    }
    
    return `Erro ${error.response.status}: ${error.response.statusText}`;
  } else if (error.request) {
    // Sem resposta do servidor
    return 'Sem resposta do servidor. Verifique sua conexão.';
  } else {
    // Erro na configuração da requisição
    return error.message || 'Erro desconhecido';
  }
}