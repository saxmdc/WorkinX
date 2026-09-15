package com.workinx.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

/**
 * DTO de entrada para POST /api/auth/registro-empresa.
 */
@Data
public class RegistroEmpresaRequest {

    @JsonAlias("nombre_empresa")
    private String nombre;

    private String correo;
    private String password;

    @JsonAlias("telefono_contacto")
    private String telefono;

    private String direccion;
    private String industria;
    private String descripcion;

    @JsonAlias("sitio_web")
    private String sitioWeb;

    @JsonAlias({"rango_empleados", "numero_empleados_rango"})
    private String rangoEmpleados;

    @JsonAlias("tipo_entidad")
    private String tipoEntidad;

    @JsonAlias("acepta_terminos")
    private Boolean aceptaTerminos;
}
