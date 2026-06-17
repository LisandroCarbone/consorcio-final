SET search_path TO app, public;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 8,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20283772323' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 8,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20338776390' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 0,
       0, 0, 12, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20360647774' AND c.cuit = '30532673484'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20175464299' AND c.cuit = '30537480544'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23289923934' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20204210749' AND c.cuit = '30540887752'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20263485409' AND c.cuit = '30559333022'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 0,
       0, 0, 12, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20275890074' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 58, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20331992314' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 0,
       0, 0, 18, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '27174620410' AND c.cuit = '30604528166'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 0,
       0, 0, 0, 30,
       30, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20176328399' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 4,
       0, 0, 12, 0,
       0, 43617.26, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20947260481' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 26, 4, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23250288794' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942335351' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 40, 9,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20252571850' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 240108.92, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942347643' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-01-01', 0, NULL, 29, 2,
       8, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23175845879' AND c.cuit = '30711776903'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 12,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20283772323' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 12,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20338776390' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20360647774' AND c.cuit = '30532673484'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20175464299' AND c.cuit = '30537480544'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 0,
       8, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23289923934' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 0,
       0, 0, 16, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20204210749' AND c.cuit = '30540887752'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20263485409' AND c.cuit = '30559333022'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20275890074' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20331992314' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '27174620410' AND c.cuit = '30604528166'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 0,
       0, 0, 0, 30,
       30, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20176328399' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 4,
       0, 0, 0, 0,
       0, 44402.37, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20947260481' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 22, 4, 0, 0,
       4, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23250288794' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942335351' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 20, 6,
       0, 0, 10, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20252571850' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 244065.9, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942347643' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-02-01', 0, NULL, 35, 6,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23175845879' AND c.cuit = '30711776903'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 12,
       0, 0, 18, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20283772323' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 0,
       12, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20338776390' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20360647774' AND c.cuit = '30532673484'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 0,
       0, 0, 15, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20175464299' AND c.cuit = '30537480544'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 0,
       4, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23289923934' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20204210749' AND c.cuit = '30540887752'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 0,
       0, 0, 7, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20263485409' AND c.cuit = '30559333022'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 75, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20275890074' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 0,
       0, 0, 18, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20331992314' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '27174620410' AND c.cuit = '30604528166'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20176328399' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 5,
       0, 0, 0, 0,
       0, 45157.21, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20947260481' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 25, 4, 0, 0,
       4, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23250288794' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942335351' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 16, 12,
       0, 0, 15, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20252571850' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 247866.5, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942347643' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-03-01', 0, NULL, 38, 7,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23175845879' AND c.cuit = '30711776903'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 12,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20283772323' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 12,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20338776390' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20360647774' AND c.cuit = '30532673484'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20175464299' AND c.cuit = '30537480544'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 0,
       4, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23289923934' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20204210749' AND c.cuit = '30540887752'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 0,
       0, 0, 5, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20263485409' AND c.cuit = '30559333022'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20275890074' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20331992314' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '27174620410' AND c.cuit = '30604528166'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 0,
       0, 0, 0, 30,
       30, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20176328399' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 4,
       0, 0, 0, 0,
       0, 46963.5, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20947260481' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 24, 4, 0, 0,
       4, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23250288794' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942335351' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 34, 21,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20252571850' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 255552.62, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942347643' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-04-01', 0, NULL, 30, 8,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23175845879' AND c.cuit = '30711776903'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-05-01', 0, NULL, 0, 20,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20283772323' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-05-01', 0, NULL, 0, 12,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20338776390' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-05-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23289923934' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-05-01', 0, NULL, 0, 0,
       0, 26, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-05-01', 0, NULL, 0, 0,
       0, 0, 0, 30,
       30, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20176328399' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-05-01', 0, NULL, 0, 5,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20947260481' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-05-01', 23, 4, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23250288794' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-05-01', 0, NULL, 0, 0,
       0, 0, 23, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942335351' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-05-01', 23, 4, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-05-01', 0, NULL, 36, 18,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20252571850' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-05-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 264100.91, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942347643' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-05-01', 0, NULL, 32, 7,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23175845879' AND c.cuit = '30711776903'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20283772323' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20338776390' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20360647774' AND c.cuit = '30532673484'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20175464299' AND c.cuit = '30537480544'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23289923934' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20204210749' AND c.cuit = '30540887752'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20263485409' AND c.cuit = '30559333022'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20275890074' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20331992314' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '27174620410' AND c.cuit = '30604528166'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20176328399' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20947260481' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23250288794' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942335351' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20252571850' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 830000, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942347643' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-06-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23175845879' AND c.cuit = '30711776903'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20283772323' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20338776390' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20360647774' AND c.cuit = '30532673484'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20175464299' AND c.cuit = '30537480544'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23289923934' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20204210749' AND c.cuit = '30540887752'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20263485409' AND c.cuit = '30559333022'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20275890074' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20331992314' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '27174620410' AND c.cuit = '30604528166'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20176328399' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20947260481' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23250288794' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942335351' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20252571850' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942347643' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-07-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23175845879' AND c.cuit = '30711776903'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20283772323' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20338776390' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20360647774' AND c.cuit = '30532673484'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20175464299' AND c.cuit = '30537480544'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23289923934' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20204210749' AND c.cuit = '30540887752'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20263485409' AND c.cuit = '30559333022'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20275890074' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20331992314' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '27174620410' AND c.cuit = '30604528166'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20176328399' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20947260481' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23250288794' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942335351' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20252571850' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942347643' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-08-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23175845879' AND c.cuit = '30711776903'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20283772323' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20338776390' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20360647774' AND c.cuit = '30532673484'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20175464299' AND c.cuit = '30537480544'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23289923934' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20204210749' AND c.cuit = '30540887752'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20263485409' AND c.cuit = '30559333022'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20275890074' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20331992314' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '27174620410' AND c.cuit = '30604528166'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20176328399' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20947260481' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23250288794' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942335351' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20252571850' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942347643' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-09-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23175845879' AND c.cuit = '30711776903'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20283772323' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20338776390' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20360647774' AND c.cuit = '30532673484'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20175464299' AND c.cuit = '30537480544'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23289923934' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20204210749' AND c.cuit = '30540887752'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20263485409' AND c.cuit = '30559333022'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20275890074' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20331992314' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '27174620410' AND c.cuit = '30604528166'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20176328399' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20947260481' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23250288794' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942335351' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20252571850' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942347643' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-10-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23175845879' AND c.cuit = '30711776903'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20283772323' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20338776390' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20360647774' AND c.cuit = '30532673484'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20175464299' AND c.cuit = '30537480544'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23289923934' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20204210749' AND c.cuit = '30540887752'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20263485409' AND c.cuit = '30559333022'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20275890074' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20331992314' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '27174620410' AND c.cuit = '30604528166'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20176328399' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20947260481' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23250288794' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942335351' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20252571850' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942347643' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-11-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23175845879' AND c.cuit = '30711776903'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20283772323' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20338776390' AND c.cuit = '30519077635'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20360647774' AND c.cuit = '30532673484'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20175464299' AND c.cuit = '30537480544'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23289923934' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30538590009'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20204210749' AND c.cuit = '30540887752'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20263485409' AND c.cuit = '30559333022'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20275890074' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20331992314' AND c.cuit = '30580260906'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '27174620410' AND c.cuit = '30604528166'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20176328399' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20947260481' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23250288794' AND c.cuit = '30630042670'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942335351' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '24269272801' AND c.cuit = '30711283338'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20252571850' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '20942347643' AND c.cuit = '30711553165'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

