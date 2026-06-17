'use client';

export function PeriodoSelect({
  periodos,
  selected,
  fmtPeriodo,
}: {
  periodos: { periodo: string }[];
  selected: string;
  fmtPeriodo: (p: string) => string;
}) {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <select
      className="input text-sm py-1.5"
      value={selected}
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set('periodo', e.target.value);
        window.location.href = url.toString();
      }}
    >
      {periodos.map((p) => (
        <option key={p.periodo} value={p.periodo}>
          {capitalize(fmtPeriodo(p.periodo))}
        </option>
      ))}
    </select>
  );
}
