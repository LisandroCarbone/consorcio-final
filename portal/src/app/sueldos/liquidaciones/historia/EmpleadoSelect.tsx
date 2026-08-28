"use client";

interface Props {
  empleados: { id: number; cuil: string; nombre: string }[];
  value: string;
}

export function EmpleadoSelect({ empleados, value }: Props) {
  return (
    <select
      name="empleado_id"
      defaultValue={value}
      className="input"
      required
      onChange={(e) => {
        (e.target.closest("form") as HTMLFormElement)?.submit();
      }}
    >
      <option value="">Seleccionar...</option>
      {empleados.map((e) => (
        <option key={e.id} value={e.id}>
          {e.nombre}
        </option>
      ))}
    </select>
  );
}
