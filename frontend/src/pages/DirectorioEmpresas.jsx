import { useState, useEffect } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Globe,
  MapPin,
  Phone,
  Search,
  Users,
  ExternalLink,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";

function DirectorioEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  // Estado para el modal de agregar empresa
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formEmpresa, setFormEmpresa] = useState({
    nombreEmpresa: "",
    industria: "",
    telefonoContacto: "",
    direccion: "",
    sitioWeb: "",
    descripcion: "",
    rangoEmpleados: "1-10"
  });

  const API_URL = "http://localhost:8080/api/empresas";

  // Cargar empresas desde el Microservicio JPA vía CORS (RETO)
  const cargarEmpresas = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("No se pudo conectar con el microservicio JPA (Puerto 8080)");
      const data = await res.json();
      // data puede ser un array o un Page de Spring
      const lista = Array.isArray(data) ? data : (data.content || []);
      setEmpresas(lista);
    } catch (err) {
      console.error("Error al consumir JPA:", err);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  // Crear empresa vía POST con CORS
  const handleCrearEmpresa = async (e) => {
    e.preventDefault();
    if (!formEmpresa.nombreEmpresa.trim() || !formEmpresa.industria.trim()) {
      alert("Nombre de empresa e industria son requeridos");
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEmpresa)
      });
      if (!res.ok) throw new Error("Error al guardar la empresa en el microservicio JPA");
      
      setMensajeExito("¡Empresa registrada exitosamente en JPA!");
      setTimeout(() => setMensajeExito(null), 4000);
      setMostrarModal(false);
      setFormEmpresa({
        nombreEmpresa: "",
        industria: "",
        telefonoContacto: "",
        direccion: "",
        sitioWeb: "",
        descripcion: "",
        rangoEmpleados: "1-10"
      });
      cargarEmpresas();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Eliminar empresa vía DELETE con CORS
  const handleEliminarEmpresa = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a "${nombre}" mediante el microservicio JPA?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar la empresa");
      setMensajeExito(`Empresa "${nombre}" eliminada exitosamente.`);
      setTimeout(() => setMensajeExito(null), 4000);
      cargarEmpresas();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  // Filtro en tiempo real
  const empresasFiltradas = empresas.filter((emp) => {
    const texto = busqueda.toLowerCase();
    const nombre = (emp.nombreEmpresa || "").toLowerCase();
    const industria = (emp.industria || "").toLowerCase();
    const direccion = (emp.direccion || "").toLowerCase();
    return nombre.includes(texto) || industria.includes(texto) || direccion.includes(texto);
  });

  return (
    <section className="interviews-page">
      {/* Encabezado con estilo oficial WorkInX */}
      <div className="interviews-header">
        <p className="section-tag">Microservicio JPA</p>
        <h1>Directorio de Empresas aliadas en WorkInX.</h1>
        <p>
          Explora y gestiona las empresas registradas en la base de datos a través de nuestro 
          microservicio independiente Spring Boot JPA consumido vía <strong>CORS</strong>.
        </p>
      </div>

      {/* Notificación de éxito */}
      {mensajeExito && (
        <div style={{
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          color: "#065f46",
          padding: "16px 20px",
          borderRadius: "16px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontWeight: "700"
        }}>
          <CheckCircle2 size={22} color="#10b981" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Barra de Resumen, Búsqueda y Acciones */}
      <div className="results-summary">
        <div>
          <h2>Empresas disponibles ({empresasFiltradas.length})</h2>
          <p>Datos sincronizados en tiempo real con MySQL</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Caja de Búsqueda nativa de WorkInX */}
          <div className="search-box" style={{ width: "280px" }}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar empresa o industria..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Botón Nueva Empresa (CORS POST) */}
          <button
            type="button"
            className="details-button"
            onClick={() => setMostrarModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Plus size={18} />
            Nueva Empresa
          </button>

          {/* Acceso externo al Dashboard HTML */}
          <a
            href="http://localhost:8080/empresas.html"
            target="_blank"
            rel="noopener noreferrer"
            className="report-button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              color: "#334155"
            }}
          >
            <ExternalLink size={18} />
            Panel JPA (8080)
          </a>
        </div>
      </div>

      {/* Estados de carga o error */}
      {cargando && (
        <div className="empty-results">
          <h3>Consultando microservicio JPA...</h3>
          <p>Conectando con http://localhost:8080/api/empresas vía CORS...</p>
        </div>
      )}

      {error && (
        <div className="empty-results" style={{ borderColor: "#fecaca" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#dc2626", marginBottom: "8px" }}>
            <AlertCircle size={24} />
            <h3 style={{ color: "#dc2626", margin: 0 }}>Error de conexión con el Servidor JPA</h3>
          </div>
          <p>{error}</p>
          <button
            type="button"
            className="details-button"
            onClick={cargarEmpresas}
            style={{ marginTop: "14px" }}
          >
            Reintentar conexión
          </button>
        </div>
      )}

      {/* Lista de Empresas con tarjetas nativas de WorkInX */}
      {!cargando && !error && (
        <div className="interviews-list">
          {empresasFiltradas.length === 0 ? (
            <div className="empty-results">
              <h3>No se encontraron empresas</h3>
              <p>No hay registros que coincidan con "{busqueda}". Puedes crear una nueva usando el botón superior.</p>
            </div>
          ) : (
            empresasFiltradas.map((emp) => (
              <div key={emp.id} className="interview-card">
                <div className="interview-main">
                  <div className="interview-company">
                    <Building2 size={20} />
                    <span>{emp.nombreEmpresa || "Empresa Sin Nombre"}</span>
                  </div>

                  <h3>{emp.industria || "Sector no especificado"}</h3>

                  <p className="interview-description">
                    {emp.descripcion || "Esta empresa aliada forma parte de la red de WorkInX conectada mediante el microservicio JPA."}
                  </p>

                  <div className="interview-tags" style={{ marginTop: "16px" }}>
                    {emp.direccion && (
                      <span>
                        <MapPin size={16} /> {emp.direccion}
                      </span>
                    )}
                    {emp.telefonoContacto && (
                      <span>
                        <Phone size={16} /> {emp.telefonoContacto}
                      </span>
                    )}
                    {emp.rangoEmpleados && (
                      <span>
                        <Users size={16} /> {emp.rangoEmpleados} empleados
                      </span>
                    )}
                  </div>
                </div>

                <div className="interview-actions">
                  {emp.sitioWeb && (
                    <a
                      href={emp.sitioWeb.startsWith("http") ? emp.sitioWeb : `https://${emp.sitioWeb}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="details-button"
                      style={{ textDecoration: "none" }}
                    >
                      <Globe size={18} />
                      Sitio Web
                    </a>
                  )}

                  {/* Botón eliminar vía JPA */}
                  <button
                    type="button"
                    className="report-button"
                    onClick={() => handleEliminarEmpresa(emp.id, emp.nombreEmpresa)}
                    title="Eliminar del microservicio JPA"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal flotante para Crear Empresa (con estilos nativos de modal WorkInX) */}
      {mostrarModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(16, 24, 40, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "26px",
            padding: "36px",
            width: "100%",
            maxWidth: "550px",
            boxShadow: "0 24px 70px rgba(20, 35, 70, 0.25)",
            position: "relative"
          }}>
            <button
              onClick={() => setMostrarModal(false)}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b"
              }}
            >
              <X size={24} />
            </button>

            <div style={{ marginBottom: "24px" }}>
              <p className="section-tag" style={{ marginBottom: "12px" }}>Crear con JPA</p>
              <h2 style={{ fontSize: "1.8rem", color: "#101828", margin: 0 }}>Nueva Empresa</h2>
              <p style={{ color: "#64748b", marginTop: "6px", fontSize: "0.95rem" }}>
                Los datos serán insertados en la base de datos por el microservicio JPA (Puerto 8080).
              </p>
            </div>

            <form onSubmit={handleCrearEmpresa}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "700", color: "#334155", marginBottom: "6px", fontSize: "0.9rem" }}>
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Soluciones Tech S.A.S"
                    className="search-box"
                    style={{ width: "100%", padding: "0 16px" }}
                    value={formEmpresa.nombreEmpresa}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, nombreEmpresa: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "700", color: "#334155", marginBottom: "6px", fontSize: "0.9rem" }}>
                      Industria *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Software"
                      className="search-box"
                      style={{ width: "100%", padding: "0 16px" }}
                      value={formEmpresa.industria}
                      onChange={(e) => setFormEmpresa({ ...formEmpresa, industria: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontWeight: "700", color: "#334155", marginBottom: "6px", fontSize: "0.9rem" }}>
                      Teléfono
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 3001234567"
                      className="search-box"
                      style={{ width: "100%", padding: "0 16px" }}
                      value={formEmpresa.telefonoContacto}
                      onChange={(e) => setFormEmpresa({ ...formEmpresa, telefonoContacto: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "700", color: "#334155", marginBottom: "6px", fontSize: "0.9rem" }}>
                    Dirección
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Calle 50 # 40 - 20"
                    className="search-box"
                    style={{ width: "100%", padding: "0 16px" }}
                    value={formEmpresa.direccion}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, direccion: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "700", color: "#334155", marginBottom: "6px", fontSize: "0.9rem" }}>
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    placeholder="https://empresa.com"
                    className="search-box"
                    style={{ width: "100%", padding: "0 16px" }}
                    value={formEmpresa.sitioWeb}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, sitioWeb: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "700", color: "#334155", marginBottom: "6px", fontSize: "0.9rem" }}>
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Breve reseña sobre los servicios u objetivos de la empresa..."
                    style={{
                      width: "100%",
                      borderRadius: "16px",
                      border: "1px solid #d0d5dd",
                      padding: "12px 14px",
                      fontFamily: "inherit",
                      fontSize: "0.95rem",
                      outline: "none",
                      resize: "vertical"
                    }}
                    value={formEmpresa.descripcion}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, descripcion: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  className="report-button"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="details-button"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar Empresa en JPA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default DirectorioEmpresas;
