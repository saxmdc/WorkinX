package com.workinx.backend.exception;

import org.springframework.http.HttpStatus;

/**
 * Excepción custom equivalente al patrón error.statusCode de Node.js.
 * Ejemplo original:
 *   const error = new Error("El correo ya está registrado.");
 *   error.statusCode = 409;
 *   throw error;
 */
public class AppException extends RuntimeException {

    private final HttpStatus status;

    public AppException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
