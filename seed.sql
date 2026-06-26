SET search_path TO app, public;

INSERT INTO app.consorcios (cuit, nombre, direccion, codigo_postal, cant_uf, categoria_edificio, banco, cbu, bank_alias, tiene_cochera, tiene_pileta, divisor_a, divisor_b)
VALUES
  ('30-71234567-0', 'Consorcio Av. Corrientes 1234', 'Av. Corrientes 1234, CABA', '1043', 12, '2°', 'Banco Nación', '0110000700000012345678', 'corrientes1234', true, false, 100, 100),
  ('30-71234568-1', 'Consorcio Palermo Gardens', 'Honduras 5678, CABA', '1414', 8, '1°', 'Banco Santander', '0720000800000087654321', 'palermogarden', false, true, 100, 100),
  ('30-71234569-2', 'Consorcio Belgrano Star', 'Cabildo 890, CABA', '1426', 20, '3°', 'Banco Galicia', '0070000900000011223344', 'belgranostar', true, true, 100, 100);

INSERT INTO app.personas (nombre, apellido, email, telefono, dni)
VALUES
  ('Carlos',   'García',    'carlos.garcia@mail.com',   '1145678901', '25678901'),
  ('Ana',      'Martínez',  'ana.martinez@mail.com',    '1156789012', '30123456'),
  ('Roberto',  'López',     'roberto.lopez@mail.com',   '1167890123', '18765432'),
  ('Sofía',    'Rodríguez', 'sofia.rodriguez@mail.com', '1178901234', '35987654'),
  ('Marcelo',  'Fernández', 'marcelo.fern@mail.com',    '1189012345', '22334455');

INSERT INTO app.unidades (consorcio_cuit, uf, piso, depto, coef_a, coef_b) VALUES
  ('30-71234567-0', '1A', '1', 'A', 8.50, 8.50),
  ('30-71234567-0', '1B', '1', 'B', 7.80, 7.80),
  ('30-71234567-0', '2A', '2', 'A', 8.50, 8.50),
  ('30-71234567-0', '2B', '2', 'B', 7.80, 7.80),
  ('30-71234567-0', 'PB', 'PB', 'Local', 9.00, 9.00),
  ('30-71234568-1', '1A', '1', 'A', 12.50, 12.50),
  ('30-71234568-1', '1B', '1', 'B', 12.50, 12.50),
  ('30-71234568-1', '2A', '2', 'A', 12.50, 12.50),
  ('30-71234568-1', '2B', '2', 'B', 12.50, 12.50);

INSERT INTO app.ocupantes (unidad_id, persona_id, rol, activo) VALUES
  (1, 1, 'propietario', true),
  (2, 2, 'propietario', true),
  (3, 3, 'propietario', true),
  (6, 4, 'propietario', true),
  (7, 5, 'propietario', true);

INSERT INTO app.empleados (cuil, nombre, fecha_ingreso, consorcio_cuit, funcion, categoria_edificio, jornada)
VALUES
  ('20-25678901-3', 'Juan Perez', '2020-01-15', '30-71234567-0', 'Encargado Permanente con Vivienda', 2, 'Completa'),
  ('20-30123456-5', 'Pedro Gomez', '2022-06-01', '30-71234568-1', 'Encargado Permanente sin Vivienda', 1, 'Completa');

INSERT INTO app.proveedores (nombre, rubro, telefono, email, cuit, activo) VALUES
  ('Ascensores Rapidos SA', 'Ascensores', '1145001234', 'info@ascensoresrapidos.com', '30-55001234-0', true),
  ('Limpieza Total SRL', 'Limpieza', '1156002345', 'ventas@limpiezatotal.com', '30-55002345-1', true),
  ('ElectroSoluciones', 'Electricidad', '1167003456', 'contacto@electrosol.com', '20-55003456-2', true);

INSERT INTO app.periodos_expensas (consorcio_cuit, anio, mes, estado, fecha_vencimiento) VALUES
  ('30-71234567-0', 2026, 6, 'abierto', '2026-06-15'),
  ('30-71234568-1', 2026, 6, 'abierto', '2026-06-15');

INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo) VALUES
  (1, 1, 'Sueldo encargado - Junio 2026', 185000.00, 'A'),
  (1, 2, 'Mantenimiento ascensor', 45000.00, 'A'),
  (1, 3, 'Seguro del edificio', 28000.00, 'A'),
  (1, 4, 'Servicio de limpieza', 32000.00, 'B'),
  (2, 1, 'Sueldo encargado - Junio 2026', 175000.00, 'A'),
  (2, 6, 'Mantenimiento pileta', 22000.00, 'B');

INSERT INTO app.tickets (consorcio_cuit, titulo, descripcion, prioridad, estado, canal_origen) VALUES
  ('30-71234567-0', 'Ascensor fuera de servicio', 'El ascensor del cuerpo A no funciona desde ayer.', 'urgente', 'en_proceso', 'whatsapp'),
  ('30-71234567-0', 'Humedad en palier PB', 'Hay manchas de humedad en la pared del palier.', 'normal', 'abierto', 'email'),
  ('30-71234568-1', 'Filtracion en terraza', 'Filtra agua por el techo del 2do piso.', 'alta', 'abierto', 'manual');

INSERT INTO app.circulares (consorcio_cuit, mensaje) VALUES
  ('30-71234567-0', 'Recordamos a todos los propietarios que el vencimiento de expensas de Junio es el dia 15. Pasada esa fecha se aplicaran intereses por mora.'),
  ('30-71234568-1', 'La pileta estara cerrada por mantenimiento los dias 28 y 29 de junio. Disculpen los inconvenientes.');
