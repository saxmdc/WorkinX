const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      mensaje: "No autorizado. Debes iniciar sesión.",
    });
  }

  const partes = authorization.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({
      mensaje: "Formato de token inválido.",
    });
  }

  const token = partes[1];

  try {
    const usuarioDecodificado = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = usuarioDecodificado;

    next();
  } catch (error) {
    return res.status(401).json({
      mensaje: "Token inválido o expirado. Inicia sesión nuevamente.",
    });
  }
};

module.exports = verificarToken;