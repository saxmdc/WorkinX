package com.workinx.backend.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class NotificacionesService {

    private final JdbcTemplate jdbc;

    public NotificacionesService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void crearNotificacion(Long usuarioId, String titulo, String mensaje, String tipo) {
        jdbc.update(
            "INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES (?, ?, ?, ?)",
            usuarioId, titulo, mensaje, tipo
        );
    }

    public List<Map<String, Object>> obtenerMisNotificaciones(Long usuarioId) {
        return jdbc.queryForList(
            "SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY fecha_creacion DESC LIMIT 50",
            usuarioId
        );
    }

    public int contarNoLeidas(Long usuarioId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM notificaciones WHERE usuario_id = ? AND leida = FALSE",
            Integer.class,
            usuarioId
        );
        return count != null ? count : 0;
    }

    public void marcarComoLeida(Long notificacionId, Long usuarioId) {
        jdbc.update(
            "UPDATE notificaciones SET leida = TRUE WHERE id = ? AND usuario_id = ?",
            notificacionId, usuarioId
        );
    }

    public void marcarTodasComoLeidas(Long usuarioId) {
        jdbc.update(
            "UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ? AND leida = FALSE",
            usuarioId
        );
    }
}