INSERT INTO novedades_sueldo
  (empleado_id, periodo, dias_trabajados_suplente, horas_jornada, horas_extras_50, horas_extras_100,
   feriados_trabajados_hs, suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
   licencia_enfermedad, adicional_voluntario, embargo, anticipo, muerte)
SELECT e.id, '2026-12-01', 0, NULL, 0, 0,
       0, 0, 0, 0,
       0, 0, 0, 0, 0
FROM empleados_edificio e
JOIN consorcios c ON c.id = e.consorcio_id
WHERE e.cuil = '23175845879' AND c.cuit = '30711776903'
ON CONFLICT (empleado_id, periodo) DO UPDATE SET
  dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
  horas_jornada = EXCLUDED.horas_jornada,
  horas_extras_50 = EXCLUDED.horas_extras_50,
  horas_extras_100 = EXCLUDED.horas_extras_100,
  feriados_trabajados_hs = EXCLUDED.feriados_trabajados_hs,
  suplencia_100_hs = EXCLUDED.suplencia_100_hs,
  plus_vacaciones_dias = EXCLUDED.plus_vacaciones_dias,
  dias_no_trabajados = EXCLUDED.dias_no_trabajados,
  licencia_enfermedad = EXCLUDED.licencia_enfermedad,
  adicional_voluntario = EXCLUDED.adicional_voluntario,
  embargo = EXCLUDED.embargo,
  anticipo = EXCLUDED.anticipo,
  muerte = EXCLUDED.muerte;

