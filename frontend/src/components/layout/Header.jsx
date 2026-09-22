import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { BriefcaseBusiness, UserRound, LogOut, Bell, CheckCheck, Info } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { notificacionesService } from "../../services/notificaciones.service";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, rutaPerfil, logout } = useAuth();

  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const notifRef = useRef(null);

  const esPaginaEntrevistas = location.pathname.startsWith("/entrevistas");

  const cargarNotificaciones = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificacionesService.obtenerMisNotificaciones();
      setNotificaciones(res.notificaciones || []);
      setNoLeidas(res.noLeidas || 0);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
    // Opcional: recargar cada X tiempo, o simplemente al montar
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    const cambiarHeader = () => {
      setScrolled(window.scrollY > 60);
    };

    cambiarHeader();
    window.addEventListener("scroll", cambiarHeader);

    const handleClickFuera = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setMostrarNotificaciones(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);

    return () => {
      window.removeEventListener("scroll", cambiarHeader);
      document.removeEventListener("mousedown", handleClickFuera);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const marcarComoLeida = async (id, yaLeida) => {
    if (yaLeida) return;
    try {
      await notificacionesService.marcarComoLeida(id);
      cargarNotificaciones();
    } catch (error) {
      console.error(error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      await notificacionesService.marcarTodasComoLeidas();
      cargarNotificaciones();
    } catch (error) {
      console.error(error);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
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
        <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">
          Directorio Empresas (JPA)
        </a>

        {!isAuthenticated ? (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/registro" className="nav-button">
              Registrarse
            </Link>
          </>
        ) : (
          <>
            <div className="notificaciones-container" ref={notifRef}>
              <button 
                type="button" 
                className="bell-button" 
                onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
              >
                <Bell size={20} />
                {noLeidas > 0 && <span className="notif-badge">{noLeidas}</span>}
              </button>

              {mostrarNotificaciones && (
                <div className="notificaciones-dropdown">
                  <div className="notif-header">
                    <h4>Notificaciones</h4>
                    {noLeidas > 0 && (
                      <button type="button" className="btn-read-all" onClick={marcarTodasComoLeidas}>
                        <CheckCheck size={14} /> Marcar todas como leídas
                      </button>
                    )}
                  </div>
                  
                  <div className="notif-body">
                    {notificaciones.length === 0 ? (
                      <div className="notif-empty">
                        <Info size={24} />
                        <p>No tienes notificaciones aún.</p>
                      </div>
                    ) : (
                      notificaciones.map(n => (
                        <div 
                          key={n.id} 
                          className={`notif-item ${!n.leida ? 'notif-unread' : ''}`}
                          onClick={() => marcarComoLeida(n.id, n.leida)}
                        >
                          {!n.leida && <span className="notif-dot"></span>}
                          <div className="notif-content">
                            <strong>{n.titulo}</strong>
                            <p>{n.mensaje}</p>
                            <small>{formatearFecha(n.fecha_creacion)}</small>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to={rutaPerfil} className="profile-button">
              <UserRound size={18} />
              Mi perfil
            </Link>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
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
