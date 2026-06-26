import { useState } from "react";
import { X, Send, BriefcaseBusiness } from "lucide-react";

const obtenerFechaActual = () => {
  return new Date().toISOString().split("T")[0];
};

function FormularioEntrevistaModal({ entrevistaEditar, onClose, onGuardar }) {
  const hoy = obtenerFechaActual();

  const [mensajeError, setMensajeError] = useState("");

  const [formulario, setFormulario] = useState({
    titulo: entrevistaEditar?.titulo || "",
    categoria: entrevistaEditar?.categoria || "",
    descripcion: entrevistaEditar?.descripcion || "",
    tipo: entrevistaEditar?.tipo || "",
    modalidad: entrevistaEditar?.modalidad || "",
    ubicacion: entrevistaEditar?.ubicacion || "",
    lugarEntrevista: entrevistaEditar?.lugarEntrevista || "",
    fechaEntrevista: entrevistaEditar?.fechaEntrevista || "",
    horaEntrevista: entrevistaEditar?.horaEntrevista || "",
    salarioAConvenir: entrevistaEditar?.salarioAConvenir || false,
    salarioMin: entrevistaEditar?.salarioMin || "",
    salarioMax: entrevistaEditar?.salarioMax || "",
    requisitos: Array.isArray(entrevistaEditar?.requisitos)
      ? entrevistaEditar.requisitos.join("\n")
      : entrevistaEditar?.requisitos || "",
    palabrasClave: Array.isArray(entrevistaEditar?.palabrasClave)
      ? entrevistaEditar.palabrasClave.join(", ")
      : entrevistaEditar?.palabrasClave || "",
    fechaLimite: entrevistaEditar?.fechaLimite || "",
  });

  const manejarCambio = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === "checkbox") {
      setFormulario({
        ...formulario,
        [name]: checked,
        salarioMin: checked ? "" : formulario.salarioMin,
        salarioMax: checked ? "" : formulario.salarioMax,
      });

      setMensajeError("");
      return;
    }

    setFormulario({
      ...formulario,
      [name]: value,
    });

    setMensajeError("");
  };

  const guardarEntrevista = (event) => {
    event.preventDefault();

    if (formulario.descripcion.trim().length < 20) {
      setMensajeError("La descripción debe tener mínimo 20 caracteres.");
      return;
    }

    if (!formulario.salarioAConvenir) {
      if (!formulario.salarioMin || !formulario.salarioMax) {
        setMensajeError(
          "Debes ingresar salario mínimo y máximo, o marcar salario a convenir."
        );
        return;
      }

      if (Number(formulario.salarioMin) > Number(formulario.salarioMax)) {
        setMensajeError("El salario mínimo no puede ser mayor al salario máximo.");
        return;
      }
    }

    if (formulario.fechaEntrevista < hoy) {
      setMensajeError("La fecha de la entrevista no puede ser anterior a hoy.");
      return;
    }

    if (formulario.fechaLimite < hoy) {
      setMensajeError("La fecha límite de postulación no puede ser anterior a hoy.");
      return;
    }

    if (formulario.fechaLimite > formulario.fechaEntrevista) {
      setMensajeError(
        "La fecha límite de postulación no puede ser después de la entrevista."
      );
      return;
    }

    const salarioTexto = formulario.salarioAConvenir
      ? "Salario a convenir"
      : `$${Number(formulario.salarioMin).toLocaleString("es-CO")} - $${Number(
          formulario.salarioMax
        ).toLocaleString("es-CO")}`;

    const datosEntrevista = {
      ...entrevistaEditar,
      ...formulario,
      id: entrevistaEditar?.id || Date.now(),
      salarioTexto,
      salarioMin: formulario.salarioAConvenir
        ? null
        : Number(formulario.salarioMin),
      salarioMax: formulario.salarioAConvenir
        ? null
        : Number(formulario.salarioMax),
      requisitos: formulario.requisitos
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      palabrasClave: formulario.palabrasClave
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      fechaPublicacion: entrevistaEditar?.fechaPublicacion || hoy,
      fechaEdicion: entrevistaEditar ? hoy : "",
      activa: true,
    };

    onGuardar(datosEntrevista);
  };

  return (
    <div className="company-modal-overlay" onClick={onClose}>
      <div className="company-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-modal-button" onClick={onClose}>
          <X size={22} />
        </button>

        <div className="company-modal-header">
          <div className="company-modal-icon">
            <BriefcaseBusiness size={28} />
          </div>

          <div>
            <p className="section-tag">
              {entrevistaEditar ? "Editar entrevista" : "Nueva entrevista"}
            </p>

            <h2>
              {entrevistaEditar
                ? "Actualiza la información de la entrevista"
                : "Publica una nueva entrevista laboral"}
            </h2>
          </div>
        </div>

        <form className="company-interview-form" onSubmit={guardarEntrevista}>
          <label>
            Cargo o título de la entrevista
            <div className="input-group">
              <input
                type="text"
                name="titulo"
                placeholder="Ej: Auxiliar administrativo"
                value={formulario.titulo}
                onChange={manejarCambio}
                required
              />
            </div>
          </label>

          <label>
            Categoría
            <div className="input-group">
              <input
                type="text"
                name="categoria"
                placeholder="Ej: Administración, logística, tecnología"
                value={formulario.categoria}
                onChange={manejarCambio}
                required
              />
            </div>
          </label>

          <label>
            Descripción
            <textarea
              className="company-textarea"
              name="descripcion"
              placeholder="Describe la entrevista, el cargo y las responsabilidades principales..."
              value={formulario.descripcion}
              onChange={manejarCambio}
              required
            />
          </label>

          <div className="company-form-grid">
            <label>
              Tipo de entrevista
              <select
                className="company-select"
                name="tipo"
                value={formulario.tipo}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="Primer empleo">Primer empleo</option>
                <option value="Profesional">Profesional</option>
                <option value="Emprendedor">Emprendedor</option>
              </select>
            </label>

            <label>
              Modalidad
              <select
                className="company-select"
                name="modalidad"
                value={formulario.modalidad}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccionar modalidad</option>
                <option value="Presencial">Presencial</option>
                <option value="Remoto">Remoto</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </label>
          </div>

          <label>
            Ubicación general
            <div className="input-group">
              <input
                type="text"
                name="ubicacion"
                placeholder="Ej: Medellín, Antioquia"
                value={formulario.ubicacion}
                onChange={manejarCambio}
                required
              />
            </div>
          </label>

          <label>
            Lugar de la entrevista
            <div className="input-group">
              <input
                type="text"
                name="lugarEntrevista"
                placeholder="Dirección, sede o enlace virtual"
                value={formulario.lugarEntrevista}
                onChange={manejarCambio}
                required
              />
            </div>
          </label>

          <div className="company-form-grid">
            <label>
              Fecha de entrevista
              <div className="input-group">
                <input
                  type="date"
                  name="fechaEntrevista"
                  min={hoy}
                  value={formulario.fechaEntrevista}
                  onChange={manejarCambio}
                  required
                />
              </div>
            </label>

            <label>
              Hora de entrevista
              <div className="input-group">
                <input
                  type="time"
                  name="horaEntrevista"
                  value={formulario.horaEntrevista}
                  onChange={manejarCambio}
                  required
                />
              </div>
            </label>
          </div>

          <label>
            Fecha límite de postulación
            <div className="input-group">
              <input
                type="date"
                name="fechaLimite"
                min={hoy}
                value={formulario.fechaLimite}
                onChange={manejarCambio}
                required
              />
            </div>
          </label>

          <label className="terms-box">
            <input
              type="checkbox"
              name="salarioAConvenir"
              checked={formulario.salarioAConvenir}
              onChange={manejarCambio}
            />

            <span>Salario a convenir</span>
          </label>

          {!formulario.salarioAConvenir && (
            <div className="company-form-grid">
              <label>
                Salario mínimo
                <div className="input-group">
                  <input
                    type="number"
                    name="salarioMin"
                    placeholder="Ej: 1300000"
                    min="0"
                    value={formulario.salarioMin}
                    onChange={manejarCambio}
                    required={!formulario.salarioAConvenir}
                  />
                </div>
              </label>

              <label>
                Salario máximo
                <div className="input-group">
                  <input
                    type="number"
                    name="salarioMax"
                    placeholder="Ej: 1600000"
                    min="0"
                    value={formulario.salarioMax}
                    onChange={manejarCambio}
                    required={!formulario.salarioAConvenir}
                  />
                </div>
              </label>
            </div>
          )}

          <label>
            Requisitos
            <textarea
              className="company-textarea"
              name="requisitos"
              placeholder="Escribe cada requisito en una línea diferente"
              value={formulario.requisitos}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Palabras clave
            <div className="input-group">
              <input
                type="text"
                name="palabrasClave"
                placeholder="Ej: atención, ventas, primer empleo"
                value={formulario.palabrasClave}
                onChange={manejarCambio}
                required
              />
            </div>
          </label>

          {mensajeError && <p className="form-error">{mensajeError}</p>}

          <div className="company-modal-actions">
            <button type="button" className="back-button" onClick={onClose}>
              Cancelar
            </button>

            <button type="submit" className="auth-button">
              <Send size={18} />
              {entrevistaEditar ? "Guardar cambios" : "Publicar entrevista"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormularioEntrevistaModal;