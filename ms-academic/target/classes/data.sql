-- ================================================================
-- UTEC Rate — data.sql COMPLETO Y OFICIAL
-- Fuente: utec.edu.pe (2025) — 16 carreras reales + Cursos Generales
-- INSERT IGNORE = seguro para re-ejecuciones sin duplicados
-- ================================================================

-- ╔══════════════════════════════════════════╗
-- ║  1. CARRERAS (17 en total)              ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO carrera (nombre, codigo, img_url, activa) VALUES
('Cursos Generales',                          'CG',   NULL, 1),
-- Facultad de Computación
('Sistemas de Información',                   'SI',   NULL, 1),
('Ciencia de Datos e Inteligencia Artificial','CDIA', NULL, 1),
('Ciencia de la Computación',                 'CC',   NULL, 1),
('Ciberseguridad',                            'CS',   NULL, 1),
-- Facultad de Negocios
('Administración y Negocios Digitales',       'AND',  NULL, 1),
('Business Analytics',                        'BA',   NULL, 1),
-- Facultad de Ingeniería
('Ingeniería Industrial',                     'II',   NULL, 1),
('Bioingeniería',                             'BI',   NULL, 1),
('Ingeniería de la Energía',                  'IE',   NULL, 1),
('Ingeniería Mecánica',                       'IM',   NULL, 1),
('Ingeniería Química',                        'IQ',   NULL, 1),
('Ingeniería Ambiental',                      'IA',   NULL, 1),
('Ingeniería Civil',                          'IC',   NULL, 1),
('Ingeniería Electrónica',                    'IEL',  NULL, 1),
('Ingeniería Mecatrónica',                    'IMT',  NULL, 1);

-- ╔══════════════════════════════════════════╗
-- ║  2. CURSOS GENERALES                    ║
-- ║  Compartidos por TODAS las carreras     ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='CG'), 'Cálculo I',                      'CG-MA101', '#6366F1', 4, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Cálculo II',                     'CG-MA102', '#6366F1', 4, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Cálculo III',                    'CG-MA103', '#6366F1', 4, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Álgebra Lineal',                 'CG-MA104', '#8B5CF6', 3, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Estadística y Probabilidades',   'CG-MA105', '#0891B2', 3, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Ecuaciones Diferenciales',       'CG-MA106', '#7C3AED', 3, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Física I',                       'CG-FI101', '#DC2626', 4, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Física II',                      'CG-FI102', '#DC2626', 4, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Química General',                'CG-QU101', '#7C3AED', 3, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Programación I',                 'CG-CS101', '#3B82F6', 4, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Programación II',                'CG-CS102', '#3B82F6', 4, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Comunicación y Redacción',       'CG-HU101', '#0284C7', 2, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Ética Profesional',              'CG-HU102', '#0284C7', 2, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Realidad Peruana',               'CG-HU103', '#0284C7', 2, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Economía',                       'CG-EC101', '#059669', 3, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Introducción a la Ingeniería',   'CG-IN101', '#F59E0B', 2, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Taller de Proyectos I',          'CG-TP101', '#F97316', 2, 1),
((SELECT id FROM carrera WHERE codigo='CG'), 'Taller de Proyectos II',         'CG-TP102', '#F97316', 2, 1);

