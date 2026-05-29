const pool = require("../config/db");

const normalizarTipo = (tipo) => {
  const valor = tipo?.toString().trim().toLowerCase();

  if (valor === "primer empleo" || valor === "primer_empleo") {
    return "primer_empleo";
  }

  if (valor === "profesional") {
    return "profesional";
  }

  if (valor === "emprendedor") {
    return "emprendedor";
  }

  return null;
};

const normalizarModalidad = (modalidad) => {
  const valor = modalidad?.toString().trim().toLowerCase();

  if (valor === "presencial") return "presencial";
  if (valor === "remoto") return "remoto";
  if (valor === "híbrido" || valor === "hibrido") return "hibrido";

  return null;
};

const obtenerEmpresaPorUsuario = async (connection, usuarioId) => {
  const [rows] = await connection.query(
    "SELECT id FROM empresas WHERE usuario_id = ? LIMIT 1",
    [usuarioId]
  );

  return rows[0] || null;
};

const obtenerOCrearCategoria = async (connection, nombreCategoria) => {
  const nombre = nombreCategoria?.trim();

  if (!nombre) {
    return null;
  }

  const [categorias] = await connection.query(
    "SELECT id FROM categorias_empleo WHERE nombre = ? LIMIT 1",
    [nombre]
  );

  if (categorias.length > 0) {
    return categorias[0].id;
  }

  const [resultado] = await connection.query(
    "INSERT INTO categorias_empleo (nombre, descripcion) VALUES (?, ?)",
    [nombre, `Categoría creada desde publicación de entrevista: ${nombre}`]
  );

  return resultado.insertId;
};

