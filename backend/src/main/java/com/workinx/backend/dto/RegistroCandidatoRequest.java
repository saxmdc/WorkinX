package com.workinx.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

/**
 * DTO de entrada para POST /api/auth/registro-candidato.
 * Acepta tanto camelCase como snake_case para compatibilidad con el frontend.
 */
@Data
public class RegistroCandidatoRequest {

    @JsonAlias("nombre_completo")
    private String nombreCompleto;

    @JsonAlias("tipo_documento")
    private String tipoDocumento;

    private String documento;
    private String correo;
    private String password;
    private String telefono;

    @JsonAlias("ciudad_residencia")
    private String ciudad;

    @JsonAlias("edad_rango")
    private String edadRango;

    @JsonAlias("acepta_terminos")
    private Boolean aceptaTerminos;
}
