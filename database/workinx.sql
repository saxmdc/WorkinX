SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `categorias_empleo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `empresas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `nombre_empresa` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `industria` varchar(100) NOT NULL,
  `sitio_web` varchar(200) DEFAULT NULL,
  `telefono_contacto` varchar(20) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `rango_empleados` enum('1-10','11-50','51-200','201-500','500+') NOT NULL,
  `clasificacion_empresa` enum('microempresa','pequena_empresa','mediana_empresa','gran_empresa','macroempresa') NOT NULL,
  `tipo_entidad` enum('publica','privada') NOT NULL,
  `acepta_terminos` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `entrevistas` (
  `id` int(11) NOT NULL,
  `empresa_id` int(11) NOT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `tipo` enum('primer_empleo','profesional','emprendedor') NOT NULL,
  `modalidad` enum('presencial','remoto','hibrido') NOT NULL,
  `ubicacion` varchar(150) NOT NULL,
  `lugar_entrevista` varchar(250) NOT NULL,
  `fecha_entrevista` date NOT NULL,
  `hora_entrevista` time NOT NULL,
  `salario_a_convenir` tinyint(1) NOT NULL DEFAULT 0,
  `salario_min` decimal(12,2) DEFAULT NULL,
  `salario_max` decimal(12,2) DEFAULT NULL,
  `fecha_publicacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_edicion` timestamp NULL DEFAULT NULL,
  `fecha_limite` date NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `vistas` int(11) NOT NULL DEFAULT 0,
  `estado` enum('publicada','pausada','cerrada','eliminada') NOT NULL DEFAULT 'publicada'
);

CREATE TABLE `habilidades` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `habilidades_usuarios` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `habilidad_id` int(11) NOT NULL,
  `nivel` enum('basico','intermedio','avanzado','experto') NOT NULL DEFAULT 'basico',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mensajes` (
  `id` int(11) NOT NULL,
  `de_usuario_id` int(11) NOT NULL,
  `para_usuario_id` int(11) NOT NULL,
  `entrevista_id` int(11) DEFAULT NULL,
  `asunto` varchar(150) NOT NULL,
  `mensaje` text NOT NULL,
  `leido` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_envio` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `palabras_clave_entrevistas` (
  `id` int(11) NOT NULL,
  `entrevista_id` int(11) NOT NULL,
  `palabra` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `perfiles_candidatos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo_documento` enum('CC','TI','CE','PPT') NOT NULL,
  `documento` varchar(20) NOT NULL,
  `ciudad_residencia` varchar(100) NOT NULL,
  `categoria_edad` enum('menor_edad','mayor_edad') NOT NULL,
  `acepta_terminos` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
);

CREATE TABLE `postulaciones` (
  `id` int(11) NOT NULL,
  `entrevista_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `mensaje` text DEFAULT NULL,
  `cv_path` varchar(255) NOT NULL,
  `estado` enum('pendiente','revisado','aceptado','rechazado','retirado') NOT NULL DEFAULT 'pendiente',
  `fecha_postulacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reportes_entrevistas` (
  `id` int(11) NOT NULL,
  `entrevista_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `tipo_reporte` enum('fraude','informacion_falsa','contenido_inapropiado','spam','otro') NOT NULL,
  `descripcion` text NOT NULL,
  `evidencia` text DEFAULT NULL,
  `estado` enum('pendiente','en_revision','resuelto','rechazado') NOT NULL DEFAULT 'pendiente',
  `fecha_reporte` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_resolucion` timestamp NULL DEFAULT NULL,
  `administrador_id` int(11) DEFAULT NULL,
  `notas_administrador` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `requisitos_entrevistas` (
  `id` int(11) NOT NULL,
  `entrevista_id` int(11) NOT NULL,
  `requisito` text NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `trazabilidad` (
  `id` int(11) NOT NULL,
  `tabla_afectada` varchar(80) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `id_registro_afectado` int(11) NOT NULL,
  `valores_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`valores_anteriores`)),
  `valores_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`valores_nuevos`)),
  `usuario_id` int(11) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre_completo` varchar(120) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('candidato','empresa','admin') NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `estado` enum('activo','inactivo','bloqueado') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `vw_entrevistas_publicas`;
CREATE SQL SECURITY DEFINER VIEW `vw_entrevistas_publicas` AS SELECT `e`.`id` AS `id`, `e`.`titulo` AS `titulo`, `e`.`descripcion` AS `descripcion`, `e`.`tipo` AS `tipo`, `e`.`modalidad` AS `modalidad`, `e`.`ubicacion` AS `ubicacion`, `e`.`lugar_entrevista` AS `lugar_entrevista`, `e`.`fecha_entrevista` AS `fecha_entrevista`, `e`.`hora_entrevista` AS `hora_entrevista`, `e`.`salario_a_convenir` AS `salario_a_convenir`, `e`.`salario_min` AS `salario_min`, `e`.`salario_max` AS `salario_max`, `e`.`fecha_publicacion` AS `fecha_publicacion`, `e`.`fecha_edicion` AS `fecha_edicion`, `e`.`fecha_limite` AS `fecha_limite`, `e`.`activa` AS `activa`, `e`.`estado` AS `estado`, `emp`.`nombre_empresa` AS `nombre_empresa`, `emp`.`tipo_entidad` AS `tipo_entidad`, `emp`.`clasificacion_empresa` AS `clasificacion_empresa`, `cat`.`nombre` AS `categoria` FROM ((`entrevistas` `e` join `empresas` `emp` on(`emp`.`id` = `e`.`empresa_id`)) left join `categorias_empleo` `cat` on(`cat`.`id` = `e`.`categoria_id`)) WHERE `e`.`activa` = 1 AND `e`.`estado` = 'publicada';

