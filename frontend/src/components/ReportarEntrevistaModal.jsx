import { useState } from "react";
import { AlertTriangle, X, Send, Building2 } from "lucide-react";

const tiposReporte = [
  {
    id: "fraude",
    texto: "Fraude",
  },
  {
    id: "informacion_falsa",
    texto: "Información falsa",
  },
  {
    id: "contenido_inapropiado",
    texto: "Contenido inapropiado",
  },
  {
    id: "spam",
    texto: "Spam",
  },
  {
    id: "otro",
    texto: "Otro",
  },
];

function ReportarEntrevistaModal({ entrevista, onClose }) {
  const [tipoReporte, setTipoReporte] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [evidencia, setEvidencia] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  if (!entrevista) {
    return null;
  }

  const limpiarFormulario = () => {
    setTipoReporte("");
    setDescripcion("");
    setEvidencia("");
    setMensajeError("");
    setCargando(false);
  };

  const cerrarModal = () => {
    limpiarFormulario();
    onClose();
  };

  const enviarReporte = async (event) => {
    event.preventDefault();

    setMensajeError("");

    if (!tipoReporte) {
      setMensajeError("Debes seleccionar un motivo para reportar la entrevista.");
      return;
    }

    if (descripcion.trim().length < 10) {
      setMensajeError("La descripción debe tener mínimo 10 caracteres.");
      return;
    }

    const token = localStorage.getItem("workinx_token");

    if (!token) {
      setMensajeError("Debes iniciar sesión para reportar una entrevista.");
      return;
    }

    try {
      setCargando(true);

      const respuesta = await fetch("http://localhost:3000/api/reportes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entrevistaId: entrevista.id,
          tipoReporte,
          descripcion: descripcion.trim(),
          evidencia: evidencia.trim(),
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setMensajeError(resultado.mensaje || "No se pudo enviar el reporte.");
        return;
      }

      console.log("Reporte guardado:", resultado);

      alert("Reporte enviado correctamente.");

      cerrarModal();
    } catch (error) {
      console.error("Error enviando reporte:", error);

      setMensajeError(
        "No se pudo conectar con el servidor. Verifica que el backend esté encendido."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="report-modal-overlay" onClick={cerrarModal}>
      <div className="report-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-modal-button" onClick={cerrarModal}>
          <X size={22} />
        </button>

        <div className="report-modal-header">
          <div className="report-icon">
            <AlertTriangle size={28} />
          </div>

          <div>
            <p className="section-tag">Reportar entrevista</p>
            <h2>Cuéntanos qué sucede con esta entrevista</h2>
          </div>
        </div>

        <div className="reported-interview">
          <Building2 size={20} />

          <div>
            <strong>{entrevista.titulo}</strong>
            <p>{entrevista.empresa}</p>
          </div>
        </div>

        <form className="report-form" onSubmit={enviarReporte}>
          <div className="report-block">
            <h3>Motivo del reporte</h3>

            <div className="report-options">
              {tiposReporte.map((tipo) => (
                <button
                  key={tipo.id}
                  type="button"
                  className={
                    tipoReporte === tipo.id
                      ? "report-option selected-report-option"
                      : "report-option"
                  }
                  onClick={() => {
                    setTipoReporte(tipo.id);
                    setMensajeError("");
                  }}
                >
                  {tipo.texto}
                </button>
              ))}
            </div>
          </div>

          <label className="report-label">
            Descripción del problema
            <textarea
              className="report-textarea"
              placeholder="Explica por qué deseas reportar esta entrevista..."
              value={descripcion}
              onChange={(event) => {
                setDescripcion(event.target.value);
                setMensajeError("");
              }}
              required
            />
          </label>

          <label className="report-label">
            Evidencia o información adicional
            <input
              className="report-input"
              type="text"
              placeholder="Opcional: enlace, comentario o dato adicional"
              value={evidencia}
              onChange={(event) => setEvidencia(event.target.value)}
            />
          </label>

          {mensajeError && <p className="form-error">{mensajeError}</p>}

          <div className="report-modal-actions">
            <button type="button" className="back-button" onClick={cerrarModal}>
              Cancelar
            </button>

            <button type="submit" className="auth-button" disabled={cargando}>
              <Send size={18} />
              {cargando ? "Enviando..." : "Enviar reporte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportarEntrevistaModal;