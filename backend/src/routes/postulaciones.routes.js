const express = require("express");
const {
  crearPostulacion,
  listarMisPostulaciones,
  listarPostulacionesPorEntrevista,
  actualizarEstadoPostulacion,
} = require("../controllers/postulaciones.controller");
const verificarToken = require("../middlewares/auth.middleware");
const uploadCV = require("../middlewares/upload.middleware");

const router = express.Router();

router.get("/mis-postulaciones", verificarToken, listarMisPostulaciones);

router.get(
  "/entrevista/:id",
  verificarToken,
  listarPostulacionesPorEntrevista
);

router.put("/:id/estado", verificarToken, actualizarEstadoPostulacion);

router.post("/", verificarToken, uploadCV.single("cv"), crearPostulacion);

module.exports = router;