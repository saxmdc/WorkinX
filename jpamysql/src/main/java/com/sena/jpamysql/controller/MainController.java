// Indica el paquete al que pertenece esta clase
package com.sena.jpamysql.controller;

// Importa la entidad User, que representa la tabla de usuarios en la base de datos
import com.sena.jpamysql.entity.User;

// Importa el repositorio que permitirá realizar operaciones CRUD sobre la entidad User
import com.sena.jpamysql.repository.UserRepository;

// Permite que Spring inyecte automáticamente dependencias
import org.springframework.beans.factory.annotation.Autowired;

// Marca esta clase como un controlador de Spring MVC
import org.springframework.stereotype.Controller;

// Anotaciones para manejar solicitudes HTTP
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.util.Optional;

// Permite definir una ruta base para todos los métodos del controlador
import org.springframework.web.bind.annotation.RequestMapping;

// Obtiene parámetros enviados desde la URL o desde un formulario
import org.springframework.web.bind.annotation.RequestParam;

// Indica que el valor retornado será enviado directamente al cliente
// en lugar de buscar una vista HTML
import org.springframework.web.bind.annotation.ResponseBody;

// ── Imports para paginación (NUEVO) ─────────────────────────────────────────
// PageRequest: construye un Pageable indicando página, tamaño y orden
// Pageable:    interfaz que JPA usa para hacer SELECT con LIMIT y OFFSET
// Page:        objeto de resultado que contiene los datos + metadatos de paginación
// Sort:        permite definir el criterio de ordenamiento
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;

// Convierte esta clase en un controlador administrado por Spring
// ── Imports para LOGS (RETO 3) ──────────────────────────────────────────────
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller

// Todas las rutas de este controlador comenzarán con "/demo"
@RequestMapping(path="/demo")
public class MainController {

    // Instancia del logger para el controlador (RETO 3)
    private static final Logger logger = LoggerFactory.getLogger(MainController.class);

    // Inyección automática del repositorio UserRepository.
    // Spring crea el objeto automáticamente y lo asigna a esta variable.
    @Autowired
    private UserRepository userRepository;

    // Atiende únicamente solicitudes HTTP POST.
    // La ruta completa será: /demo/add
    @PostMapping(path="/add")

    // @ResponseBody hace que el String retornado se envíe directamente
    // como respuesta HTTP y no como el nombre de una vista.
    public @ResponseBody String addNewUser(

            // Obtiene el parámetro "name" enviado desde el formulario o URL
            @RequestParam String name,

            // Obtiene el parámetro "email"
            @RequestParam String email,
            
            // Nuevos parámetros añadidos
            @RequestParam String direccion,
            @RequestParam String celular,
            @RequestParam String cargo) {

        // Registra el inicio de la operación con nivel INFO (Reto 3)
        logger.info("[INFO] Solicitud recibida para registrar nuevo usuario: {}", email);

        // Crea un nuevo objeto de tipo User
        User n = new User();

        // Asigna el nombre recibido al objeto
        n.setName(name);

        // Asigna el correo recibido al objeto
        n.setEmail(email);

        n.setDireccion(direccion);
        n.setCelular(celular);
        n.setCargo(cargo);

        // Guarda el objeto en la base de datos.
        // Si el usuario no existe, realiza un INSERT.
        // Si ya existe (mismo ID), realiza un UPDATE.
        userRepository.save(n);

        logger.info("[INFO] Usuario guardado exitosamente con ID generado: {}", n.getId());

        // Devuelve un mensaje simple indicando que el registro fue exitoso
        return "Saved";
    }

    // Atiende solicitudes HTTP GET.
    // La ruta completa será: /demo/all
    @GetMapping(path="/all")

    // Devuelve directamente el resultado como JSON o XML
    public @ResponseBody Iterable<User> getAllUsers() {
        logger.info("[INFO] Consultando todos los usuarios de la base de datos");
        return userRepository.findAll();
    }

    // Actualizar un usuario existente
    @PutMapping(path="/update")
    public @ResponseBody String updateUser(
            @RequestParam Integer id,
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String direccion,
            @RequestParam String celular,
            @RequestParam String cargo) {
        
        logger.info("[INFO] Solicitud recibida para actualizar usuario con ID: {}", id);
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setName(name);
            user.setEmail(email);
            user.setDireccion(direccion);
            user.setCelular(celular);
            user.setCargo(cargo);
            userRepository.save(user);

            logger.info("[INFO] Usuario con ID: {} actualizado exitosamente", id);
            return "Updated";
        }

        // Registro de nivel WARN cuando el usuario a actualizar no existe (Reto 3)
        logger.warn("[WARN] Intento de actualización fallido: No existe usuario con ID: {}", id);
        return "User not found";
    }

    // Eliminar un usuario
    @DeleteMapping(path="/delete")
    public @ResponseBody String deleteUser(@RequestParam Integer id) {
        logger.info("[INFO] Solicitud recibida para eliminar usuario con ID: {}", id);
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            logger.info("[INFO] Usuario con ID: {} eliminado exitosamente", id);
            return "Deleted";
        }

        // Registro de nivel WARN cuando el usuario a eliminar no existe (Reto 3)
        logger.warn("[WARN] Intento de eliminación fallido: No existe usuario con ID: {}", id);
        return "User not found";
    }

    // Buscar por id
    @GetMapping(path="/find/id")
    public @ResponseBody Optional<User> getUserById(@RequestParam Integer id) {
        logger.info("[INFO] Buscando usuario con ID: {}", id);
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            logger.warn("[WARN] Búsqueda sin resultados: Usuario con ID: {} no encontrado", id);
        }
        return user;
    }

    // Buscar por email
    @GetMapping(path="/find/email")
    public @ResponseBody Iterable<User> getUserByEmail(@RequestParam String email) {
        logger.info("[INFO] Buscando usuario(s) con email: {}", email);
        return userRepository.findByEmail(email);
    }

    // ── PAGINACIÓN (NUEVO) ────────────────────────────────────────────────────
    @GetMapping(path="/page")
    public @ResponseBody Page<User> getUsersPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        logger.info("[INFO] Petición de página de usuarios: número de página={}, tamaño={}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return userRepository.findAll(pageable);
    }

    // ── BÚSQUEDA POR 2 CAMPOS CON OPERADOR AND (Y) (NUEVO) ───────────────────
    @GetMapping(path="/find/name-and-cargo")
    public @ResponseBody Iterable<User> findByNameAndCargo(
            @RequestParam String name,
            @RequestParam String cargo) {
        logger.info("[INFO] Ejecutando búsqueda AND (nombre: '{}' Y cargo: '{}')", name, cargo);
        return userRepository.findByNameAndCargo(name, cargo);
    }

    // ── BÚSQUEDA POR 3 CAMPOS CON OPERADOR OR (O) (NUEVO) ────────────────────
    @GetMapping(path="/find/name-or-email-or-cargo")
    public @ResponseBody Iterable<User> findByNameOrEmailOrCargo(
            @RequestParam(required = false, defaultValue = "") String name,
            @RequestParam(required = false, defaultValue = "") String email,
            @RequestParam(required = false, defaultValue = "") String cargo) {
        logger.info("[INFO] Ejecutando búsqueda OR (nombre: '{}' O email: '{}' O cargo: '{}')", name, email, cargo);
        return userRepository.findByNameOrEmailOrCargo(name, email, cargo);
    }

}