-- ╔══════════════════════════════════════════╗
-- ║  3. SISTEMAS DE INFORMACIÓN (SI)        ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='SI'), 'Algoritmos y Estructuras de Datos',  'SI-CS201', '#06B6D4', 4, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Base de Datos I',                    'SI-CS301', '#10B981', 4, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Base de Datos II',                   'SI-CS302', '#10B981', 3, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Redes y Comunicaciones',             'SI-CS401', '#F59E0B', 3, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Ingeniería de Software I',           'SI-CS501', '#EF4444', 4, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Ingeniería de Software II',          'SI-CS502', '#EF4444', 3, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Sistemas Operativos',                'SI-CS503', '#F97316', 3, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Arquitectura de Software',           'SI-CS601', '#84CC16', 3, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Desarrollo Web Full Stack',          'SI-CS602', '#14B8A6', 3, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Seguridad Informática',              'SI-CS701', '#F43F5E', 3, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Gestión de Proyectos TI',            'SI-GE701', '#6366F1', 3, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Auditoría de Sistemas',              'SI-GE702', '#8B5CF6', 3, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Sistemas de Información Empresarial','SI-GE801', '#0891B2', 3, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Inteligencia de Negocios',           'SI-CS801', '#EC4899', 3, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Computación en la Nube',             'SI-CS802', '#0369A1', 3, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Proyecto de Sistemas I',             'SI-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='SI'), 'Proyecto de Sistemas II',            'SI-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  4. CIENCIA DE DATOS E IA (CDIA)        ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Matemática Discreta',               'CDIA-MA201', '#7C3AED', 4, 1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Algoritmos y Estructuras de Datos', 'CDIA-CS201', '#06B6D4', 4, 1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Probabilidades y Estadística Avanzada','CDIA-MA301','#0891B2',4,1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Machine Learning I',                'CDIA-AI401', '#EC4899', 4, 1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Machine Learning II',               'CDIA-AI402', '#EC4899', 4, 1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Deep Learning',                     'CDIA-AI501', '#BE123C', 4, 1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Procesamiento de Lenguaje Natural', 'CDIA-AI502', '#9333EA', 3, 1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Visión por Computadora',            'CDIA-AI503', '#0369A1', 3, 1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Big Data y Procesamiento Distribuido','CDIA-CS601','#0F766E',4,1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Bases de Datos NoSQL',              'CDIA-CS602', '#059669', 3, 1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Ingeniería de Datos',               'CDIA-CS603', '#10B981', 3, 1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Visualización de Datos',            'CDIA-CS604', '#F59E0B', 3, 1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Ética en IA',                       'CDIA-HU601', '#64748B', 2, 1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Proyecto de Ciencia de Datos I',    'CDIA-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='CDIA'), 'Proyecto de Ciencia de Datos II',   'CDIA-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  5. CIENCIA DE LA COMPUTACIÓN (CC)      ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='CC'), 'Matemática Discreta',           'CC-MA201', '#7C3AED', 4, 1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Algoritmos y Complejidad',      'CC-CS301', '#06B6D4', 4, 1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Estructuras de Datos Avanzadas','CC-CS302', '#0891B2', 4, 1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Teoría de la Computación',      'CC-CS401', '#BE123C', 3, 1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Teoría de Compiladores',        'CC-CS402', '#9333EA', 4, 1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Sistemas Operativos',           'CC-CS403', '#F97316', 3, 1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Arquitectura de Computadoras',  'CC-CS501', '#84CC16', 3, 1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Redes de Computadoras',         'CC-CS502', '#F59E0B', 3, 1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Computación Paralela y Distribuida','CC-CS601','#0F766E',3,1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Inteligencia Artificial',       'CC-AI601', '#EC4899', 3, 1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Computación Gráfica',           'CC-CS602', '#0369A1', 3, 1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Bases de Datos',                'CC-CS603', '#10B981', 3, 1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Seguridad en Sistemas',         'CC-CS701', '#F43F5E', 3, 1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Proyecto de Investigación I',   'CC-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='CC'), 'Proyecto de Investigación II',  'CC-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  6. CIBERSEGURIDAD (CS)                 ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='CS'), 'Fundamentos de Ciberseguridad',    'CS-SE201', '#EF4444', 4, 1),
((SELECT id FROM carrera WHERE codigo='CS'), 'Criptografía',                     'CS-SE301', '#DC2626', 4, 1),
((SELECT id FROM carrera WHERE codigo='CS'), 'Seguridad en Redes',               'CS-SE401', '#B91C1C', 3, 1),
((SELECT id FROM carrera WHERE codigo='CS'), 'Hacking Ético y Pentesting',       'CS-SE402', '#991B1B', 3, 1),
((SELECT id FROM carrera WHERE codigo='CS'), 'Análisis de Malware',              'CS-SE501', '#7F1D1D', 3, 1),
((SELECT id FROM carrera WHERE codigo='CS'), 'Forense Digital',                  'CS-SE502', '#450A0A', 3, 1),
((SELECT id FROM carrera WHERE codigo='CS'), 'Seguridad en la Nube',             'CS-SE601', '#1E3A5F', 3, 1),
((SELECT id FROM carrera WHERE codigo='CS'), 'Gestión de Riesgos y Cumplimiento','CS-SE602', '#64748B', 3, 1),
((SELECT id FROM carrera WHERE codigo='CS'), 'Seguridad en Aplicaciones Web',    'CS-SE701', '#F43F5E', 3, 1),
((SELECT id FROM carrera WHERE codigo='CS'), 'Proyecto de Ciberseguridad I',     'CS-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='CS'), 'Proyecto de Ciberseguridad II',    'CS-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  7. ADMINISTRACIÓN Y NEGOCIOS (AND)     ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='AND'), 'Fundamentos de Administración',    'AND-AD201', '#B45309', 3, 1),
((SELECT id FROM carrera WHERE codigo='AND'), 'Contabilidad Financiera',           'AND-FN201', '#92400E', 3, 1),
((SELECT id FROM carrera WHERE codigo='AND'), 'Marketing Digital',                 'AND-MK301', '#E11D48', 3, 1),
((SELECT id FROM carrera WHERE codigo='AND'), 'Gestión Empresarial',               'AND-GE301', '#BE123C', 3, 1),
((SELECT id FROM carrera WHERE codigo='AND'), 'Finanzas Corporativas',             'AND-FN401', '#15803D', 4, 1),
((SELECT id FROM carrera WHERE codigo='AND'), 'Comercio Electrónico',              'AND-MK401', '#0369A1', 3, 1),
((SELECT id FROM carrera WHERE codigo='AND'), 'Innovación y Emprendimiento',       'AND-IN401', '#7C3AED', 3, 1),
((SELECT id FROM carrera WHERE codigo='AND'), 'Transformación Digital',            'AND-TD501', '#0891B2', 3, 1),
((SELECT id FROM carrera WHERE codigo='AND'), 'Estrategia de Negocios Digitales',  'AND-GE501', '#F59E0B', 3, 1),
((SELECT id FROM carrera WHERE codigo='AND'), 'Análisis de Datos para Negocios',   'AND-DA501', '#EC4899', 3, 1),
((SELECT id FROM carrera WHERE codigo='AND'), 'Gestión de Proyectos',              'AND-GP601', '#6366F1', 3, 1),
((SELECT id FROM carrera WHERE codigo='AND'), 'Derecho Empresarial',               'AND-DE601', '#64748B', 2, 1),
((SELECT id FROM carrera WHERE codigo='AND'), 'Proyecto Empresarial I',            'AND-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='AND'), 'Proyecto Empresarial II',           'AND-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  8. BUSINESS ANALYTICS (BA)             ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='BA'), 'Estadística para Negocios',      'BA-ES201', '#0891B2', 4, 1),
((SELECT id FROM carrera WHERE codigo='BA'), 'Análisis Predictivo',            'BA-AN301', '#0369A1', 3, 1),
((SELECT id FROM carrera WHERE codigo='BA'), 'Minería de Datos',               'BA-AN401', '#7C3AED', 3, 1),
((SELECT id FROM carrera WHERE codigo='BA'), 'Business Intelligence',          'BA-BI401', '#F59E0B', 3, 1),
((SELECT id FROM carrera WHERE codigo='BA'), 'Visualización y Dashboards',     'BA-VI501', '#EC4899', 3, 1),
((SELECT id FROM carrera WHERE codigo='BA'), 'Machine Learning para Negocios', 'BA-ML501', '#BE123C', 3, 1),
((SELECT id FROM carrera WHERE codigo='BA'), 'Optimización de Procesos',       'BA-OP601', '#059669', 3, 1),
((SELECT id FROM carrera WHERE codigo='BA'), 'Proyecto Analytics I',           'BA-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='BA'), 'Proyecto Analytics II',          'BA-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  9. INGENIERÍA INDUSTRIAL (II)          ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='II'), 'Investigación de Operaciones I',  'II-IO301', '#7C3AED', 4, 1),
((SELECT id FROM carrera WHERE codigo='II'), 'Investigación de Operaciones II', 'II-IO302', '#7C3AED', 4, 1),
((SELECT id FROM carrera WHERE codigo='II'), 'Gestión de Producción',           'II-GP401', '#2563EB', 3, 1),
((SELECT id FROM carrera WHERE codigo='II'), 'Logística y Cadena de Suministro','II-LG401', '#059669', 3, 1),
((SELECT id FROM carrera WHERE codigo='II'), 'Ergonomía y Seguridad Industrial','II-ES401', '#F59E0B', 3, 1),
((SELECT id FROM carrera WHERE codigo='II'), 'Control de Calidad',              'II-CQ501', '#EF4444', 3, 1),
((SELECT id FROM carrera WHERE codigo='II'), 'Simulación de Sistemas',          'II-SS501', '#0891B2', 3, 1),
((SELECT id FROM carrera WHERE codigo='II'), 'Lean Manufacturing',              'II-LM601', '#10B981', 3, 1),
((SELECT id FROM carrera WHERE codigo='II'), 'Gestión de Proyectos',            'II-GP601', '#6366F1', 3, 1),
((SELECT id FROM carrera WHERE codigo='II'), 'Economía Industrial',             'II-EC601', '#B45309', 3, 1),
((SELECT id FROM carrera WHERE codigo='II'), 'Proyecto Industrial I',           'II-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='II'), 'Proyecto Industrial II',          'II-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  10. BIOINGENIERÍA (BI)                 ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='BI'), 'Biología Celular y Molecular',    'BI-BIO201', '#059669', 4, 1),
((SELECT id FROM carrera WHERE codigo='BI'), 'Bioquímica',                      'BI-BIO202', '#10B981', 4, 1),
((SELECT id FROM carrera WHERE codigo='BI'), 'Biomecánica',                     'BI-BIO301', '#0891B2', 3, 1),
((SELECT id FROM carrera WHERE codigo='BI'), 'Fisiología para Ingenieros',      'BI-BIO302', '#0284C7', 3, 1),
((SELECT id FROM carrera WHERE codigo='BI'), 'Señales Biomédicas',              'BI-BIO401', '#7C3AED', 3, 1),
((SELECT id FROM carrera WHERE codigo='BI'), 'Dispositivos e Instrumentación Médica','BI-DM401','#EC4899',3,1),
((SELECT id FROM carrera WHERE codigo='BI'), 'Ingeniería de Tejidos',           'BI-IT501',  '#BE123C', 3, 1),
((SELECT id FROM carrera WHERE codigo='BI'), 'Bioinformática',                  'BI-BI601',  '#6366F1', 3, 1),
((SELECT id FROM carrera WHERE codigo='BI'), 'Nanotecnología Biomédica',        'BI-NT601',  '#F59E0B', 3, 1),
((SELECT id FROM carrera WHERE codigo='BI'), 'Proyecto Biomédico I',            'BI-PR901',  '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='BI'), 'Proyecto Biomédico II',           'BI-PR902',  '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  11. INGENIERÍA DE LA ENERGÍA (IE)      ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='IE'), 'Termodinámica',                   'IE-TD301', '#F97316', 4, 1),
((SELECT id FROM carrera WHERE codigo='IE'), 'Mecánica de Fluidos',             'IE-MF401', '#0891B2', 4, 1),
((SELECT id FROM carrera WHERE codigo='IE'), 'Circuitos Eléctricos',            'IE-CE401', '#EAB308', 4, 1),
((SELECT id FROM carrera WHERE codigo='IE'), 'Transferencia de Calor',          'IE-TC501', '#DC2626', 3, 1),
((SELECT id FROM carrera WHERE codigo='IE'), 'Energías Renovables',             'IE-ER501', '#22C55E', 3, 1),
((SELECT id FROM carrera WHERE codigo='IE'), 'Energía Solar y Eólica',          'IE-ER502', '#84CC16', 3, 1),
((SELECT id FROM carrera WHERE codigo='IE'), 'Sistemas Eléctricos de Potencia', 'IE-EP601', '#FACC15', 3, 1),
((SELECT id FROM carrera WHERE codigo='IE'), 'Eficiencia Energética',           'IE-EE601', '#0F766E', 3, 1),
((SELECT id FROM carrera WHERE codigo='IE'), 'Gestión Energética',              'IE-GE701', '#6366F1', 3, 1),
((SELECT id FROM carrera WHERE codigo='IE'), 'Proyecto de Energía I',           'IE-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='IE'), 'Proyecto de Energía II',          'IE-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  12. INGENIERÍA MECÁNICA (IM)           ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='IM'), 'Estática',                        'IM-ME201', '#64748B', 4, 1),
((SELECT id FROM carrera WHERE codigo='IM'), 'Dinámica',                        'IM-ME202', '#64748B', 4, 1),
((SELECT id FROM carrera WHERE codigo='IM'), 'Resistencia de Materiales',       'IM-ME301', '#475569', 4, 1),
((SELECT id FROM carrera WHERE codigo='IM'), 'Termodinámica',                   'IM-TD401', '#F97316', 4, 1),
((SELECT id FROM carrera WHERE codigo='IM'), 'Mecánica de Fluidos',             'IM-MF401', '#0891B2', 3, 1),
((SELECT id FROM carrera WHERE codigo='IM'), 'Diseño de Máquinas I',            'IM-DM501', '#7C3AED', 3, 1),
((SELECT id FROM carrera WHERE codigo='IM'), 'Diseño de Máquinas II',           'IM-DM502', '#7C3AED', 3, 1),
((SELECT id FROM carrera WHERE codigo='IM'), 'Manufactura',                     'IM-MN601', '#DC2626', 3, 1),
((SELECT id FROM carrera WHERE codigo='IM'), 'Control Automático',              'IM-CA601', '#EF4444', 3, 1),
((SELECT id FROM carrera WHERE codigo='IM'), 'Elementos Finitos',               'IM-EF701', '#059669', 3, 1),
((SELECT id FROM carrera WHERE codigo='IM'), 'Proyecto Mecánico I',             'IM-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='IM'), 'Proyecto Mecánico II',            'IM-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  13. INGENIERÍA QUÍMICA (IQ)            ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='IQ'), 'Química Orgánica',               'IQ-QU201', '#7C3AED', 4, 1),
((SELECT id FROM carrera WHERE codigo='IQ'), 'Química Analítica',              'IQ-QU202', '#8B5CF6', 3, 1),
((SELECT id FROM carrera WHERE codigo='IQ'), 'Termodinámica Química',          'IQ-TD301', '#F97316', 4, 1),
((SELECT id FROM carrera WHERE codigo='IQ'), 'Fenómenos de Transporte',        'IQ-FT401', '#0891B2', 4, 1),
((SELECT id FROM carrera WHERE codigo='IQ'), 'Operaciones Unitarias I',        'IQ-OU401', '#DC2626', 4, 1),
((SELECT id FROM carrera WHERE codigo='IQ'), 'Operaciones Unitarias II',       'IQ-OU402', '#DC2626', 3, 1),
((SELECT id FROM carrera WHERE codigo='IQ'), 'Cinética Química y Reactores',   'IQ-CR501', '#B91C1C', 4, 1),
((SELECT id FROM carrera WHERE codigo='IQ'), 'Diseño de Plantas Químicas',     'IQ-DP601', '#059669', 3, 1),
((SELECT id FROM carrera WHERE codigo='IQ'), 'Control de Procesos',            'IQ-CP601', '#0F766E', 3, 1),
((SELECT id FROM carrera WHERE codigo='IQ'), 'Proyecto Químico I',             'IQ-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='IQ'), 'Proyecto Químico II',            'IQ-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  14. INGENIERÍA AMBIENTAL (IA)          ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='IA'), 'Ecología y Medio Ambiente',       'IA-EC201', '#22C55E', 3, 1),
((SELECT id FROM carrera WHERE codigo='IA'), 'Química Ambiental',               'IA-QA301', '#16A34A', 3, 1),
((SELECT id FROM carrera WHERE codigo='IA'), 'Hidrología',                      'IA-HI401', '#0891B2', 3, 1),
((SELECT id FROM carrera WHERE codigo='IA'), 'Tratamiento de Aguas Residuales', 'IA-AG401', '#0369A1', 4, 1),
((SELECT id FROM carrera WHERE codigo='IA'), 'Gestión de Residuos Sólidos',     'IA-RS501', '#B45309', 3, 1),
((SELECT id FROM carrera WHERE codigo='IA'), 'Contaminación Atmosférica',       'IA-CA501', '#64748B', 3, 1),
((SELECT id FROM carrera WHERE codigo='IA'), 'Evaluación de Impacto Ambiental', 'IA-EI601', '#0F766E', 3, 1),
((SELECT id FROM carrera WHERE codigo='IA'), 'Energías Renovables Ambientales', 'IA-ER601', '#84CC16', 3, 1),
((SELECT id FROM carrera WHERE codigo='IA'), 'Gestión Ambiental Empresarial',   'IA-GE701', '#6366F1', 3, 1),
((SELECT id FROM carrera WHERE codigo='IA'), 'Proyecto Ambiental I',            'IA-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='IA'), 'Proyecto Ambiental II',           'IA-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  15. INGENIERÍA CIVIL (IC)              ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='IC'), 'Estática',                              'IC-ME201', '#64748B', 4, 1),
((SELECT id FROM carrera WHERE codigo='IC'), 'Resistencia de Materiales',             'IC-ME301', '#475569', 4, 1),
((SELECT id FROM carrera WHERE codigo='IC'), 'Mecánica de Suelos I',                 'IC-GE401', '#92400E', 4, 1),
((SELECT id FROM carrera WHERE codigo='IC'), 'Mecánica de Suelos II',                'IC-GE402', '#92400E', 3, 1),
((SELECT id FROM carrera WHERE codigo='IC'), 'Hidráulica',                           'IC-HI401', '#0284C7', 4, 1),
((SELECT id FROM carrera WHERE codigo='IC'), 'Análisis Estructural I',               'IC-ES401', '#0891B2', 4, 1),
((SELECT id FROM carrera WHERE codigo='IC'), 'Análisis Estructural II',              'IC-ES402', '#0891B2', 4, 1),
((SELECT id FROM carrera WHERE codigo='IC'), 'Diseño en Concreto Armado',            'IC-DC501', '#DC2626', 4, 1),
((SELECT id FROM carrera WHERE codigo='IC'), 'Diseño en Acero',                      'IC-DA501', '#4B5563', 3, 1),
((SELECT id FROM carrera WHERE codigo='IC'), 'Ingeniería de Tráfico',                'IC-IT601', '#F97316', 3, 1),
((SELECT id FROM carrera WHERE codigo='IC'), 'Ingeniería Sísmica',                   'IC-IS601', '#EF4444', 3, 1),
((SELECT id FROM carrera WHERE codigo='IC'), 'Gestión de Proyectos de Construcción', 'IC-GP701', '#6366F1', 3, 1),
((SELECT id FROM carrera WHERE codigo='IC'), 'Proyecto Civil I',                     'IC-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='IC'), 'Proyecto Civil II',                    'IC-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  16. INGENIERÍA ELECTRÓNICA (IEL)       ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='IEL'), 'Circuitos Eléctricos I',         'IEL-CE201', '#EAB308', 4, 1),
((SELECT id FROM carrera WHERE codigo='IEL'), 'Circuitos Eléctricos II',        'IEL-CE202', '#EAB308', 4, 1),
((SELECT id FROM carrera WHERE codigo='IEL'), 'Electrónica Analógica',          'IEL-EA301', '#F97316', 4, 1),
((SELECT id FROM carrera WHERE codigo='IEL'), 'Electrónica Digital',            'IEL-ED401', '#7C3AED', 4, 1),
((SELECT id FROM carrera WHERE codigo='IEL'), 'Señales y Sistemas',             'IEL-SS401', '#0891B2', 4, 1),
((SELECT id FROM carrera WHERE codigo='IEL'), 'Comunicaciones Digitales',       'IEL-CD501', '#06B6D4', 3, 1),
((SELECT id FROM carrera WHERE codigo='IEL'), 'Sistemas Embebidos',             'IEL-SE501', '#84CC16', 3, 1),
((SELECT id FROM carrera WHERE codigo='IEL'), 'Microprocesadores',              'IEL-MP601', '#6366F1', 3, 1),
((SELECT id FROM carrera WHERE codigo='IEL'), 'Control Automático',             'IEL-CA601', '#EF4444', 3, 1),
((SELECT id FROM carrera WHERE codigo='IEL'), 'Robótica',                       'IEL-RO701', '#EC4899', 3, 1),
((SELECT id FROM carrera WHERE codigo='IEL'), 'Internet de las Cosas (IoT)',    'IEL-IT701', '#0369A1', 3, 1),
((SELECT id FROM carrera WHERE codigo='IEL'), 'Proyecto Electrónico I',         'IEL-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='IEL'), 'Proyecto Electrónico II',        'IEL-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  17. INGENIERÍA MECATRÓNICA (IMT)       ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO curso (carrera_id, nombre, codigo, color_hex, creditos, activo) VALUES
((SELECT id FROM carrera WHERE codigo='IMT'), 'Circuitos Eléctricos',           'IMT-CE201', '#EAB308', 4, 1),
((SELECT id FROM carrera WHERE codigo='IMT'), 'Mecánica para Mecatrónica',       'IMT-ME301', '#64748B', 4, 1),
((SELECT id FROM carrera WHERE codigo='IMT'), 'Electrónica para Mecatrónica',    'IMT-EL401', '#F97316', 4, 1),
((SELECT id FROM carrera WHERE codigo='IMT'), 'Control Automático I',            'IMT-CA401', '#EF4444', 4, 1),
((SELECT id FROM carrera WHERE codigo='IMT'), 'Control Automático II',           'IMT-CA402', '#EF4444', 3, 1),
((SELECT id FROM carrera WHERE codigo='IMT'), 'Robótica I',                      'IMT-RO501', '#EC4899', 4, 1),
((SELECT id FROM carrera WHERE codigo='IMT'), 'Robótica II',                     'IMT-RO502', '#EC4899', 3, 1),
((SELECT id FROM carrera WHERE codigo='IMT'), 'Sistemas Embebidos',              'IMT-SE601', '#84CC16', 3, 1),
((SELECT id FROM carrera WHERE codigo='IMT'), 'Automatización Industrial',       'IMT-AI601', '#0369A1', 3, 1),
((SELECT id FROM carrera WHERE codigo='IMT'), 'Manufactura Avanzada',            'IMT-MA701', '#7C3AED', 3, 1),
((SELECT id FROM carrera WHERE codigo='IMT'), 'Visión por Computadora Aplicada', 'IMT-VC701', '#0891B2', 3, 1),
((SELECT id FROM carrera WHERE codigo='IMT'), 'Proyecto Mecatrónico I',          'IMT-PR901', '#F0B429', 3, 1),
((SELECT id FROM carrera WHERE codigo='IMT'), 'Proyecto Mecatrónico II',         'IMT-PR902', '#F0B429', 3, 1);

-- ╔══════════════════════════════════════════╗
-- ║  18. PROFESOR_CURSO — prueba local      ║
-- ║  UUIDs fijos = seed del MS1             ║
-- ╚══════════════════════════════════════════╝
INSERT IGNORE INTO profesor_curso (profesor_id, curso_id, semestre, seccion, activo) VALUES
('00000000-0000-0000-0000-000000000001',(SELECT id FROM curso WHERE codigo='CG-MA101'),'2025-1','A',1),
('00000000-0000-0000-0000-000000000001',(SELECT id FROM curso WHERE codigo='CG-MA101'),'2025-1','B',1),
('00000000-0000-0000-0000-000000000001',(SELECT id FROM curso WHERE codigo='CG-MA102'),'2025-1','A',1),
('00000000-0000-0000-0000-000000000001',(SELECT id FROM curso WHERE codigo='CG-MA104'),'2025-1','A',1),
('00000000-0000-0000-0000-000000000002',(SELECT id FROM curso WHERE codigo='CG-FI101'),'2025-1','A',1),
('00000000-0000-0000-0000-000000000002',(SELECT id FROM curso WHERE codigo='CG-FI101'),'2025-1','B',1),
('00000000-0000-0000-0000-000000000002',(SELECT id FROM curso WHERE codigo='CG-FI102'),'2025-1','A',1),
('00000000-0000-0000-0000-000000000002',(SELECT id FROM curso WHERE codigo='CG-CS101'),'2025-1','A',1),
('00000000-0000-0000-0000-000000000003',(SELECT id FROM curso WHERE codigo='SI-CS201'), '2025-1','A',1),
('00000000-0000-0000-0000-000000000003',(SELECT id FROM curso WHERE codigo='SI-CS301'), '2025-1','B',1),
('00000000-0000-0000-0000-000000000003',(SELECT id FROM curso WHERE codigo='AND-MK301'),'2025-1','A',1),
('00000000-0000-0000-0000-000000000001',(SELECT id FROM curso WHERE codigo='CC-MA201'), '2025-1','A',1),
('00000000-0000-0000-0000-000000000002',(SELECT id FROM curso WHERE codigo='IC-ME201'), '2025-1','A',1),
('00000000-0000-0000-0000-000000000003',(SELECT id FROM curso WHERE codigo='IEL-RO701'),'2025-1','A',1),
('00000000-0000-0000-0000-000000000001',(SELECT id FROM curso WHERE codigo='CG-MA101'),'2024-2','A',1),
('00000000-0000-0000-0000-000000000002',(SELECT id FROM curso WHERE codigo='CG-FI101'),'2024-2','A',1),
('00000000-0000-0000-0000-000000000003',(SELECT id FROM curso WHERE codigo='SI-CS201'), '2024-2','A',1);