const crearEntrevista = async (req, res) => {
  if (req.usuario.rol !== "empresa") {
    return res.status(403).json({
      mensaje: "Solo las empresas pueden publicar entrevistas.",
    });
  }

  const {
    titulo,
    categoria,
    descripcion,
    tipo,
    modalidad,
    ubicacion,
    lugarEntrevista,
    fechaEntrevista,
    horaEntrevista,
    salarioAConvenir,
    salarioMin,
    salarioMax,
    requisitos,
    palabrasClave,
    fechaLimite,
  } = req.body;

  if (
    !titulo ||
    !categoria ||
    !descripcion ||
    !tipo ||
    !modalidad ||
    !ubicacion ||
    !lugarEntrevista ||
    !fechaEntrevista ||
    !horaEntrevista ||
    !fechaLimite
  ) {
    return res.status(400).json({
      mensaje: "Todos los campos obligatorios de la entrevista deben ser enviados.",
    });
  }

  if (descripcion.trim().length < 20) {
    return res.status(400).json({
      mensaje: "La descripción debe tener mínimo 20 caracteres.",
    });
  }

  const tipoNormalizado = normalizarTipo(tipo);
  const modalidadNormalizada = normalizarModalidad(modalidad);

  if (!tipoNormalizado) {
    return res.status(400).json({
      mensaje: "El tipo de entrevista no es válido.",
    });
  }

  if (!modalidadNormalizada) {
    return res.status(400).json({
      mensaje: "La modalidad no es válida.",
    });
  }

  const salarioConvenido = Boolean(salarioAConvenir);

  if (!salarioConvenido) {
    if (!salarioMin || !salarioMax) {
      return res.status(400).json({
        mensaje:
          "Debes enviar salario mínimo y máximo, o marcar salario a convenir.",
      });
    }

    if (Number(salarioMin) > Number(salarioMax)) {
      return res.status(400).json({
        mensaje: "El salario mínimo no puede ser mayor al salario máximo.",
      });
    }
  }

  if (fechaLimite > fechaEntrevista) {
    return res.status(400).json({
      mensaje: "La fecha límite no puede ser posterior a la fecha de entrevista.",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const empresa = await obtenerEmpresaPorUsuario(connection, req.usuario.id);

    if (!empresa) {
      await connection.rollback();

      return res.status(404).json({
        mensaje: "No se encontró el perfil de empresa asociado a este usuario.",
      });
    }

    const categoriaId = await obtenerOCrearCategoria(connection, categoria);

    const [resultadoEntrevista] = await connection.query(
      `INSERT INTO entrevistas
        (
          empresa_id,
          categoria_id,
          titulo,
          descripcion,
          tipo,
          modalidad,
          ubicacion,
          lugar_entrevista,
          fecha_entrevista,
          hora_entrevista,
          salario_a_convenir,
          salario_min,
          salario_max,
          fecha_limite
        )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empresa.id,
        categoriaId,
        titulo.trim(),
        descripcion.trim(),
        tipoNormalizado,
        modalidadNormalizada,
        ubicacion.trim(),
        lugarEntrevista.trim(),
        fechaEntrevista,
        horaEntrevista,
        salarioConvenido,
        salarioConvenido ? null : Number(salarioMin),
        salarioConvenido ? null : Number(salarioMax),
        fechaLimite,
      ]
    );

    const entrevistaId = resultadoEntrevista.insertId;

    if (Array.isArray(requisitos)) {
      for (const requisito of requisitos) {
        if (requisito && requisito.trim()) {
          await connection.query(
            "INSERT INTO requisitos_entrevistas (entrevista_id, requisito) VALUES (?, ?)",
            [entrevistaId, requisito.trim()]
          );
        }
      }
    }

    if (Array.isArray(palabrasClave)) {
      for (const palabra of palabrasClave) {
        if (palabra && palabra.trim()) {
          await connection.query(
            "INSERT INTO palabras_clave_entrevistas (entrevista_id, palabra) VALUES (?, ?)",
            [entrevistaId, palabra.trim().toLowerCase()]
          );
        }
      }
    }

    await connection.commit();

    res.status(201).json({
      mensaje: "Entrevista publicada correctamente.",
      entrevista: {
        id: entrevistaId,
        titulo,
        empresa_id: empresa.id,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error creando entrevista:", error);

    res.status(500).json({
      mensaje: "Error interno al publicar la entrevista.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const formatearTipo = (tipo) => {
  const tipos = {
    primer_empleo: "Primer empleo",
    profesional: "Profesional",
    emprendedor: "Emprendedor",
  };

  return tipos[tipo] || tipo;
};

const formatearModalidad = (modalidad) => {
  const modalidades = {
    presencial: "Presencial",
    remoto: "Remoto",
    hibrido: "Híbrido",
  };

  return modalidades[modalidad] || modalidad;
};

const formatearFecha = (fecha) => {
  if (!fecha) return null;

  return new Date(fecha).toISOString().split("T")[0];
};

const crearSalarioTexto = (entrevista) => {
  if (entrevista.salario_a_convenir) {
    return "Salario a convenir";
  }

  return `$${Number(entrevista.salario_min).toLocaleString(
    "es-CO"
  )} - $${Number(entrevista.salario_max).toLocaleString("es-CO")}`;
};

const convertirEntrevista = (entrevista) => {
  return {
    id: entrevista.id,
    titulo: entrevista.titulo,
    descripcion: entrevista.descripcion,
    tipo: formatearTipo(entrevista.tipo),
    modalidad: formatearModalidad(entrevista.modalidad),
    ubicacion: entrevista.ubicacion,
    lugarEntrevista: entrevista.lugar_entrevista,
    fechaEntrevista: formatearFecha(entrevista.fecha_entrevista),
    horaEntrevista: entrevista.hora_entrevista,
    salarioAConvenir: Boolean(entrevista.salario_a_convenir),
    salarioMin: entrevista.salario_min,
    salarioMax: entrevista.salario_max,
    salarioTexto: crearSalarioTexto(entrevista),
    fechaPublicacion: formatearFecha(entrevista.fecha_publicacion),
    fechaEdicion: formatearFecha(entrevista.fecha_edicion),
    fechaLimite: formatearFecha(entrevista.fecha_limite),
    activa: Boolean(entrevista.activa),
    estado: entrevista.estado,
    empresa: entrevista.nombre_empresa,
    categoria: entrevista.categoria || "Sin categoría",
    palabrasClave: entrevista.palabras_clave
      ? entrevista.palabras_clave.split("||")
      : [],
    requisitos: entrevista.requisitos ? entrevista.requisitos.split("||") : [],
  };
};

const listarEntrevistas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        e.*,
        emp.nombre_empresa,
        cat.nombre AS categoria,
        (
          SELECT GROUP_CONCAT(p.palabra SEPARATOR '||')
          FROM palabras_clave_entrevistas p
          WHERE p.entrevista_id = e.id
        ) AS palabras_clave,
        (
          SELECT GROUP_CONCAT(r.requisito SEPARATOR '||')
          FROM requisitos_entrevistas r
          WHERE r.entrevista_id = e.id
        ) AS requisitos
      FROM entrevistas e
      INNER JOIN empresas emp ON emp.id = e.empresa_id
      LEFT JOIN categorias_empleo cat ON cat.id = e.categoria_id
      WHERE e.activa = TRUE
        AND e.estado = 'publicada'
      ORDER BY e.fecha_publicacion DESC`
    );

    const entrevistas = rows.map(convertirEntrevista);

    res.json({
      mensaje: "Entrevistas obtenidas correctamente.",
      total: entrevistas.length,
      entrevistas,
    });
  } catch (error) {
    console.error("Error listando entrevistas:", error);

    res.status(500).json({
      mensaje: "Error interno al obtener entrevistas.",
      error: error.message,
    });
  }
};

const obtenerEntrevistaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT
        e.*,
        emp.nombre_empresa,
        cat.nombre AS categoria,
        (
          SELECT GROUP_CONCAT(p.palabra SEPARATOR '||')
          FROM palabras_clave_entrevistas p
          WHERE p.entrevista_id = e.id
        ) AS palabras_clave,
        (
          SELECT GROUP_CONCAT(r.requisito SEPARATOR '||')
          FROM requisitos_entrevistas r
          WHERE r.entrevista_id = e.id
        ) AS requisitos
      FROM entrevistas e
      INNER JOIN empresas emp ON emp.id = e.empresa_id
      LEFT JOIN categorias_empleo cat ON cat.id = e.categoria_id
      WHERE e.id = ?
        AND e.activa = TRUE
        AND e.estado = 'publicada'
      LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: "Entrevista no encontrada.",
      });
    }

    res.json({
      mensaje: "Entrevista obtenida correctamente.",
      entrevista: convertirEntrevista(rows[0]),
    });
  } catch (error) {
    console.error("Error obteniendo entrevista:", error);

    res.status(500).json({
      mensaje: "Error interno al obtener la entrevista.",
      error: error.message,
    });
  }
};

