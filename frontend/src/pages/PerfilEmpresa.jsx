import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  UsersRound,
} from "lucide-react";
import FormularioEntrevistaModal from "../components/FormularioEntrevistaModal";
import PostulantesEntrevistaModal from "../components/PostulantesEntrevistaModal";

function PerfilEmpresa() {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [mensajeError, setMensajeError] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [entrevistaEditar, setEntrevistaEditar] = useState(null);

  const [entrevistasEmpresa, setEntrevistasEmpresa] = useState([]);
  const [cargandoEntrevistas, setCargandoEntrevistas] = useState(false);

  const [entrevistaPostulantes, setEntrevistaPostulantes] = useState(null);
  const [postulantes, setPostulantes] = useState([]);
  const [cargandoPostulantes, setCargandoPostulantes] = useState(false);

  const cargarEntrevistasEmpresa = async (token) => {
    try {
      setCargandoEntrevistas(true);

      const respuesta = await fetch(
        "http://localhost:3000/api/entrevistas/empresa/mis-entrevistas",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setMensajeError(
          resultado.mensaje || "No se pudieron cargar las entrevistas."
        );
        return;
      }

      setEntrevistasEmpresa(resultado.entrevistas || []);
    } catch (error) {
      console.error("Error cargando entrevistas de empresa:", error);

      setMensajeError(
        "No se pudo conectar con el servidor para cargar las entrevistas."
      );
    } finally {
      setCargandoEntrevistas(false);
    }
  };

  useEffect(() => {
    const obtenerPerfilEmpresa = async () => {
      const token = localStorage.getItem("workinx_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setCargandoPerfil(true);
        setMensajeError("");

        const respuesta = await fetch("http://localhost:3000/api/auth/perfil", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
          localStorage.removeItem("workinx_token");
          localStorage.removeItem("workinx_usuario");

          setMensajeError(
            resultado.mensaje || "No se pudo cargar el perfil de empresa."
          );

          navigate("/login");
          return;
        }

        if (resultado.tipo_perfil !== "empresa") {
          navigate("/perfil/usuario");
          return;
        }

        setPerfil(resultado.perfil);

        await cargarEntrevistasEmpresa(token);
      } catch (error) {
        console.error("Error cargando perfil de empresa:", error);

        setMensajeError(
          "No se pudo conectar con el servidor. Verifica que el backend esté encendido."
        );
      } finally {
        setCargandoPerfil(false);
      }
    };

    obtenerPerfilEmpresa();
  }, [navigate]);

  const abrirCrearEntrevista = () => {
    setEntrevistaEditar(null);
    setModalAbierto(true);
    setMensajeError("");
  };

  const abrirEditarEntrevista = (entrevista) => {
    setEntrevistaEditar(entrevista);
    setModalAbierto(true);
    setMensajeError("");
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEntrevistaEditar(null);
    setMensajeError("");
  };

  const guardarEntrevista = async (entrevistaGuardada) => {
    const token = localStorage.getItem("workinx_token");

    if (!token) {
      navigate("/login");
      return;
    }

    const esEdicion = Boolean(entrevistaEditar?.id);

    const url = esEdicion
      ? `http://localhost:3000/api/entrevistas/${entrevistaEditar.id}`
      : "http://localhost:3000/api/entrevistas";

    const metodo = esEdicion ? "PUT" : "POST";

    try {
      setMensajeError("");

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo: entrevistaGuardada.titulo,
          categoria: entrevistaGuardada.categoria,
          descripcion: entrevistaGuardada.descripcion,
          tipo: entrevistaGuardada.tipo,
          modalidad: entrevistaGuardada.modalidad,
          ubicacion: entrevistaGuardada.ubicacion,
          lugarEntrevista: entrevistaGuardada.lugarEntrevista,
          fechaEntrevista: entrevistaGuardada.fechaEntrevista,
          horaEntrevista: entrevistaGuardada.horaEntrevista,
          salarioAConvenir: entrevistaGuardada.salarioAConvenir,
          salarioMin: entrevistaGuardada.salarioMin,
          salarioMax: entrevistaGuardada.salarioMax,
          requisitos: entrevistaGuardada.requisitos,
          palabrasClave: entrevistaGuardada.palabrasClave,
          fechaLimite: entrevistaGuardada.fechaLimite,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setMensajeError(
          resultado.mensaje ||
            `No se pudo ${esEdicion ? "actualizar" : "publicar"} la entrevista.`
        );
        return;
      }

      console.log(
        esEdicion ? "Entrevista actualizada:" : "Entrevista publicada:",
        resultado
      );

      setModalAbierto(false);
      setEntrevistaEditar(null);

      await cargarEntrevistasEmpresa(token);
    } catch (error) {
      console.error("Error guardando entrevista:", error);

      setMensajeError(
        "No se pudo conectar con el servidor. Verifica que el backend esté encendido."
      );
    }
  };

  const verEntrevista = (entrevista) => {
    navigate(`/entrevistas/${entrevista.id}`);
  };

  const eliminarEntrevista = async (entrevista) => {
    const confirmar = confirm(
      `¿Seguro que deseas eliminar la entrevista "${entrevista.titulo}"?`
    );

    if (!confirmar) return;

    const token = localStorage.getItem("workinx_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setMensajeError("");

      const respuesta = await fetch(
        `http://localhost:3000/api/entrevistas/${entrevista.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setMensajeError(
          resultado.mensaje || "No se pudo eliminar la entrevista."
        );
        return;
      }

      console.log("Entrevista eliminada:", resultado);

      await cargarEntrevistasEmpresa(token);
    } catch (error) {
      console.error("Error eliminando entrevista:", error);

      setMensajeError(
        "No se pudo conectar con el servidor para eliminar la entrevista."
      );
    }
  };

  const abrirPostulantes = async (entrevista) => {
    const token = localStorage.getItem("workinx_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setMensajeError("");
      setCargandoPostulantes(true);
      setEntrevistaPostulantes(entrevista);
      setPostulantes([]);

      const respuesta = await fetch(
        `http://localhost:3000/api/postulaciones/entrevista/${entrevista.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setMensajeError(
          resultado.mensaje || "No se pudieron cargar los postulantes."
        );
        setEntrevistaPostulantes(null);
        return;
      }

      setPostulantes(resultado.postulantes || []);
    } catch (error) {
      console.error("Error cargando postulantes:", error);

      setMensajeError(
        "No se pudo conectar con el servidor para cargar postulantes."
      );
    } finally {
      setCargandoPostulantes(false);
    }
  };

