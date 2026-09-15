package com.sena.jpamysql.controller;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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
     * 1. Manejo de violaciones de validación de Entity (Jakarta Validation)
     * Ocurre cuando fallan anotaciones como @NotBlank, @Size, @Email o @Pattern.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<String> handleConstraintViolation(ConstraintViolationException ex) {
        String errorMessage = ex.getConstraintViolations()
                .stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(" | "));

        // Registro de log nivel ERROR (Reto 3)
        logger.error("[ERROR] Violación de validación en Entity: {}", errorMessage);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
    }

    /**
     * 2. Manejo de violación de integridad de datos en Base de Datos (SQL)
     * Ocurre por ejemplo cuando se intenta registrar un correo ya existente (unique = true).
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String mensaje = "El correo electrónico ya se encuentra registrado en el sistema.";

        // Registro de log nivel ERROR (Reto 3)
        logger.error("[ERROR] Violación de integridad de datos (clave duplicada o restricción SQL): {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(mensaje);
    }

    /**
     * 3. Manejo de parámetros obligatorios faltantes en la solicitud HTTP
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<String> handleMissingParams(MissingServletRequestParameterException ex) {
        String mensaje = "El campo obligatorio '" + ex.getParameterName() + "' no fue proporcionado.";

        // Registro de log nivel WARN (Reto 3)
        logger.warn("[WARN] Parámetro obligatorio faltante en la petición: {}", ex.getParameterName());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mensaje);
    }

    /**
     * 4. Manejador general de excepciones no controladas
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception ex) {
        // Registro de log nivel ERROR con traza completa (Reto 3)
        logger.error("[ERROR] Error inesperado en el servidor: ", ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Ocurrió un error interno en el servidor: " + ex.getMessage());
    }
}
