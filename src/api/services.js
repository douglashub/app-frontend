import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const AlunoService = {
  getAlunos: () => api.get('/alunos'),
  createAluno: (data) => api.post('/alunos', data),
  updateAluno: (id, data) => api.put(`/alunos/${id}`, data),
  deleteAluno: (id) => api.delete(`/alunos/${id}`)
};

export const OnibusService = {
  getOnibus: () => api.get('/onibus'),
  createOnibus: (data) => api.post('/onibus', data),
  updateOnibus: (id, data) => api.put(`/onibus/${id}`, data),
  deleteOnibus: (id) => api.delete(`/onibus/${id}`)
};

export const RotaService = {
  getRotas: () => api.get('/rotas'),
  createRota: (data) => api.post('/rotas', data),
  updateRota: (id, data) => api.put(`/rotas/${id}`, data),
  deleteRota: (id) => api.delete(`/rotas/${id}`)
};

export const ViagemService = {
  getViagens: () => api.get('/viagens'),
  createViagem: (data) => api.post('/viagens', data),
  updateViagem: (id, data) => api.put(`/viagens/${id}`, data),
  deleteViagem: (id) => api.delete(`/viagens/${id}`)
};

export const MonitorService = {
  getMonitores: () => api.get('/monitores'),
  createMonitor: (data) => api.post('/monitores', data),
  updateMonitor: (id, data) => api.put(`/monitores/${id}`, data),
  deleteMonitor: (id) => api.delete(`/monitores/${id}`)
};

export const MotoristaService = {
  getMotoristas: () => api.get('/motoristas'),
  createMotorista: (data) => api.post('/motoristas', data),
  updateMotorista: (id, data) => api.put(`/motoristas/${id}`, data),
  deleteMotorista: (id) => api.delete(`/motoristas/${id}`)
};