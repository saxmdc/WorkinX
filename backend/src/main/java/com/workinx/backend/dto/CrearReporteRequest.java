package com.workinx.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

/**
 * DTO de entrada para POST /api/reportes.
 */
@Data
public class CrearReporteRequest {

    @JsonAlias("entrevista_id")
    private Long entrevistaId;

    @JsonAlias("tipo_reporte")
    private String tipoReporte;

    private String descripcion;
    private String evidencia;
}
