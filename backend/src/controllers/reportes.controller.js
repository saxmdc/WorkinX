const pool = require("../config/db");

const tiposPermitidos = [
  "fraude",
  "informacion_falsa",
  "contenido_inapropiado",
  "spam",
  "otro",
];

const crearReporte = async (req, res) => {
  const usuarioId = req.usuario.id;

  const {
    entrevistaId,
    entrevista_id,
    tipoReporte,
    tipo_reporte,
    descripcion,
    evidencia,
  } = req.body;

  const entrevistaIdFinal = entrevistaId || entrevista_id;
  const tipoReporteFinal = tipoReporte || tipo_reporte;

  if (!entrevistaIdFinal || !tipoReporteFinal || !descripcion) {
    return res.status(400).json({
      mensaje: "Debes enviar entrevista, motivo y descripción del reporte.",
    });
  }

  if (!tiposPermitidos.includes(tipoReporteFinal)) {
    return res.status(400).json({
      mensaje: "El tipo de reporte no es válido.",
    });
  }

  if (descripcion.trim().length < 10) {
    return res.status(400).json({
      mensaje: "La descripción debe tener mínimo 10 caracteres.",
    });
  }

  try {
    const [entrevistas] = await pool.query(
      `SELECT id 
       FROM entrevistas 
       WHERE id = ?
         AND activa = TRUE
         AND estado = 'publicada'
       LIMIT 1`,
      [entrevistaIdFinal]
    );

    if (entrevistas.length === 0) {
      return res.status(404).json({
        mensaje: "La entrevista no existe o no está disponible para reportar.",
      });
    }

    const [reporteExistente] = await pool.query(
      `SELECT id
       FROM reportes_entrevistas
       WHERE entrevista_id = ?
         AND usuario_id = ?
         AND estado IN ('pendiente', 'en_revision')
       LIMIT 1`,
      [entrevistaIdFinal, usuarioId]
    );

    if (reporteExistente.length > 0) {
      return res.status(409).json({
        mensaje: "Ya tienes un reporte activo para esta entrevista.",
      });
    }

    const [resultado] = await pool.query(
      `INSERT INTO reportes_entrevistas
        (
          entrevista_id,
          usuario_id,
          tipo_reporte,
          descripcion,
          evidencia,
          estado
        )
       VALUES (?, ?, ?, ?, ?, 'pendiente')`,
      [
        entrevistaIdFinal,
        usuarioId,
        tipoReporteFinal,
        descripcion.trim(),
        evidencia?.trim() || null,
      ]
    );

    res.status(201).json({
      mensaje: "Reporte enviado correctamente.",
      reporte: {
        id: resultado.insertId,
        entrevista_id: Number(entrevistaIdFinal),
        tipo_reporte: tipoReporteFinal,
        estado: "pendiente",
      },
    });
  } catch (error) {
    console.error("Error creando reporte:", error);

    res.status(500).json({
      mensaje: "Error interno al enviar el reporte.",
      error: error.message,
    });
  }
};

module.exports = {
  crearReporte,
};