const cambiarEstadoPostulacion = async (postulacionId, nuevoEstado) => {
  const token = localStorage.getItem("workinx_token");

  if (!token) {
    navigate("/login");
    return;
  }

  try {
    setMensajeError("");

    const respuesta = await fetch(
      `http://localhost:3000/api/postulaciones/${postulacionId}/estado`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          estado: nuevoEstado,
        }),
      }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      setMensajeError(
        resultado.mensaje || "No se pudo actualizar el estado."
      );
      return;
    }

    setPostulantes((postulantesActuales) =>
      postulantesActuales.map((postulante) =>
        postulante.id === postulacionId
          ? { ...postulante, estado: nuevoEstado }
          : postulante
      )
    );
  } catch (error) {
    console.error("Error cambiando estado:", error);

    setMensajeError(
      "No se pudo conectar con el servidor para actualizar el estado."
    );
  }
};

  const convertirClasificacion = (clasificacion) => {
    const valores = {
      microempresa: "Microempresa",
      pequena_empresa: "Pequeña empresa",
      mediana_empresa: "Mediana empresa",
      gran_empresa: "Gran empresa",
      macroempresa: "Macroempresa",
    };

    return valores[clasificacion] || "Sin clasificación";
  };

  const convertirTipoEntidad = (tipoEntidad) => {
    if (tipoEntidad === "publica") return "Pública";
    if (tipoEntidad === "privada") return "Privada";
    return "Sin definir";
  };

  if (cargandoPerfil) {
    return (
      <section className="company-profile-page">
        <div className="empty-results">
          <h3>Cargando perfil empresarial...</h3>
          <p>Estamos consultando la información de tu empresa.</p>
        </div>
      </section>
    );
  }

  if (mensajeError && !perfil) {
    return (
      <section className="company-profile-page">
        <div className="empty-results">
          <h3>No se pudo cargar el perfil.</h3>
          <p>{mensajeError}</p>
        </div>
      </section>
    );
  }

  if (!perfil) {
    return (
      <section className="company-profile-page">
        <div className="empty-results">
          <h3>Perfil no encontrado.</h3>
          <p>Inicia sesión nuevamente para consultar tu información.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="company-profile-page">
      <div className="company-profile-header">
        <div>
          <p className="section-tag">Panel de empresa</p>
          <h1>Perfil empresarial</h1>
          <p>
            Gestiona la información de tu empresa y administra las entrevistas
            laborales publicadas.
          </p>
        </div>

        <button
          type="button"
          className="auth-button company-create-button"
          onClick={abrirCrearEntrevista}
        >
          <Plus size={20} />
          Publicar nueva entrevista
        </button>
      </div>

      {mensajeError && <p className="form-error">{mensajeError}</p>}

      <div className="company-profile-layout">
        <aside className="company-profile-card">
          <div className="company-avatar">
            <Building2 size={42} />
          </div>

          <h2>{perfil.nombre_empresa}</h2>

          <p className="company-profile-subtitle">
            {convertirClasificacion(perfil.clasificacion_empresa)} · Entidad{" "}
            {convertirTipoEntidad(perfil.tipo_entidad)}
          </p>

          <div className="company-profile-info">
            <p>
              <Mail size={18} />
              {perfil.correo}
            </p>

            <p>
              <Phone size={18} />
              {perfil.telefono_contacto || perfil.telefono}
            </p>

            <p>
              <MapPin size={18} />
              {perfil.direccion}
            </p>

            <p>
              <Building2 size={18} />
              {perfil.industria}
            </p>
          </div>
        </aside>

        <div className="company-posts-panel">
          <div className="company-posts-header">
            <div>
              <h2>Mis entrevistas publicadas</h2>
              <p>{entrevistasEmpresa.length} entrevistas registradas</p>
            </div>
          </div>

          {cargandoEntrevistas ? (
            <div className="empty-results">
              <h3>Cargando entrevistas...</h3>
              <p>Estamos consultando las entrevistas publicadas por tu empresa.</p>
            </div>
          ) : (
            <div className="company-posts-list">
              {entrevistasEmpresa.map((entrevista) => (
                <article key={entrevista.id} className="company-post-card">
                  <div>
                    <span className="company-post-category">
                      {entrevista.categoria}
                    </span>

                    <h3>{entrevista.titulo}</h3>

                    <p>{entrevista.descripcion}</p>

                    <div className="company-post-dates">
                      <span>
                        <CalendarDays size={16} />
                        Publicada: {entrevista.fechaPublicacion}
                      </span>

                      <span>
                        <CalendarDays size={16} />
                        Editada:{" "}
                        {entrevista.fechaEdicion
                          ? entrevista.fechaEdicion
                          : "Sin editar"}
                      </span>
                    </div>

                    <div className="company-post-tags">
                      <span>{entrevista.tipo}</span>
                      <span>{entrevista.modalidad}</span>
                      <span>{entrevista.salarioTexto}</span>
                    </div>
                  </div>

                  <div className="company-panel-actions">
                    <button
                      type="button"
                      className="details-button"
                      onClick={() => verEntrevista(entrevista)}
                    >
                      <Eye size={18} />
                      Ver
                    </button>

                    <button
                      type="button"
                      className="details-button"
                      onClick={() => abrirPostulantes(entrevista)}
                    >
                      <UsersRound size={18} />
                      Postulantes
                    </button>

                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => abrirEditarEntrevista(entrevista)}
                    >
                      <Pencil size={18} />
                      Editar
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => eliminarEntrevista(entrevista)}
                    >
                      <Trash2 size={18} />
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}

              {entrevistasEmpresa.length === 0 && (
                <div className="empty-results">
                  <h3>No tienes entrevistas publicadas.</h3>
                  <p>
                    Usa el botón “Publicar nueva entrevista” para registrar tu
                    primera entrevista laboral.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {modalAbierto && (
        <FormularioEntrevistaModal
          entrevistaEditar={entrevistaEditar}
          onClose={cerrarModal}
          onGuardar={guardarEntrevista}
        />
      )}

      <PostulantesEntrevistaModal
        entrevista={entrevistaPostulantes}
        postulantes={postulantes}
        cargando={cargandoPostulantes}
        onCambiarEstado={cambiarEstadoPostulacion}
        onClose={() => {
          setEntrevistaPostulantes(null);
          setPostulantes([]);
        }}
      />
    </section>
  );
}

export default PerfilEmpresa;