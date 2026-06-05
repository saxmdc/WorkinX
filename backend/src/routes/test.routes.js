const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS base_datos");

    res.json({
      mensaje: "Conexión a MySQL exitosa",
      base_datos: rows[0].base_datos,
    });
  } catch (error) {
    console.error("Error conectando a MySQL:", error);

    res.status(500).json({
      mensaje: "Error conectando a MySQL",
      error: error.message,
    });
  }
});

module.exports = router;