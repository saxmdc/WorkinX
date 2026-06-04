const express = require("express");
const { crearReporte } = require("../controllers/reportes.controller");
const verificarToken = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", verificarToken, crearReporte);

module.exports = router;