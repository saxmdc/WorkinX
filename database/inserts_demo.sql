INSERT INTO `categorias_empleo` (`id`, `nombre`, `descripcion`, `activa`, `fecha_creacion`) VALUES
(1, 'Administración', 'Cargos relacionados con apoyo administrativo, archivo y gestión documental.', 1, '2026-06-05 11:01:36'),
(2, 'Logística', 'Cargos relacionados con inventario, bodega y distribución.', 1, '2026-06-05 11:01:36'),
(3, 'Servicio al cliente', 'Cargos relacionados con atención y acompañamiento a usuarios.', 1, '2026-06-05 11:01:36'),
(4, 'Tecnología', 'Cargos relacionados con desarrollo de software, soporte y sistemas.', 1, '2026-06-05 11:01:36'),
(5, 'Diseño', 'Cargos relacionados con diseño gráfico, contenido visual y creatividad.', 1, '2026-06-05 11:01:36'),
(6, 'Comercial', 'Cargos relacionados con ventas, promoción y mercadeo.', 1, '2026-06-05 11:01:36'),
(7, 'Educación', 'Cargos relacionados con formación, tutorías y apoyo educativo.', 1, '2026-06-05 11:01:36'),
(8, 'Salud', 'Cargos relacionados con servicios, apoyo y asistencia en salud.', 1, '2026-06-05 11:01:36'),
(28, 'Tegnología', 'Categoría creada desde publicación de entrevista: Tegnología', 1, '2026-06-10 13:10:53'),
(29, 'Analisis y desarrollo de Software', 'Categoría creada desde publicación de entrevista: Analisis y desarrollo de Software', 1, '2026-06-12 14:17:01');

