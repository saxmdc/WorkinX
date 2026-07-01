import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  IdCard,
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  FileText,
  ExternalLink,
} from "lucide-react";

function PerfilUsuario() {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [postulaciones, setPostulaciones] = useState([]);

  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [cargandoPostulaciones, setCargandoPostulaciones] = useState(true);

  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      const token = localStorage.getItem("workinx_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setCargandoPerfil(true);
        setCargandoPostulaciones(true);
        setMensajeError("");

        const respuestaPerfil = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/perfil`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const resultadoPerfil = await respuestaPerfil.json();

        if (!respuestaPerfil.ok) {
          localStorage.removeItem("workinx_token");
          localStorage.removeItem("workinx_usuario");

          setMensajeError(
            resultadoPerfil.mensaje || "No se pudo cargar el perfil."
          );

          navigate("/login");
          return;
        }

        if (resultadoPerfil.tipo_perfil !== "candidato") {
          navigate("/perfil/empresa");
          return;
        }

        setPerfil(resultadoPerfil.perfil);

        const respuestaPostulaciones = await fetch(
          `${import.meta.env.VITE_API_URL}/api/postulaciones/mis-postulaciones`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const resultadoPostulaciones = await respuestaPostulaciones.json();

        if (!respuestaPostulaciones.ok) {
          setMensajeError(
            resultadoPostulaciones.mensaje ||
              "No se pudieron cargar tus postulaciones."
          );
          return;
        }

        setPostulaciones(resultadoPostulaciones.postulaciones || []);
      } catch (error) {
        console.error("Error cargando perfil del candidato:", error);

        setMensajeError(
          "No se pudo conectar con el servidor. Verifica que el backend esté encendido."
        );
      } finally {
        setCargandoPerfil(false);
        setCargandoPostulaciones(false);
      }
    };

    cargarDatosUsuario();
  }, [navigate]);

  const convertirEdad = (categoriaEdad) => {
    if (categoriaEdad === "mayor_edad") return "Mayor de edad";
    if (categoriaEdad === "menor_edad") return "Menor de edad";
    return "Sin clasificar";
  };

  const convertirEstado = (estado) => {
    const estados = {
      pendiente: "Pendiente",
      revisado: "Revisado",
      aceptado: "Aceptado",
      rechazado: "Rechazado",
      retirado: "Retirado",
    };

    return estados[estado] || estado;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (cargandoPerfil) {
    return (
      <section className="user-profile-page">
        <div className="empty-results">
          <h3>Cargando perfil...</h3>
          <p>Estamos consultando tu información de candidato.</p>
        </div>
      </section>
    );
  }

  if (mensajeError && !perfil) {
    return (
      <section className="user-profile-page">
        <div className="empty-results">
          <h3>No se pudo cargar el perfil.</h3>
          <p>{mensajeError}</p>
        </div>
      </section>
    );
  }

  if (!perfil) {
    return (
      <section className="user-profile-page">
        <div className="empty-results">
          <h3>Perfil no encontrado.</h3>
          <p>Inicia sesión nuevamente para consultar tu información.</p>

          <Link to="/login" className="primary-button">
            Ir al login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="user-profile-page">
      <div className="user-profile-header">
        <div>
          <p className="section-tag">Perfil del candidato</p>

          <h1>Mi perfil</h1>

          <p>
            Consulta tu información personal y revisa las entrevistas laborales
            a las que te has postulado.
          </p>
        </div>
      </div>

      {mensajeError && <p className="form-error">{mensajeError}</p>}

      <div className="user-profile-layout">
        <aside className="user-profile-card">
          <div className="user-avatar">
            <UserRound size={44} />
          </div>

          <h2>{perfil.nombre_completo}</h2>

          <p className="user-profile-subtitle">
            Candidato · {convertirEdad(perfil.categoria_edad)}
          </p>

          <div className="user-profile-info">
            <p>
              <Mail size={18} />
              {perfil.correo}
            </p>

            <p>
              <Phone size={18} />
              {perfil.telefono || "Sin teléfono registrado"}
            </p>

            <p>
              <MapPin size={18} />
              {perfil.ciudad_residencia}
            </p>

            <p>
              <IdCard size={18} />
              {perfil.tipo_documento} - {perfil.documento}
            </p>
          </div>
        </aside>

        <div className="user-applications-panel">
          <div className="user-applications-header">
            <div>
              <h2>Mis postulaciones</h2>
              <p>{postulaciones.length} entrevistas registradas</p>
            </div>
          </div>

          {cargandoPostulaciones ? (
            <div className="empty-results">
              <h3>Cargando postulaciones...</h3>
              <p>Estamos consultando tus postulaciones registradas.</p>
            </div>
          ) : (
            <div className="user-applications-list">
              {postulaciones.map((postulacion) => (
                <article
                  key={postulacion.id}
                  className="user-application-card"
                >
                  <div>
                    <span className="application-status">
                      Estado: {convertirEstado(postulacion.estado)}
                    </span>

                    <h3>{postulacion.entrevista_titulo}</h3>

                    <p className="application-company">
                      <BriefcaseBusiness size={18} />
                      {postulacion.empresa}
                    </p>

                    {postulacion.mensaje && (
                      <p className="application-message">
                        “{postulacion.mensaje}”
                      </p>
                    )}

                    <div className="application-tags">
                      <span>
                        <FileText size={16} />
                        CV: {postulacion.cv_nombre || "Archivo adjunto"}
                      </span>

                      <span>
                        <CalendarDays size={16} />
                        Fecha: {formatearFecha(postulacion.fecha_postulacion)}
                      </span>

                      <span>{postulacion.tipo}</span>
                      <span>{postulacion.modalidad}</span>
                      <span>{postulacion.salarioTexto}</span>
                    </div>
                  </div>

                  <div className="user-application-actions">
                    <Link
                      to={`/entrevistas/${postulacion.entrevista_id}`}
                      className="details-button"
                    >
                      <Eye size={18} />
                      Ver entrevista
                    </Link>

                    {postulacion.cv_url && (
                      <a
                        href={postulacion.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        className="details-button"
                      >
                        <ExternalLink size={18} />
                        Ver CV
                      </a>
                    )}
                  </div>
                </article>
              ))}

              {postulaciones.length === 0 && (
                <div className="empty-results">
                  <h3>Aún no tienes postulaciones.</h3>

                  <p>
                    Cuando te postules a una entrevista, aparecerá aquí para que
                    puedas consultarla desde tu perfil.
                  </p>

                  <Link to="/entrevistas" className="primary-button">
                    Buscar entrevistas
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PerfilUsuario;