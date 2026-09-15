// Indica el paquete donde se encuentra la clase
package com.sena.jpamysql.entity;

// Importa la anotación @Nullable para indicar que un atributo puede contener un valor nulo
import org.jspecify.annotations.Nullable;

// Importaciones de JPA (Jakarta Persistence)
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

// Indica que esta clase es una entidad JPA.
// Hibernate la convertirá automáticamente en una tabla de la base de datos.
@Entity
public class User {

    // Indica que este atributo será la clave primaria (Primary Key) de la tabla.
    @Id

    // Especifica que el valor del ID será generado automáticamente.
    // GenerationType.AUTO permite que Hibernate elija la mejor estrategia
    // según la base de datos utilizada.
    @GeneratedValue(strategy = GenerationType.AUTO)

    // El identificador puede ser nulo antes de guardar el objeto en la base de datos.
    // Una vez guardado, Hibernate asignará un valor automáticamente.
    private @Nullable Integer id;

    // Campo que almacenará el nombre del usuario.
    // Se convertirá en una columna llamada "name".
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Column(nullable = false, length = 100)
    private String name;

    // Campo que almacenará el correo electrónico del usuario.
    // Se convertirá en una columna llamada "email".
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Debe proporcionar un correo electrónico válido")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // Campo que almacenará la dirección del usuario.
    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 200, message = "La dirección no puede superar los 200 caracteres")
    @Column(nullable = false, length = 200)
    private String direccion;

    // Campo que almacenará el celular del usuario.
    @NotBlank(message = "El celular es obligatorio")
    @Pattern(regexp = "^\\+?[0-9]*$", message = "El celular solo debe contener números (opcionalmente un + al inicio)")
    @Size(min = 7, max = 15, message = "El número de celular debe tener entre 7 y 15 caracteres")
    @Column(nullable = false, length = 15)
    private String celular;

    // Campo que almacenará el cargo del usuario.
    @NotBlank(message = "El cargo es obligatorio")
    @Size(max = 50, message = "El cargo no puede superar los 50 caracteres")
    @Column(nullable = false, length = 50)
    private String cargo;

    // ==========================
    // MÉTODOS GETTERS Y SETTERS
    // ==========================

    // Devuelve el valor del ID
    public Integer getId() {
        return id;
    }

    // Modifica el valor del ID.
    // Normalmente no se utiliza porque Hibernate lo genera automáticamente.
    public void setId(Integer id) {
        this.id = id;
    }

    // Devuelve el nombre del usuario
    public String getName() {
        return name;
    }

    // Asigna un nuevo nombre al usuario
    public void setName(String name) {
        this.name = name;
    }

    // Devuelve el correo electrónico del usuario
    public String getEmail() {
        return email;
    }

    // Asigna un nuevo correo electrónico al usuario
    public void setEmail(String email) {
        this.email = email;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getCelular() {
        return celular;
    }

    public void setCelular(String celular) {
        this.celular = celular;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }
}