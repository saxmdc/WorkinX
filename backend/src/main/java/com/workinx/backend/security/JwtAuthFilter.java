package com.workinx.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Equivalente a auth.middleware.js de Node.js.
 * Lee el header "Authorization: Bearer <token>", extrae el usuario
 * y lo coloca en el SecurityContext de Spring.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authorization = request.getHeader("Authorization");

        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);

            try {
                Claims claims = jwtUtil.parsearToken(token);

                Long id = ((Number) claims.get("id")).longValue();
                String correo = claims.get("correo", String.class);
                String rol = claims.get("rol", String.class);

                UsuarioAutenticado usuario = new UsuarioAutenticado(id, correo, rol);

                // Crear autenticación con rol para Spring Security
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + rol.toUpperCase()))
                );

                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (JwtException e) {
                // Token inválido o expirado — se deja el contexto vacío.
                // Spring Security rechazará la petición si la ruta requiere autenticación.
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
