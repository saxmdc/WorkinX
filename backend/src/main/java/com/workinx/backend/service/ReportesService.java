package com.workinx.backend.service;

import com.workinx.backend.exception.AppException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;

/**
 * Equivalente a reportes.service.js — mismas queries SQL.
 */
@Service
@Transactional
public class ReportesService {

    private final JdbcTemplate jdbc;
    private final NotificacionesService notificacionesService;

    public ReportesService(JdbcTemplate jdbc, NotificacionesService notificacionesService) {
        this.jdbc = jdbc;
        this.notificacionesService = notificacionesService;
    }

    public Map<String, Object> crearReporte(Long usuarioId, Long entrevistaId,
            String tipoReporte, String descripcion, String evidencia) {

        // Verificar que la entrevista existe y está activa
        List<Map<String, Object>> entrevistas = jdbc.queryForList(
                "SELECT id FROM entrevistas WHERE id = ? AND activa = TRUE AND estado = 'publicada' LIMIT 1",
                entrevistaId);
        if (entrevistas.isEmpty()) {
            throw new AppException(
                    "La entrevista no existe o no está disponible para reportar.", HttpStatus.NOT_FOUND);
        }

        // Verificar que no tenga ya un reporte activo para esa entrevista
        List<Map<String, Object>> reporteExistente = jdbc.queryForList(
                "SELECT id FROM reportes_entrevistas " +
                "WHERE entrevista_id = ? AND usuario_id = ? " +
                "AND estado IN ('pendiente', 'en_revision') LIMIT 1",
                entrevistaId, usuarioId);
        if (!reporteExistente.isEmpty()) {
            throw new AppException(
                    "Ya tienes un reporte activo para esta entrevista.", HttpStatus.CONFLICT);
        }

        KeyHolder kh = new GeneratedKeyHolder();
        final String evidenciaFinal = evidencia != null ? evidencia.trim() : null;
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO reportes_entrevistas " +
                    "(entrevista_id, usuario_id, tipo_reporte, descripcion, evidencia, estado) " +
                    "VALUES (?, ?, ?, ?, ?, 'pendiente')",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, entrevistaId);
            ps.setLong(2, usuarioId);
            ps.setString(3, tipoReporte);
            ps.setString(4, descripcion.trim());
            if (evidenciaFinal != null) ps.setString(5, evidenciaFinal);
            else ps.setNull(5, java.sql.Types.VARCHAR);
            return ps;
        }, kh);

        long reporteId = kh.getKey().longValue();

        // LOGICA DE UMBRAL (Threshold)
        Integer cantidadReportes = jdbc.queryForObject(
            "SELECT COUNT(*) FROM reportes_entrevistas WHERE entrevista_id = ?",
            Integer.class,
            entrevistaId
        );

        if (cantidadReportes != null && cantidadReportes >= 3) {
            jdbc.update("UPDATE entrevistas SET activa = FALSE, estado = 'pausada' WHERE id = ?", entrevistaId);
            
            // Notificar a la empresa
            List<Map<String, Object>> empresaDatos = jdbc.queryForList(
                "SELECT e.usuario_id, en.titulo FROM entrevistas en JOIN empresas e ON en.empresa_id = e.id WHERE en.id = ? LIMIT 1",
                entrevistaId
            );
            if (!empresaDatos.isEmpty()) {
                Long empresaUsuarioId = ((Number) empresaDatos.get(0).get("usuario_id")).longValue();
                String tituloEntrevista = (String) empresaDatos.get(0).get("titulo");
                notificacionesService.crearNotificacion(
                    empresaUsuarioId,
                    "Entrevista suspendida",
                    "Tu vacante '" + tituloEntrevista + "' ha sido dada de baja automáticamente tras recibir múltiples reportes de la comunidad.",
                    "alerta_seguridad"
                );
            }
        }

        return Map.of(
                "id", reporteId,
                "entrevista_id", entrevistaId,
                "tipo_reporte", tipoReporte,
                "estado", "pendiente"
        );
    }
}
