"use client";

interface Props {
  empleados: { cuil: string; nombre: string }[];
  value: string;
}

export function EmpleadoSelect({ empleados, value }: Props) {
  return (
    <select
      name="empleado_cuil"
      defaultValue={value}
      className="input"
      required
      onChange={(e) => {
        (e.target.closest("form") as HTMLFormElement)?.submit();
      }}
    >
      <option value="">Seleccionar...</option>
      {empleados.map((e) => (
        <option key={e.cuil} value={e.cuil}>
          {e.nombre}
        </option>
      ))}
    </select>
  );
}
