export default function AyudaPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manual del Usuario</h1>
        <p className="text-gray-500 mt-1">
          Guía completa del Portal de Administración de Consorcios.
        </p>
      </div>

      {/* Navegación */}
      <Section icon="🧭" title="Navegación general">
        <p>El portal tiene dos controles de navegación principales:</p>
        <Card title="Barra lateral (Sidebar)">
          Menú fijo a la izquierda con los módulos agrupados en{" "}
          <strong>General</strong> (Dashboard, Consorcios, Administración) y{" "}
          <strong>Gestión Operativa</strong> (Sueldos, Expensas, Cuenta Cte.,
          Facturación, Proveedores, Tickets, Circulares). Los menús de Sueldos y
          Expensas se expanden con un clic para mostrar las subpáginas. En
          pantallas chicas, se oculta y aparece un botón de hamburguesa.
        </Card>
        <Card title="Barra superior (TopBar)">
          Permite seleccionar el <strong>consorcio activo</strong> y el{" "}
          <strong>período activo</strong> (mes/año). Casi todas las páginas
          filtran sus datos según estas selecciones. También incluye el selector
          de tema visual (Azul / Naranja).
        </Card>
        <Tip>
          Si al entrar a una página ves el mensaje &quot;Seleccione un consorcio&quot;,
          usá el desplegable de la barra superior para elegir el consorcio con el
          que querés trabajar.
        </Tip>
      </Section>

      {/* Dashboard */}
      <Section icon="🏠" title="Dashboard">
        <Route path="/" />
        <p>Vista general multi-consorcio con información en tiempo real:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li><strong>KPIs:</strong> Consorcios activos, cobranza del período, deuda total, tickets y órdenes pendientes.</li>
          <li><strong>Alertas urgentes:</strong> Banner colapsable con items que requieren acción inmediata (unidades 3+ meses impagos, períodos sin liquidar, etc.)</li>
          <li><strong>Morosidad:</strong> Ranking de consorcios con mayor morosidad, con link directo a cuenta corriente.</li>
          <li><strong>Cobranza por consorcio:</strong> Gráfico comparativo cobrado vs. liquidado.</li>
          <li><strong>Estado de caja:</strong> Saldo bancario y cobranzas del mes por consorcio.</li>
          <li><strong>Accesos rápidos:</strong> Cargar gastos, ver cuenta corriente, órdenes de trabajo, enviar circulares.</li>
        </ul>
      </Section>

      {/* Sueldos */}
      <Section icon="👷" title="Sueldos — Flujo de liquidación">
        <Route path="/sueldos" />
        <p>
          El hub de sueldos muestra el estado del período actual con un{" "}
          <strong>checklist inteligente</strong> que se completa automáticamente:
        </p>
        <Workflow steps={["Cargar Novedades", "Liquidar Recibos", "Confirmar Recibos", "Exportar LSD", "Cerrar Período"]} />
        <p>
          La página también muestra la nómina de empleados activos, estadísticas
          del período (generadas, confirmadas, total neto), y accesos directos a
          SAC, Despido y Escalas.
        </p>
      </Section>

      <Section icon="" title="Empleados">
        <Route path="/sueldos/empleados/nuevo" />
        <p>Desde el hub de Sueldos, el botón &quot;Nuevo empleado&quot; abre el formulario:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li><strong>Identificación:</strong> CUIL, legajo, nombre, fecha nacimiento/ingreso, email, WhatsApp</li>
          <li><strong>Puesto:</strong> Consorcio, función, categoría edificio (1° a 4°), jornada, vivienda</li>
          <li><strong>Obra social y banco:</strong> Obra social, código, banco, CBU</li>
          <li><strong>Plus salarial:</strong> Retiro/clasificación de residuos, cocheras, jardín, zona desfavorable, pileta, título encargado integral, adicional voluntario</li>
        </ul>
      </Section>

      <Section icon="" title="Escalas SUTERH">
        <Route path="/sueldos/escalas" />
        <p>
          Muestra los <strong>básicos por función y categoría</strong> (1° a 4°)
          junto con valores adicionales (antigüedad, vacacional, viáticos, etc.).
          Se actualizan automáticamente el 1° de cada mes vía n8n.
        </p>
        <Tip>
          Si al liquidar aparece un cartel ámbar &quot;Escala pendiente&quot;, significa que
          no hay escala cargada para ese período y se usó la anterior. Cargá las
          escalas actuales y recalculá.
        </Tip>
      </Section>

      <Section icon="" title="Novedades del mes">
        <Route path="/sueldos/novedades" />
        <p>Variables mensuales de cada empleado antes de liquidar:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>Días trabajados (suplentes), horas jornada (máx. 18)</li>
          <li>Horas extras 50% y 100%, feriados trabajados</li>
          <li>Suplencia al 100%, plus vacaciones (días)</li>
          <li>Días no trabajados, licencia por enfermedad</li>
          <li>Adicional voluntario, embargo, anticipo</li>
          <li>Observaciones (texto libre)</li>
        </ul>
      </Section>

      <Section icon="" title="Conceptos adicionales (haber/descuento manual)">
        <Route path="/sueldos/novedades → panel 'Adicionales del período'" />
        <Tip>
          <strong>Funcionalidad clave:</strong> Si necesitás agregar un concepto
          extraordinario que no está en la liquidación automática (por ejemplo: un
          bono, una capacitación SERACARH, un descuento especial), este es el lugar.
        </Tip>
        <p>
          En la parte superior de Novedades, dentro de{" "}
          <strong>&quot;Adicionales del período&quot;</strong>, la sección{" "}
          <strong>&quot;Conceptos adicionales&quot;</strong> permite:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>Agregar líneas de <strong>Haber</strong> (monto fijo $) o <strong>Descuento</strong> (monto fijo $ o % del bruto)</li>
          <li>Nombrar el concepto libremente</li>
          <li>Se aplican a todos los empleados del consorcio para ese período</li>
          <li>Aparecen automáticamente en el recibo al liquidar</li>
        </ul>
      </Section>

      <Section icon="" title="Adicional Remuneratorio Mensual">
        <p>
          También dentro de &quot;Adicionales del período&quot;. Se carga automáticamente
          desde la escala SUTERH vigente, pero se puede sobrescribir manualmente.
          Se prorratea para suplentes según horas trabajadas.
        </p>
      </Section>

      <Section icon="" title="Fondo Educación y Comunicación Art. 19 bis">
        <p>
          Checkbox en &quot;Adicionales del período&quot; que activa/desactiva el descuento
          del <strong>2% por Fondo de Educación</strong> (Art. 19 bis CCT 589/10).
          Se aplica una vez al año, solo a empleados permanentes.
        </p>
        <Tip>
          Típicamente se activa en el primer semestre, cuando SUTERH publica
          nuevas escalas. Si no estás seguro, consultá con la gestoría.
        </Tip>
      </Section>

      <Section icon="" title="Liquidaciones">
        <Route path="/sueldos/liquidaciones" />
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li><strong>&quot;Recalcular todo&quot;:</strong> Genera/recalcula las liquidaciones de todos los empleados activos</li>
          <li><strong>&quot;Confirmar&quot;:</strong> Confirma cada recibo individualmente. Al confirmar, se generan los gastos de categoría 1 en Expensas</li>
          <li><strong>&quot;Ver recibo&quot;:</strong> Abre el recibo de sueldo completo</li>
          <li><strong>&quot;Exportar LSD&quot;:</strong> Genera el archivo del Libro Sueldo Digital</li>
        </ul>
      </Section>

      <Section icon="" title="Recibo de sueldo">
        <Route path="/sueldos/liquidaciones/[id]" />
        <p>Recibo completo según formato Decreto 407/2026 / Art. 140 LCT:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>Datos del empleador y empleado, período, antigüedad</li>
          <li><strong>Costo total empleador:</strong> Desglose de contribuciones patronales</li>
          <li><strong>Sueldo bruto:</strong> Haberes y descuentos detallados</li>
          <li><strong>Neto a pagar</strong> en número y letras, datos bancarios</li>
          <li>Gráfico de composición del costo laboral</li>
          <li>Último depósito de aportes y contribuciones</li>
          <li>Botón de Imprimir con opción de envío por email/WhatsApp</li>
        </ul>
      </Section>

      <Section icon="" title="SAC (Aguinaldo)">
        <Route path="/sueldos/sac" />
        <p>Liquidación del Sueldo Anual Complementario por semestre:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>Seleccionar empleado, semestre (1° ene-jun / 2° jul-nov) y año</li>
          <li>Vista previa con mejor bruto del semestre, meses trabajados, SAC base, bonificación 20%</li>
          <li>Desglose de descuentos y contribuciones patronales estimadas</li>
          <li>Botón &quot;Confirmar SAC&quot; que genera la liquidación</li>
        </ul>
        <Tip>
          Si el empleado trabajó menos meses que el semestre completo, el SAC se
          calcula proporcionalmente.
        </Tip>
      </Section>

      <Section icon="" title="Egreso / Despido">
        <Route path="/sueldos/despido" />
        <p>
          Calculadora de liquidación final con 6 tipos de egreso: despido sin
          causa, con causa, renuncia, mutuo acuerdo, fallecimiento, jubilación.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>Indemnización por antigüedad, preaviso, integración mes, SAC proporcional, vacaciones proporcionales</li>
          <li>Cada concepto marcado como Remunerativo o No Remunerativo</li>
          <li>Descuentos y contribuciones calculados solo sobre lo remunerativo</li>
        </ul>
        <Tip>
          Al confirmar, el empleado pasa a estado inactivo con la fecha de egreso
          registrada. Esta acción no se puede deshacer fácilmente.
        </Tip>
      </Section>

      <Section icon="" title="Parámetros CCT">
        <Route path="/configuracion/parametros" />
        <p>Configuración global del CCT 589/10 y AFIP, versionado por vigencia:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>Detracción F.931 (completa, media jornada, SAC)</li>
          <li>Porcentajes: SUTERH, FATERYH, SERACARH, SCVO</li>
          <li>Aportes y contribuciones SS/OS/ANSSAL</li>
          <li><strong>Por consorcio:</strong> ART (% variable y costo fijo), SCVO (mes renovación y costo), tasas de interés</li>
        </ul>
      </Section>

      <Section icon="" title="Credenciales ARCA">
        <Route path="/configuracion/arca" />
        <p>
          Configuración de credenciales ARCA (ex-AFIP) para facturación
          electrónica por consorcio.
        </p>
      </Section>

      {/* Expensas */}
      <Section icon="💰" title="Expensas">
        <Route path="/expensas" />
        <p>Módulo de gestión de gastos comunes y prorrateo por unidad funcional.</p>
        <Workflow steps={["Cargar Gastos", "Liquidar Sueldos", "Prorratear", "Cobranzas", "Cerrar Período"]} />
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li><strong>Gastos del período:</strong> Por categoría (1-Sueldos, 2-Servicios Públicos... 10-Otros), tipo (Coef. A, B, Particular)</li>
          <li><strong>Autocompletado:</strong> Sugiere gastos similares de períodos anteriores</li>
          <li><strong>Copiar gastos:</strong> Copia todos los gastos de un período anterior</li>
          <li><strong>Cuotas:</strong> Gastos en cuotas que se reparten automáticamente</li>
          <li><strong>Provisiones:</strong> Fondo de reserva</li>
          <li><strong>Estado financiero:</strong> Saldo anterior, cobranzas, saldo de cierre</li>
          <li><strong>Expensas fijas:</strong> Monto fijo mensual que se prorratea</li>
        </ul>
        <Tip>
          Si ves un cartel ámbar &quot;Desactualizado&quot; en Prorrateo, hubo cambios
          desde la última liquidación. Hacé clic en &quot;Recalcular&quot;.
        </Tip>
      </Section>

      <Section icon="" title="Conciliación Bancaria">
        <Route path="/expensas/conciliacion-bancaria" />
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>Subir extractos bancarios por período</li>
          <li>Match automático de movimientos contra unidades y gastos</li>
          <li>Nivel de confianza del match para revisión manual</li>
          <li>Resumen: créditos/débitos, matched/pendientes, saldo apertura/cierre</li>
        </ul>
      </Section>

      {/* Finanzas */}
      <Section icon="📊" title="Cuenta Corriente">
        <Route path="/finanzas/cuenta-corriente" />
        <p>Libro de deudas por unidad funcional con motor de intereses simple (Art. 770 CCyC):</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>Cada período impago acumula interés mensual independiente</li>
          <li>Pagos imputados FIFO (intereses primero, luego capital, Art. 776 CCyC)</li>
          <li>Tabla por unidad: saldo anterior, pago, expensas A/B, deuda, intereses, total</li>
          <li><strong>Historial:</strong> Clic en una unidad para ver todo el libro</li>
          <li><strong>Pagos:</strong> Registrar pagos individuales (fecha, monto, medio, referencia)</li>
        </ul>
      </Section>

      <Section icon="🧾" title="Facturación Electrónica">
        <Route path="/finanzas/facturacion" />
        <p>
          Emisión de comprobantes electrónicos vía ARCA/AFIP. Requiere
          credenciales ARCA configuradas. Lista comprobantes emitidos con CAE,
          punto de venta, tipo, receptor y monto.
        </p>
      </Section>

      {/* Consorcios */}
      <Section icon="🏢" title="Consorcios">
        <Route path="/consorcios" />
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li><strong>Datos generales:</strong> Nombre, dirección, CUIT, código postal, clave SUTERH, categoría edificio, banco</li>
          <li><strong>Servicios centrales</strong> (Art. 6 CCT 589/10): Ascensor, agua caliente, calefacción, cocheras, pileta, jardín — determinan la categoría CCT</li>
          <li><strong>Configuración de expensas:</strong> Tipo (variable/fija), formato de cobro, interés por mora</li>
          <li><strong>Unidades funcionales:</strong> UFs con coeficientes A/B, propietarios/inquilinos con datos de contacto y CBU</li>
        </ul>
      </Section>

      {/* Proveedores */}
      <Section icon="🔨" title="Proveedores y Órdenes de Trabajo">
        <Route path="/proveedores" />
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li><strong>Órdenes de trabajo:</strong> Estado (pendiente → confirmada → en curso → completada), proveedor, presupuesto</li>
          <li><strong>Tickets sin OT:</strong> Tickets abiertos sin orden de trabajo asociada</li>
          <li><strong>Proveedores registrados:</strong> Directorio de proveedores del consorcio</li>
        </ul>
      </Section>

      {/* Tickets */}
      <Section icon="🔧" title="Tickets">
        <Route path="/tickets" />
        <p>
          Sistema de reclamos con filtros (Abiertos / Todos / Cerrados), prioridad
          (urgente → alta → normal → baja), y categorías mapeadas a gastos de
          expensas. Cada ticket tiene una máquina de estados y un hilo de mensajes
          con notas internas opcionales.
        </p>
      </Section>

      {/* Circulares */}
      <Section icon="📢" title="Circulares">
        <Route path="/circulares" />
        <p>
          Envío de comunicados masivos por WhatsApp a los ocupantes del consorcio.
          Muestra cuántos residentes tienen WhatsApp cargado, historial de
          circulares, y formulario para redactar y enviar.
        </p>
      </Section>

      {/* Administración */}
      <Section icon="⚙️" title="Administración">
        <Route path="/administracion" />
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>Sociedad, administrador, CUIT, matrícula RPA</li>
          <li>Contacto: email, teléfono, celular urgencias, horario, domicilio</li>
          <li>Datos fiscales: categoría AFIP, situación IVA, fecha inicio actividades</li>
          <li>Operativo: logo, firma digital, WhatsApp urgencias, sitio web</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  const isSubsection = !icon;
  return (
    <section className={isSubsection ? "space-y-3" : "space-y-3"}>
      <div
        className={
          isSubsection
            ? ""
            : "flex items-center gap-2 border-b-2 border-brand-600 pb-2"
        }
      >
        {icon && <span className="text-xl">{icon}</span>}
        {isSubsection ? (
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        ) : (
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        )}
      </div>
      <div className="space-y-3 text-sm text-gray-600">{children}</div>
    </section>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{children}</p>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-md p-3 text-sm text-gray-700">
      {children}
    </div>
  );
}

function Route({ path }: { path: string }) {
  return (
    <span className="inline-block text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded mb-2">
      {path}
    </span>
  );
}

function Workflow({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1 my-3">
      {steps.map((step, i) => (
        <span key={step} className="flex items-center gap-1">
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-800 shadow-sm">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
              {i + 1}
            </span>
            {step}
          </span>
          {i < steps.length - 1 && (
            <span className="text-gray-400 text-sm">→</span>
          )}
        </span>
      ))}
    </div>
  );
}
