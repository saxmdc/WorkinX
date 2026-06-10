import { Routes, Route } from "react-router";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import RegistroEmpresa from "./pages/RegistroEmpresa";
import RegistroUsuario from "./pages/RegistroUsuario";
import Entrevistas from "./pages/Entrevistas";
import DetalleEntrevista from "./pages/DetalleEntrevista";
import PerfilEmpresa from "./pages/PerfilEmpresa";
import PerfilUsuario from "./pages/PerfilUsuario";

function App() {
  return (
    <>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/registro/empresa" element={<RegistroEmpresa />} />
          <Route path="/registro/usuario" element={<RegistroUsuario />} />
          <Route path="/entrevistas" element={<Entrevistas />} />
          <Route path="/entrevistas/:id" element={<DetalleEntrevista />} />
          <Route path="/perfil/empresa" element={<PerfilEmpresa />} />
          <Route path="/perfil/usuario" element={<PerfilUsuario />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;