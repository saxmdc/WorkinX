package com.workinx.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Equivalente a utils/formatters.js de Node.js.
 * Transforma los resultados de la DB al formato JSON de respuesta.
 */
@Component
public class Formatters {

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    /** Formatea el tipo de entrevista al texto legible. */
    public String formatearTipo(String tipo) {
        if (tipo == null) return tipo;
        return switch (tipo) {
            case "primer_empleo" -> "Primer empleo";
            case "profesional"   -> "Profesional";
            case "emprendedor"   -> "Emprendedor";
            default              -> tipo;
        };
    }

    /** Formatea la modalidad al texto legible. */
    public String formatearModalidad(String modalidad) {
        if (modalidad == null) return modalidad;
        return switch (modalidad) {
            case "presencial" -> "Presencial";
            case "remoto"     -> "Remoto";
            case "hibrido"    -> "Híbrido";
            default           -> modalidad;
        };
    }

    /**
     * Convierte cualquier objeto de fecha (java.sql.Date, LocalDate, etc.) a "yyyy-MM-dd".
     */
    public String formatearFecha(Object fecha) {
        if (fecha == null) return null;
        String s = fecha.toString();
        // java.sql.Date y LocalDate ya se formatean como "yyyy-MM-dd"
        // java.sql.Timestamp como "yyyy-MM-dd HH:mm:ss.n"
        if (s.length() >= 10) return s.substring(0, 10);
        return s;
    }

    /**
     * Convierte el campo hora (java.sql.Time) a String "HH:mm:ss".
     */
    public String formatearHora(Object hora) {
        if (hora == null) return null;
        return hora.toString();
    }

    /** Helper para convertir TINYINT(1) / Boolean a boolean Java. */
    public boolean esVerdadero(Object val) {
        if (val == null)            return false;
        if (val instanceof Boolean b) return b;
        if (val instanceof Number n)  return n.intValue() != 0;
        return false;
    }

    /** Genera el texto de salario igual que el JS original. */
    public String crearSalarioTexto(Map<String, Object> e) {
        if (esVerdadero(e.get("salario_a_convenir"))) {
            return "Salario a convenir";
        }
        Object min = e.get("salario_min");
        Object max = e.get("salario_max");
        if (min == null || max == null) return "Salario a convenir";
        // Formato con separador de miles (equivalente a toLocaleString("es-CO"))
        long minLong = ((Number) min).longValue();
        long maxLong = ((Number) max).longValue();
        if (minLong == maxLong) {
            return String.format("$%,d", minLong).replace(",", ".");
        }
        return String.format("$%,d - $%,d", minLong, maxLong)
                .replace(",", ".");
    }

    /**
     * Convierte una fila de la DB al objeto de respuesta de entrevista.
     * Equivalente a convertirEntrevista() en formatters.js.
     */
    public Map<String, Object> convertirEntrevista(Map<String, Object> e) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id",              e.get("id"));
        result.put("titulo",          e.get("titulo"));
        result.put("descripcion",     e.get("descripcion"));
        result.put("tipo",            formatearTipo(safeStr(e.get("tipo"))));
        result.put("modalidad",       formatearModalidad(safeStr(e.get("modalidad"))));
        result.put("ubicacion",       e.get("ubicacion"));
        result.put("lugarEntrevista", e.get("lugar_entrevista"));
        result.put("fechaEntrevista", formatearFecha(e.get("fecha_entrevista")));
        result.put("horaEntrevista",  formatearHora(e.get("hora_entrevista")));
        result.put("salarioAConvenir",esVerdadero(e.get("salario_a_convenir")));
        result.put("salarioMin",      e.get("salario_min"));
        result.put("salarioMax",      e.get("salario_max"));
        result.put("salarioTexto",    crearSalarioTexto(e));
        result.put("fechaPublicacion",formatearFecha(e.get("fecha_publicacion")));
        result.put("fechaEdicion",    formatearFecha(e.get("fecha_edicion")));
        result.put("fechaLimite",     formatearFecha(e.get("fecha_limite")));
        result.put("activa",          esVerdadero(e.get("activa")));
        result.put("estado",          e.get("estado"));
        result.put("empresa",         e.get("nombre_empresa"));
        result.put("categoria",       e.getOrDefault("categoria", "Sin categoría"));

        // palabras_clave y requisitos vienen como "a||b||c" de GROUP_CONCAT
        result.put("palabrasClave", splitPipe(safeStr(e.get("palabras_clave"))));
        result.put("requisitos",    splitPipe(safeStr(e.get("requisitos"))));

        // Coordenadas del mapa (pueden ser null si no se seleccionaron)
        result.put("latitud",  e.get("latitud"));
        result.put("longitud", e.get("longitud"));

        return result;
    }

    /**
     * Genera la URL pública del CV.
     * Equivalente a generarCvUrl() en formatters.js.
     */
    public String generarCvUrl(String cvPath) {
        if (cvPath == null || cvPath.isBlank()) return null;
        String nombre = new File(cvPath).getName();
        return appUrl + "/uploads/cv/" + nombre;
    }

    // ---- Helpers internos ----

    private String safeStr(Object val) {
        return val == null ? null : val.toString();
    }

    private List<String> splitPipe(String val) {
        if (val == null || val.isBlank()) return Collections.emptyList();
        return Arrays.asList(val.split("\\|\\|"));
    }
}
