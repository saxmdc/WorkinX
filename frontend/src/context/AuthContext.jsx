import { createContext, useState, useEffect, useMemo } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("workinx_token"));
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("workinx_usuario");
    if (!guardado) return null;
    try {
      return JSON.parse(guardado);
    } catch {
      return null;
    }
  });

  const login = (nuevoToken, nuevoUsuario) => {
    localStorage.setItem("workinx_token", nuevoToken);
    localStorage.setItem("workinx_usuario", JSON.stringify(nuevoUsuario));
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  };

  const logout = () => {
    localStorage.removeItem("workinx_token");
    localStorage.removeItem("workinx_usuario");
    localStorage.removeItem("workinx_postulaciones");
    setToken(null);
    setUsuario(null);
  };

  const actualizarUsuario = (datosActualizados) => {
    setUsuario((prev) => {
      const actual = { ...prev, ...datosActualizados };
      localStorage.setItem("workinx_usuario", JSON.stringify(actual));
      return actual;
    });
  };

  const rutaPerfil = useMemo(() => {
    if (!usuario) return "/login";
    if (usuario.ruta_perfil) return usuario.ruta_perfil;
    if (usuario.rol === "empresa") return "/perfil/empresa";
    if (usuario.rol === "admin") return "/admin";
    return "/perfil/usuario";
  }, [usuario]);

  const value = useMemo(
    () => ({
      token,
      usuario,
      isAuthenticated: Boolean(token),
      esCandidato: usuario?.rol === "candidato",
      esEmpresa: usuario?.rol === "empresa",
      rutaPerfil,
      login,
      logout,
      actualizarUsuario,
    }),
    [token, usuario, rutaPerfil]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
