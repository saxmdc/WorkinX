import { apiRequest } from "./api";

export const reportesService = {
  async crearReporte(datos) {
    return apiRequest("/api/reportes", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },
};
