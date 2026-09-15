package com.workinx.backend.service;

import com.workinx.backend.exception.AppException;
import com.workinx.backend.util.Formatters;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.transaction.annotation.Transactional;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Equivalente a postulaciones.service.js — misma lógica de negocio y queries SQL.
 */
@Service
@Transactional
public class PostulacionesService {

    private final JdbcTemplate jdbc;
    private final Formatters formatters;
    private final NotificacionesService notificacionesService;

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    public PostulacionesService(JdbcTemplate jdbc, Formatters formatters, NotificacionesService notificacionesService) {
        this.jdbc = jdbc;
        this.formatters = formatters;
        this.notificacionesService = notificacionesService;
    }

    // --- Helper: obtener empresa por usuarioId ---
    private Map<String, Object> obtenerEmpresaPorUsuario(Long usuarioId) {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT id FROM empresas WHERE usuario_id = ? LIMIT 1", usuarioId);
        return rows.isEmpty() ? null : rows.get(0);
    }

    // --- Helper: guardar archivo en disco (equivalente a Multer diskStorage) ---
    private Path guardarArchivo(MultipartFile file) throws IOException {
        Path carpetaCV = Paths.get(uploadsDir, "cv").toAbsolutePath();
        Files.createDirectories(carpetaCV);

        // Mismo patrón de nombre que Multer: timestamp_nombreSeguro.ext
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "cv";
        String extension = "";
        int dotIdx = originalName.lastIndexOf('.');
        if (dotIdx >= 0) extension = originalName.substring(dotIdx);
        String nombreSeguro = originalName.replace(extension, "").replaceAll("[^a-zA-Z0-9_-]", "_");
        String nombreFinal = Instant.now().toEpochMilli() + "_" + nombreSeguro + extension;

        Path destino = carpetaCV.resolve(nombreFinal);
        Files.copy(file.getInputStream(), destino);
        return destino;
    }

    // --- Helper: eliminar archivo si existe (para cleanup en errores) ---
    public void eliminarArchivo(Path path) {
        if (path != null) {
            try { Files.deleteIfExists(path); } catch (IOException ignored) {}
        }
    }

    // =====================================================================
    // CREAR POSTULACIÓN
    // =====================================================================
    public Map<String, Object> crearPostulacion(Long usuarioId, Long entrevistaId,
            String mensaje, MultipartFile file) {

        // Verificar extensión del archivo
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        String ext = originalName.toLowerCase();
        if (!ext.endsWith(".pdf") && !ext.endsWith(".doc") && !ext.endsWith(".docx")) {
            throw new AppException("El CV debe estar en formato PDF, DOC o DOCX.", HttpStatus.BAD_REQUEST);
        }

        // Verificar que la entrevista existe y está activa
        List<Map<String, Object>> entrevistas = jdbc.queryForList(
                "SELECT id FROM entrevistas WHERE id = ? AND activa = TRUE AND estado = 'publicada' LIMIT 1",
                entrevistaId);
        if (entrevistas.isEmpty()) {
            throw new AppException("La entrevista no existe o no está disponible.", HttpStatus.NOT_FOUND);
        }

        // Verificar que no se haya postulado ya
        List<Map<String, Object>> postulacionExistente = jdbc.queryForList(
                "SELECT id FROM postulaciones WHERE entrevista_id = ? AND usuario_id = ? " +
                "AND estado <> 'retirado' LIMIT 1",
                entrevistaId, usuarioId);
        if (!postulacionExistente.isEmpty()) {
            throw new AppException("Ya te postulaste a esta entrevista.", HttpStatus.CONFLICT);
        }

        // Guardar el archivo en disco
        Path cvPath;
        try {
            cvPath = guardarArchivo(file);
        } catch (IOException e) {
            throw new AppException("Error al guardar el archivo: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        String cvPathStr = cvPath.toString().replace("\\", "/");

        try {
            KeyHolder kh = new GeneratedKeyHolder();
            final String mensajeFinal = mensaje != null ? mensaje.trim() : null;
            jdbc.update(con -> {
                PreparedStatement ps = con.prepareStatement(
                        "INSERT INTO postulaciones (entrevista_id, usuario_id, mensaje, cv_path, estado) " +
                        "VALUES (?, ?, ?, ?, 'pendiente')",
                        Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, entrevistaId);
                ps.setLong(2, usuarioId);
                if (mensajeFinal != null) ps.setString(3, mensajeFinal);
                else ps.setNull(3, java.sql.Types.VARCHAR);
                ps.setString(4, cvPathStr);
                return ps;
            }, kh);

            long postulacionId = kh.getKey().longValue();

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
                    "Nueva postulación",
                    "Alguien se ha postulado a tu entrevista: " + tituloEntrevista,
                    "postulacion"
                );
            }

            return Map.of(
                    "id", postulacionId,
                    "entrevista_id", entrevistaId,
                    "usuario_id", usuarioId,
                    "mensaje", mensajeFinal != null ? mensajeFinal : "",
                    "cv_path", cvPathStr,
                    "cv_nombre", file.getOriginalFilename(),
                    "cv_url", formatters.generarCvUrl(cvPathStr),
                    "estado", "pendiente",
                    "fecha_postulacion", Instant.now().toString()
            );
        } catch (Exception e) {
            eliminarArchivo(cvPath);
            throw e;
        }
    }

