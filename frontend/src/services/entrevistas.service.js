import { apiRequest } from "./api";

export const entrevistasService = {
  async listarEntrevistas() {
    return apiRequest("/api/entrevistas", {
      method: "GET",
    });
  },

  async obtenerEntrevistaPorId(id) {
    return apiRequest(`/api/entrevistas/${id}`, {
      method: "GET",
    });
  },

  async listarMisEntrevistas() {
    return apiRequest("/api/entrevistas/empresa/mis-entrevistas", {
      method: "GET",
    });
  },

  async crearEntrevista(datos) {
    return apiRequest("/api/entrevistas", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },

  async actualizarEntrevista(id, datos) {
    return apiRequest(`/api/entrevistas/${id}`, {
      method: "PUT",
      body: JSON.stringify(datos),
    });
  },

  async eliminarEntrevista(id) {
    return apiRequest(`/api/entrevistas/${id}`, {
      method: "DELETE",
    });
  },
};
