package com.sena.jpamysql.controller;

import com.sena.jpamysql.entity.Empresa;
import com.sena.jpamysql.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/empresas")
@CrossOrigin(origins = "http://localhost:5173")
public class EmpresaController {

    @Autowired
    private EmpresaRepository empresaRepository;

    @GetMapping
    public List<Empresa> listarTodas() {
        return empresaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Empresa> obtenerPorId(@PathVariable Long id) {
        Optional<Empresa> empresa = empresaRepository.findById(id);
        return empresa.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Empresa> actualizarEmpresa(@PathVariable Long id, @RequestBody Empresa datosActualizados) {
        return empresaRepository.findById(id).map(empresaExistente -> {
            if (datosActualizados.getNombreEmpresa() != null) empresaExistente.setNombreEmpresa(datosActualizados.getNombreEmpresa());
            if (datosActualizados.getDescripcion() != null) empresaExistente.setDescripcion(datosActualizados.getDescripcion());
            if (datosActualizados.getIndustria() != null) empresaExistente.setIndustria(datosActualizados.getIndustria());
            if (datosActualizados.getSitioWeb() != null) empresaExistente.setSitioWeb(datosActualizados.getSitioWeb());
            if (datosActualizados.getTelefonoContacto() != null) empresaExistente.setTelefonoContacto(datosActualizados.getTelefonoContacto());
            if (datosActualizados.getDireccion() != null) empresaExistente.setDireccion(datosActualizados.getDireccion());
            
            Empresa actualizada = empresaRepository.save(empresaExistente);
            return ResponseEntity.ok(actualizada);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // CREATE: Crear una nueva empresa (C del CRUD)
    @PostMapping
    public ResponseEntity<Empresa> crearEmpresa(@RequestBody Empresa nuevaEmpresa) {
        Empresa guardada = empresaRepository.save(nuevaEmpresa);
        return ResponseEntity.ok(guardada);
    }

    // DELETE: Borrar una empresa (D del CRUD)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrarEmpresa(@PathVariable Long id) {
        if (empresaRepository.existsById(id)) {
            empresaRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
