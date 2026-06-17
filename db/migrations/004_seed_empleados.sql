-- Migration 004: seed employees from Excel
SET search_path TO app, public;

INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '20283772323', 'RIOS LUIS ALBERTO', '3', '1980-12-22', '2008-05-19',
  c.id,
  'OSPERYH', 106500, 'Encargado Permanente con vivienda', 3, 'Completa',
  true, 'GALICIA', '0070004730004030834139',
  true, true,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30519077635'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '20338776390', 'RIOS MATIAS ALEJANDRO', '11', '1988-06-30', '2025-06-02',
  c.id,
  'OSPERYH', 106500, 'Ayudante Media jornada', 3, 'Media',
  false, 'REBA', '4150999718005103900025',
  false, false,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30519077635'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '20360647774', 'GIACOMO SEBASTIAN LUIS', '2', '1976-01-19', '2013-09-02',
  c.id,
  'OSPERYH', 106500, 'Encargado No Permanente Sin vivienda', 3, 'Media',
  false, 'SANTANDER', '0720210288000036765304',
  true, true,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30532673484'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '20175464299', 'ESPONDA JOSE MARIA', '373 015 01', '1965-10-15', '2007-08-17',
  c.id,
  'OSPERYH', 106500, 'Encargado Permanente con vivienda', 1, 'Completa',
  true, 'GALICIA', '0070004730004030946195',
  true, true,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30537480544'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '23289923934', 'PIÑERO SONIA MERCEDES', '1', '1981-09-25', '2023-12-18',
  c.id,
  'OSPERYH', 106500, 'Encargado No Permanente Sin vivienda', 2, 'Media',
  false, 'SANTANDER', '0720010688000038808654',
  true, true,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30538590009'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '24269272801', 'PIÑERO CLAUDIA ELIZABET', NULL, '1978-12-06', '2026-05-23',
  c.id,
  'O.S.DEL PERSONAL CIVIL DE LA NACION', 125707, 'Suplente eventual', 2, 'Suplente',
  false, 'SANTANDER', '0720010688000038532122',
  false, false,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30538590009'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '20204210749', 'RODA MARIO GUSTAVO', '39174', '1968-08-24', '2001-10-01',
  c.id,
  'OSPERYH', 106500, 'Encargado Permanente con vivienda', 1, 'Completa',
  true, 'SANTANDER', '0720210288000036355336',
  true, true,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30540887752'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '20263485409', 'LEDESMA SANTIAGO DAVID', '2', '1977-11-07', '2014-10-01',
  c.id,
  'OSPERYH', 106500, 'Encargado No Permanente Sin vivienda', 3, 'Media',
  false, 'BBVA', '0170003940000009341199',
  false, false,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30559333022'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '20275890074', 'CORONEL EDGARDO DARIO', '59418', '1979-08-03', '2011-02-14',
  c.id,
  'OSPERYH', 106500, 'Encargado Permanente con vivienda', 1, 'Completa',
  true, 'ICBC', '0150538201000115832142',
  true, true,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30580260906'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '20331992314', 'RODRIGUEZ ALFREDO RAUL', '27648', '1987-07-16', '2010-11-01',
  c.id,
  'OSPERYH', 106500, 'Personal Vigilancia Diurna', 1, 'Completa',
  false, 'ICBC', '0150538201000115831415',
  false, false,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30580260906'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '27174620410', 'CANCINOS MARGARITA', '3', '1965-09-18', '1999-04-21',
  c.id,
  'OSPERYH', 106500, 'Encargado Permanente con vivienda', 3, 'Completa',
  true, 'BBVA', '0170003940000008666921',
  true, true,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30604528166'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '20176328399', 'ROJAS CARLOS MANUEL', '2', '1966-06-03', '2003-12-05',
  c.id,
  'O.S. EMPL. TEXTILES Y AFINES', 121101, 'Encargado Permanente sin vivienda', 1, 'Completa',
  false, 'SANTANDER', '0720558388000000752172',
  true, true,
  true, true,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30630042670'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '20947260481', 'ESTIGARRIBIA ARCE DARIO', '9', '1986-10-09', '2007-07-09',
  c.id,
  'OSPERYH', 106500, 'Personal Vigilancia Nocturna', 1, 'Completa',
  false, 'SANTANDER', '0720558388000000755768',
  false, false,
  false, false,
  false, false,
  false,
  false, 48842.04, 'activo'
FROM app.consorcios c WHERE c.cuit = '30630042670'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '23250288794', 'PIÑERO BIBIANA PATRICIA', '18', '1975-10-20', '2025-07-01',
  c.id,
  'OBRA SOCIAL DE LOS MEDICOS DE LA CIUDAD', 126908, 'Suplente eventual', 1, 'Suplente',
  false, 'SANTANDER', '0720326688000037550686',
  false, false,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30630042670'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '20942335351', 'TORRES ORTIZ DENIS RAMON', '1', '1978-12-11', '2010-01-01',
  c.id,
  'OSPERYH', 106500, 'Encargado Permanente sin vivienda', 3, 'Completa',
  false, 'MACRO', '2850930740001996453014',
  true, true,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30711283338'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '24269272801', 'PIÑERO CLAUDIA ELIZABET', '5', '1978-12-06', '2026-05-04',
  c.id,
  'O.S.DEL PERSONAL CIVIL DE LA NACION', 125707, 'Suplente eventual', 3, 'Suplente',
  false, 'SANTANDER', '0720010688000038532122',
  false, false,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30711283338'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '20942347643', 'LIMA CENTURION RONAL DEJESUS', '1', '1982-03-08', '2010-11-15',
  c.id,
  'OSPERYH', 106500, 'Encargado Permanente con vivienda', 1, 'Completa',
  true, 'GALICIA', '0070039930004046286135',
  true, true,
  true, false,
  true, false,
  true,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30711553165'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '20252571850', 'VERON CARLOS ALBERTO', '2', '1976-04-29', '2011-04-11',
  c.id,
  'O.S. LOS EMPL. DE COMERCIO Y ACTIVIDADES CIVILES', 126205, 'Personal Vigilancia Nocturna', 1, 'Completa',
  false, 'GALICIA', '0070156930004014368580',
  false, false,
  false, false,
  false, false,
  false,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30711553165'
ON CONFLICT DO NOTHING;
INSERT INTO app.empleados_edificio
  (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
   obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
   tiene_vivienda, banco, cbu,
   retiro_residuos, clasificacion_residuos,
   plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
   tiene_titulo, adicional_voluntario, estado)
SELECT
  '23175845879', 'CORONEL CARLOS EMIGDIO', '277/095/001', '1966-03-24', '2011-04-01',
  c.id,
  'OSPERYH', 106500, 'Encargado Permanente con vivienda', 1, 'Completa',
  true, 'ICBC', '0150528301000112724198',
  true, true,
  true, false,
  true, false,
  true,
  false, 0, 'activo'
FROM app.consorcios c WHERE c.cuit = '30711776903'
ON CONFLICT DO NOTHING;
