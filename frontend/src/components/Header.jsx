import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { BriefcaseBusiness, UserRound, LogOut } from "lucide-react";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const esPaginaEntrevistas = location.pathname.startsWith("/entrevistas");

  const token = localStorage.getItem("workinx_token");
  const usuarioGuardado = localStorage.getItem("workinx_usuario");
  const usuarioActivo = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  const rutaPerfil = usuarioActivo?.ruta_perfil || "/perfil/usuario";

  useEffect(() => {
    const cambiarHeader = () => {
      setScrolled(window.scrollY > 60);
    };

    cambiarHeader();

    window.addEventListener("scroll", cambiarHeader);

    return () => {
      window.removeEventListener("scroll", cambiarHeader);
    };
  }, [location.pathname]);

  const cerrarSesion = () => {
    localStorage.removeItem("workinx_token");
    localStorage.removeItem("workinx_usuario");
    localStorage.removeItem("workinx_postulaciones");

    navigate("/login");
  };

  const claseHeader = `
    header
    ${scrolled ? "header-scrolled" : ""}
    ${!scrolled && esPaginaEntrevistas ? "header-light" : ""}
    ${!scrolled && !esPaginaEntrevistas ? "header-home" : ""}
  `;

  return (
    <header className={claseHeader}>
      <Link to="/" className="logo">
        <BriefcaseBusiness size={30} />
        <span>WorkInX</span>
      </Link>

      <nav className="nav">
        <Link to="/">Inicio</Link>
        <a href="/#quienes-somos">Quiénes somos</a>
        <a href="/#mision-vision">Misión y visión</a>
        <Link to="/entrevistas">Entrevistas</Link>

        {!token ? (
          <>
            <Link to="/login">Iniciar sesión</Link>

            <Link to="/registro" className="nav-button">
              Registrarse
            </Link>
          </>
        ) : (
          <>
            <Link to={rutaPerfil} className="profile-button">
              <UserRound size={18} />
              Mi perfil
            </Link>

            <button
              type="button"
              className="logout-button"
              onClick={cerrarSesion}
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;