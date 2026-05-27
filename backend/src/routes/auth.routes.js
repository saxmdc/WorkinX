const express = require("express");
const {
  registrarCandidato,
  registrarEmpresa,
  loginUsuario,
  obtenerPerfil,
} = require("../controllers/auth.controller");

const verificarToken = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/registro-candidato", registrarCandidato);
router.post("/registro-empresa", registrarEmpresa);
router.post("/login", loginUsuario);

router.get("/perfil", verificarToken, obtenerPerfil);

module.exports = router;