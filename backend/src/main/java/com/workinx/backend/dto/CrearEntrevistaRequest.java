package com.workinx.backend.dto;

import lombok.Data;

import java.util.List;

/**
 * DTO de entrada para POST/PUT /api/entrevistas.
 * Acepta exactamente los mismos campos que el body del controlador Node.js.
 */
@Data
public class CrearEntrevistaRequest {

    private String titulo;
    private String categoria;
    private String descripcion;
    private String tipo;
    private String modalidad;
    private String ubicacion;
    private String lugarEntrevista;
    private String fechaEntrevista;   // "yyyy-MM-dd"
    private String horaEntrevista;    // "HH:mm" o "HH:mm:ss"
    private Boolean salarioAConvenir;
    private Double salarioMin;
    private Double salarioMax;
    private List<String> requisitos;
    private List<String> palabrasClave;
    private String fechaLimite;       // "yyyy-MM-dd"
    private Double latitud;
    private Double longitud;
}
