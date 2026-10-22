import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Health status
  getHealth: async () => {
    const res = await axios.get('/health');
    return res.data;
  },

  // Diagnosis / Scanner
  diagnoseLeaf: async (file, notes = '') => {
    const formData = new FormData();
    formData.append('image', file);
    if (notes) {
      formData.append('notes', notes);
    }
    const res = await axios.post(`${API_BASE}/diagnose`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getDiagnosisById: async (id) => {
    const res = await axios.get(`${API_BASE}/diagnose/${id}`);
    return res.data;
  },

  // My Garden
  getGardenPlants: async () => {
    const res = await axios.get(`${API_BASE}/garden`);
    return res.data;
  },

  addPlantToGarden: async (plantData) => {
    const res = await axios.post(`${API_BASE}/garden`, plantData);
    return res.data;
  },

  waterPlant: async (id) => {
    const res = await axios.post(`${API_BASE}/garden/${id}/water`);
    return res.data;
  },

  deleteGardenPlant: async (id) => {
    const res = await axios.delete(`${API_BASE}/garden/${id}`);
    return res.data;
  },

  getGardenAlerts: async () => {
    const res = await axios.get(`${API_BASE}/garden/alerts`);
    return res.data;
  },

  // History & Statistics
  getHistory: async (params = {}) => {
    const res = await axios.get(`${API_BASE}/history`, { params });
    return res.data;
  },

  deleteHistoryItem: async (id) => {
    const res = await axios.delete(`${API_BASE}/history/${id}`);
    return res.data;
  },

  getStats: async () => {
    const res = await axios.get(`${API_BASE}/stats`);
    return res.data;
  },

  // Disease Knowledgebase / Encyclopedia
  getRemedies: async (search = '') => {
    const res = await axios.get(`${API_BASE}/remedies`, {
      params: search ? { search } : {},
    });
    return res.data;
  },

  getRemedyByClass: async (rawClass) => {
    const res = await axios.get(`${API_BASE}/remedies/${encodeURIComponent(rawClass)}`);
    return res.data;
  },
};
