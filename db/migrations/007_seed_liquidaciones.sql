SET search_path TO app, public;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 1790832.9537664, 396339.9537663999, 1394493, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20283772323' AND c.nombre = 'CONS PROP SGO DEL ESTERO 336 46 CAP FED'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',957382,1),
  ('haber','Retiro de residuos',146955.80000000002,3),
  ('haber','Clasificación de residuos',55107.424,4),
  ('haber','Valor vivienda',6833.8,5),
  ('haber','Plus antigüedad (2%)',343393.19999999995,7),
  ('haber','Horas extras 100%',181160.66687999998,16),
  ('no_remunerativo','Adicional remuneratorio mensual',100000,22),
  ('descuento','Jubilación',196991.6179968,30),
  ('descuento','Ley 19032',53724.98672639999,31),
  ('descuento','Obra Social',53724.98672639999,32),
  ('descuento','SUTERH',35816.6578176,34),
  ('descuento','Caja Prot. Flia.',17908.3289088,35),
  ('descuento','FATERYH',17908.3289088,36),
  ('descuento','Seguro vitalicio',13431.246681599998,37),
  ('descuento','Descuento vivienda',6833.8,38),
  ('descuento','Redondeo',0.06288640014827251,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 1625760.88, 392458.88, 1233302, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20283772323' AND c.nombre = 'CONS PROP SGO DEL ESTERO 336 46 CAP FED'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',885351,1),
  ('haber','Retiro de residuos',136354,3),
  ('haber','Clasificación de residuos',47564.45,4),
  ('haber','Valor vivienda',6340.8,5),
  ('haber','Plus antigüedad (2%)',318612.30000000005,7),
  ('haber','Horas extras 100%',111537.804,16),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',178833.63894,30),
  ('descuento','Ley 19032',48772.81062,31),
  ('descuento','Obra Social',48772.81062,32),
  ('descuento','SUTERH',32515.20708,34),
  ('descuento','Caja Prot. Flia.',16257.60354,35),
  ('descuento','FATERYH',16257.60354,36),
  ('descuento','Seguro vitalicio',12193.202655,37),
  ('descuento','Descuento vivienda',6340.8,38),
  ('descuento','Redondeo',0.5300749999005347,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 723462.35, 181042.35, 542420, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20338776390' AND c.nombre = 'CONS PROP SGO DEL ESTERO 336 46 CAP FED'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',515401,1),
  ('haber','Horas extras 100%',82464.16,16),
  ('no_remunerativo','Adicional viáticos',65596.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',60000,22),
  ('descuento','Jubilación',79580.7826,30),
  ('descuento','Ley 19032',21703.8498,31),
  ('descuento','Obra Social',21703.8498,32),
  ('descuento','Diferencia Obra Social Ley 26475',9220.210199999998,33),
  ('descuento','SUTERH',14469.2332,34),
  ('descuento','Caja Prot. Flia.',7234.6166,35),
  ('descuento','FATERYH',7234.6166,36),
  ('descuento','Seguro vitalicio',5425.96245,37),
  ('descuento','Redondeo',0.6944499999517575,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 974373.33, 233106.33, 741267, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20360647774' AND c.nombre = 'CONSORCIO DE PROPIETARIOS LIMA 461/67/73'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',517465,1),
  ('haber','Retiro de residuos',13808,3),
  ('haber','Clasificación de residuos',29727.8,4),
  ('haber','Plus antigüedad (2%)',224902.80000000002,7),
  ('haber','Plus vacacional',62872.288,20),
  ('no_remunerativo','Adicional viáticos',65596.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',60000,22),
  ('descuento','Jubilación',107180.96268000001,30),
  ('descuento','Ley 19032',29231.17164,31),
  ('descuento','Obra Social',29231.17164,32),
  ('descuento','Diferencia Obra Social Ley 26475',1692.8883599999972,33),
  ('descuento','SUTERH',19487.447760000003,34),
  ('descuento','Caja Prot. Flia.',9743.723880000001,35),
  ('descuento','FATERYH',9743.723880000001,36),
  ('descuento','Seguro vitalicio',7307.79291,37),
  ('descuento','Redondeo',0.9425099999643862,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 1500685.44, 362753.44, 1137932, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20175464299' AND c.nombre = 'CONS DE PROP AV BELGRANO 1266/70/76'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',965838,1),
  ('haber','Retiro de residuos',41424,3),
  ('haber','Clasificación de residuos',29727.8,4),
  ('haber','Valor vivienda',6340.8,5),
  ('haber','Plus antigüedad (2%)',337354.2,7),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',165075.328,30),
  ('descuento','Ley 19032',45020.544,31),
  ('descuento','Obra Social',45020.544,32),
  ('descuento','SUTERH',30013.696,34),
  ('descuento','Caja Prot. Flia.',15006.848,35),
  ('descuento','FATERYH',15006.848,36),
  ('descuento','Seguro vitalicio',11255.136,37),
  ('descuento','Descuento vivienda',6340.8,38),
  ('descuento','Redondeo',0.6399999998975545,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 722355.39, 182218.39, 540137, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '23289923934' AND c.nombre = 'CONSORCIO DE PROPIETARIOS RODRIGUEZ PEÑA 1351'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',517465,1),
  ('haber','Retiro de residuos',12082,3),
  ('haber','Clasificación de residuos',29727.8,4),
  ('haber','Plus antigüedad (2%)',37483.8,7),
  ('no_remunerativo','Adicional viáticos',65596.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',60000,22),
  ('descuento','Jubilación',79459.06100000002,30),
  ('descuento','Ley 19032',21670.653000000002,31),
  ('descuento','Obra Social',21670.653000000002,32),
  ('descuento','Diferencia Obra Social Ley 26475',10659.056999999997,33),
  ('descuento','SUTERH',14447.102000000003,34),
  ('descuento','Caja Prot. Flia.',7223.551000000001,35),
  ('descuento','FATERYH',7223.551000000001,36),
  ('descuento','Seguro vitalicio',5417.6632500000005,37),
  ('descuento','Redondeo',0.2932499999878928,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 0, 0, 0, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '24269272801' AND c.nombre = 'CONSORCIO DE PROPIETARIOS RODRIGUEZ PEÑA 1351'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',42120.2,1)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 1602781.1, 387001.1, 1215780, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20204210749' AND c.nombre = 'CONSORCIO DE COPROPIETARIOS ARENALES 2120 24'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',965838,1),
  ('haber','Retiro de residuos',31068,3),
  ('haber','Clasificación de residuos',29727.8,4),
  ('haber','Valor vivienda',6340.8,5),
  ('haber','Plus antigüedad (2%)',449805.60000000003,7),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',176305.82200000001,30),
  ('descuento','Ley 19032',48083.406,31),
  ('descuento','Obra Social',48083.406,32),
  ('descuento','SUTERH',32055.604000000003,34),
  ('descuento','Caja Prot. Flia.',16027.802000000001,35),
  ('descuento','FATERYH',16027.802000000001,36),
  ('descuento','Seguro vitalicio',12020.8515,37),
  ('descuento','Descuento vivienda',6340.8,38),
  ('descuento','Redondeo',0.8974999999627471,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 849222.71, 207137.71, 642085, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20263485409' AND c.nombre = 'CONSORCIO DE PROPIETARIOS DEL EDIFICIO PALOS 285'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',517465,1),
  ('haber','Plus antigüedad (2%)',206160.90000000002,7),
  ('no_remunerativo','Adicional viáticos',65596.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',60000,22),
  ('descuento','Jubilación',93414.464,30),
  ('descuento','Ley 19032',25476.672,31),
  ('descuento','Obra Social',25476.672,32),
  ('descuento','Diferencia Obra Social Ley 26475',5447.387999999999,33),
  ('descuento','SUTERH',16984.448,34),
  ('descuento','Caja Prot. Flia.',8492.224,35),
  ('descuento','FATERYH',8492.224,36),
  ('descuento','Seguro vitalicio',6369.168,37),
  ('descuento','Redondeo',0.30799999996088445,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 1505941.91, 364001.91, 1141940, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20275890074' AND c.nombre = 'CONSORCIO DE PROPIETARIOS URUGUAY 1025 27 29'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',965838,1),
  ('haber','Retiro de residuos',18986,3),
  ('haber','Clasificación de residuos',29727.8,4),
  ('haber','Valor vivienda',6340.8,5),
  ('haber','Plus antigüedad (2%)',262386.60000000003,7),
  ('haber','Plus vacacional',102662.33599999995,20),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',165653.56896,30),
  ('descuento','Ley 19032',45178.24608,31),
  ('descuento','Obra Social',45178.24608,32),
  ('descuento','SUTERH',30118.83072,34),
  ('descuento','Caja Prot. Flia.',15059.41536,35),
  ('descuento','FATERYH',15059.41536,36),
  ('descuento','Seguro vitalicio',11294.56152,37),
  ('descuento','Descuento vivienda',6340.8,38),
  ('descuento','Redondeo',0.378800000064075,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 1942068, 461241, 1480827, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20331992314' AND c.nombre = 'CONSORCIO DE PROPIETARIOS URUGUAY 1025 27 29'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',942893,1),
  ('haber','Plus antigüedad (2%)',281128.5,7),
  ('haber','Horas extras 50%',532449.3525,15),
  ('no_remunerativo','Adicional viáticos',65596.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',213627.40877500002,30),
  ('descuento','Ley 19032',58262.020575,31),
  ('descuento','Obra Social',58262.020575,32),
  ('descuento','SUTERH',38841.347050000004,34),
  ('descuento','Caja Prot. Flia.',19420.673525000002,35),
  ('descuento','FATERYH',19420.673525000002,36),
  ('descuento','Seguro vitalicio',14565.50514375,37),
  ('descuento','Redondeo',0.6437187497504056,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 1779361, 428939, 1350422, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '27174620410' AND c.nombre = 'CONSORCIO DE PROPIETARIOS ALTE BROWN 720'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',885351,1),
  ('haber','Retiro de residuos',67314,3),
  ('haber','Clasificación de residuos',35276.98933333333,4),
  ('haber','Valor vivienda',6340.8,5),
  ('haber','Plus antigüedad (2%)',487289.4,7),
  ('haber','Plus vacacional',177788.66271999996,20),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',195729.69372586667,30),
  ('descuento','Ley 19032',53380.825561599995,31),
  ('descuento','Obra Social',53380.825561599995,32),
  ('descuento','SUTERH',35587.217041066666,34),
  ('descuento','Caja Prot. Flia.',17793.608520533333,35),
  ('descuento','FATERYH',17793.608520533333,36),
  ('descuento','Seguro vitalicio',13345.206390399999,37),
  ('descuento','Descuento vivienda',6340.8,38),
  ('descuento','Redondeo',0.15030933334492147,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 1868591.46, 443790.46, 1424801, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20176328399' AND c.nombre = 'CONSORCIO PROPIETARIOS DE LA FINCA CALLE ARENALES 1648 50'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1124512,1),
  ('haber','Retiro de residuos',55232,3),
  ('haber','Clasificación de residuos',32502.394666666667,4),
  ('haber','Plus antigüedad (2%)',412321.80000000005,7),
  ('haber','Plus cocheras',23553.4,8),
  ('haber','Plus movimiento coches',34873.3,9),
  ('haber','Licencia por enfermedad',1682994.8946666666,18),
  ('descuento','Días no trabajados',-1682994.8946666666,19),
  ('no_remunerativo','Adicional viáticos',65596.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',205545.05341333334,30),
  ('descuento','Ley 19032',56057.741839999995,31),
  ('descuento','Obra Social',56057.741839999995,32),
  ('descuento','SUTERH',37371.827893333335,34),
  ('descuento','Caja Prot. Flia.',18685.913946666667,35),
  ('descuento','FATERYH',18685.913946666667,36),
  ('descuento','Seguro vitalicio',14014.435459999999,37),
  ('descuento','Redondeo',0.06156666669994593,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 1750262.01, 415687.01, 1334575, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20947260481' AND c.nombre = 'CONSORCIO PROPIETARIOS DE LA FINCA CALLE ARENALES 1648 50'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1008959,1),
  ('haber','Plus antigüedad (2%)',337354.2,7),
  ('haber','Adicional voluntario',43617.26,14),
  ('haber','Horas extras 100%',63539.67817142857,16),
  ('haber','Plus vacacional',111194.43680000002,20),
  ('no_remunerativo','Adicional viáticos',65596.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',192528.71824685714,30),
  ('descuento','Ley 19032',52507.832249142855,31),
  ('descuento','Obra Social',52507.832249142855,32),
  ('descuento','SUTERH',35005.221499428575,34),
  ('descuento','Caja Prot. Flia.',17502.610749714288,35),
  ('descuento','FATERYH',17502.610749714288,36),
  ('descuento','Seguro vitalicio',13126.958062285714,37),
  ('descuento','Redondeo',0.9303342858329415,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 609963.24, 126567.24, 483396, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '23250288794' AND c.nombre = 'CONSORCIO PROPIETARIOS DE LA FINCA CALLE ARENALES 1648 50'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',42120.2,1),
  ('no_remunerativo','Adicional remuneratorio mensual',62400,22),
  ('descuento','Jubilación',67095.886,30),
  ('descuento','Ley 19032',18298.877999999997,31),
  ('descuento','Obra Social',18298.877999999997,32),
  ('descuento','Caja Prot. Flia.',6099.626,35),
  ('descuento','Seguro vitalicio',4574.719499999999,37),
  ('descuento','Redondeo',0.6395000000484288,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 1592599.19, 378242.19, 1214357, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20942335351' AND c.nombre = 'CONSORCIO DE PROPIETARIOS SALTA 555 59'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1030802,1),
  ('haber','Retiro de residuos',46602,3),
  ('haber','Clasificación de residuos',29727.8,4),
  ('haber','Plus antigüedad (2%)',299870.4,7),
  ('no_remunerativo','Adicional viáticos',65596.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',175185.85700000002,30),
  ('descuento','Ley 19032',47777.961,31),
  ('descuento','Obra Social',47777.961,32),
  ('descuento','SUTERH',31851.974000000006,34),
  ('descuento','Caja Prot. Flia.',15925.987000000003,35),
  ('descuento','FATERYH',15925.987000000003,36),
  ('descuento','Seguro vitalicio',11944.49025,37),
  ('descuento','Redondeo',0.4912499999627471,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 0, 0, 0, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '24269272801' AND c.nombre = 'CONSORCIO DE PROPIETARIOS SALTA 555 59'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',42120.2,1),
  ('haber','Clasificación de residuos',29727.8,4)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 1541545.56, 612566.56, 928979, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20942347643' AND c.nombre = 'CONSORCIO DE PROPIETARIOS AZCUENAGA 1570 IQ-RECOLETA'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',965838,1),
  ('haber','Retiro de residuos',51780,3),
  ('haber','Clasificación de residuos',29727.8,4),
  ('haber','Valor vivienda',6340.8,5),
  ('haber','Plus antigüedad (2%)',281128.5,7),
  ('haber','Plus cocheras',23553.4,8),
  ('haber','Plus jardín',23553.4,10),
  ('haber','Plus piletas',39622.7,13),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',169569.906,30),
  ('descuento','Ley 19032',46246.337999999996,31),
  ('descuento','Obra Social',46246.337999999996,32),
  ('descuento','SUTERH',30830.891999999996,34),
  ('descuento','Caja Prot. Flia.',15415.445999999998,35),
  ('descuento','FATERYH',15415.445999999998,36),
  ('descuento','Seguro vitalicio',11561.584499999999,37),
  ('descuento','Descuento vivienda',6340.8,38),
  ('descuento','Embargo',240108.92,39),
  ('descuento','Redondeo',0.9625000001396984,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 2023599.76, 480604.76, 1542995, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20252571850' AND c.nombre = 'CONSORCIO DE PROPIETARIOS AZCUENAGA 1570 IQ-RECOLETA'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1008959,1),
  ('haber','Plus antigüedad (2%)',262386.60000000003,7),
  ('haber','Horas extras 50%',435889.92,15),
  ('haber','Horas extras 100%',130766.97600000001,16),
  ('no_remunerativo','Adicional viáticos',65596.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',222595.88956,30),
  ('descuento','Ley 19032',60707.96988,31),
  ('descuento','Obra Social',60707.96988,32),
  ('descuento','SUTERH',40471.979920000005,34),
  ('descuento','Caja Prot. Flia.',20235.989960000003,35),
  ('descuento','FATERYH',20235.989960000003,36),
  ('descuento','Seguro vitalicio',15176.99247,37),
  ('descuento','Redondeo',0.7655499998945743,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-01-01', 2029183.78, 488271.78, 1540912, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '23175845879' AND c.nombre = 'CONSORCIO DE PROPIETARIOS CALLE SANCHEZ DE BUSTAMANTE 2466,2468 Y 2472, CABA'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',965838,1),
  ('haber','Retiro de residuos',27616,3),
  ('haber','Clasificación de residuos',29727.8,4),
  ('haber','Valor vivienda',6340.8,5),
  ('haber','Plus antigüedad (2%)',262386.60000000003,7),
  ('haber','Plus cocheras',23553.4,8),
  ('haber','Plus jardín',23553.4,10),
  ('haber','Plus piletas',39622.7,13),
  ('haber','Horas extras 50%',299853.91724999994,15),
  ('haber','Horas extras 100%',27572.773999999998,16),
  ('haber','Feriados trabajados',203117.70133333333,17),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',223210.14018416664,30),
  ('descuento','Ley 19032',60875.49277749999,31),
  ('descuento','Obra Social',60875.49277749999,32),
  ('descuento','SUTERH',40583.661851666664,34),
  ('descuento','Caja Prot. Flia.',20291.830925833332,35),
  ('descuento','FATERYH',20291.830925833332,36),
  ('descuento','Seguro vitalicio',15218.873194374997,37),
  ('descuento','Descuento vivienda',6340.8,38),
  ('descuento','Redondeo',0.6919052083976567,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 1709630.47, 378299.47, 1331331, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20283772323' AND c.nombre = 'CONS PROP SGO DEL ESTERO 336 46 CAP FED'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',901288,1),
  ('haber','Retiro de residuos',138803,3),
  ('haber','Clasificación de residuos',48420.4,4),
  ('haber','Valor vivienda',6454.9,5),
  ('haber','Plus antigüedad (2%)',324346.4,7),
  ('haber','Horas extras 100%',170317.52399999998,16),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',188059.32463999998,30),
  ('descuento','Ley 19032',51288.90671999999,31),
  ('descuento','Obra Social',51288.90671999999,32),
  ('descuento','SUTERH',34192.604479999995,34),
  ('descuento','Caja Prot. Flia.',17096.302239999997,35),
  ('descuento','FATERYH',17096.302239999997,36),
  ('descuento','Seguro vitalicio',12822.226679999998,37),
  ('descuento','Descuento vivienda',6454.9,38),
  ('descuento','Redondeo',0.2497200001962483,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 777378.07, 177239.07, 600139, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20338776390' AND c.nombre = 'CONS PROP SGO DEL ESTERO 336 46 CAP FED'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',524678,1),
  ('haber','Horas extras 100%',125922.72,16),
  ('no_remunerativo','Adicional viáticos',66777.2,21),
  ('no_remunerativo','Adicional remuneratorio mensual',60000,22),
  ('descuento','Jubilación',85511.57119999999,30),
  ('descuento','Ley 19032',23321.337599999995,31),
  ('descuento','Obra Social',23321.337599999995,32),
  ('descuento','Diferencia Obra Social Ley 26475',8159.372400000004,33),
  ('descuento','SUTERH',15547.558399999998,34),
  ('descuento','Caja Prot. Flia.',7773.779199999999,35),
  ('descuento','FATERYH',7773.779199999999,36),
  ('descuento','Seguro vitalicio',5830.334399999999,37),
  ('descuento','Redondeo',0.15000000002328306,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 926826.49, 205260.49, 721566, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20360647774' AND c.nombre = 'CONSORCIO DE PROPIETARIOS LIMA 461/67/73'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',526779,1),
  ('haber','Retiro de residuos',14056,3),
  ('haber','Clasificación de residuos',30262.9,4),
  ('haber','Plus antigüedad (2%)',228950.40000000002,7),
  ('no_remunerativo','Adicional viáticos',66777.2,21),
  ('no_remunerativo','Adicional remuneratorio mensual',60000,22),
  ('descuento','Jubilación',101950.80500000001,30),
  ('descuento','Ley 19032',27804.765,31),
  ('descuento','Obra Social',27804.765,32),
  ('descuento','Diferencia Obra Social Ley 26475',3675.9449999999997,33),
  ('descuento','SUTERH',18536.510000000002,34),
  ('descuento','Caja Prot. Flia.',9268.255000000001,35),
  ('descuento','FATERYH',9268.255000000001,36),
  ('descuento','Seguro vitalicio',6951.19125,37),
  ('descuento','Redondeo',0.9912500000791624,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 1525534.63, 338258.63, 1187276, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20175464299' AND c.nombre = 'CONS DE PROP AV BELGRANO 1266/70/76'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',983223,1),
  ('haber','Retiro de residuos',42168,3),
  ('haber','Clasificación de residuos',30262.9,4),
  ('haber','Valor vivienda',6454.9,5),
  ('haber','Plus antigüedad (2%)',343425.60000000003,7),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',167808.78399999999,30),
  ('descuento','Ley 19032',45766.03199999999,31),
  ('descuento','Obra Social',45766.03199999999,32),
  ('descuento','SUTERH',30510.688,34),
  ('descuento','Caja Prot. Flia.',15255.344,35),
  ('descuento','FATERYH',15255.344,36),
  ('descuento','Seguro vitalicio',11441.507999999998,37),
  ('descuento','Descuento vivienda',6454.9,38),
  ('descuento','Redondeo',0.23200000007636845,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 825019.67, 187602.67, 637417, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '23289923934' AND c.nombre = 'CONSORCIO DE PROPIETARIOS RODRIGUEZ PEÑA 1351'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',526779,1),
  ('haber','Retiro de residuos',12299,3),
  ('haber','Clasificación de residuos',30262.9,4),
  ('haber','Plus antigüedad (2%)',38158.4,7),
  ('haber','Feriados trabajados',90742.264,17),
  ('no_remunerativo','Adicional viáticos',66777.2,21),
  ('no_remunerativo','Adicional remuneratorio mensual',60000,22),
  ('descuento','Jubilación',90752.06404,30),
  ('descuento','Ley 19032',24750.562919999997,31),
  ('descuento','Obra Social',24750.562919999997,32),
  ('descuento','Diferencia Obra Social Ley 26475',8161.087080000005,33),
  ('descuento','SUTERH',16500.37528,34),
  ('descuento','Caja Prot. Flia.',8250.18764,35),
  ('descuento','FATERYH',8250.18764,36),
  ('descuento','Seguro vitalicio',6187.640729999999,37),
  ('descuento','Redondeo',0.9042500000214204,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 0, 0, 0, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '24269272801' AND c.nombre = 'CONSORCIO DE PROPIETARIOS RODRIGUEZ PEÑA 1351'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',42878.4,1)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 1790477.75, 395883.75, 1394594, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20204210749' AND c.nombre = 'CONSORCIO DE COPROPIETARIOS ARENALES 2120 24'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',983223,1),
  ('haber','Retiro de residuos',31626,3),
  ('haber','Clasificación de residuos',30262.9,4),
  ('haber','Valor vivienda',6454.9,5),
  ('haber','Plus antigüedad (2%)',457900.80000000005,7),
  ('haber','Plus vacacional',161009.87733333337,20),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',196952.52250666666,30),
  ('descuento','Ley 19032',53714.32432,31),
  ('descuento','Obra Social',53714.32432,32),
  ('descuento','SUTERH',35809.54954666667,34),
  ('descuento','Caja Prot. Flia.',17904.774773333334,35),
  ('descuento','FATERYH',17904.774773333334,36),
  ('descuento','Seguro vitalicio',13428.58108,37),
  ('descuento','Descuento vivienda',6454.9,38),
  ('descuento','Redondeo',0.27398666669614613,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 863428.35, 193373.35, 670055, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20263485409' AND c.nombre = 'CONSORCIO DE PROPIETARIOS DEL EDIFICIO PALOS 285'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',526779,1),
  ('haber','Plus antigüedad (2%)',209871.2,7),
  ('no_remunerativo','Adicional viáticos',66777.2,21),
  ('no_remunerativo','Adicional remuneratorio mensual',60000,22),
  ('descuento','Jubilación',94977.014,30),
  ('descuento','Ley 19032',25902.821999999996,31),
  ('descuento','Obra Social',25902.821999999996,32),
  ('descuento','Diferencia Obra Social Ley 26475',5577.888000000003,33),
  ('descuento','SUTERH',17268.548,34),
  ('descuento','Caja Prot. Flia.',8634.274,35),
  ('descuento','FATERYH',8634.274,36),
  ('descuento','Seguro vitalicio',6475.705499999999,37),
  ('descuento','Redondeo',0.9475000001257285,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 1445456.54, 320841.54, 1124615, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20275890074' AND c.nombre = 'CONSORCIO DE PROPIETARIOS URUGUAY 1025 27 29'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',983223,1),
  ('haber','Retiro de residuos',19327,3),
  ('haber','Clasificación de residuos',30262.9,4),
  ('haber','Valor vivienda',6454.9,5),
  ('haber','Plus antigüedad (2%)',286188,7),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',159000.138,30),
  ('descuento','Ley 19032',43363.674,31),
  ('descuento','Obra Social',43363.674,32),
  ('descuento','SUTERH',28909.116,34),
  ('descuento','Caja Prot. Flia.',14454.558,35),
  ('descuento','FATERYH',14454.558,36),
  ('descuento','Seguro vitalicio',10840.9185,37),
  ('descuento','Descuento vivienda',6454.9,38),
  ('descuento','Redondeo',0.736500000115484,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 1432830.57, 311640.57, 1121190, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20331992314' AND c.nombre = 'CONSORCIO DE PROPIETARIOS URUGUAY 1025 27 29'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',959865,1),
  ('haber','Plus antigüedad (2%)',286188,7),
  ('no_remunerativo','Adicional viáticos',66777.2,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',157611.322,30),
  ('descuento','Ley 19032',42984.905999999995,31),
  ('descuento','Obra Social',42984.905999999995,32),
  ('descuento','SUTERH',28656.604,34),
  ('descuento','Caja Prot. Flia.',14328.302,35),
  ('descuento','FATERYH',14328.302,36),
  ('descuento','Seguro vitalicio',10746.226499999999,37),
  ('descuento','Redondeo',0.3685000000987202,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 1628237.46, 360596.46, 1267641, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '27174620410' AND c.nombre = 'CONSORCIO DE PROPIETARIOS ALTE BROWN 720'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',901288,1),
  ('haber','Retiro de residuos',68523,3),
  ('haber','Clasificación de residuos',35911.97466666667,4),
  ('haber','Valor vivienda',6454.9,5),
  ('haber','Plus antigüedad (2%)',496059.2,7),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',179106.07821333336,30),
  ('descuento','Ley 19032',48847.11224,31),
  ('descuento','Obra Social',48847.11224,32),
  ('descuento','SUTERH',32564.74149333334,34),
  ('descuento','Caja Prot. Flia.',16282.37074666667,35),
  ('descuento','FATERYH',16282.37074666667,36),
  ('descuento','Seguro vitalicio',12211.77806,37),
  ('descuento','Descuento vivienda',6454.9,38),
  ('descuento','Redondeo',0.3890733332373202,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 1900062.58, 413263.58, 1486799, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20176328399' AND c.nombre = 'CONSORCIO PROPIETARIOS DE LA FINCA CALLE ARENALES 1648 50'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1144753,1),
  ('haber','Retiro de residuos',56224,3),
  ('haber','Clasificación de residuos',33087.437333333335,4),
  ('haber','Plus antigüedad (2%)',419742.4,7),
  ('haber','Plus cocheras',23977.4,8),
  ('haber','Plus movimiento coches',35501,9),
  ('haber','Licencia por enfermedad',1713285.2373333331,18),
  ('descuento','Días no trabajados',-1713285.2373333331,19),
  ('no_remunerativo','Adicional viáticos',66777.2,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',209006.86810666663,30),
  ('descuento','Ley 19032',57001.87311999999,31),
  ('descuento','Obra Social',57001.87311999999,32),
  ('descuento','SUTERH',38001.248746666664,34),
  ('descuento','Caja Prot. Flia.',19000.624373333332,35),
  ('descuento','FATERYH',19000.624373333332,36),
  ('descuento','Seguro vitalicio',14250.468279999997,37),
  ('descuento','Redondeo',0.1427866667509079,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 1666410.08, 362444.08, 1303966, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20947260481' AND c.nombre = 'CONSORCIO PROPIETARIOS DE LA FINCA CALLE ARENALES 1648 50'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1027121,1),
  ('haber','Plus antigüedad (2%)',343425.60000000003,7),
  ('haber','Adicional voluntario',44402.37,14),
  ('haber','Horas extras 100%',64683.38148571429,16),
  ('no_remunerativo','Adicional viáticos',66777.2,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',183305.05066342858,30),
  ('descuento','Ley 19032',49992.286544571434,31),
  ('descuento','Obra Social',49992.286544571434,32),
  ('descuento','SUTERH',33328.19102971429,34),
  ('descuento','Caja Prot. Flia.',16664.095514857145,35),
  ('descuento','FATERYH',16664.095514857145,36),
  ('descuento','Seguro vitalicio',12498.071636142859,37),
  ('descuento','Redondeo',0.5259624284226447,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 569741.4, 106826.4, 462915, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '23250288794' AND c.nombre = 'CONSORCIO PROPIETARIOS DE LA FINCA CALLE ARENALES 1648 50'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',42878.4,1),
  ('haber','Feriados trabajados',42878.4,17),
  ('no_remunerativo','Adicional remuneratorio mensual',55200,22),
  ('descuento','Jubilación',62671.488000000005,30),
  ('descuento','Ley 19032',17092.224000000002,31),
  ('descuento','Obra Social',17092.224000000002,32),
  ('descuento','Caja Prot. Flia.',5697.408,35),
  ('descuento','Seguro vitalicio',4273.0560000000005,37),
  ('descuento','Redondeo',0.5999999999767169,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 1619103.97, 352154.97, 1266949, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20942335351' AND c.nombre = 'CONSORCIO DE PROPIETARIOS SALTA 555 59'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1049357,1),
  ('haber','Retiro de residuos',47439,3),
  ('haber','Clasificación de residuos',30262.9,4),
  ('haber','Plus antigüedad (2%)',305267.2,7),
  ('no_remunerativo','Adicional viáticos',66777.2,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',178101.36299999998,30),
  ('descuento','Ley 19032',48573.098999999995,31),
  ('descuento','Obra Social',48573.098999999995,32),
  ('descuento','SUTERH',32382.065999999995,34),
  ('descuento','Caja Prot. Flia.',16191.032999999998,35),
  ('descuento','FATERYH',16191.032999999998,36),
  ('descuento','Seguro vitalicio',12143.274749999999,37),
  ('descuento','Redondeo',0.6677500000223517,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 0, 0, 0, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '24269272801' AND c.nombre = 'CONSORCIO DE PROPIETARIOS SALTA 555 59'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',42878.4,1),
  ('haber','Clasificación de residuos',30262.9,4)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 1567130.47, 591371.47, 975759, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20942347643' AND c.nombre = 'CONSORCIO DE PROPIETARIOS AZCUENAGA 1570 IQ-RECOLETA'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',983223,1),
  ('haber','Retiro de residuos',52710,3),
  ('haber','Clasificación de residuos',30262.9,4),
  ('haber','Valor vivienda',6454.9,5),
  ('haber','Plus antigüedad (2%)',286188,7),
  ('haber','Plus cocheras',23977.4,8),
  ('haber','Plus jardín',23977.4,10),
  ('haber','Plus piletas',40335.9,13),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',172384.24499999994,30),
  ('descuento','Ley 19032',47013.88499999999,31),
  ('descuento','Obra Social',47013.88499999999,32),
  ('descuento','SUTERH',31342.589999999993,34),
  ('descuento','Caja Prot. Flia.',15671.294999999996,35),
  ('descuento','FATERYH',15671.294999999996,36),
  ('descuento','Seguro vitalicio',11753.471249999997,37),
  ('descuento','Descuento vivienda',6454.9,38),
  ('descuento','Embargo',244065.9,39),
  ('descuento','Redondeo',0.96625000028871,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 2109535.98, 458823.98, 1650712, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20252571850' AND c.nombre = 'CONSORCIO DE PROPIETARIOS AZCUENAGA 1570 IQ-RECOLETA'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1027121,1),
  ('haber','Plus antigüedad (2%)',267108.8,7),
  ('haber','Horas extras 50%',221867.9657142857,15),
  ('haber','Horas extras 100%',88747.18628571428,16),
  ('haber','Plus vacacional',317913.38266666676,20),
  ('no_remunerativo','Adicional viáticos',66777.2,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',232048.90881333334,30),
  ('descuento','Ley 19032',63286.06604,31),
  ('descuento','Obra Social',63286.06604,32),
  ('descuento','SUTERH',42190.710693333334,34),
  ('descuento','Caja Prot. Flia.',21095.355346666667,35),
  ('descuento','FATERYH',21095.355346666667,36),
  ('descuento','Seguro vitalicio',15821.51651,37),
  ('descuento','Redondeo',0.44412333332002163,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-02-01', 1976066.18, 436249.18, 1539817, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '23175845879' AND c.nombre = 'CONSORCIO DE PROPIETARIOS CALLE SANCHEZ DE BUSTAMANTE 2466,2468 Y 2472, CABA'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',983223,1),
  ('haber','Retiro de residuos',28112,3),
  ('haber','Clasificación de residuos',30262.9,4),
  ('haber','Valor vivienda',6454.9,5),
  ('haber','Plus antigüedad (2%)',267108.8,7),
  ('haber','Plus cocheras',23977.4,8),
  ('haber','Plus jardín',23977.4,10),
  ('haber','Plus piletas',40335.9,13),
  ('haber','Horas extras 50%',368406.2287499999,15),
  ('haber','Horas extras 100%',84207.13799999998,16),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',217367.22334249996,30),
  ('descuento','Ley 19032',59281.970002499984,31),
  ('descuento','Obra Social',59281.970002499984,32),
  ('descuento','SUTERH',39521.31333499999,34),
  ('descuento','Caja Prot. Flia.',19760.656667499996,35),
  ('descuento','FATERYH',19760.656667499996,36),
  ('descuento','Seguro vitalicio',14820.492500624996,37),
  ('descuento','Descuento vivienda',6454.9,38),
  ('descuento','Redondeo',0.5157681251876056,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 941563.98, 208558.98, 733005, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20360647774' AND c.nombre = 'CONSORCIO DE PROPIETARIOS LIMA 461/67/73'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',535735,1),
  ('haber','Retiro de residuos',14295.2,3),
  ('haber','Clasificación de residuos',30777.3,4),
  ('haber','Plus antigüedad (2%)',232843.19999999998,7),
  ('no_remunerativo','Adicional viáticos',67912.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',60000,22),
  ('descuento','Jubilación',103571.95199999999,30),
  ('descuento','Ley 19032',28246.895999999997,31),
  ('descuento','Obra Social',28246.895999999997,32),
  ('descuento','Diferencia Obra Social Ley 26475',3768.9840000000004,33),
  ('descuento','SUTERH',18831.264,34),
  ('descuento','Caja Prot. Flia.',9415.632,35),
  ('descuento','FATERYH',9415.632,36),
  ('descuento','Seguro vitalicio',7061.723999999999,37),
  ('descuento','Redondeo',0.7800000000279397,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 1692373.8, 374655.8, 1317718, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20175464299' AND c.nombre = 'CONS DE PROP AV BELGRANO 1266/70/76'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',999938,1),
  ('haber','Retiro de residuos',42885.600000000006,3),
  ('haber','Clasificación de residuos',30777.3,4),
  ('haber','Valor vivienda',6564.6,5),
  ('haber','Plus antigüedad (2%)',349264.8,7),
  ('haber','Plus vacacional',142943.03,20),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',186161.0663,30),
  ('descuento','Ley 19032',50771.1999,31),
  ('descuento','Obra Social',50771.1999,32),
  ('descuento','SUTERH',33847.4666,34),
  ('descuento','Caja Prot. Flia.',16923.7333,35),
  ('descuento','FATERYH',16923.7333,36),
  ('descuento','Seguro vitalicio',12692.799975,37),
  ('descuento','Descuento vivienda',6564.6,38),
  ('descuento','Redondeo',0.4692750000394881,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 791883.18, 181949.18, 609934, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '23289923934' AND c.nombre = 'CONSORCIO DE PROPIETARIOS RODRIGUEZ PEÑA 1351'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',535735,1),
  ('haber','Retiro de residuos',12508.300000000001,3),
  ('haber','Clasificación de residuos',30777.3,4),
  ('haber','Plus antigüedad (2%)',38807.2,7),
  ('haber','Feriados trabajados',46142.512,17),
  ('no_remunerativo','Adicional viáticos',67912.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',60000,22),
  ('descuento','Jubilación',87107.10932,30),
  ('descuento','Ley 19032',23756.48436,31),
  ('descuento','Obra Social',23756.48436,32),
  ('descuento','Diferencia Obra Social Ley 26475',9714.665640000003,33),
  ('descuento','SUTERH',15837.65624,34),
  ('descuento','Caja Prot. Flia.',7918.82812,35),
  ('descuento','FATERYH',7918.82812,36),
  ('descuento','Seguro vitalicio',5939.12109,37),
  ('descuento','Redondeo',0.36524999991524965,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 0, 0, 0, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '24269272801' AND c.nombre = 'CONSORCIO DE PROPIETARIOS RODRIGUEZ PEÑA 1351'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',43607.3,1)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 1655131.48, 366555.48, 1288576, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20204210749' AND c.nombre = 'CONSORCIO DE COPROPIETARIOS ARENALES 2120 24'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',999938,1),
  ('haber','Retiro de residuos',32164.2,3),
  ('haber','Clasificación de residuos',30777.3,4),
  ('haber','Valor vivienda',6564.6,5),
  ('haber','Plus antigüedad (2%)',465686.39999999997,7),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',182064.355,30),
  ('descuento','Ley 19032',49653.915,31),
  ('descuento','Obra Social',49653.915,32),
  ('descuento','SUTERH',33102.61,34),
  ('descuento','Caja Prot. Flia.',16551.305,35),
  ('descuento','FATERYH',16551.305,36),
  ('descuento','Seguro vitalicio',12413.47875,37),
  ('descuento','Descuento vivienda',6564.6,38),
  ('descuento','Redondeo',0.9837499998975545,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 2226234.51, 490770.51, 1735464, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20275890074' AND c.nombre = 'CONSORCIO DE PROPIETARIOS URUGUAY 1025 27 29'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',999938,1),
  ('haber','Retiro de residuos',19655.9,3),
  ('haber','Clasificación de residuos',30777.3,4),
  ('haber','Valor vivienda',6564.6,5),
  ('haber','Plus antigüedad (2%)',291054,7),
  ('haber','Horas extras 50%',758244.2625000001,15),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',244885.746875,30),
  ('descuento','Ley 19032',66787.02187499999,31),
  ('descuento','Obra Social',66787.02187499999,32),
  ('descuento','SUTERH',44524.68125,34),
  ('descuento','Caja Prot. Flia.',22262.340625,35),
  ('descuento','FATERYH',22262.340625,36),
  ('descuento','Seguro vitalicio',16696.755468749998,37),
  ('descuento','Descuento vivienda',6564.6,38),
  ('descuento','Redondeo',0.44609374995343387,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 1653880.43, 366283.43, 1287597, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '27174620410' AND c.nombre = 'CONSORCIO DE PROPIETARIOS ALTE BROWN 720'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',916610,1),
  ('haber','Retiro de residuos',69689.1,3),
  ('haber','Clasificación de residuos',36522.396,4),
  ('haber','Valor vivienda',6564.6,5),
  ('haber','Plus antigüedad (2%)',504493.6,7),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',181926.76656,30),
  ('descuento','Ley 19032',49616.39088,31),
  ('descuento','Obra Social',49616.39088,32),
  ('descuento','SUTERH',33077.59392,34),
  ('descuento','Caja Prot. Flia.',16538.79696,35),
  ('descuento','FATERYH',16538.79696,36),
  ('descuento','Seguro vitalicio',12404.09772,37),
  ('descuento','Descuento vivienda',6564.6,38),
  ('descuento','Redondeo',0.7378799999132752,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 1930326.89, 419845.89, 1510481, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20176328399' AND c.nombre = 'CONSORCIO PROPIETARIOS DE LA FINCA CALLE ARENALES 1648 50'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1164214,1),
  ('haber','Retiro de residuos',57180.8,3),
  ('haber','Clasificación de residuos',33649.848,4),
  ('haber','Plus antigüedad (2%)',426879.19999999995,7),
  ('haber','Plus cocheras',24385,8),
  ('haber','Plus movimiento coches',36104.6,9),
  ('no_remunerativo','Adicional viáticos',67912.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',212335.85428,30),
  ('descuento','Ley 19032',57909.77844,31),
  ('descuento','Obra Social',57909.77844,32),
  ('descuento','SUTERH',38606.51896,34),
  ('descuento','Caja Prot. Flia.',19303.25948,35),
  ('descuento','FATERYH',19303.25948,36),
  ('descuento','Seguro vitalicio',14477.44461,37),
  ('descuento','Redondeo',0.9456899999640882,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 1709146.11, 371739.11, 1337407, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20947260481' AND c.nombre = 'CONSORCIO PROPIETARIOS DE LA FINCA CALLE ARENALES 1648 50'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1044582,1),
  ('haber','Plus antigüedad (2%)',349264.8,7),
  ('haber','Adicional voluntario',45157.21,14),
  ('haber','Horas extras 100%',82228.80057142857,16),
  ('no_remunerativo','Adicional viáticos',67912.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',188005.98416285714,30),
  ('descuento','Ley 19032',51274.35931714286,31),
  ('descuento','Obra Social',51274.35931714286,32),
  ('descuento','SUTERH',34182.90621142857,34),
  ('descuento','Caja Prot. Flia.',17091.453105714285,35),
  ('descuento','FATERYH',17091.453105714285,36),
  ('descuento','Seguro vitalicio',12818.589829285715,37),
  ('descuento','Redondeo',0.794477857183665,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 651098.98, 122080.98, 529018, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '23250288794' AND c.nombre = 'CONSORCIO PROPIETARIOS DE LA FINCA CALLE ARENALES 1648 50'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',43607.3,1),
  ('haber','Feriados trabajados',43607.3,17),
  ('no_remunerativo','Adicional remuneratorio mensual',62400,22),
  ('descuento','Jubilación',71620.8405,30),
  ('descuento','Ley 19032',19532.9565,31),
  ('descuento','Obra Social',19532.9565,32),
  ('descuento','Caja Prot. Flia.',6510.985500000001,35),
  ('descuento','Seguro vitalicio',4883.239125,37),
  ('descuento','Redondeo',0.42812499997671694,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 0, 0, 0, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '24269272801' AND c.nombre = 'CONSORCIO DE PROPIETARIOS SALTA 555 59'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',43607.3,1)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 2054008.38, 453311.38, 1600697, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '23175845879' AND c.nombre = 'CONSORCIO DE PROPIETARIOS CALLE SANCHEZ DE BUSTAMANTE 2466,2468 Y 2472, CABA'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',999938,1),
  ('haber','Retiro de residuos',28590.4,3),
  ('haber','Clasificación de residuos',30777.3,4),
  ('haber','Valor vivienda',6564.6,5),
  ('haber','Plus antigüedad (2%)',271650.39999999997,7),
  ('haber','Plus cocheras',24385,8),
  ('haber','Plus jardín',24385,10),
  ('haber','Plus piletas',41021.6,13),
  ('haber','Horas extras 50%',406784.00549999997,15),
  ('haber','Horas extras 100%',99911.861,16),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',225940.898315,30),
  ('descuento','Ley 19032',61620.244995,31),
  ('descuento','Obra Social',61620.244995,32),
  ('descuento','SUTERH',41080.16333,34),
  ('descuento','Caja Prot. Flia.',20540.081665,35),
  ('descuento','FATERYH',20540.081665,36),
  ('descuento','Seguro vitalicio',15405.06124875,37),
  ('descuento','Descuento vivienda',6564.6,38),
  ('descuento','Redondeo',0.20971375005319715,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 2015637.56, 444965.56, 1570672, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20283772323' AND c.nombre = 'CONS PROP SGO DEL ESTERO 336 46 CAP FED'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',916610,1),
  ('haber','Retiro de residuos',141165.1,3),
  ('haber','Clasificación de residuos',49243.5,4),
  ('haber','Valor vivienda',6564.6,5),
  ('haber','Plus antigüedad (2%)',329861.19999999995,7),
  ('haber','Horas extras 100%',173213.328,16),
  ('haber','Plus vacacional',278978.85000000003,20),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',221720.02358000004,30),
  ('descuento','Ley 19032',60469.09734000001,31),
  ('descuento','Obra Social',60469.09734000001,32),
  ('descuento','SUTERH',40312.73156000001,34),
  ('descuento','Caja Prot. Flia.',20156.365780000004,35),
  ('descuento','FATERYH',20156.365780000004,36),
  ('descuento','Seguro vitalicio',15117.274335000002,37),
  ('descuento','Descuento vivienda',6564.6,38),
  ('descuento','Redondeo',0.9777149998117238,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 789500.06, 180047.06, 609453, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20338776390' AND c.nombre = 'CONS PROP SGO DEL ESTERO 336 46 CAP FED'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',533538,1),
  ('haber','Feriados trabajados',128049.12,17),
  ('no_remunerativo','Adicional viáticos',67912.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',60000,22),
  ('descuento','Jubilación',86844.9582,30),
  ('descuento','Ley 19032',23684.9886,31),
  ('descuento','Obra Social',23684.9886,32),
  ('descuento','Diferencia Obra Social Ley 26475',8330.891399999997,33),
  ('descuento','SUTERH',15789.992400000001,34),
  ('descuento','Caja Prot. Flia.',7894.9962000000005,35),
  ('descuento','FATERYH',7894.9962000000005,36),
  ('descuento','Seguro vitalicio',5921.24715,37),
  ('descuento','Redondeo',0.4387499999720603,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 912048.99, 203024.99, 709024, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20263485409' AND c.nombre = 'CONSORCIO DE PROPIETARIOS DEL EDIFICIO PALOS 285'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',535735,1),
  ('haber','Plus antigüedad (2%)',213439.59999999998,7),
  ('haber','Plus vacacional',34961.5,20),
  ('no_remunerativo','Adicional viáticos',67912.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',60000,22),
  ('descuento','Jubilación',100325.346,30),
  ('descuento','Ley 19032',27361.458,31),
  ('descuento','Obra Social',27361.458,32),
  ('descuento','Diferencia Obra Social Ley 26475',4654.421999999999,33),
  ('descuento','SUTERH',18240.972,34),
  ('descuento','Caja Prot. Flia.',9120.486,35),
  ('descuento','FATERYH',9120.486,36),
  ('descuento','Seguro vitalicio',6840.3645,37),
  ('descuento','Redondeo',0.3925000000745058,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 1607218.92, 349569.92, 1257649, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20331992314' AND c.nombre = 'CONSORCIO DE PROPIETARIOS URUGUAY 1025 27 29'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',976183,1),
  ('haber','Plus antigüedad (2%)',291054,7),
  ('haber','Plus vacacional',152068.5,20),
  ('no_remunerativo','Adicional viáticos',67912.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',176793.98,30),
  ('descuento','Ley 19032',48216.54,31),
  ('descuento','Obra Social',48216.54,32),
  ('descuento','SUTERH',32144.36,34),
  ('descuento','Caja Prot. Flia.',16072.18,35),
  ('descuento','FATERYH',16072.18,36),
  ('descuento','Seguro vitalicio',12054.135,37),
  ('descuento','Redondeo',0.9150000000372529,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 1644590.26, 357698.26, 1286892, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20942335351' AND c.nombre = 'CONSORCIO DE PROPIETARIOS SALTA 555 59'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1067196,1),
  ('haber','Retiro de residuos',48246.3,3),
  ('haber','Clasificación de residuos',30777.3,4),
  ('haber','Plus antigüedad (2%)',310457.6,7),
  ('no_remunerativo','Adicional viáticos',67912.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',180904.86700000003,30),
  ('descuento','Ley 19032',49337.691000000006,31),
  ('descuento','Obra Social',49337.691000000006,32),
  ('descuento','SUTERH',32891.794,34),
  ('descuento','Caja Prot. Flia.',16445.897,35),
  ('descuento','FATERYH',16445.897,36),
  ('descuento','Seguro vitalicio',12334.422750000002,37),
  ('descuento','Redondeo',0.5597499997820705,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 1591732.92, 600632.92, 991100, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20942347643' AND c.nombre = 'CONSORCIO DE PROPIETARIOS AZCUENAGA 1570 IQ-RECOLETA'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',999938,1),
  ('haber','Retiro de residuos',53607,3),
  ('haber','Clasificación de residuos',30777.3,4),
  ('haber','Valor vivienda',6564.6,5),
  ('haber','Plus antigüedad (2%)',291054,7),
  ('haber','Plus cocheras',24385,8),
  ('haber','Plus jardín',24385,10),
  ('haber','Plus piletas',41021.6,13),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',175090.57500000004,30),
  ('descuento','Ley 19032',47751.975000000006,31),
  ('descuento','Obra Social',47751.975000000006,32),
  ('descuento','SUTERH',31834.650000000005,34),
  ('descuento','Caja Prot. Flia.',15917.325000000003,35),
  ('descuento','FATERYH',15917.325000000003,36),
  ('descuento','Seguro vitalicio',11937.993750000001,37),
  ('descuento','Descuento vivienda',6564.6,38),
  ('descuento','Embargo',247866.5,39),
  ('descuento','Redondeo',0.41874999983701855,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-03-01', 2344238.97, 509871.97, 1834367, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20252571850' AND c.nombre = 'CONSORCIO DE PROPIETARIOS AZCUENAGA 1570 IQ-RECOLETA'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1044582,1),
  ('haber','Plus antigüedad (2%)',271650.39999999997,7),
  ('haber','Horas extras 50%',180511.87199999997,15),
  ('haber','Horas extras 100%',180511.87199999997,16),
  ('haber','Plus vacacional',479070.3,20),
  ('no_remunerativo','Adicional viáticos',67912.5,21),
  ('no_remunerativo','Adicional remuneratorio mensual',120000,22),
  ('descuento','Jubilación',257866.28383999996,30),
  ('descuento','Ley 19032',70327.16831999998,31),
  ('descuento','Obra Social',70327.16831999998,32),
  ('descuento','SUTERH',46884.77887999999,34),
  ('descuento','Caja Prot. Flia.',23442.389439999995,35),
  ('descuento','FATERYH',23442.389439999995,36),
  ('descuento','Seguro vitalicio',17581.792079999996,37),
  ('descuento','Redondeo',0.026320000179111958,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 1790832.95, 396339.95, 1394493, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20283772323' AND c.nombre = 'CONS PROP SGO DEL ESTERO 336 46 CAP FED'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',957382,1),
  ('haber','Retiro de residuos',146955.80000000002,3),
  ('haber','Clasificación de residuos',55107.424,4),
  ('haber','Valor vivienda',6833.8,5),
  ('haber','Plus antigüedad (2%)',343393.19999999995,7),
  ('haber','Horas extras 100%',181160.66687999998,16),
  ('no_remunerativo','Adicional remuneratorio mensual',100000,22),
  ('descuento','Jubilación',196991.6179968,30),
  ('descuento','Ley 19032',53724.98672639999,31),
  ('descuento','Obra Social',53724.98672639999,32),
  ('descuento','SUTERH',35816.6578176,34),
  ('descuento','Caja Prot. Flia.',17908.3289088,35),
  ('descuento','FATERYH',17908.3289088,36),
  ('descuento','Seguro vitalicio',13431.246681599998,37),
  ('descuento','Descuento vivienda',6833.8,38),
  ('descuento','Redondeo',0.06288640014827251,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 809505.49, 185111.49, 624394, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20338776390' AND c.nombre = 'CONS PROP SGO DEL ESTERO 336 46 CAP FED'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',555490,1),
  ('haber','Horas extras 100%',133317.59999999998,16),
  ('no_remunerativo','Adicional viáticos',70696.9,21),
  ('no_remunerativo','Adicional remuneratorio mensual',50000,22),
  ('descuento','Jubilación',89045.495,30),
  ('descuento','Ley 19032',24285.135,31),
  ('descuento','Obra Social',24285.135,32),
  ('descuento','Diferencia Obra Social Ley 26475',9044.265000000003,33),
  ('descuento','SUTERH',16190.09,34),
  ('descuento','Caja Prot. Flia.',8095.045,35),
  ('descuento','FATERYH',8095.045,36),
  ('descuento','Seguro vitalicio',6071.28375,37),
  ('descuento','Redondeo',0.9937500000232831,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 976862.01, 216491.01, 760371, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20360647774' AND c.nombre = 'CONSORCIO DE PROPIETARIOS LIMA 461/67/73'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',566849,1),
  ('haber','Retiro de residuos',14881.6,3),
  ('haber','Clasificación de residuos',32039.2,4),
  ('haber','Plus antigüedad (2%)',242395.19999999998,7),
  ('no_remunerativo','Adicional viáticos',70696.9,21),
  ('no_remunerativo','Adicional remuneratorio mensual',50000,22),
  ('descuento','Jubilación',107454.809,30),
  ('descuento','Ley 19032',29305.856999999996,31),
  ('descuento','Obra Social',29305.856999999996,32),
  ('descuento','Diferencia Obra Social Ley 26475',4023.543000000005,33),
  ('descuento','SUTERH',19537.237999999998,34),
  ('descuento','Caja Prot. Flia.',9768.618999999999,35),
  ('descuento','FATERYH',9768.618999999999,36),
  ('descuento','Seguro vitalicio',7326.464249999999,37),
  ('descuento','Redondeo',0.1062500000698492,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 1591528.05, 352991.05, 1238537, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20175464299' AND c.nombre = 'CONS DE PROP AV BELGRANO 1266/70/76'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1044417,1),
  ('haber','Retiro de residuos',44644.8,3),
  ('haber','Clasificación de residuos',32039.2,4),
  ('haber','Valor vivienda',6833.8,5),
  ('haber','Plus antigüedad (2%)',363592.8,7),
  ('no_remunerativo','Adicional remuneratorio mensual',100000,22),
  ('descuento','Jubilación',175068.03600000002,30),
  ('descuento','Ley 19032',47745.828,31),
  ('descuento','Obra Social',47745.828,32),
  ('descuento','SUTERH',31830.552000000003,34),
  ('descuento','Caja Prot. Flia.',15915.276000000002,35),
  ('descuento','FATERYH',15915.276000000002,36),
  ('descuento','Seguro vitalicio',11936.457,37),
  ('descuento','Descuento vivienda',6833.8,38),
  ('descuento','Redondeo',0.4529999999795109,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 821772.62, 188926.62, 632846, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '23289923934' AND c.nombre = 'CONSORCIO DE PROPIETARIOS RODRIGUEZ PEÑA 1351'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',566849,1),
  ('haber','Retiro de residuos',13021.4,3),
  ('haber','Clasificación de residuos',32039.2,4),
  ('haber','Plus antigüedad (2%)',40399.2,7),
  ('haber','Feriados trabajados',48766.312,17),
  ('no_remunerativo','Adicional viáticos',70696.9,21),
  ('no_remunerativo','Adicional remuneratorio mensual',50000,22),
  ('descuento','Jubilación',90394.92132,30),
  ('descuento','Ley 19032',24653.160359999998,31),
  ('descuento','Obra Social',24653.160359999998,32),
  ('descuento','Diferencia Obra Social Ley 26475',10191.209639999997,33),
  ('descuento','SUTERH',16435.44024,34),
  ('descuento','Caja Prot. Flia.',8217.72012,35),
  ('descuento','FATERYH',8217.72012,36),
  ('descuento','Seguro vitalicio',6163.2900899999995,37),
  ('descuento','Redondeo',0.6102500000270084,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 0, 0, 0, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '24269272801' AND c.nombre = 'CONSORCIO DE PROPIETARIOS RODRIGUEZ PEÑA 1351'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',45395.2,1)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 1701564.97, 376923.97, 1324641, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20204210749' AND c.nombre = 'CONSORCIO DE COPROPIETARIOS ARENALES 2120 24'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1044417,1),
  ('haber','Retiro de residuos',33483.6,3),
  ('haber','Clasificación de residuos',32039.2,4),
  ('haber','Valor vivienda',6833.8,5),
  ('haber','Plus antigüedad (2%)',484790.39999999997,7),
  ('no_remunerativo','Adicional remuneratorio mensual',100000,22),
  ('descuento','Jubilación',187172.04,30),
  ('descuento','Ley 19032',51046.92,31),
  ('descuento','Obra Social',51046.92,32),
  ('descuento','SUTERH',34031.28,34),
  ('descuento','Caja Prot. Flia.',17015.64,35),
  ('descuento','FATERYH',17015.64,36),
  ('descuento','Seguro vitalicio',12761.73,37),
  ('descuento','Descuento vivienda',6833.8,38),
  ('descuento','Redondeo',0.9699999999720603,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 936043.46, 208837.46, 727206, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20263485409' AND c.nombre = 'CONSORCIO DE PROPIETARIOS DEL EDIFICIO PALOS 285'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',566849,1),
  ('haber','Plus antigüedad (2%)',222195.59999999998,7),
  ('haber','Plus vacacional',26301.5,20),
  ('no_remunerativo','Adicional viáticos',70696.9,21),
  ('no_remunerativo','Adicional remuneratorio mensual',50000,22),
  ('descuento','Jubilación',102964.73,30),
  ('descuento','Ley 19032',28081.289999999997,31),
  ('descuento','Obra Social',28081.289999999997,32),
  ('descuento','Diferencia Obra Social Ley 26475',5248.110000000004,33),
  ('descuento','SUTERH',18720.86,34),
  ('descuento','Caja Prot. Flia.',9360.43,35),
  ('descuento','FATERYH',9360.43,36),
  ('descuento','Seguro vitalicio',7020.322499999999,37),
  ('descuento','Redondeo',0.46250000002328306,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 1506747.1, 334551.1, 1172196, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20275890074' AND c.nombre = 'CONSORCIO DE PROPIETARIOS URUGUAY 1025 27 29'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1044417,1),
  ('haber','Retiro de residuos',20462.2,3),
  ('haber','Clasificación de residuos',32039.2,4),
  ('haber','Valor vivienda',6833.8,5),
  ('haber','Plus antigüedad (2%)',302994,7),
  ('no_remunerativo','Adicional remuneratorio mensual',100000,22),
  ('descuento','Jubilación',165742.082,30),
  ('descuento','Ley 19032',45202.386,31),
  ('descuento','Obra Social',45202.386,32),
  ('descuento','SUTERH',30134.924,34),
  ('descuento','Caja Prot. Flia.',15067.462,35),
  ('descuento','FATERYH',15067.462,36),
  ('descuento','Seguro vitalicio',11300.5965,37),
  ('descuento','Descuento vivienda',6833.8,38),
  ('descuento','Redondeo',0.8985000001266599,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 1489798.04, 324031.04, 1165767, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20331992314' AND c.nombre = 'CONSORCIO DE PROPIETARIOS URUGUAY 1025 27 29'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1016107,1),
  ('haber','Plus antigüedad (2%)',302994,7),
  ('no_remunerativo','Adicional viáticos',70696.9,21),
  ('no_remunerativo','Adicional remuneratorio mensual',100000,22),
  ('descuento','Jubilación',163877.769,30),
  ('descuento','Ley 19032',44693.937,31),
  ('descuento','Obra Social',44693.937,32),
  ('descuento','SUTERH',29795.958,34),
  ('descuento','Caja Prot. Flia.',14897.979,35),
  ('descuento','FATERYH',14897.979,36),
  ('descuento','Seguro vitalicio',11173.48425,37),
  ('descuento','Redondeo',0.14325000019744039,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 1720173.35, 380971.35, 1339202, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '27174620410' AND c.nombre = 'CONSORCIO DE PROPIETARIOS ALTE BROWN 720'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',957382,1),
  ('haber','Retiro de residuos',72547.8,3),
  ('haber','Clasificación de residuos',38019.850666666665,4),
  ('haber','Valor vivienda',6833.8,5),
  ('haber','Plus antigüedad (2%)',545389.2,7),
  ('no_remunerativo','Adicional remuneratorio mensual',100000,22),
  ('descuento','Jubilación',189218.99157333333,30),
  ('descuento','Ley 19032',51605.17952,31),
  ('descuento','Obra Social',51605.17952,32),
  ('descuento','SUTERH',34403.45301333333,34),
  ('descuento','Caja Prot. Flia.',17201.726506666666,35),
  ('descuento','FATERYH',17201.726506666666,36),
  ('descuento','Seguro vitalicio',12901.29488,37),
  ('descuento','Descuento vivienda',6833.8,38),
  ('descuento','Redondeo',0.7008533333428204,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 1984591.68, 431648.68, 1552943, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20176328399' AND c.nombre = 'CONSORCIO PROPIETARIOS DE LA FINCA CALLE ARENALES 1648 50'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1211978,1),
  ('haber','Retiro de residuos',59526.4,3),
  ('haber','Clasificación de residuos',35029.52533333333,4),
  ('haber','Plus antigüedad (2%)',444391.19999999995,7),
  ('haber','Plus cocheras',25384.8,8),
  ('haber','Plus movimiento coches',37584.8,9),
  ('haber','Licencia por enfermedad',1813894.7253333332,18),
  ('descuento','Días no trabajados',-1813894.7253333332,19),
  ('no_remunerativo','Adicional viáticos',70696.9,21),
  ('no_remunerativo','Adicional remuneratorio mensual',100000,22),
  ('descuento','Jubilación',218305.07878666665,30),
  ('descuento','Ley 19032',59537.748759999995,31),
  ('descuento','Obra Social',59537.748759999995,32),
  ('descuento','SUTERH',39691.832506666666,34),
  ('descuento','Caja Prot. Flia.',19845.916253333333,35),
  ('descuento','FATERYH',19845.916253333333,36),
  ('descuento','Seguro vitalicio',14884.437189999999,37),
  ('descuento','Redondeo',0.05317666684277356,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 1735534.73, 377478.73, 1358056, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20947260481' AND c.nombre = 'CONSORCIO PROPIETARIOS DE LA FINCA CALLE ARENALES 1648 50'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1085873,1),
  ('haber','Plus antigüedad (2%)',363592.8,7),
  ('haber','Adicional voluntario',46963.5,14),
  ('haber','Horas extras 100%',68408.19657142858,16),
  ('no_remunerativo','Adicional viáticos',70696.9,21),
  ('no_remunerativo','Adicional remuneratorio mensual',100000,22),
  ('descuento','Jubilación',190908.78362285713,30),
  ('descuento','Ley 19032',52066.03189714286,31),
  ('descuento','Obra Social',52066.03189714286,32),
  ('descuento','SUTERH',34710.68793142857,34),
  ('descuento','Caja Prot. Flia.',17355.343965714284,35),
  ('descuento','FATERYH',17355.343965714284,36),
  ('descuento','Seguro vitalicio',13016.507974285714,37),
  ('descuento','Redondeo',0.3346828571520746,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 640137.8, 120025.8, 520112, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '23250288794' AND c.nombre = 'CONSORCIO PROPIETARIOS DE LA FINCA CALLE ARENALES 1648 50'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',45395.2,1),
  ('haber','Feriados trabajados',45395.2,17),
  ('no_remunerativo','Adicional remuneratorio mensual',50000,22),
  ('descuento','Jubilación',70415.13599999998,30),
  ('descuento','Ley 19032',19204.127999999993,31),
  ('descuento','Obra Social',19204.127999999993,32),
  ('descuento','Caja Prot. Flia.',6401.375999999998,35),
  ('descuento','Seguro vitalicio',4801.031999999998,37),
  ('descuento','Redondeo',0.20000000012805685,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 1687135.88, 366951.88, 1320184, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20942335351' AND c.nombre = 'CONSORCIO DE PROPIETARIOS SALTA 555 59'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1110980,1),
  ('haber','Retiro de residuos',50225.4,3),
  ('haber','Clasificación de residuos',32039.2,4),
  ('haber','Plus antigüedad (2%)',323193.6,7),
  ('no_remunerativo','Adicional viáticos',70696.9,21),
  ('no_remunerativo','Adicional remuneratorio mensual',100000,22),
  ('descuento','Jubilación',185584.86099999995,30),
  ('descuento','Ley 19032',50614.052999999985,31),
  ('descuento','Obra Social',50614.052999999985,32),
  ('descuento','SUTERH',33742.70199999999,34),
  ('descuento','Caja Prot. Flia.',16871.350999999995,35),
  ('descuento','FATERYH',16871.350999999995,36),
  ('descuento','Seguro vitalicio',12653.513249999996,37),
  ('descuento','Redondeo',0.7842500002589077,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 0, 0, 0, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '24269272801' AND c.nombre = 'CONSORCIO DE PROPIETARIOS SALTA 555 59'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',45395.2,1),
  ('haber','Clasificación de residuos',32039.2,4)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 1635563.39, 618121.39, 1017442, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20942347643' AND c.nombre = 'CONSORCIO DE PROPIETARIOS AZCUENAGA 1570 IQ-RECOLETA'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1044417,1),
  ('haber','Retiro de residuos',55806,3),
  ('haber','Clasificación de residuos',32039.2,4),
  ('haber','Valor vivienda',6833.8,5),
  ('haber','Plus antigüedad (2%)',302994,7),
  ('haber','Plus cocheras',25384.8,8),
  ('haber','Plus jardín',25384.8,10),
  ('haber','Plus piletas',42703.5,13),
  ('no_remunerativo','Adicional remuneratorio mensual',100000,22),
  ('descuento','Jubilación',179911.94100000002,30),
  ('descuento','Ley 19032',49066.893000000004,31),
  ('descuento','Obra Social',49066.893000000004,32),
  ('descuento','SUTERH',32711.262000000002,34),
  ('descuento','Caja Prot. Flia.',16355.631000000001,35),
  ('descuento','FATERYH',16355.631000000001,36),
  ('descuento','Seguro vitalicio',12266.723250000001,37),
  ('descuento','Descuento vivienda',6833.8,38),
  ('descuento','Embargo',255552.62,39),
  ('descuento','Redondeo',0.2942499998025596,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 2297648.33, 499738.33, 1797910, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '20252571850' AND c.nombre = 'CONSORCIO DE PROPIETARIOS AZCUENAGA 1570 IQ-RECOLETA'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1085873,1),
  ('haber','Plus antigüedad (2%)',302994,7),
  ('haber','Horas extras 50%',404755.52571428573,15),
  ('haber','Horas extras 100%',333328.08,16),
  ('no_remunerativo','Adicional viáticos',70696.9,21),
  ('no_remunerativo','Adicional remuneratorio mensual',100000,22),
  ('descuento','Jubilación',252741.2256285714,30),
  ('descuento','Ley 19032',68929.42517142856,31),
  ('descuento','Obra Social',68929.42517142856,32),
  ('descuento','SUTERH',45952.95011428571,34),
  ('descuento','Caja Prot. Flia.',22976.475057142856,35),
  ('descuento','FATERYH',22976.475057142856,36),
  ('descuento','Seguro vitalicio',17232.35629285714,37),
  ('descuento','Redondeo',0.8267785713542253,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

WITH liq AS (
  INSERT INTO liquidaciones_sueldo (empleado_id, periodo, remuneracion_bruta, total_descuentos_empleado, neto_a_pagar, estado)
  SELECT e.id, '2026-04-01', 2069924.27, 457042.27, 1612882, 'confirmada'
  FROM empleados_edificio e
  JOIN consorcios c ON c.id = e.consorcio_id
  WHERE e.cuil = '23175845879' AND c.nombre = 'CONSORCIO DE PROPIETARIOS CALLE SANCHEZ DE BUSTAMANTE 2466,2468 Y 2472, CABA'
  ON CONFLICT (empleado_id, periodo) DO UPDATE SET
    remuneracion_bruta = EXCLUDED.remuneracion_bruta,
    total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
    neto_a_pagar = EXCLUDED.neto_a_pagar,
    estado = 'confirmada'
  RETURNING id
)
INSERT INTO conceptos_liquidacion (liquidacion_id, tipo, concepto, importe, orden)
SELECT liq.id, tipo, concepto, importe, orden FROM liq, (VALUES
  ('haber','Sueldo Básico',1044417,1),
  ('haber','Retiro de residuos',29763.2,3),
  ('haber','Clasificación de residuos',32039.2,4),
  ('haber','Valor vivienda',6833.8,5),
  ('haber','Plus antigüedad (2%)',302994,7),
  ('haber','Plus cocheras',25384.8,8),
  ('haber','Plus jardín',25384.8,10),
  ('haber','Plus piletas',42703.5,13),
  ('haber','Horas extras 50%',339642.0675,15),
  ('haber','Horas extras 100%',120761.62400000001,16),
  ('no_remunerativo','Adicional remuneratorio mensual',100000,22),
  ('descuento','Jubilación',227691.63906500002,30),
  ('descuento','Ley 19032',62097.719745,31),
  ('descuento','Obra Social',62097.719745,32),
  ('descuento','SUTERH',41398.479830000004,34),
  ('descuento','Caja Prot. Flia.',20699.239915000002,35),
  ('descuento','FATERYH',20699.239915000002,36),
  ('descuento','Seguro vitalicio',15524.42993625,37),
  ('descuento','Descuento vivienda',6833.8,38),
  ('descuento','Redondeo',0.2766512497328222,40)
) AS t(tipo, concepto, importe, orden)
ON CONFLICT DO NOTHING;

