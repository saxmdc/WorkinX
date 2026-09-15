package com.workinx.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * GET /           — Raíz del servidor
 * GET /api/health — Estado del servidor y la base de datos
 * GET /api/test   — Equivalente a la ruta de test del original
 */
@RestController
public class HealthController {

    private final JdbcTemplate jdbc;

    public HealthController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Ruta raíz — equivalente al app.get("/") del original */
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "mensaje", "Backend de WorkInX (Spring Boot) funcionando correctamente",
                "version", "1.0.0",
                "status", "ok"
        ));
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "ok");
        response.put("mensaje", "Backend de WorkInX (Spring Boot) funcionando correctamente");
        response.put("version", "1.0.0");

        try {
            jdbc.queryForObject("SELECT 1", Integer.class);
            response.put("database", "connected");
        } catch (Exception e) {
            response.put("database", "error: " + e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/test")
    public ResponseEntity<Map<String, Object>> test() {
        return ResponseEntity.ok(Map.of(
                "mensaje", "Ruta de prueba funcionando",
                "status", "ok"
        ));
    }
}
