// Indica el paquete al que pertenece esta interfaz
package com.sena.jpamysql.repository;

// Importa la entidad User sobre la cual se realizarán las operaciones CRUD
import com.sena.jpamysql.entity.User;

// Importa la interfaz JpaRepository de Spring Data.
// JpaRepository extiende CrudRepository, por lo que conserva todos sus métodos CRUD.
// Además agrega soporte para paginación mediante el método findAll(Pageable pageable).
import org.springframework.data.jpa.repository.JpaRepository;

// Declara la interfaz UserRepository.
// Al extender JpaRepository, Spring genera automáticamente
// la implementación de esta interfaz durante la ejecución.
public interface UserRepository extends JpaRepository<User, Integer> {

    // No es necesario escribir ningún método para disponer
    // de las operaciones básicas sobre la entidad User.

    // Spring Data JPA implementa automáticamente métodos como:

    // save(User entity)
    // Guarda un nuevo usuario o actualiza uno existente.

    // findById(Integer id)
    // Busca un usuario por su clave primaria.

    // findAll()
    // Obtiene todos los usuarios de la base de datos.

    // deleteById(Integer id)
    // Elimina un usuario mediante su ID.

    // delete(User entity)
    // Elimina el objeto recibido.

    // existsById(Integer id)
    // Verifica si existe un usuario con ese ID.

    // count()
    // Devuelve la cantidad total de usuarios registrados.
    
    // Busca un usuario por su correo electrónico.
    Iterable<User> findByEmail(String email);

    // ── BÚSQUEDAS COMPUESTAS (NUEVAS) ─────────────────────────────────────────

    // 1. Búsqueda por 2 campos con operador AND (Y)
    // SQL equivalente: SELECT * FROM user WHERE name = ? AND cargo = ?
    Iterable<User> findByNameAndCargo(String name, String cargo);

    // 2. Búsqueda por 3 campos con operador OR (O)
    // SQL equivalente: SELECT * FROM user WHERE name = ? OR email = ? OR cargo = ?
    Iterable<User> findByNameOrEmailOrCargo(String name, String email, String cargo);
}
