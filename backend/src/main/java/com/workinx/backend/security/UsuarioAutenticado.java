package com.workinx.backend.security;

/**
 * Representa al usuario autenticado extraído del JWT.
 * Equivalente a req.usuario en el middleware de Node.js.
 */
public record UsuarioAutenticado(Long id, String correo, String rol) {}