const listarMisEntrevistas = async (req, res) => {
  if (req.usuario.rol !== "empresa") {
    return res.status(403).json({
      mensaje: "Solo las empresas pueden consultar sus entrevistas.",
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

    const [rows] = await pool.query(
      `SELECT
        e.*,
        emp.nombre_empresa,
        cat.nombre AS categoria,
        (
          SELECT GROUP_CONCAT(p.palabra SEPARATOR '||')
          FROM palabras_clave_entrevistas p
          WHERE p.entrevista_id = e.id
        ) AS palabras_clave,
        (
          SELECT GROUP_CONCAT(r.requisito SEPARATOR '||')
          FROM requisitos_entrevistas r
          WHERE r.entrevista_id = e.id
        ) AS requisitos
      FROM entrevistas e
      INNER JOIN empresas emp ON emp.id = e.empresa_id
      LEFT JOIN categorias_empleo cat ON cat.id = e.categoria_id
      WHERE e.empresa_id = ?
        AND e.estado <> 'eliminada'
      ORDER BY e.fecha_publicacion DESC`,
      [empresaId]
    );

    const entrevistas = rows.map(convertirEntrevista);

    res.json({
      mensaje: "Entrevistas de empresa obtenidas correctamente.",
      total: entrevistas.length,
      entrevistas,
    });
  } catch (error) {
    console.error("Error listando entrevistas de empresa:", error);

    res.status(500).json({
      mensaje: "Error interno al obtener las entrevistas de la empresa.",
      error: error.message,
    });
  }
};

const actualizarEntrevista = async (req, res) => {
  if (req.usuario.rol !== "empresa") {
    return res.status(403).json({
      mensaje: "Solo las empresas pueden editar entrevistas.",
    });
  }

  const { id } = req.params;

  const {
    titulo,
    categoria,
    descripcion,
    tipo,
    modalidad,
    ubicacion,
    lugarEntrevista,
    fechaEntrevista,
    horaEntrevista,
    salarioAConvenir,
    salarioMin,
    salarioMax,
    requisitos,
    palabrasClave,
    fechaLimite,
  } = req.body;

  if (
    !titulo ||
    !categoria ||
    !descripcion ||
    !tipo ||
    !modalidad ||
    !ubicacion ||
    !lugarEntrevista ||
    !fechaEntrevista ||
    !horaEntrevista ||
    !fechaLimite
  ) {
    return res.status(400).json({
      mensaje: "Todos los campos obligatorios de la entrevista deben ser enviados.",
    });
  }

  if (descripcion.trim().length < 20) {
    return res.status(400).json({
      mensaje: "La descripción debe tener mínimo 20 caracteres.",
    });
  }

  const tipoNormalizado = normalizarTipo(tipo);
  const modalidadNormalizada = normalizarModalidad(modalidad);

  if (!tipoNormalizado) {
    return res.status(400).json({
      mensaje: "El tipo de entrevista no es válido.",
    });
  }

  if (!modalidadNormalizada) {
    return res.status(400).json({
      mensaje: "La modalidad no es válida.",
    });
  }

  const salarioConvenido = Boolean(salarioAConvenir);

  if (!salarioConvenido) {
    if (!salarioMin || !salarioMax) {
      return res.status(400).json({
        mensaje:
          "Debes enviar salario mínimo y máximo, o marcar salario a convenir.",
      });
    }

    if (Number(salarioMin) > Number(salarioMax)) {
      return res.status(400).json({
        mensaje: "El salario mínimo no puede ser mayor al salario máximo.",
      });
    }
  }

  if (fechaLimite > fechaEntrevista) {
    return res.status(400).json({
      mensaje: "La fecha límite no puede ser posterior a la fecha de entrevista.",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const empresa = await obtenerEmpresaPorUsuario(connection, req.usuario.id);

    if (!empresa) {
      await connection.rollback();

      return res.status(404).json({
        mensaje: "No se encontró el perfil de empresa asociado a este usuario.",
      });
    }

    const [entrevistaExiste] = await connection.query(
      "SELECT id FROM entrevistas WHERE id = ? AND empresa_id = ? AND estado <> 'eliminada' LIMIT 1",
      [id, empresa.id]
    );

    if (entrevistaExiste.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        mensaje: "La entrevista no existe o no pertenece a esta empresa.",
      });
    }

    const categoriaId = await obtenerOCrearCategoria(connection, categoria);

    await connection.query(
      `UPDATE entrevistas
       SET
        categoria_id = ?,
        titulo = ?,
        descripcion = ?,
        tipo = ?,
        modalidad = ?,
        ubicacion = ?,
        lugar_entrevista = ?,
        fecha_entrevista = ?,
        hora_entrevista = ?,
        salario_a_convenir = ?,
        salario_min = ?,
        salario_max = ?,
        fecha_limite = ?
       WHERE id = ?
         AND empresa_id = ?`,
      [
        categoriaId,
        titulo.trim(),
        descripcion.trim(),
        tipoNormalizado,
        modalidadNormalizada,
        ubicacion.trim(),
        lugarEntrevista.trim(),
        fechaEntrevista,
        horaEntrevista,
        salarioConvenido,
        salarioConvenido ? null : Number(salarioMin),
        salarioConvenido ? null : Number(salarioMax),
        fechaLimite,
        id,
        empresa.id,
      ]
    );

    await connection.query(
      "DELETE FROM requisitos_entrevistas WHERE entrevista_id = ?",
      [id]
    );

    await connection.query(
      "DELETE FROM palabras_clave_entrevistas WHERE entrevista_id = ?",
      [id]
    );

    if (Array.isArray(requisitos)) {
      for (const requisito of requisitos) {
        if (requisito && requisito.trim()) {
          await connection.query(
            "INSERT INTO requisitos_entrevistas (entrevista_id, requisito) VALUES (?, ?)",
            [id, requisito.trim()]
          );
        }
      }
    }

    if (Array.isArray(palabrasClave)) {
      for (const palabra of palabrasClave) {
        if (palabra && palabra.trim()) {
          await connection.query(
            "INSERT INTO palabras_clave_entrevistas (entrevista_id, palabra) VALUES (?, ?)",
            [id, palabra.trim().toLowerCase()]
          );
        }
      }
    }

    await connection.commit();

    res.json({
      mensaje: "Entrevista actualizada correctamente.",
      entrevista: {
        id: Number(id),
        titulo,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error actualizando entrevista:", error);

    res.status(500).json({
      mensaje: "Error interno al actualizar la entrevista.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const eliminarEntrevista = async (req, res) => {
  if (req.usuario.rol !== "empresa") {
    return res.status(403).json({
      mensaje: "Solo las empresas pueden eliminar entrevistas.",
    });
  }

  const { id } = req.params;

  try {
    const empresa = await obtenerEmpresaPorUsuario(pool, req.usuario.id);

    if (!empresa) {
      return res.status(404).json({
        mensaje: "No se encontró el perfil de empresa asociado a este usuario.",
      });
    }

    const [resultado] = await pool.query(
      `UPDATE entrevistas
       SET activa = FALSE,
           estado = 'eliminada'
       WHERE id = ?
         AND empresa_id = ?
         AND estado <> 'eliminada'`,
      [id, empresa.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "La entrevista no existe o no pertenece a esta empresa.",
      });
    }

    res.json({
      mensaje: "Entrevista eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando entrevista:", error);

    res.status(500).json({
      mensaje: "Error interno al eliminar la entrevista.",
      error: error.message,
    });
  }
};

module.exports = {
  crearEntrevista,
  listarEntrevistas,
  obtenerEntrevistaPorId,
  listarMisEntrevistas,
  actualizarEntrevista,
  eliminarEntrevista,
};