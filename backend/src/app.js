const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.json({
    mensaje: "Backend de WorkInX funcionando correctamente",
  });
});

const testRoutes = require("./routes/test.routes");
const authRoutes = require("./routes/auth.routes");
const entrevistasRoutes = require("./routes/entrevistas.routes");
const reportesRoutes = require("./routes/reportes.routes");
const postulacionesRoutes = require("./routes/postulaciones.routes");

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/entrevistas", entrevistasRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/postulaciones", postulacionesRoutes);

module.exports = app;