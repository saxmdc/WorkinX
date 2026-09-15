package com.workinx.backend.controller;

import com.workinx.backend.service.NotificacionesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionesController {

    private final NotificacionesService notificacionesService;

    public NotificacionesController(NotificacionesService notificacionesService) {
        this.notificacionesService = notificacionesService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerMisNotificaciones(@AuthenticationPrincipal com.workinx.backend.security.UsuarioAutenticado usuario) {
        Long usuarioId = usuario.id();
        List<Map<String, Object>> notificaciones = notificacionesService.obtenerMisNotificaciones(usuarioId);
        int noLeidas = notificacionesService.contarNoLeidas(usuarioId);

        Map<String, Object> response = new HashMap<>();
        response.put("notificaciones", notificaciones);
        response.put("noLeidas", noLeidas);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/leer")
    public ResponseEntity<Map<String, String>> marcarComoLeida(@PathVariable Long id, @AuthenticationPrincipal com.workinx.backend.security.UsuarioAutenticado usuario) {
        notificacionesService.marcarComoLeida(id, usuario.id());
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Notificación marcada como leída");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/leer-todas")
    public ResponseEntity<Map<String, String>> marcarTodasComoLeidas(@AuthenticationPrincipal com.workinx.backend.security.UsuarioAutenticado usuario) {
        notificacionesService.marcarTodasComoLeidas(usuario.id());
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Todas las notificaciones marcadas como leídas");
        return ResponseEntity.ok(response);
    }
}
