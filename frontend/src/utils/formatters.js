export const convertirEdad = (categoriaEdad) => {
  if (categoriaEdad === "mayor_edad") return "Mayor de edad";
  if (categoriaEdad === "menor_edad") return "Menor de edad";
  return "Sin clasificar";
};

export const convertirEstado = (estado) => {
  const estados = {
    pendiente: "Pendiente",
    revisado: "Revisado",
    aceptado: "Aceptado",
    rechazado: "Rechazado",
    retirado: "Retirado",
  };

  return estados[estado] || estado;
};

export const formatearFecha = (fecha) => {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const convertirClasificacion = (clasificacion) => {
  const valores = {
    microempresa: "Microempresa",
    pequena_empresa: "Pequeña empresa",
    mediana_empresa: "Mediana empresa",
    gran_empresa: "Gran empresa",
    macroempresa: "Macroempresa",
  };

  return valores[clasificacion] || "Sin clasificación";
};

export const convertirTipoEntidad = (tipoEntidad) => {
  if (tipoEntidad === "publica") return "Pública";
  if (tipoEntidad === "privada") return "Privada";
  return "Sin definir";
};
