const express = require("express");
const {
  crearEntrevista,
  listarEntrevistas,
  obtenerEntrevistaPorId,
  listarMisEntrevistas,
  actualizarEntrevista,
  eliminarEntrevista,
} = require("../controllers/entrevistas.controller");
const verificarToken = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", listarEntrevistas);
router.get("/empresa/mis-entrevistas", verificarToken, listarMisEntrevistas);
router.get("/:id", obtenerEntrevistaPorId);

router.post("/", verificarToken, crearEntrevista);
router.put("/:id", verificarToken, actualizarEntrevista);
router.delete("/:id", verificarToken, eliminarEntrevista);

module.exports = router;