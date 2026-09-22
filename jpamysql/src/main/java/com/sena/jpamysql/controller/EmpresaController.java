package com.sena.jpamysql.controller;

import com.sena.jpamysql.entity.Empresa;
import com.sena.jpamysql.repository.EmpresaRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/empresas")
@CrossOrigin(origins = "*") // Permitir consumo desde cualquier origen / React
public class EmpresaController {

    // ── RETO 3: Implementación de LOGS (INFO, WARN, ERROR) ───────────────────
    private static final Logger logger = LoggerFactory.getLogger(EmpresaController.class);

    @Autowired
    private EmpresaRepository empresaRepository;

    // ── RETO 5: Paginación con JPA Repository ───────────────────────────────
    @GetMapping("/page")
    public ResponseEntity<Page<Empresa>> listarPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        logger.info("[INFO] Solicitando página de empresas: número={}, tamaño={}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return ResponseEntity.ok(empresaRepository.findAll(pageable));
    }

    // READ: Obtener todas las empresas sin paginación (para compatibilidad)
    @GetMapping
    public List<Empresa> listarTodas() {
        logger.info("[INFO] Consultando todas las empresas registradas");
        return empresaRepository.findAll();
    }

    // ── RETO 1: Búsqueda por 2 campos con operador AND (Y) ──────────────────
    @GetMapping("/find/and")
    public ResponseEntity<List<Empresa>> buscarPorIndustriaYDireccion(
            @RequestParam String industria,
            @RequestParam String direccion) {
        logger.info("[INFO] Ejecutando búsqueda AND (industria: '{}' Y dirección: '{}')", industria, direccion);
        return ResponseEntity.ok(empresaRepository.findByIndustriaAndDireccionContaining(industria, direccion));
    }

    // ── RETO 1: Búsqueda por 3 campos con operador OR (O) ───────────────────
    @GetMapping("/find/or")
    public ResponseEntity<List<Empresa>> buscarPorNombreOIndustriaODescripcion(
            @RequestParam String nombre,
            @RequestParam String industria,
            @RequestParam String descripcion) {
        logger.info("[INFO] Ejecutando búsqueda OR (nombre: '{}' O industria: '{}' O descripción: '{}')", nombre, industria, descripcion);
        return ResponseEntity.ok(empresaRepository.findByNombreEmpresaContainingOrIndustriaContainingOrDescripcionContaining(nombre, industria, descripcion));
    }

    // READ: Obtener una empresa por ID
    @GetMapping("/{id}")
    public ResponseEntity<Empresa> obtenerPorId(@PathVariable Long id) {
        logger.info("[INFO] Buscando empresa con ID: {}", id);
        Optional<Empresa> empresa = empresaRepository.findById(id);
        if (empresa.isEmpty()) {
            logger.warn("[WARN] Búsqueda sin resultados: Empresa con ID: {} no encontrada", id);
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(empresa.get());
    }

    // CREATE: Crear una nueva empresa con @Valid (RETO 4)
    @PostMapping
    public ResponseEntity<Empresa> crearEmpresa(@Valid @RequestBody Empresa nuevaEmpresa) {
        try {
            logger.info("[INFO] Solicitud recibida para registrar nueva empresa: {}", nuevaEmpresa.getNombreEmpresa());

            // Asignar valores por defecto seguros
            if (nuevaEmpresa.getClasificacionEmpresa() == null) nuevaEmpresa.setClasificacionEmpresa("mediana_empresa");
            if (nuevaEmpresa.getTipoEntidad() == null) nuevaEmpresa.setTipoEntidad("privada");
            if (nuevaEmpresa.getAceptaTerminos() == null) nuevaEmpresa.setAceptaTerminos(1);
            if (nuevaEmpresa.getRangoEmpleados() == null || nuevaEmpresa.getRangoEmpleados().trim().isEmpty()) {
                nuevaEmpresa.setRangoEmpleados("1-10");
            }

            Empresa guardada = empresaRepository.save(nuevaEmpresa);
            logger.info("[INFO] Empresa guardada exitosamente con ID generado: {}", guardada.getId());
            return ResponseEntity.ok(guardada);
        } catch (Exception e) {
            logger.error("[ERROR] Error al crear empresa: {}", e.getMessage());
            throw e;
        }
    }

    // UPDATE: Actualizar empresa con @Valid
    @PutMapping("/{id}")
    public ResponseEntity<Empresa> actualizarEmpresa(@PathVariable Long id, @Valid @RequestBody Empresa datos) {
        logger.info("[INFO] Solicitud recibida para actualizar empresa con ID: {}", id);
        return empresaRepository.findById(id).map(existente -> {
            existente.setNombreEmpresa(datos.getNombreEmpresa());
            existente.setIndustria(datos.getIndustria());
            existente.setTelefonoContacto(datos.getTelefonoContacto());
            existente.setDireccion(datos.getDireccion());
            if (datos.getSitioWeb() != null) existente.setSitioWeb(datos.getSitioWeb());
            if (datos.getDescripcion() != null) existente.setDescripcion(datos.getDescripcion());
            if (datos.getRangoEmpleados() != null) existente.setRangoEmpleados(datos.getRangoEmpleados());

            Empresa actualizada = empresaRepository.save(existente);
            logger.info("[INFO] Empresa con ID: {} actualizada exitosamente", id);
            return ResponseEntity.ok(actualizada);
        }).orElseGet(() -> {
            logger.warn("[WARN] Intento de actualización fallido: No existe empresa con ID: {}", id);
            return ResponseEntity.notFound().build();
        });
    }

    // DELETE: Borrar una empresa
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrarEmpresa(@PathVariable Long id) {
        logger.info("[INFO] Solicitud recibida para eliminar empresa con ID: {}", id);
        if (empresaRepository.existsById(id)) {
            empresaRepository.deleteById(id);
            logger.info("[INFO] Empresa con ID: {} eliminada exitosamente", id);
            return ResponseEntity.ok().build();
        }
        logger.warn("[WARN] Intento de eliminación fallido: No existe empresa con ID: {}", id);
        return ResponseEntity.notFound().build();
    }
}
