export function EstadoBadge({ estado }: { estado: string }) {
  const cls =
    estado === "confirmada"
      ? "bg-green-100 text-green-700"
      : estado === "anulada"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${cls}`}>
      {estado}
    </span>
  );
}
