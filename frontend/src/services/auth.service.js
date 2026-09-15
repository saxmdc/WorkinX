import { apiRequest } from "./api";

export const authService = {
  async login(correo, password) {
    return apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo, password }),
    });
  },

  async registrarCandidato(datos) {
    return apiRequest("/api/auth/registro-candidato", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },

  async registrarEmpresa(datos) {
    return apiRequest("/api/auth/registro-empresa", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },

  async obtenerPerfil() {
    return apiRequest("/api/auth/perfil", {
      method: "GET",
    });
  },
};
