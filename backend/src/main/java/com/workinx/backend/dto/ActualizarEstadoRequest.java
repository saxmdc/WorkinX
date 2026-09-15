package com.workinx.backend.dto;

import lombok.Data;

/**
 * DTO para PUT /api/postulaciones/:id/estado.
 */
@Data
public class ActualizarEstadoRequest {
    private String estado;
}
