package com.sena.jpamysql.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

/**
 * Entidad Empresa que mapea la tabla 'empresas' de la base de datos 'workinx'.
 * Incluye 5 validaciones con anotaciones de Jakarta Validation (RETO 4).
 */
@Entity
@Table(name = "empresas")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id")
    private Long usuarioId;

    // Validación 1 y 2
    @NotBlank(message = "El nombre de la empresa es obligatorio")
    @Size(min = 2, max = 150, message = "El nombre debe tener entre 2 y 150 caracteres")
    @Column(name = "nombre_empresa")
    private String nombreEmpresa;

    private String nit;
    private String descripcion;
    
    // Validación 3 y 4
    @NotBlank(message = "La industria es obligatoria")
    @Size(max = 100, message = "La industria no puede superar 100 caracteres")
    private String industria;
    
    @Column(name = "sitio_web")
    private String sitioWeb;
    
    // Validación 5
    @Pattern(regexp = "^[0-9+ -]*$", message = "El teléfono solo debe contener números, espacios o guiones")
    @Column(name = "telefono_contacto")
    private String telefonoContacto;
    
    private String direccion;
    
    @Column(name = "rango_empleados")
    private String rangoEmpleados = "1-10";

    @Column(name = "clasificacion_empresa")
    private String clasificacionEmpresa = "mediana_empresa";

    @Column(name = "tipo_entidad")
    private String tipoEntidad = "privada";

    @Column(name = "acepta_terminos")
    private Integer aceptaTerminos = 1;

    public Empresa() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getNombreEmpresa() { return nombreEmpresa; }
    public void setNombreEmpresa(String nombreEmpresa) { this.nombreEmpresa = nombreEmpresa; }

    public String getNit() { return nit; }
    public void setNit(String nit) { this.nit = nit; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getIndustria() { return industria; }
    public void setIndustria(String industria) { this.industria = industria; }

    public String getSitioWeb() { return sitioWeb; }
    public void setSitioWeb(String sitioWeb) { this.sitioWeb = sitioWeb; }

    public String getTelefonoContacto() { return telefonoContacto; }
    public void setTelefonoContacto(String telefonoContacto) { this.telefonoContacto = telefonoContacto; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getRangoEmpleados() { return rangoEmpleados; }
    public void setRangoEmpleados(String rangoEmpleados) { this.rangoEmpleados = rangoEmpleados; }

    public String getClasificacionEmpresa() { return clasificacionEmpresa; }
    public void setClasificacionEmpresa(String clasificacionEmpresa) { this.clasificacionEmpresa = clasificacionEmpresa; }

    public String getTipoEntidad() { return tipoEntidad; }
    public void setTipoEntidad(String tipoEntidad) { this.tipoEntidad = tipoEntidad; }

    public Integer getAceptaTerminos() { return aceptaTerminos; }
    public void setAceptaTerminos(Integer aceptaTerminos) { this.aceptaTerminos = aceptaTerminos; }
}
