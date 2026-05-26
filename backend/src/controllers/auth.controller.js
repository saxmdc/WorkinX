const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const validarPassword = (password) => {
  const minimo = password.length >= 8;
  const mayuscula = /[A-ZÁÉÍÓÚÑ]/.test(password);
  const numero = /[0-9]/.test(password);
  const especial = /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/.test(password);

  return minimo && mayuscula && numero && especial;
};

const validarDocumento = (tipoDocumento, documento) => {
  if (!/^[0-9]+$/.test(documento)) return false;

  if (tipoDocumento === "TI") return documento.length === 10;
  if (tipoDocumento === "CC") return documento.length >= 6 && documento.length <= 10;
  if (tipoDocumento === "CE") return documento.length >= 6 && documento.length <= 7;
  if (tipoDocumento === "PPT") return documento.length === 7;

  return false;
};

const obtenerCategoriaEdad = (edadRango) => {
  if (edadRango === "-17" || edadRango === "menor_edad") return "menor_edad";
  if (edadRango === "+18" || edadRango === "mayor_edad") return "mayor_edad";
  return null;
};

const obtenerTipoEntidad = (tipoEntidad) => {
  if (!tipoEntidad) return null;

  const valor = tipoEntidad
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (valor === "publica") return "publica";
  if (valor === "privada") return "privada";

  return null;
};

const obtenerClasificacionEmpresa = (rangoEmpleados) => {
  const clasificaciones = {
    "1-10": "microempresa",
    "11-50": "pequena_empresa",
    "51-200": "mediana_empresa",
    "201-500": "gran_empresa",
    "500+": "macroempresa",
  };

  return clasificaciones[rangoEmpleados] || null;
};