INSERT INTO `usuarios` (`id`, `nombre_completo`, `correo`, `password_hash`, `rol`, `telefono`, `estado`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Minchu', 'minchu@gmail.com', '$2b$10$Dme44Y8o5x73LqZVRfgIZeQbz6XlyFwr3nkBj6A94WMzWdYXKdiYC', 'candidato', '323525758', 'activo', '2026-06-05 11:03:49', NULL),
(2, 'Samuel Duque', 'sam@gmail.com', '$2b$10$7XhFfL61wneatEjCmr2TfO9680h3rdtlU6jHslt38n4M5N6edEo0u', 'candidato', '3022568951', 'activo', '2026-06-10 12:13:45', NULL),
(3, 'Empresa', 'empresa@gmail.com', '$2b$10$I.p5yKtlnOsHFku/4/7h9uzlRGl0xyhlsg5kJL.AMpPcH0L7xpUWa', 'empresa', '3225420714', 'activo', '2026-06-10 12:14:49', NULL),
(4, 'Example', 'example@gmail.com', '$2b$10$C76zoNt/j2TxZQvAxWFPteamAKQch4qdyAVcMnK3y4pvFXp4Eak9u', 'empresa', '30225684', 'activo', '2026-06-12 12:07:54', NULL),
(5, 'Hector Maya', 'hector2@gmail.com', '$2b$10$1UYJrHtmEQ5AK/32iVaeO.iUN6lJKxvgZqdx6b8mpaHZXKEJgYDaS', 'candidato', '3022785966', 'activo', '2026-06-12 14:13:22', NULL),
(6, 'Sena ejemplo', 'Sena@gmail.com', '$2b$10$csibL5B0jmRv3atiO6oE8e8QpQlA.TbcizgpyCghinPugbkkgSBV.', 'empresa', '325556845', 'activo', '2026-06-12 14:15:06', NULL),
(7, 'Edwyn', 'edwin@gmail.com', '$2b$10$NSPc3dZVv3g8k5.H/lniU.XQNqiy3fqXciEFHi67BprLmicodh.ri', 'candidato', '305264578', 'activo', '2026-06-12 14:29:27', NULL);

INSERT INTO `empresas` (`id`, `usuario_id`, `nombre_empresa`, `descripcion`, `industria`, `sitio_web`, `telefono_contacto`, `direccion`, `rango_empleados`, `clasificacion_empresa`, `tipo_entidad`, `acepta_terminos`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 3, 'Empresa', NULL, 'Software', NULL, '3225420714', 'Cr 48 #12-41', '500+', 'macroempresa', 'privada', 1, '2026-06-10 12:14:49', NULL),
(2, 4, 'Example', NULL, 'Salud', NULL, '30225684', 'Cll. 33B #94-231', '51-200', 'mediana_empresa', 'privada', 1, '2026-06-12 12:07:54', NULL),
(3, 6, 'Sena ejemplo', NULL, 'Software', NULL, '325556845', 'Cll 49 #71-20', '500+', 'macroempresa', 'publica', 1, '2026-06-12 14:15:06', NULL);

INSERT INTO `perfiles_candidatos` (`id`, `usuario_id`, `tipo_documento`, `documento`, `ciudad_residencia`, `categoria_edad`, `acepta_terminos`, `fecha_creacion`) VALUES
(1, 1, 'CC', '1587003559', 'Pereira', 'mayor_edad', 1, '2026-06-05 11:03:49'),
(2, 2, 'CC', '1011398295', 'Medellin', 'mayor_edad', 1, '2026-06-10 12:13:45'),
(3, 5, 'CC', '1011395456', 'El Poblado', 'mayor_edad', 1, '2026-06-12 14:13:22'),
(4, 7, 'CC', '1022458656', 'Santander', 'mayor_edad', 1, '2026-06-12 14:29:27');

INSERT INTO `habilidades` (`id`, `nombre`, `descripcion`, `activa`) VALUES
(1, 'Comunicación', 'Capacidad para expresar ideas con claridad.', 1),
(2, 'Trabajo en equipo', 'Capacidad para colaborar con otras personas.', 1),
(3, 'Responsabilidad', 'Cumplimiento de tareas y compromisos.', 1),
(4, 'Puntualidad', 'Cumplimiento de horarios y tiempos establecidos.', 1),
(5, 'Atención al cliente', 'Habilidad para orientar y atender usuarios.', 1),
(6, 'Ventas', 'Habilidad para promocionar y vender productos o servicios.', 1),
(7, 'JavaScript', 'Conocimiento del lenguaje JavaScript.', 1),
(8, 'React', 'Conocimiento de interfaces con React.', 1),
(9, 'Organización', 'Capacidad para ordenar información, tareas o recursos.', 1),
(10, 'Creatividad', 'Capacidad para generar ideas y soluciones visuales o funcionales.', 1);

INSERT INTO `entrevistas` (`id`, `empresa_id`, `categoria_id`, `titulo`, `descripcion`, `tipo`, `modalidad`, `ubicacion`, `lugar_entrevista`, `fecha_entrevista`, `hora_entrevista`, `salario_a_convenir`, `salario_min`, `salario_max`, `fecha_publicacion`, `fecha_edicion`, `fecha_limite`, `activa`, `vistas`, `estado`) VALUES
(20, 1, 28, 'Desarrollador de Software', 'Ayuda quiero corregir el error que tenía por favor funciona', 'primer_empleo', 'presencial', 'Medellín, Antiquia', 'Cr 95# 192-12', '2026-06-30', '14:00:00', 1, NULL, NULL, '2026-06-10 13:10:53', NULL, '2026-06-15', 0, 0, 'pausada'),
(21, 3, 29, 'Instructor SENA', 'Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'profesional', 'presencial', 'Medellín, Antiquia', 'SENA pedregal', '2026-06-15', '14:00:00', 1, NULL, NULL, '2026-06-12 14:17:01', NULL, '2026-06-13', 1, 0, 'publicada');

INSERT INTO `palabras_clave_entrevistas` (`id`, `entrevista_id`, `palabra`) VALUES
(1, 20, 'exampleexampleexample'),
(2, 21, 'enseñar');

INSERT INTO `postulaciones` (`id`, `entrevista_id`, `usuario_id`, `mensaje`, `cv_path`, `estado`, `fecha_postulacion`, `fecha_actualizacion`) VALUES
(1, 21, 5, 'Quiero que me contrate, por favor.', 'C:/Users/hp pavilon/Documents/WorkInX/backend/uploads/cv/1781274436946_cv_prueba.pdf', 'aceptado', '2026-06-12 14:27:16', '2026-06-12 14:30:35'),
(2, 21, 7, 'Ejmeplooooof', 'C:/Users/hp pavilon/Documents/WorkInX/backend/uploads/cv/1781274611325_Caso_Sandra__Gesti__n_de_Riesgos_UCI.pdf', 'pendiente', '2026-06-12 14:30:11', '2026-06-12 14:31:36');

INSERT INTO `reportes_entrevistas` (`id`, `entrevista_id`, `usuario_id`, `tipo_reporte`, `descripcion`, `evidencia`, `estado`, `fecha_reporte`, `fecha_resolucion`, `administrador_id`, `notas_administrador`) VALUES
(1, 20, 2, 'fraude', 'La entrevista es sospechosa ya que busca estafar y robar gente', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'pendiente', '2026-06-12 04:01:57', NULL, NULL, NULL),
(2, 20, 4, 'informacion_falsa', 'Tin del tan del tun y del ton', 'Saldkdaokdow', 'pendiente', '2026-06-12 12:08:38', NULL, NULL, NULL),
(3, 20, 5, 'contenido_inapropiado', 'jjjjjjjjjjjjjjjjjjjjjjjjjjjj', 'timss', 'pendiente', '2026-06-12 14:41:03', NULL, NULL, NULL),
(4, 21, 5, 'spam', 'aaaaaaaaaaa', 'dd', 'pendiente', '2026-06-12 14:41:29', NULL, NULL, NULL);

INSERT INTO `requisitos_entrevistas` (`id`, `entrevista_id`, `requisito`, `fecha_creacion`) VALUES
(1, 20, 'Primer empleo', '2026-06-10 13:10:53'),
(2, 20, 'no se', '2026-06-10 13:10:53'),
(3, 20, 'Ingles', '2026-06-10 13:10:53'),
(4, 21, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '2026-06-12 14:17:01');
