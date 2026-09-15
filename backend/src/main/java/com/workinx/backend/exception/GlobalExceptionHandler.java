package com.workinx.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Manejador centralizado de errores.
 * Equivalente a error.middleware.js de Express.
 *
 * Respuesta siempre en formato: { "mensaje": "..." }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Errores de negocio lanzados manualmente (AppException).
     * Equivalente a: if (err.statusCode) { res.status(err.statusCode).json({ mensaje }) }
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<Map<String, Object>> handleAppException(AppException ex) {
        return ResponseEntity.status(ex.getStatus())
                .body(Map.of("mensaje", ex.getMessage()));
    }

    /**
     * Recurso estático no encontrado (ej: GET /) — respuesta silenciosa sin stack trace en log.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResource(NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("mensaje", "Ruta no encontrada: " + ex.getResourcePath()));
    }

    /**
     * Archivo demasiado grande (equivalente a multer LIMIT_FILE_SIZE).
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("mensaje", "El archivo excede el tamaño máximo permitido de 5 MB."));
    }

    /**
     * Errores de validación Bean Validation (@Valid en DTOs).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String mensaje = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst()
                .orElse("Error de validación.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("mensaje", mensaje));
    }

    /**
     * Catch-all para cualquier error no esperado.
     * Equivalente al manejador genérico de error.middleware.js.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        System.err.println("Error capturado por GlobalExceptionHandler: " + ex.getMessage());
        ex.printStackTrace();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("mensaje", ex.getMessage() != null ? ex.getMessage() : "Error interno del servidor.");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