const registrarCandidato = async (req, res) => {
  const {
    nombre_completo,
    nombreCompleto,
    tipo_documento,
    tipoDocumento,
    documento,
    correo,
    password,
    telefono,
    ciudad_residencia,
    ciudad,
    edad_rango,
    edadRango,
    acepta_terminos,
    aceptaTerminos,
  } = req.body;

  const nombreFinal = nombre_completo || nombreCompleto;
  const tipoDocumentoFinal = tipo_documento || tipoDocumento;
  const ciudadFinal = ciudad_residencia || ciudad;
  const edadRangoFinal = edad_rango || edadRango;
  const aceptaTerminosFinal = acepta_terminos ?? aceptaTerminos;

  if (
    !nombreFinal ||
    !tipoDocumentoFinal ||
    !documento ||
    !correo ||
    !password ||
    !telefono ||
    !ciudadFinal ||
    !edadRangoFinal
  ) {
    return res.status(400).json({
      mensaje: "Todos los campos obligatorios deben ser enviados.",
    });
  }

  if (!aceptaTerminosFinal) {
    return res.status(400).json({
      mensaje: "Debes aceptar los términos y condiciones.",
    });
  }

  if (!validarPassword(password)) {
    return res.status(400).json({
      mensaje:
        "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.",
    });
  }

  if (!validarDocumento(tipoDocumentoFinal, documento)) {
    return res.status(400).json({
      mensaje: "El documento no cumple la cantidad de dígitos requerida para el tipo seleccionado.",
    });
  }

  const categoriaEdad = obtenerCategoriaEdad(edadRangoFinal);

  if (!categoriaEdad) {
    return res.status(400).json({
      mensaje: "La categoría de edad no es válida.",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [correoExiste] = await connection.query(
      "SELECT id FROM usuarios WHERE correo = ? LIMIT 1",
      [correo]
    );

    if (correoExiste.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        mensaje: "El correo ya está registrado.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [usuarioResult] = await connection.query(
      `INSERT INTO usuarios 
        (nombre_completo, correo, password_hash, rol, telefono)
       VALUES (?, ?, ?, 'candidato', ?)`,
      [nombreFinal, correo, passwordHash, telefono]
    );

    const usuarioId = usuarioResult.insertId;

    await connection.query(
      `INSERT INTO perfiles_candidatos
        (usuario_id, tipo_documento, documento, ciudad_residencia, categoria_edad, acepta_terminos)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        tipoDocumentoFinal,
        documento,
        ciudadFinal,
        categoriaEdad,
        aceptaTerminosFinal,
      ]
    );

    await connection.commit();

    res.status(201).json({
      mensaje: "Candidato registrado correctamente.",
      usuario: {
        id: usuarioId,
        nombre_completo: nombreFinal,
        correo,
        rol: "candidato",
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error registrando candidato:", error);

    res.status(500).json({
      mensaje: "Error interno al registrar candidato.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const registrarEmpresa = async (req, res) => {
  const {
    nombre_empresa,
    nombre,
    correo,
    password,
    telefono_contacto,
    telefono,
    direccion,
    industria,
    descripcion,
    sitio_web,
    rango_empleados,
    numero_empleados_rango,
    tipo_entidad,
    tipoEntidad,
    acepta_terminos,
    aceptaTerminos,
  } = req.body;

  const nombreEmpresaFinal = nombre_empresa || nombre;
  const telefonoFinal = telefono_contacto || telefono;
  const rangoEmpleadosFinal = rango_empleados || numero_empleados_rango;
  const tipoEntidadFinal = obtenerTipoEntidad(tipo_entidad || tipoEntidad);
  const clasificacionEmpresa = obtenerClasificacionEmpresa(rangoEmpleadosFinal);
  const aceptaTerminosFinal = acepta_terminos ?? aceptaTerminos;

  if (
    !nombreEmpresaFinal ||
    !correo ||
    !password ||
    !telefonoFinal ||
    !direccion ||
    !industria ||
    !rangoEmpleadosFinal ||
    !tipoEntidadFinal
  ) {
    return res.status(400).json({
      mensaje: "Todos los campos obligatorios de empresa deben ser enviados.",
    });
  }

  if (!aceptaTerminosFinal) {
    return res.status(400).json({
      mensaje: "Debes aceptar los términos y condiciones.",
    });
  }

  if (!clasificacionEmpresa) {
    return res.status(400).json({
      mensaje: "El rango de empleados no es válido.",
    });
  }

  if (!validarPassword(password)) {
    return res.status(400).json({
      mensaje:
        "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [correoExiste] = await connection.query(
      "SELECT id FROM usuarios WHERE correo = ? LIMIT 1",
      [correo]
    );

    if (correoExiste.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        mensaje: "El correo ya está registrado.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [usuarioResult] = await connection.query(
      `INSERT INTO usuarios 
        (nombre_completo, correo, password_hash, rol, telefono)
       VALUES (?, ?, ?, 'empresa', ?)`,
      [nombreEmpresaFinal, correo, passwordHash, telefonoFinal]
    );

    const usuarioId = usuarioResult.insertId;

    const [empresaResult] = await connection.query(
      `INSERT INTO empresas
        (
          usuario_id,
          nombre_empresa,
          descripcion,
          industria,
          sitio_web,
          telefono_contacto,
          direccion,
          rango_empleados,
          clasificacion_empresa,
          tipo_entidad,
          acepta_terminos
        )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        nombreEmpresaFinal,
        descripcion || null,
        industria,
        sitio_web || null,
        telefonoFinal,
        direccion,
        rangoEmpleadosFinal,
        clasificacionEmpresa,
        tipoEntidadFinal,
        aceptaTerminosFinal,
      ]
    );

    await connection.commit();

    res.status(201).json({
      mensaje: "Empresa registrada correctamente.",
      usuario: {
        id: usuarioId,
        nombre_completo: nombreEmpresaFinal,
        correo,
        rol: "empresa",
      },
      empresa: {
        id: empresaResult.insertId,
        nombre_empresa: nombreEmpresaFinal,
        rango_empleados: rangoEmpleadosFinal,
        clasificacion_empresa: clasificacionEmpresa,
        tipo_entidad: tipoEntidadFinal,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error registrando empresa:", error);

    res.status(500).json({
      mensaje: "Error interno al registrar empresa.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const loginUsuario = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({
      mensaje: "Correo y contraseña son obligatorios.",
    });
  }

  try {
    const [usuarios] = await pool.query(
      `SELECT id, nombre_completo, correo, password_hash, rol, estado
       FROM usuarios
       WHERE correo = ?
       LIMIT 1`,
      [correo]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos.",
      });
    }

    const usuario = usuarios[0];

    if (usuario.estado !== "activo") {
      return res.status(403).json({
        mensaje: "La cuenta no está activa.",
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos.",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    let rutaPerfil = "/perfil/usuario";

    if (usuario.rol === "empresa") {
      rutaPerfil = "/perfil/empresa";
    }

    if (usuario.rol === "admin") {
      rutaPerfil = "/admin";
    }

    res.json({
      mensaje: "Login exitoso.",
      token,
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        rol: usuario.rol,
        ruta_perfil: rutaPerfil,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);

    res.status(500).json({
      mensaje: "Error interno al iniciar sesión.",
      error: error.message,
    });
  }
};

const obtenerPerfil = async (req, res) => {
  const usuarioId = req.usuario.id;
  const rol = req.usuario.rol;

  try {
    if (rol === "candidato") {
      const [rows] = await pool.query(
        `SELECT 
          u.id,
          u.nombre_completo,
          u.correo,
          u.telefono,
          u.rol,
          u.estado,
          pc.tipo_documento,
          pc.documento,
          pc.ciudad_residencia,
          pc.categoria_edad,
          pc.acepta_terminos
        FROM usuarios u
        INNER JOIN perfiles_candidatos pc ON pc.usuario_id = u.id
        WHERE u.id = ?
        LIMIT 1`,
        [usuarioId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          mensaje: "Perfil de candidato no encontrado.",
        });
      }

      return res.json({
        mensaje: "Perfil obtenido correctamente.",
        tipo_perfil: "candidato",
        perfil: rows[0],
      });
    }

    if (rol === "empresa") {
      const [rows] = await pool.query(
        `SELECT 
          u.id AS usuario_id,
          u.nombre_completo,
          u.correo,
          u.telefono,
          u.rol,
          u.estado,
          e.id AS empresa_id,
          e.nombre_empresa,
          e.descripcion,
          e.industria,
          e.sitio_web,
          e.telefono_contacto,
          e.direccion,
          e.rango_empleados,
          e.clasificacion_empresa,
          e.tipo_entidad,
          e.acepta_terminos
        FROM usuarios u
        INNER JOIN empresas e ON e.usuario_id = u.id
        WHERE u.id = ?
        LIMIT 1`,
        [usuarioId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          mensaje: "Perfil de empresa no encontrado.",
        });
      }

      return res.json({
        mensaje: "Perfil obtenido correctamente.",
        tipo_perfil: "empresa",
        perfil: rows[0],
      });
    }

    return res.status(403).json({
      mensaje: "Rol no autorizado para consultar perfil.",
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);

    res.status(500).json({
      mensaje: "Error interno al obtener el perfil.",
      error: error.message,
    });
  }
};

module.exports = {
  registrarCandidato,
  registrarEmpresa,
  loginUsuario,
  obtenerPerfil,
};