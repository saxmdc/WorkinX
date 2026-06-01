const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const eliminarArchivoSubido = (archivo) => {
  if (archivo && archivo.path && fs.existsSync(archivo.path)) {
    fs.unlinkSync(archivo.path);
  }
};

const crearPostulacion = async (req, res) => {
  if (req.usuario.rol !== "candidato") {
    eliminarArchivoSubido(req.file);

    return res.status(403).json({
      mensaje: "Solo los candidatos pueden postularse a entrevistas.",
    });
  }

  const usuarioId = req.usuario.id;
  const entrevistaId = req.body.entrevistaId || req.body.entrevista_id;
  const mensaje = req.body.mensaje || null;

  if (!entrevistaId) {
    eliminarArchivoSubido(req.file);

    return res.status(400).json({
      mensaje: "Debes enviar la entrevista a la que deseas postularte.",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      mensaje: "Debes adjuntar tu hoja de vida o CV.",
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
      [entrevistaId]
    );

    if (entrevistas.length === 0) {
      eliminarArchivoSubido(req.file);

      return res.status(404).json({
        mensaje: "La entrevista no existe o no está disponible.",
      });
    }

    const [postulacionExistente] = await pool.query(
      `SELECT id
       FROM postulaciones
       WHERE entrevista_id = ?
         AND usuario_id = ?
         AND estado <> 'retirado'
       LIMIT 1`,
      [entrevistaId, usuarioId]
    );

    if (postulacionExistente.length > 0) {
      eliminarArchivoSubido(req.file);

      return res.status(409).json({
        mensaje: "Ya te postulaste a esta entrevista.",
      });
    }

    const cvPath = req.file.path.replace(/\\/g, "/");

    const [resultado] = await pool.query(
      `INSERT INTO postulaciones
        (
          entrevista_id,
          usuario_id,
          mensaje,
          cv_path,
          estado
        )
       VALUES (?, ?, ?, ?, 'pendiente')`,
      [entrevistaId, usuarioId, mensaje?.trim() || null, cvPath]
    );

    console.log("Postulación insertada en MySQL con ID:", resultado.insertId);
    console.log("Archivo guardado en:", cvPath);

    res.status(201).json({
      mensaje: "Postulación enviada correctamente.",
      postulacion: {
        id: resultado.insertId,
        entrevista_id: Number(entrevistaId),
        usuario_id: usuarioId,
        mensaje: mensaje?.trim() || "",
        cv_path: cvPath,
        cv_nombre: req.file.originalname,
        estado: "pendiente",
        fecha_postulacion: new Date().toISOString(),
      },
    });
  } catch (error) {
    eliminarArchivoSubido(req.file);

    console.error("Error creando postulación:", error);

    res.status(500).json({
      mensaje: "Error interno al enviar la postulación.",
      error: error.message,
    });
  }
};

const listarMisPostulaciones = async (req, res) => {
  if (req.usuario.rol !== "candidato") {
    return res.status(403).json({
      mensaje: "Solo los candidatos pueden consultar sus postulaciones.",
    });
  }

  const usuarioId = req.usuario.id;

  try {
    const [rows] = await pool.query(
      `SELECT
        p.id,
        p.entrevista_id,
        p.usuario_id,
        p.mensaje,
        p.cv_path,
        p.estado,
        p.fecha_postulacion,
        e.titulo AS entrevista_titulo,
        e.tipo,
        e.modalidad,
        e.ubicacion,
        e.salario_a_convenir,
        e.salario_min,
        e.salario_max,
        emp.nombre_empresa AS empresa
      FROM postulaciones p
      INNER JOIN entrevistas e ON e.id = p.entrevista_id
      INNER JOIN empresas emp ON emp.id = e.empresa_id
      WHERE p.usuario_id = ?
        AND p.estado <> 'retirado'
      ORDER BY p.fecha_postulacion DESC`,
      [usuarioId]
    );

    const postulaciones = rows.map((postulacion) => {
      const cvNombre = postulacion.cv_path
        ? path.basename(postulacion.cv_path)
        : null;

      const salarioTexto = postulacion.salario_a_convenir
        ? "Salario a convenir"
        : `$${Number(postulacion.salario_min).toLocaleString(
            "es-CO"
          )} - $${Number(postulacion.salario_max).toLocaleString("es-CO")}`;

      return {
        id: postulacion.id,
        entrevista_id: postulacion.entrevista_id,
        usuario_id: postulacion.usuario_id,
        mensaje: postulacion.mensaje,
        cv_path: postulacion.cv_path,
        cv_nombre: cvNombre,
        cv_url: cvNombre ? `http://localhost:3000/uploads/cv/${cvNombre}` : null,
        estado: postulacion.estado,
        fecha_postulacion: postulacion.fecha_postulacion,
        entrevista_titulo: postulacion.entrevista_titulo,
        empresa: postulacion.empresa,
        tipo: postulacion.tipo,
        modalidad: postulacion.modalidad,
        ubicacion: postulacion.ubicacion,
        salarioTexto,
      };
    });

    res.json({
      mensaje: "Postulaciones obtenidas correctamente.",
      total: postulaciones.length,
      postulaciones,
    });
  } catch (error) {
    console.error("Error listando postulaciones:", error);

    res.status(500).json({
      mensaje: "Error interno al obtener las postulaciones.",
      error: error.message,
    });
  }
};

const listarPostulacionesPorEntrevista = async (req, res) => {
  if (req.usuario.rol !== "empresa") {
    return res.status(403).json({
      mensaje: "Solo las empresas pueden consultar postulantes.",
    });
  }

  const { id } = req.params;
  const usuarioEmpresaId = req.usuario.id;

  try {
    const [empresaRows] = await pool.query(
      "SELECT id FROM empresas WHERE usuario_id = ? LIMIT 1",
      [usuarioEmpresaId]
    );

    if (empresaRows.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontró el perfil de empresa.",
      });
    }

    const empresaId = empresaRows[0].id;

    const [entrevistaRows] = await pool.query(
      `SELECT id, titulo
       FROM entrevistas
       WHERE id = ?
         AND empresa_id = ?
         AND estado <> 'eliminada'
       LIMIT 1`,
      [id, empresaId]
    );

    if (entrevistaRows.length === 0) {
      return res.status(404).json({
        mensaje: "La entrevista no existe o no pertenece a esta empresa.",
      });
    }

    const [rows] = await pool.query(
      `SELECT
        p.id,
        p.entrevista_id,
        p.usuario_id,
        p.mensaje,
        p.cv_path,
        p.estado,
        p.fecha_postulacion,
        u.nombre_completo,
        u.correo,
        u.telefono,
        pc.tipo_documento,
        pc.documento,
        pc.ciudad_residencia,
        pc.categoria_edad
      FROM postulaciones p
      INNER JOIN usuarios u ON u.id = p.usuario_id
      INNER JOIN perfiles_candidatos pc ON pc.usuario_id = u.id
      WHERE p.entrevista_id = ?
        AND p.estado <> 'retirado'
      ORDER BY p.fecha_postulacion DESC`,
      [id]
    );

    const postulantes = rows.map((postulacion) => {
      const cvNombre = postulacion.cv_path
        ? path.basename(postulacion.cv_path)
        : null;

      return {
        id: postulacion.id,
        entrevista_id: postulacion.entrevista_id,
        usuario_id: postulacion.usuario_id,
        nombre_completo: postulacion.nombre_completo,
        correo: postulacion.correo,
        telefono: postulacion.telefono,
        tipo_documento: postulacion.tipo_documento,
        documento: postulacion.documento,
        ciudad_residencia: postulacion.ciudad_residencia,
        categoria_edad: postulacion.categoria_edad,
        mensaje: postulacion.mensaje,
        estado: postulacion.estado,
        fecha_postulacion: postulacion.fecha_postulacion,
        cv_path: postulacion.cv_path,
        cv_nombre: cvNombre,
        cv_url: cvNombre ? `http://localhost:3000/uploads/cv/${cvNombre}` : null,
      };
    });

    res.json({
      mensaje: "Postulantes obtenidos correctamente.",
      entrevista: entrevistaRows[0],
      total: postulantes.length,
      postulantes,
    });
  } catch (error) {
    console.error("Error listando postulantes:", error);

    res.status(500).json({
      mensaje: "Error interno al obtener los postulantes.",
      error: error.message,
    });
  }
};

