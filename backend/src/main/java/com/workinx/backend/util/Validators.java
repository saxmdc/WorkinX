package com.workinx.backend.util;

import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Equivalente a utils/validators.js de Node.js.
 * Contiene todas las validaciones de negocio portadas directamente.
 */
@Component
public class Validators {

    private static final Map<String, String> CLASIFICACIONES_EMPRESA = Map.of(
            "1-10",    "microempresa",
            "11-50",   "pequena_empresa",
            "51-200",  "mediana_empresa",
            "201-500", "gran_empresa",
            "500+",    "macroempresa"
    );

    /**
     * Valida la contraseña: mínimo 8 chars, 1 mayúscula, 1 número, 1 carácter especial.
     * Misma lógica que validarPassword() en Node.js.
     */
    public boolean validarPassword(String password) {
        if (password == null || password.isEmpty()) return false;
        boolean minimo    = password.length() >= 8;
        boolean mayuscula = password.matches(".*[A-ZÁÉÍÓÚÑ].*");
        boolean numero    = password.matches(".*[0-9].*");
        boolean especial  = password.matches(".*[!@#$%^&*(),.?\":{}|<>_\\-+=/\\\\\\[\\];'`~].*");
        return minimo && mayuscula && numero && especial;
    }

    /**
     * Valida el número de documento según el tipo.
     * Misma lógica que validarDocumento() en Node.js.
     */
    public boolean validarDocumento(String tipoDocumento, String documento) {
        if (documento == null || !documento.matches("^[0-9]+$")) return false;
        return switch (tipoDocumento) {
            case "TI"  -> documento.length() == 10;
            case "CC"  -> documento.length() >= 6 && documento.length() <= 10;
            case "CE"  -> documento.length() >= 6 && documento.length() <= 7;
            case "PPT" -> documento.length() == 7;
            default    -> false;
        };
    }

    /**
     * Mapea el rango de edad al valor de la DB.
     */
    public String obtenerCategoriaEdad(String edadRango) {
        if ("-17".equals(edadRango)   || "menor_edad".equals(edadRango)) return "menor_edad";
        if ("+18".equals(edadRango)   || "mayor_edad".equals(edadRango)) return "mayor_edad";
        return null;
    }

    /**
     * Normaliza tipo de entidad a "publica" o "privada".
     */
    public String obtenerTipoEntidad(String tipoEntidad) {
        if (tipoEntidad == null) return null;
        // Normalizar acentos y mayúsculas
        String valor = tipoEntidad.trim().toLowerCase()
                .replace("á", "a").replace("é", "e")
                .replace("í", "i").replace("ó", "o").replace("ú", "u");
        if ("publica".equals(valor))  return "publica";
        if ("privada".equals(valor)) return "privada";
        return null;
    }

    /**
     * Retorna la clasificación de empresa según el rango de empleados.
     */
    public String obtenerClasificacionEmpresa(String rangoEmpleados) {
        if (rangoEmpleados == null) return null;
        return CLASIFICACIONES_EMPRESA.getOrDefault(rangoEmpleados, null);
    }

    /**
     * Normaliza el tipo de entrevista al valor guardado en DB.
     */
    public String normalizarTipoEntrevista(String tipo) {
        if (tipo == null) return null;
        String valor = tipo.trim().toLowerCase();
        if ("primer empleo".equals(valor) || "primer_empleo".equals(valor)) return "primer_empleo";
        if ("profesional".equals(valor))  return "profesional";
        if ("emprendedor".equals(valor))  return "emprendedor";
        return null;
    }

    /**
     * Normaliza la modalidad al valor guardado en DB.
     */
    public String normalizarModalidad(String modalidad) {
        if (modalidad == null) return null;
        String valor = modalidad.trim().toLowerCase()
                .replace("í", "i");
        return switch (valor) {
            case "presencial"           -> "presencial";
            case "remoto"               -> "remoto";
            case "hibrido", "híbrido"   -> "hibrido";
            default                     -> null;
        };
    }
}
