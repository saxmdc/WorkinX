import { apiRequest } from "./api";

export const postulacionesService = {
  async crearPostulacion(formData) {
    return apiRequest("/api/postulaciones", {
      method: "POST",
      body: formData,
    });
  },

  async listarMisPostulaciones() {
    return apiRequest("/api/postulaciones/mis-postulaciones", {
      method: "GET",
    });
  },

  async listarPostulacionesPorEntrevista(entrevistaId) {
    return apiRequest(`/api/postulaciones/entrevista/${entrevistaId}`, {
      method: "GET",
    });
  },

  async actualizarEstadoPostulacion(postulacionId, estado) {
    return apiRequest(`/api/postulaciones/${postulacionId}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    });
  },
};
