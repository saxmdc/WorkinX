package com.workinx.backend.dto;

import lombok.Data;

/**
 * DTO de entrada para POST /api/auth/login.
 */
@Data
public class LoginRequest {
    private String correo;
    private String password;
}
