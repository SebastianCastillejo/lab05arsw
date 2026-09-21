import api from './apiClient.js'

// Consume el API REST real (misma interfaz que apimock)
const blueprintsApiClient = {
  getAll: async () => (await api.get('/blueprints')).data,

  getByAuthor: async (author) => (await api.get(`/blueprints/${encodeURIComponent(author)}`)).data,

  getByAuthorAndName: async (author, name) =>
    (await api.get(`/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`)).data,

  create: async (blueprint) => (await api.post('/blueprints', blueprint)).data,
}

export default blueprintsApiClient