    // =====================================================================
    // MIS POSTULACIONES (candidato)
    // =====================================================================
    public List<Map<String, Object>> listarMisPostulaciones(Long usuarioId) {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT p.id, p.entrevista_id, p.usuario_id, p.mensaje, p.cv_path, " +
                "p.estado, p.fecha_postulacion, " +
                "e.titulo AS entrevista_titulo, e.tipo, e.modalidad, e.ubicacion, " +
                "e.salario_a_convenir, e.salario_min, e.salario_max, " +
                "emp.nombre_empresa AS empresa " +
                "FROM postulaciones p " +
                "INNER JOIN entrevistas e ON e.id = p.entrevista_id " +
                "INNER JOIN empresas emp ON emp.id = e.empresa_id " +
                "WHERE p.usuario_id = ? AND p.estado <> 'retirado' " +
                "ORDER BY p.fecha_postulacion DESC", usuarioId);

        return rows.stream().map(p -> {
            String cvPath = (String) p.get("cv_path");
            String cvNombre = cvPath != null ? new File(cvPath).getName() : null;
            String salarioTexto = formatters.esVerdadero(p.get("salario_a_convenir"))
                    ? "Salario a convenir"
                    : formatters.crearSalarioTexto(p);

            return Map.ofEntries(
                    Map.entry("id", p.get("id")),
                    Map.entry("entrevista_id", p.get("entrevista_id")),
                    Map.entry("usuario_id", p.get("usuario_id")),
                    Map.entry("mensaje", p.getOrDefault("mensaje", "")),
                    Map.entry("cv_path", cvPath != null ? cvPath : ""),
                    Map.entry("cv_nombre", cvNombre != null ? cvNombre : ""),
                    Map.entry("cv_url", cvPath != null ? formatters.generarCvUrl(cvPath) : ""),
                    Map.entry("estado", p.get("estado")),
                    Map.entry("fecha_postulacion", formatters.formatearFecha(p.get("fecha_postulacion"))),
                    Map.entry("entrevista_titulo", p.getOrDefault("entrevista_titulo", "")),
                    Map.entry("empresa", p.getOrDefault("empresa", "")),
                    Map.entry("tipo", p.getOrDefault("tipo", "")),
                    Map.entry("modalidad", p.getOrDefault("modalidad", "")),
                    Map.entry("ubicacion", p.getOrDefault("ubicacion", "")),
                    Map.entry("salarioTexto", salarioTexto)
            );
        }).toList();
    }

    // =====================================================================
    // POSTULACIONES POR ENTREVISTA (empresa ve sus candidatos)
    // =====================================================================
    public Map<String, Object> listarPostulacionesPorEntrevista(Long usuarioEmpresaId, Long entrevistaId) {
        Map<String, Object> empresa = obtenerEmpresaPorUsuario(usuarioEmpresaId);
        if (empresa == null) {
            throw new AppException("No se encontró el perfil de empresa.", HttpStatus.NOT_FOUND);
        }

        Long empresaId = ((Number) empresa.get("id")).longValue();

        List<Map<String, Object>> entrevistaRows = jdbc.queryForList(
                "SELECT id, titulo FROM entrevistas WHERE id = ? AND empresa_id = ? " +
                "AND estado <> 'eliminada' LIMIT 1",
                entrevistaId, empresaId);
        if (entrevistaRows.isEmpty()) {
            throw new AppException(
                    "La entrevista no existe o no pertenece a esta empresa.", HttpStatus.NOT_FOUND);
        }

        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT p.id, p.entrevista_id, p.usuario_id, p.mensaje, p.cv_path, " +
                "p.estado, p.fecha_postulacion, " +
                "u.nombre_completo, u.correo, u.telefono, " +
                "pc.tipo_documento, pc.documento, pc.ciudad_residencia, pc.categoria_edad " +
                "FROM postulaciones p " +
                "INNER JOIN usuarios u ON u.id = p.usuario_id " +
                "INNER JOIN perfiles_candidatos pc ON pc.usuario_id = u.id " +
                "WHERE p.entrevista_id = ? AND p.estado <> 'retirado' " +
                "ORDER BY p.fecha_postulacion DESC", entrevistaId);

        List<Map<String, Object>> postulantes = rows.stream().map(p -> {
            String cvPath = (String) p.get("cv_path");
            String cvNombre = cvPath != null ? new File(cvPath).getName() : null;

            return Map.ofEntries(
                    Map.entry("id", p.get("id")),
                    Map.entry("entrevista_id", p.get("entrevista_id")),
                    Map.entry("usuario_id", p.get("usuario_id")),
                    Map.entry("nombre_completo", p.getOrDefault("nombre_completo", "")),
                    Map.entry("correo", p.getOrDefault("correo", "")),
                    Map.entry("telefono", p.getOrDefault("telefono", "")),
                    Map.entry("tipo_documento", p.getOrDefault("tipo_documento", "")),
                    Map.entry("documento", p.getOrDefault("documento", "")),
                    Map.entry("ciudad_residencia", p.getOrDefault("ciudad_residencia", "")),
                    Map.entry("categoria_edad", p.getOrDefault("categoria_edad", "")),
                    Map.entry("mensaje", p.getOrDefault("mensaje", "")),
                    Map.entry("estado", p.get("estado")),
                    Map.entry("fecha_postulacion", formatters.formatearFecha(p.get("fecha_postulacion"))),
                    Map.entry("cv_path", cvPath != null ? cvPath : ""),
                    Map.entry("cv_nombre", cvNombre != null ? cvNombre : ""),
                    Map.entry("cv_url", cvPath != null ? formatters.generarCvUrl(cvPath) : "")
            );
        }).toList();

        return Map.of("entrevista", entrevistaRows.get(0), "postulantes", postulantes);
    }

    // =====================================================================
    // ACTUALIZAR ESTADO DE POSTULACIÓN (empresa)
    // =====================================================================
    public Map<String, Object> actualizarEstadoPostulacion(Long usuarioEmpresaId,
            Long postulacionId, String estado) {
        Map<String, Object> empresa = obtenerEmpresaPorUsuario(usuarioEmpresaId);
        if (empresa == null) {
            throw new AppException("No se encontró el perfil de empresa.", HttpStatus.NOT_FOUND);
        }

        Long empresaId = ((Number) empresa.get("id")).longValue();

        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT p.id, p.estado, p.entrevista_id FROM postulaciones p " +
                "INNER JOIN entrevistas e ON e.id = p.entrevista_id " +
                "WHERE p.id = ? AND e.empresa_id = ? AND p.estado <> 'retirado' LIMIT 1",
                postulacionId, empresaId);
        if (rows.isEmpty()) {
            throw new AppException(
                    "La postulación no existe o no pertenece a una entrevista de esta empresa.",
                    HttpStatus.NOT_FOUND);
        }

        jdbc.update("UPDATE postulaciones SET estado = ? WHERE id = ?", estado, postulacionId);

        // Notificar al candidato
        List<Map<String, Object>> postulacionDatos = jdbc.queryForList(
            "SELECT p.usuario_id, en.titulo, e.nombre_empresa FROM postulaciones p JOIN entrevistas en ON p.entrevista_id = en.id JOIN empresas e ON en.empresa_id = e.id WHERE p.id = ? LIMIT 1",
            postulacionId
        );
        if (!postulacionDatos.isEmpty()) {
            Long candidatoId = ((Number) postulacionDatos.get(0).get("usuario_id")).longValue();
            String tituloEntrevista = (String) postulacionDatos.get(0).get("titulo");
            String nombreEmpresa = (String) postulacionDatos.get(0).get("nombre_empresa");
            notificacionesService.crearNotificacion(
                candidatoId,
                "Actualización de postulación",
                "Tu postulación para '" + tituloEntrevista + "' en " + nombreEmpresa + " ha cambiado de estado a: " + estado.toUpperCase(),
                "estado_postulacion"
            );
        }

        return Map.of("id", postulacionId, "estado", estado);
    }
}
