-- ================================================================
-- Script de inicialización de MySQL
-- Se ejecuta UNA SOLA VEZ cuando se crea el volumen por primera vez
-- ================================================================

-- Dar permisos completos al usuario de la app SOLO sobre su BD
GRANT ALL PRIVILEGES ON academic_db.* TO 'utec_user'@'%';

-- Revocar acceso a otras BDs del sistema (seguridad)
REVOKE ALL PRIVILEGES ON *.* FROM 'utec_user'@'%';
GRANT ALL PRIVILEGES ON academic_db.* TO 'utec_user'@'%';

-- Solo desde la red interna de Docker (172.x.x.x)
-- En producción cambiar '%' por la IP del contenedor ms-academic
FLUSH PRIVILEGES;
