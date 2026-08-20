export function EstadoBadge({ estado }: { estado: string }) {
  const cls =
    estado === "confirmada"
      ? "bg-green-100 text-green-700"
      : estado === "anulada"
      ? "bg-red-100 text-red-700"
      : estado === "requiere_revision"
      ? "bg-amber-100 text-amber-700"
      : "bg-yellow-100 text-yellow-700";
  const label = estado === "requiere_revision" ? "Escala pendiente" : estado;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${estado === "requiere_revision" ? "" : "capitalize"} ${cls}`}>
      {label}
    </span>
  );
}
