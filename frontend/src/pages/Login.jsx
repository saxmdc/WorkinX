import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, LockKeyhole, LogIn, UserPlus, Building2 } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (event) => {
    event.preventDefault();

    setMensajeError("");
    setCargando(true);

    const datos = new FormData(event.target);

    const usuario = {
      correo: datos.get("correo"),
      password: datos.get("password"),
    };

    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setMensajeError(resultado.mensaje || "No se pudo iniciar sesión.");
        setCargando(false);
        return;
      }

      localStorage.setItem("workinx_token", resultado.token);
      localStorage.setItem("workinx_usuario", JSON.stringify(resultado.usuario));

      navigate(resultado.usuario.ruta_perfil);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      setMensajeError(
        "No se pudo conectar con el servidor. Verifica que el backend esté encendido."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="login-page">
      <div className="login-container">
        <div className="login-info">
          <p className="section-tag">Acceso a WorkInX</p>

          <h1>Inicia sesión y continúa buscando oportunidades laborales.</h1>

          <p>
            Accede a tu cuenta para buscar entrevistas, revisar oportunidades,
            postularte y mantener actualizado tu perfil profesional.
          </p>

          <div className="login-benefits">
            <div>
              <UserPlus size={24} />
              <span>Perfil candidato</span>
            </div>

            <div>
              <Building2 size={24} />
              <span>Acceso empresas</span>
            </div>

            <div>
              <LogIn size={24} />
              <span>Ingreso seguro</span>
            </div>
          </div>
        </div>

        <div className="login-card">
          <h2>Iniciar sesión</h2>

          <p className="auth-subtitle">
            Ingresa tus datos para acceder a WorkInX.
          </p>

          <form onSubmit={manejarLogin} className="auth-form">
            <label>
              Correo electrónico
              <div className="input-group">
                <Mail size={20} />
                <input
                  type="email"
                  name="correo"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
            </label>

            <label>
              Contraseña
              <div className="input-group">
                <LockKeyhole size={20} />
                <input
                  type="password"
                  name="password"
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>
            </label>

            {mensajeError && <p className="form-error">{mensajeError}</p>}

            <button type="submit" className="auth-button" disabled={cargando}>
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="auth-link">
            ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;