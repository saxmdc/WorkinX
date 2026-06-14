import { BriefcaseBusiness, Mail, MapPin, Phone } from "lucide-react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <BriefcaseBusiness size={30} />
            <span>WorkInX</span>
          </div>

          <p>
            Plataforma enfocada en conectar a jóvenes, personas sin experiencia
            y empresas mediante entrevistas laborales accesibles y organizadas.
          </p>
        </div>

        <div className="footer-column">
          <h3>Navegación</h3>
          <a href="#inicio">Inicio</a>
          <a href="#quienes-somos">Quiénes somos</a>
          <a href="#mision-vision">Misión y visión</a>
          <a href="/entrevistas">Entrevistas</a>
        </div>

        <div className="footer-column">
          <h3>Contacto</h3>

          <p>
            <Mail size={18} />
            contacto@workinx.com
          </p>

          <p>
            <Phone size={18} />
            +57 300 000 0000
          </p>

          <p>
            <MapPin size={18} />
            Medellín, Colombia
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 WorkInX. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;