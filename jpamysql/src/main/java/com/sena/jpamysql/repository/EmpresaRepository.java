package com.sena.jpamysql.repository;

import com.sena.jpamysql.entity.Empresa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {

    // ── RETO 1: Búsqueda por 2 campos con operador AND (Y) ──────────────────
    // SQL: SELECT * FROM empresas WHERE industria = ? AND direccion LIKE ?
    List<Empresa> findByIndustriaAndDireccionContaining(String industria, String direccion);

    // ── RETO 1: Búsqueda por 3 campos con operador OR (O) ───────────────────
    // SQL: SELECT * FROM empresas WHERE nombre_empresa LIKE ? OR industria LIKE ? OR descripcion LIKE ?
    List<Empresa> findByNombreEmpresaContainingOrIndustriaContainingOrDescripcionContaining(
            String nombre, String industria, String descripcion
    );

    // ── RETO 5: Paginación con Spring Data JPA ──────────────────────────────
    Page<Empresa> findAll(Pageable pageable);
}
