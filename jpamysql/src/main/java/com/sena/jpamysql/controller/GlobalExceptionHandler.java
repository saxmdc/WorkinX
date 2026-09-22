package com.sena.jpamysql.controller;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ── CONTROLADOR DE MANEJO GLOBAL DE EXCEPCIONES (RETO 2) ─────────────────────
 * Intercepta todas las excepciones lanzadas en la aplicación y genera respuestas
 * HTTP estructuradas y mensajes limpios para el usuario en lugar del error 500.
 *
 * Además, registra logs de nivel ERROR y WARN con SLF4J (RETO 3).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Instancia del logger SLF4J para el manejo de excepciones
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 1. Manejo de violaciones de validación en peticiones REST (@Valid @RequestBody)
     * Ocurre cuando fallan las 5 anotaciones de Empresa.java (@NotBlank, @Size, @Pattern).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> erroresCampos = new HashMap<>();
        List<String> listaMensajes = new ArrayList<>();

        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            erroresCampos.put(error.getField(), error.getDefaultMessage());
            listaMensajes.add(error.getDefaultMessage());
        }

        String mensajeUnificado = String.join(" | ", listaMensajes);

        // Registro de log nivel ERROR (Reto 3)
        logger.error("[ERROR] Violación de validación en Entity: {}", mensajeUnificado);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "Error de validación");
        respuesta.put("mensaje", mensajeUnificado);
        respuesta.put("mensajes", listaMensajes);
        respuesta.put("campos", erroresCampos);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }

    /**
     * 2. Manejo de violaciones de validación de Entity directa (ConstraintViolationException)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        List<String> listaMensajes = ex.getConstraintViolations()
                .stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.toList());

        String mensajeUnificado = String.join(" | ", listaMensajes);

        // Registro de log nivel ERROR (Reto 3)
        logger.error("[ERROR] Violación de validación en Entity: {}", mensajeUnificado);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "Error de validación");
        respuesta.put("mensaje", mensajeUnificado);
        respuesta.put("mensajes", listaMensajes);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }

    /**
     * 3. Manejo de violación de integridad de datos en Base de Datos (SQL)
     * Ocurre por ejemplo cuando se intenta registrar un correo ya existente (unique = true).
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String mensaje = "Conflicto en base de datos: el registro ya existe o viola una restricción de integridad.";

        // Registro de log nivel ERROR (Reto 3)
        logger.error("[ERROR] Violación de integridad de datos (clave duplicada o restricción SQL): {}", ex.getMessage());

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "Conflicto de integridad");
        respuesta.put("mensaje", mensaje);

        return ResponseEntity.status(HttpStatus.CONFLICT).body(respuesta);
    }

    /**
     * 4. Manejo de parámetros obligatorios faltantes en la solicitud HTTP
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParams(MissingServletRequestParameterException ex) {
        String mensaje = "El campo obligatorio '" + ex.getParameterName() + "' no fue proporcionado.";

        // Registro de log nivel WARN (Reto 3)
        logger.warn("[WARN] Parámetro obligatorio faltante en la petición: {}", ex.getParameterName());

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "Parámetro faltante");
        respuesta.put("mensaje", mensaje);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }

    /**
     * 5. Manejador general de excepciones no controladas
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        // Registro de log nivel ERROR con traza completa (Reto 3)
        logger.error("[ERROR] Error inesperado en el servidor: ", ex);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "Error interno");
        respuesta.put("mensaje", "Ocurrió un error interno en el servidor: " + ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(respuesta);
    }
}
