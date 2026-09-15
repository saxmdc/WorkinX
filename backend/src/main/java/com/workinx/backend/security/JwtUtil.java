package com.workinx.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Equivalente a jwt.sign() y jwt.verify() de jsonwebtoken (Node.js).
 * Genera y valida tokens JWT con el mismo payload: { id, correo, rol }.
 */
@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expiration;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {
        // La clave debe tener al menos 256 bits para HS256
        byte[] keyBytes = secret.getBytes();
        if (keyBytes.length < 32) {
            // Rellenar con ceros si el secreto es muy corto
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            keyBytes = padded;
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expiration = expiration;
    }

    /**
     * Genera un token JWT con el mismo payload que el original Node.js:
     * { id, correo, rol, iat, exp }
     */
    public String generarToken(Long id, String correo, String rol) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", id);
        claims.put("correo", correo);
        claims.put("rol", rol);

        return Jwts.builder()
                .claims(claims)
                .subject(correo)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }

    /**
     * Parsea y valida un token JWT. Lanza JwtException si es inválido o expirado.
     */
    public Claims parsearToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