DROP TABLE IF EXISTS `vw_postulaciones_detalladas`;
CREATE SQL SECURITY DEFINER VIEW `vw_postulaciones_detalladas` AS SELECT `p`.`id` AS `id`, `p`.`estado` AS `estado`, `p`.`fecha_postulacion` AS `fecha_postulacion`, `p`.`cv_path` AS `cv_path`, `p`.`mensaje` AS `mensaje`, `u`.`nombre_completo` AS `candidato`, `u`.`correo` AS `correo_candidato`, `pc`.`tipo_documento` AS `tipo_documento`, `pc`.`documento` AS `documento`, `pc`.`ciudad_residencia` AS `ciudad_residencia`, `pc`.`categoria_edad` AS `categoria_edad`, `e`.`titulo` AS `entrevista`, `emp`.`nombre_empresa` AS `nombre_empresa` FROM ((((`postulaciones` `p` join `usuarios` `u` on(`u`.`id` = `p`.`usuario_id`)) join `perfiles_candidatos` `pc` on(`pc`.`usuario_id` = `u`.`id`)) join `entrevistas` `e` on(`e`.`id` = `p`.`entrevista_id`)) join `empresas` `emp` on(`emp`.`id` = `e`.`empresa_id`));

ALTER TABLE `categorias_empleo` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `nombre` (`nombre`);
ALTER TABLE `empresas` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `usuario_id` (`usuario_id`);
ALTER TABLE `entrevistas` ADD PRIMARY KEY (`id`);
ALTER TABLE `habilidades` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `nombre` (`nombre`);
ALTER TABLE `habilidades_usuarios` ADD PRIMARY KEY (`id`);
ALTER TABLE `mensajes` ADD PRIMARY KEY (`id`);
ALTER TABLE `palabras_clave_entrevistas` ADD PRIMARY KEY (`id`);
ALTER TABLE `perfiles_candidatos` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `usuario_id` (`usuario_id`);
ALTER TABLE `postulaciones` ADD PRIMARY KEY (`id`);
ALTER TABLE `reportes_entrevistas` ADD PRIMARY KEY (`id`);
ALTER TABLE `requisitos_entrevistas` ADD PRIMARY KEY (`id`);
ALTER TABLE `trazabilidad` ADD PRIMARY KEY (`id`);
ALTER TABLE `usuarios` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `correo` (`correo`);

ALTER TABLE `categorias_empleo` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `empresas` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `entrevistas` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `habilidades` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `habilidades_usuarios` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `mensajes` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `palabras_clave_entrevistas` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `perfiles_candidatos` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `postulaciones` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `reportes_entrevistas` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `requisitos_entrevistas` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `trazabilidad` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `usuarios` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `empresas` ADD CONSTRAINT `fk_empresa_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `entrevistas` ADD CONSTRAINT `fk_entrevista_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_empleo` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD CONSTRAINT `fk_entrevista_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `habilidades_usuarios` ADD CONSTRAINT `fk_habilidad_usuario_habilidad` FOREIGN KEY (`habilidad_id`) REFERENCES `habilidades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_habilidad_usuario_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mensajes` ADD CONSTRAINT `fk_mensaje_de_usuario` FOREIGN KEY (`de_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_mensaje_entrevista` FOREIGN KEY (`entrevista_id`) REFERENCES `entrevistas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD CONSTRAINT `fk_mensaje_para_usuario` FOREIGN KEY (`para_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `palabras_clave_entrevistas` ADD CONSTRAINT `fk_palabra_entrevista` FOREIGN KEY (`entrevista_id`) REFERENCES `entrevistas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `perfiles_candidatos` ADD CONSTRAINT `fk_perfil_candidato_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `postulaciones` ADD CONSTRAINT `fk_postulacion_entrevista` FOREIGN KEY (`entrevista_id`) REFERENCES `entrevistas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_postulacion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `reportes_entrevistas` ADD CONSTRAINT `fk_reporte_admin` FOREIGN KEY (`administrador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD CONSTRAINT `fk_reporte_entrevista` FOREIGN KEY (`entrevista_id`) REFERENCES `entrevistas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_reporte_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `requisitos_entrevistas` ADD CONSTRAINT `fk_requisitos_entrevista` FOREIGN KEY (`entrevista_id`) REFERENCES `entrevistas` (`id`) ON DELETE CASCADE;
ALTER TABLE `trazabilidad` ADD CONSTRAINT `fk_trazabilidad_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