const actualizarEstadoPostulacion = async (req, res) => {
  if (req.usuario.rol !== "empresa") {
    return res.status(403).json({
      mensaje: "Solo las empresas pueden cambiar el estado de una postulación.",
    });
  }

  const { id } = req.params;
  const { estado } = req.body;

  const estadosPermitidos = ["pendiente", "revisado", "aceptado", "rechazado"];

  if (!estado || !estadosPermitidos.includes(estado)) {
    return res.status(400).json({
      mensaje: "El estado enviado no es válido.",
    });
  }

  try {
    const [empresaRows] = await pool.query(
      "SELECT id FROM empresas WHERE usuario_id = ? LIMIT 1",
      [req.usuario.id]
    );

    if (empresaRows.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontró el perfil de empresa.",
      });
    }

    const empresaId = empresaRows[0].id;

    const [postulacionRows] = await pool.query(
      `SELECT 
        p.id,
        p.estado,
        p.entrevista_id
       FROM postulaciones p
       INNER JOIN entrevistas e ON e.id = p.entrevista_id
       WHERE p.id = ?
         AND e.empresa_id = ?
         AND p.estado <> 'retirado'
       LIMIT 1`,
      [id, empresaId]
    );

    if (postulacionRows.length === 0) {
      return res.status(404).json({
        mensaje: "La postulación no existe o no pertenece a una entrevista de esta empresa.",
      });
    }

    await pool.query(
      `UPDATE postulaciones
       SET estado = ?
       WHERE id = ?`,
      [estado, id]
    );

    res.json({
      mensaje: "Estado de postulación actualizado correctamente.",
      postulacion: {
        id: Number(id),
        estado,
      },
    });
  } catch (error) {
    console.error("Error actualizando estado de postulación:", error);

    res.status(500).json({
      mensaje: "Error interno al actualizar el estado de la postulación.",
      error: error.message,
    });
  }
};

module.exports = {
  crearPostulacion,
  listarMisPostulaciones,
  listarPostulacionesPorEntrevista,
  actualizarEstadoPostulacion,
};