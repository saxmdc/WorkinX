import { apiRequest } from "./api";

export const notificacionesService = {
  async obtenerMisNotificaciones() {
    return apiRequest("/api/notificaciones", {
      method: "GET",
    });
  },

  async marcarComoLeida(id) {
    return apiRequest(`/api/notificaciones/${id}/leer`, {
      method: "PUT",
    });
  },

  async marcarTodasComoLeidas() {
    return apiRequest("/api/notificaciones/leer-todas", {
      method: "PUT",
    });
  },
};
